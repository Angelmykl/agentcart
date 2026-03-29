// AgentCart Spending Policy Contract
// Soroban Smart Contract (Stellar)
//
// This contract enforces on-chain budget caps for AI agent wallets.
// Rather than trusting the app server to check budgets, the contract
// itself rejects any payment that would exceed the agent's configured
// spending limit for a given session.
//
// Deploy: stellar contract deploy --wasm target/wasm32-unknown-unknown/release/agentcart_policy.wasm
// Network: Stellar Testnet

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Map, String, Symbol,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

const OWNER: Symbol = symbol_short!("OWNER");
const POLICIES: Symbol = symbol_short!("POLICIES");
const SESSIONS: Symbol = symbol_short!("SESSIONS");

// ─── Data Types ──────────────────────────────────────────────────────────────

/// Spending policy for an agent wallet
#[contracttype]
#[derive(Clone)]
pub struct SpendingPolicy {
    /// Maximum XLM the agent can spend per session (in stroops: 1 XLM = 10_000_000)
    pub budget_stroops: i128,
    /// Whether the agent is currently active
    pub active: bool,
    /// Address that set this policy (the human user)
    pub owner: Address,
}

/// Session state — tracks spending within a single agent run
#[contracttype]
#[derive(Clone)]
pub struct Session {
    pub agent: Address,
    pub session_id: String,
    pub spent_stroops: i128,
    pub started_at: u64,
    pub tx_count: u32,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct AgentCartPolicy;

#[contractimpl]
impl AgentCartPolicy {

    /// Initialize the contract with an owner
    pub fn initialize(env: Env, owner: Address) {
        owner.require_auth();
        env.storage().instance().set(&OWNER, &owner);
        env.storage().instance().set(&POLICIES, &Map::<Address, SpendingPolicy>::new(&env));
        env.storage().instance().set(&SESSIONS, &Map::<String, Session>::new(&env));
    }

    /// Register a spending policy for an agent wallet
    /// Called by the human user before starting an agent session
    pub fn set_policy(
        env: Env,
        agent: Address,
        budget_xlm: i128,       // human-readable XLM amount
        caller: Address,
    ) {
        caller.require_auth();

        let budget_stroops = budget_xlm * 10_000_000; // convert to stroops

        let policy = SpendingPolicy {
            budget_stroops,
            active: true,
            owner: caller.clone(),
        };

        let mut policies: Map<Address, SpendingPolicy> = env
            .storage()
            .instance()
            .get(&POLICIES)
            .unwrap_or(Map::new(&env));

        policies.set(agent, policy);
        env.storage().instance().set(&POLICIES, &policies);

        env.events().publish(
            (symbol_short!("policy"), symbol_short!("set")),
            (caller, budget_xlm),
        );
    }

    /// Start a new agent session — resets the spending counter
    pub fn start_session(
        env: Env,
        agent: Address,
        session_id: String,
    ) {
        agent.require_auth();

        let session = Session {
            agent: agent.clone(),
            session_id: session_id.clone(),
            spent_stroops: 0,
            started_at: env.ledger().timestamp(),
            tx_count: 0,
        };

        let mut sessions: Map<String, Session> = env
            .storage()
            .instance()
            .get(&SESSIONS)
            .unwrap_or(Map::new(&env));

        sessions.set(session_id, session);
        env.storage().instance().set(&SESSIONS, &sessions);
    }

    /// Authorize a payment — checks it won't exceed the budget
    /// Called BEFORE the agent submits a tool payment transaction
    /// Returns true if payment is within budget, panics if it would exceed
    pub fn authorize_payment(
        env: Env,
        agent: Address,
        session_id: String,
        amount_stroops: i128,
        tool_id: String,
    ) -> bool {
        agent.require_auth();

        // Load policy
        let policies: Map<Address, SpendingPolicy> = env
            .storage()
            .instance()
            .get(&POLICIES)
            .unwrap();

        let policy = policies.get(agent.clone())
            .expect("No spending policy found for this agent");

        assert!(policy.active, "Agent spending policy is inactive");

        // Load session
        let mut sessions: Map<String, Session> = env
            .storage()
            .instance()
            .get(&SESSIONS)
            .unwrap();

        let mut session = sessions.get(session_id.clone())
            .expect("No active session found");

        // Check budget
        let new_total = session.spent_stroops + amount_stroops;
        assert!(
            new_total <= policy.budget_stroops,
            "Payment would exceed spending budget"
        );

        // Update session spend tracker
        session.spent_stroops = new_total;
        session.tx_count += 1;
        sessions.set(session_id.clone(), session.clone());
        env.storage().instance().set(&SESSIONS, &sessions);

        // Emit payment authorized event (queryable from Horizon)
        env.events().publish(
            (symbol_short!("payment"), symbol_short!("auth")),
            (agent, tool_id, amount_stroops, new_total),
        );

        true
    }

    /// Get current session spending
    pub fn get_session(env: Env, session_id: String) -> Option<Session> {
        let sessions: Map<String, Session> = env
            .storage()
            .instance()
            .get(&SESSIONS)
            .unwrap_or(Map::new(&env));
        sessions.get(session_id)
    }

    /// Get agent's spending policy
    pub fn get_policy(env: Env, agent: Address) -> Option<SpendingPolicy> {
        let policies: Map<Address, SpendingPolicy> = env
            .storage()
            .instance()
            .get(&POLICIES)
            .unwrap_or(Map::new(&env));
        policies.get(agent)
    }

    /// Deactivate an agent's policy (emergency stop)
    pub fn deactivate(env: Env, agent: Address, caller: Address) {
        caller.require_auth();

        let mut policies: Map<Address, SpendingPolicy> = env
            .storage()
            .instance()
            .get(&POLICIES)
            .unwrap();

        if let Some(mut policy) = policies.get(agent.clone()) {
            assert!(
                policy.owner == caller,
                "Only the policy owner can deactivate"
            );
            policy.active = false;
            policies.set(agent, policy);
            env.storage().instance().set(&POLICIES, &policies);
        }
    }
}
