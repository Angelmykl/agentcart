#!/usr/bin/env node

/**
 * Run this once to generate your agent's Stellar testnet wallet.
 * 
 * Usage: node scripts/setup-wallet.js
 * 
 * It will:
 * 1. Generate a new Stellar keypair
 * 2. Fund it with 10,000 XLM via Friendbot (testnet only)
 * 3. Print the keys to add to your .env.local
 */

const { Keypair } = require("@stellar/stellar-sdk");

async function main() {
  console.log("\n🛒 AgentCart — Wallet Setup\n");

  // Generate keypair
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  console.log("Generated Stellar keypair:");
  console.log("  Public:", publicKey);
  console.log("  Secret:", secretKey);
  console.log("\nFunding via Friendbot...");

  // Fund via Friendbot
  const res = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
  );

  if (res.ok) {
    console.log("✅ Funded successfully with 10,000 XLM!\n");
  } else {
    console.log("⚠️  Friendbot funding failed (may already be funded)\n");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Add these to your .env.local:\n");
  console.log(`AGENT_STELLAR_PUBLIC=${publicKey}`);
  console.log(`AGENT_STELLAR_SECRET=${secretKey}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(
    "View your wallet: https://stellar.expert/explorer/testnet/account/" +
      publicKey +
      "\n"
  );
}

main().catch(console.error);
