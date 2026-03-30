import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, limit = 5 } = await req.json();

  // Mock news results (in production: NewsAPI, GDELT, or similar)
  const mockArticles = [
    {
      title: `DeFi TVL hits record as ${query} sees renewed interest`,
      source: "CoinDesk",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      summary: `The decentralized finance sector saw a surge in activity as ${query} attracted significant capital inflows over the past 24 hours.`,
      sentiment: "positive",
      url: "https://coindesk.com",
    },
    {
      title: `Analysts bullish on ${query} ahead of key protocol upgrade`,
      source: "The Block",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      summary: `Multiple analysts have issued bullish outlooks, citing upcoming technical improvements and growing institutional adoption.`,
      sentiment: "positive",
      url: "https://theblock.co",
    },
    {
      title: `Regulatory clarity boosts ${query} market confidence`,
      source: "Decrypt",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      summary: `Recent regulatory developments have provided greater clarity for market participants, leading to increased confidence in the sector.`,
      sentiment: "neutral",
      url: "https://decrypt.co",
    },
    {
      title: `${query} faces headwinds as market consolidates`,
      source: "CryptoSlate",
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      summary: `Despite long-term optimism, short-term market dynamics suggest a consolidation phase may be underway.`,
      sentiment: "negative",
      url: "https://cryptoslate.com",
    },
    {
      title: `Institutional flows into ${query} reach quarterly high`,
      source: "Bloomberg Crypto",
      publishedAt: new Date(Date.now() - 28800000).toISOString(),
      summary: `Institutional investment vehicles targeting the space have seen their highest inflows this quarter.`,
      sentiment: "positive",
      url: "https://bloomberg.com",
    },
  ].slice(0, limit);

  return NextResponse.json({
    query,
    articles: mockArticles,
    totalResults: mockArticles.length,
    retrievedAt: new Date().toISOString(),
    _summary: `Found ${mockArticles.length} articles about "${query}". Majority sentiment: positive.`,
  });
}
