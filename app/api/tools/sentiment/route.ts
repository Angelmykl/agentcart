import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { tokens = ["BTC", "ETH"] } = await req.json();

  // Simulated sentiment scores (would integrate LunarCrush or similar in prod)
  const results = tokens.map((token: string) => {
    const score = Math.random() * 100;
    const sentiment =
      score > 65 ? "Bullish" : score > 40 ? "Neutral" : "Bearish";
    const emoji =
      sentiment === "Bullish" ? "🟢" : sentiment === "Neutral" ? "🟡" : "🔴";

    return {
      token,
      sentimentScore: Math.round(score),
      sentiment,
      emoji,
      socialVolume: Math.floor(Math.random() * 50000) + 1000,
      change7d: (Math.random() * 40 - 20).toFixed(1) + "%",
      topSignal:
        sentiment === "Bullish"
          ? "High buy pressure on spot markets"
          : sentiment === "Bearish"
          ? "Declining exchange inflows"
          : "Mixed signals from derivatives",
    };
  });

  return NextResponse.json({
    sentiment: results,
    retrievedAt: new Date().toISOString(),
    _summary: `Sentiment for ${tokens.join(", ")}: ${results.map((r: { token: string; sentiment: string; emoji: string }) => `${r.token} ${r.emoji} ${r.sentiment}`).join(", ")}`,
  });
}
