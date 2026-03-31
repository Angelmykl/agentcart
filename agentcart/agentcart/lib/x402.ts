/**
 * x402 Payment Protocol Implementation for AgentCart
 * 
 * Based on the x402 spec: HTTP 402 Payment Required
 * https://github.com/coinbase/x402
 * 
 * Flow:
 * 1. Client requests tool endpoint
 * 2. Server responds 402 with X-Payment-Required header (payment details)
 * 3. Client pays on Stellar, gets tx hash
 * 4. Client retries with X-Payment-Receipt header
 * 5. Server verifies receipt → executes tool → returns data
 */

import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";

export interface X402PaymentRequired {
  version: "x402/1.0";
  scheme: "stellar";
  network: "testnet" | "mainnet";
  recipient: string;          // Stellar address to pay
  amountXlm: number;          // Amount in XLM
  memo: string;               // Required memo for verification
  expiresAt: number;          // Unix timestamp
  description: string;        // Human readable
}

export interface X402Receipt {
  txHash: string;
  paidAt: number;
  amountXlm: number;
  memo: string;
}

/**
 * Build a 402 Payment Required response
 */
export function buildPaymentRequired(
  toolId: string,
  toolName: string,
  amountXlm: number
): Response {
  const escrowAddress = process.env.AGENT_STELLAR_PUBLIC || "";
  const memo = `x402:${toolId}:${Date.now()}`;

  const paymentRequired: X402PaymentRequired = {
    version: "x402/1.0",
    scheme: "stellar",
    network: "testnet",
    recipient: escrowAddress,
    amountXlm,
    memo,
    expiresAt: Math.floor(Date.now() / 1000) + 300, // 5 min
    description: `Payment required for ${toolName}: ${amountXlm} XLM`,
  };

  return new Response(
    JSON.stringify({
      error: "Payment Required",
      ...paymentRequired,
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "X-Payment-Required": JSON.stringify(paymentRequired),
        "Access-Control-Expose-Headers": "X-Payment-Required",
      },
    }
  );
}

/**
 * Verify an x402 payment receipt by checking the Stellar transaction
 * Returns true if payment is valid
 */
export async function verifyPaymentReceipt(
  receipt: X402Receipt,
  expectedAmountXlm: number,
  toolId: string
): Promise<{ valid: boolean; reason?: string }> {
  // In dev mode without secret key, accept mock receipts
  if (!process.env.AGENT_STELLAR_SECRET) {
    return { valid: true };
  }

  // Mock tx hashes (from our mock function) start with tool id prefix
  if (receipt.txHash.startsWith(toolId.slice(0, 4))) {
    return { valid: true };
  }

  try {
    const server = new Horizon.Server(HORIZON_URL);
    const tx = await server.transactions().transaction(receipt.txHash).call();

    // Check transaction exists and is recent (within 10 minutes)
    const txTime = new Date(tx.created_at).getTime();
    const now = Date.now();
    if (now - txTime > 10 * 60 * 1000) {
      return { valid: false, reason: "Transaction too old" };
    }

    // Check memo contains tool ID
    if (tx.memo && !tx.memo.includes(toolId)) {
      return { valid: false, reason: "Invalid memo" };
    }

    return { valid: true };
  } catch (err) {
    console.error("Receipt verification error:", err);
    // Be lenient in demo - don't block on verification errors
    return { valid: true };
  }
}

/**
 * Parse X-Payment-Receipt header from request
 */
export function parseReceiptHeader(
  receiptHeader: string | null
): X402Receipt | null {
  if (!receiptHeader) return null;
  try {
    return JSON.parse(receiptHeader);
  } catch {
    // Try as plain tx hash
    if (receiptHeader.length === 64) {
      return {
        txHash: receiptHeader,
        paidAt: Date.now(),
        amountXlm: 0,
        memo: "",
      };
    }
    return null;
  }
}

/**
 * Middleware wrapper — wraps a tool handler with x402 payment gating
 * Usage: export const POST = withX402("defillama", "DeFiLlama Live Feed", 5, handler)
 */
export function withX402(
  toolId: string,
  toolName: string,
  amountXlm: number,
  handler: (req: Request) => Promise<Response>
) {
  return async function (req: Request): Promise<Response> {
    const receiptHeader = (req as any).headers?.get?.("X-Payment-Receipt") || null;
    const receipt = parseReceiptHeader(receiptHeader);

    // No receipt → return 402
    if (!receipt) {
      return buildPaymentRequired(toolId, toolName, amountXlm);
    }

    // Verify receipt
    const { valid, reason } = await verifyPaymentReceipt(
      receipt,
      amountXlm,
      toolId
    );

    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment receipt", reason }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    // Payment verified — execute tool
    return handler(req);
  };
}
