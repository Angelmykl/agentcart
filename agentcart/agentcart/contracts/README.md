# AgentCart Soroban Contract

## Overview

The `spending_policy.rs` contract enforces **on-chain budget caps** for AI agent wallets.

## Why This Matters

Without on-chain enforcement, the budget cap is just a promise from the app server. With Soroban, the contract itself rejects any payment that would exceed the agent's configured budget — making the constraint trustless and verifiable by anyone.

## Flow

```
User sets budget (50 XLM)
        ↓
Contract stores SpendingPolicy for agent wallet
        ↓
Agent starts a session → Contract creates Session record
        ↓
Before each tool payment:
  authorize_payment() called →
    Contract checks: spent + amount <= budget
    If OK → emits authorized event → app submits Stellar payment
    If over budget → contract panics → payment blocked
        ↓
All session spend data queryable on-chain via Horizon
```

## Deployment (Testnet)

```bash
# Install Stellar CLI
cargo install --locked stellar-cli

# Build the contract
cd contracts
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/agentcart_policy.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet

# Initialize
stellar contract invoke \
  --id CONTRACT_ID \
  --source YOUR_SECRET_KEY \
  --network testnet \
  -- initialize \
  --owner YOUR_PUBLIC_KEY
```

## Environment Variable

After deploying, add to `.env.local`:
```
SOROBAN_CONTRACT_ID=your_deployed_contract_id
```

The app will call `authorize_payment` before each Stellar micropayment.
