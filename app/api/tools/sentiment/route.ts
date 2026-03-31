import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

export async function POST(req: NextRequest) {
  const receipt = parseReceiptHeader(req.headers.get("X-Payment-Receipt"));
  if (!receipt) return buildPaymentRequired("sentiment", "CryptoSentiment API", 8);
  const { valid } = await verifyPaymentReceipt(receipt, 8, "sentiment");
  if (!valid) return buildPaymentRequired("sentiment", "CryptoSentiment API", 8);
  const { tokens = ["BTC", "ETH"] } = await req.json().catch(() => ({}));
  const results = tokens.map((token: string) => {
    const score = Math.random() * 100;
    const sentiment = score > 65 ? "Bullish" : score > 40 ? "Neutral" : "Bearish";
    const emoji = sentiment === "Bullish" ? "🟢" : sentiment === "Neutral" ? "🟡" : "🔴";
    return { token, sentimentScore: Math.round(score), sentiment, emoji, socialVolume: Math.floor(Math.random() * 50000) + 1000, change7d: (Math.random() * 40 - 20).toFixed(1) + "%" };
  });
  return NextResponse.json({ sentiment: results, retrievedAt: new Date().toISOString(), x402: { paid: true, txHash: receipt.txHash }, _summary: `Sentiment: ${results.map((r: {token:string;emoji:string;sentiment:string}) => `${r.token} ${r.emoji} ${r.sentiment}`).join(", ")}` });
}
