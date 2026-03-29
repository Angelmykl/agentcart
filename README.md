# 🛒 AgentCart — Paid Tool Marketplace for AI Agents on Stellar

> AI agents can reason. They can plan. They can act. But until now they couldn't **pay**.  
> AgentCart is a marketplace where AI agents autonomously purchase paid tools using XLM micropayments on Stellar — trustlessly, instantly, on-chain.

**Built for Stellar Hacks: Agents 2026 · $10,000 Prize Pool**

[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-00d4ff?style=flat-square)](https://stellar.org)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4-orange?style=flat-square)](https://anthropic.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](https://nextjs.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart_Contract-blueviolet?style=flat-square)](https://soroban.stellar.org)

---

## 🧠 What It Does

AgentCart solves the hardest blocker for autonomous AI agents: **paying for things**.

Give the agent a task and a XLM budget. It figures out which tools it needs, pays for each one via a real Stellar transaction before calling it, then synthesises a final answer from the results — all without any human in the loop.

Every payment is a real on-chain XLM transaction. Every tool call is gated behind a payment. The agent's budget cap is enforced by a Soroban smart contract.

---

## 🏗️ Architecture

```
User sets task + XLM budget
        ↓
Claude (tool_use mode) plans which tools are needed
        ↓
For each tool:
  ┌─────────────────────────────────────────────┐
  │  Soroban contract: authorize_payment()       │
  │  Checks: spent + price <= budget             │
  │  Emits on-chain authorization event          │
  └─────────────────────────────────────────────┘
        ↓
  Stellar micropayment: agent wallet → tool vault
  (real XLM transaction, verifiable on Stellar Expert)
        ↓
  Tool endpoint executes, returns data
        ↓
Claude synthesises final answer from all tool results
        ↓
Result + full payment ledger shown to user
```

---

## 🛠️ Tool Marketplace

| Tool | Price | Source |
|------|-------|--------|
| 📊 DeFiLlama Live Feed | 5 XLM/call | Real API (free) |
| 🧠 CryptoSentiment API | 8 XLM/call | Simulated |
| 📰 News Intelligence | 3 XLM/call | Simulated |
| 🕸️ Web Scraper | 4 XLM/call | Real fetch |
| 🔔 Webhook Dispatcher | 1 XLM/call | Simulated |

Anyone can list their own tool and earn XLM per call — see `/list-tool`.

---

## 🚀 Quick Start (GitHub Codespaces)

### 1. Fork & open in Codespaces
Click **Code → Codespaces → New codespace** on the repo page.

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

**Anthropic API key** — get from [console.anthropic.com](https://console.anthropic.com)
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Stellar testnet wallet** — run the setup script:
```bash
node scripts/setup-wallet.js
```
Copy the two keys it prints into `.env.local`.

**App URL** — in Codespaces, get the forwarded port 3000 URL:
```
NEXT_PUBLIC_APP_URL=https://your-codespace-url-3000.app.github.dev
```

### 4. Run
```bash
npm run dev
```

> ⚠️ **Codespaces tip:** Set port 3000 to **Public** in the Ports tab so the agent can call its own tool endpoints.

---

## 📁 Project Structure

```
agentcart/
├── app/
│   ├── api/
│   │   ├── agent/route.ts          # SSE streaming agent endpoint
│   │   ├── wallet/route.ts         # Agent XLM balance
│   │   └── tools/
│   │       ├── defillama/          # Real DeFiLlama API
│   │       ├── sentiment/          # Token sentiment (simulated)
│   │       ├── news/               # News search (simulated)
│   │       ├── scraper/            # Live web scraper
│   │       └── webhook/            # Alert dispatcher
│   ├── history/page.tsx            # Past agent runs
│   ├── list-tool/page.tsx          # Tool provider registration
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Main agent console
├── components/
│   ├── Header.tsx
│   ├── TaskInput.tsx               # Task + budget input
│   ├── AgentSteps.tsx              # Live reasoning feed
│   ├── ResultBox.tsx               # Final answer display
│   ├── Marketplace.tsx             # Tool list (right panel)
│   └── PaymentLedger.tsx           # Live Stellar tx feed
├── contracts/
│   ├── spending_policy.rs          # Soroban budget enforcement contract
│   └── README.md                   # Contract deployment guide
├── lib/
│   ├── agent.ts                    # Claude tool_use agentic loop
│   ├── stellar.ts                  # XLM micropayment logic
│   └── tools.ts                    # Tool registry + Claude schema builder
├── scripts/
│   └── setup-wallet.js             # Testnet wallet generator
└── types/index.ts                  # Shared TypeScript types
```

---

## ⛓️ Soroban Smart Contract

The `contracts/spending_policy.rs` contract enforces budget caps **on-chain**.

Before each tool payment, the app calls `authorize_payment()` on the contract. The contract checks whether the new total would exceed the agent's budget. If it would — the contract panics and the payment is blocked. No trust required.

See `contracts/README.md` for deployment instructions.

---

## 🌐 Deploy to Vercel

```bash
npx vercel
```

Add environment variables in Vercel dashboard → Settings → Environment Variables.

---

## 🔍 Verify Payments

Every XLM transaction is publicly verifiable:  
`https://stellar.expert/explorer/testnet/account/YOUR_AGENT_PUBLIC_KEY`

The memo field on each transaction reads `agentcart:{toolId}` — making every payment auditable by tool.

---

## 📄 License

MIT — built with ❤️ for Stellar Hacks 2026
