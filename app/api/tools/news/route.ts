import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

export async function POST(req: NextRequest) {
  const receipt = parseReceiptHeader(req.headers.get("X-Payment-Receipt"));
  if (!receipt) return buildPaymentRequired("news", "News Intelligence", 3);
  const { valid } = await verifyPaymentReceipt(receipt, 3, "news");
  if (!valid) return buildPaymentRequired("news", "News Intelligence", 3);
  const { query = "crypto", limit = 5 } = await req.json().catch(() => ({}));
  const articles = [
    { title: `DeFi TVL hits record as ${query} sees renewed interest`, source: "CoinDesk", publishedAt: new Date(Date.now()-3600000).toISOString(), summary: `${query} attracted significant capital inflows over the past 24 hours.`, sentiment: "positive" },
    { title: `Analysts bullish on ${query} ahead of key upgrade`, source: "The Block", publishedAt: new Date(Date.now()-7200000).toISOString(), summary: `Multiple analysts issued bullish outlooks citing upcoming technical improvements.`, sentiment: "positive" },
    { title: `Regulatory clarity boosts ${query} confidence`, source: "Decrypt", publishedAt: new Date(Date.now()-14400000).toISOString(), summary: `Recent regulatory developments provided greater clarity for market participants.`, sentiment: "neutral" },
    { title: `${query} faces headwinds as market consolidates`, source: "CryptoSlate", publishedAt: new Date(Date.now()-21600000).toISOString(), summary: `Short-term dynamics suggest a consolidation phase may be underway.`, sentiment: "negative" },
    { title: `Institutional flows into ${query} reach quarterly high`, source: "Bloomberg Crypto", publishedAt: new Date(Date.now()-28800000).toISOString(), summary: `Investment vehicles targeting the space saw their highest inflows this quarter.`, sentiment: "positive" },
  ].slice(0, limit);
  return NextResponse.json({ query, articles, totalResults: articles.length, retrievedAt: new Date().toISOString(), x402: { paid: true, txHash: receipt.txHash }, _summary: `Found ${articles.length} articles about "${query}". Majority sentiment: positive.` });
}
