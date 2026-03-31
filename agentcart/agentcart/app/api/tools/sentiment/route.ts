import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

const TOOL_ID = "sentiment";
const TOOL_NAME = "CryptoSentiment API";
const PRICE_XLM = 8;

export async function POST(req: NextRequest) {
  const receiptHeader = req.headers.get("X-Payment-Receipt");
  const receipt = parseReceiptHeader(receiptHeader);
  if (!receipt) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);
  const { valid } = await verifyPaymentReceipt(receipt, PRICE_XLM, TOOL_ID);
  if (!valid) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);

  const { tokens = ["BTC", "ETH"] } = await req.json().catch(() => ({}));

  const results = tokens.map((token: string) => {
    const score = Math.random() * 100;
    const sentiment = score > 65 ? "Bullish" : score > 40 ? "Neutral" : "Bearish";
    const emoji = sentiment === "Bullish" ? "🟢" : sentiment === "Neutral" ? "🟡" : "🔴";
    return {
      token, sentimentScore: Math.round(score), sentiment, emoji,
      socialVolume: Math.floor(Math.random() * 50000) + 1000,
      change7d: (Math.random() * 40 - 20).toFixed(1) + "%",
      topSignal: sentiment === "Bullish" ? "High buy pressure" : sentiment === "Bearish" ? "Declining inflows" : "Mixed signals",
    };
  });

  return NextResponse.json({
    sentiment: results,
    retrievedAt: new Date().toISOString(),
    x402: { paid: true, txHash: receipt.txHash },
    _summary: `Sentiment for ${tokens.join(", ")}: ${results.map((r: { token: string; emoji: string; sentiment: string }) => `${r.token} ${r.emoji} ${r.sentiment}`).join(", ")}`,
  });
}
