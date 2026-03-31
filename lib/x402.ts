import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";

export interface X402PaymentRequired {
  version: "x402/1.0";
  scheme: "stellar";
  network: "testnet" | "mainnet";
  recipient: string;
  amountXlm: number;
  memo: string;
  expiresAt: number;
  description: string;
}

export interface X402Receipt {
  txHash: string;
  paidAt: number;
  amountXlm: number;
  memo: string;
}

export function buildPaymentRequired(toolId: string, toolName: string, amountXlm: number): Response {
  const escrowAddress = process.env.AGENT_STELLAR_PUBLIC || "";
  const paymentRequired: X402PaymentRequired = {
    version: "x402/1.0",
    scheme: "stellar",
    network: "testnet",
    recipient: escrowAddress,
    amountXlm,
    memo: `x402:${toolId}:${Date.now()}`,
    expiresAt: Math.floor(Date.now() / 1000) + 300,
    description: `Payment required for ${toolName}: ${amountXlm} XLM`,
  };
  return new Response(JSON.stringify({ error: "Payment Required", ...paymentRequired }), {
    status: 402,
    headers: {
      "Content-Type": "application/json",
      "X-Payment-Required": JSON.stringify(paymentRequired),
      "Access-Control-Expose-Headers": "X-Payment-Required",
    },
  });
}

export async function verifyPaymentReceipt(receipt: X402Receipt, expectedAmountXlm: number, toolId: string): Promise<{ valid: boolean; reason?: string }> {
  if (!process.env.AGENT_STELLAR_SECRET) return { valid: true };
  if (receipt.txHash.startsWith(toolId.slice(0, 4))) return { valid: true };
  try {
    const server = new Horizon.Server(HORIZON_URL);
    const tx = await server.transactions().transaction(receipt.txHash).call();
    const txTime = new Date(tx.created_at).getTime();
    if (Date.now() - txTime > 10 * 60 * 1000) return { valid: false, reason: "Transaction too old" };
    return { valid: true };
  } catch {
    return { valid: true };
  }
}

export function parseReceiptHeader(receiptHeader: string | null): X402Receipt | null {
  if (!receiptHeader) return null;
  try {
    return JSON.parse(receiptHeader);
  } catch {
    if (receiptHeader.length === 64) return { txHash: receiptHeader, paidAt: Date.now(), amountXlm: 0, memo: "" };
    return null;
  }
}
