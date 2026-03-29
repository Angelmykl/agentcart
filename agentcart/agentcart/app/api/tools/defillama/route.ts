import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { limit = 5 } = await req.json();

  try {
    // DeFiLlama is free, no API key needed
    const res = await fetch("https://api.llama.fi/protocols", {
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("DeFiLlama API failed");

    const protocols = await res.json();

    // Sort by TVL and take top N
    const top = protocols
      .filter((p: { tvl: number }) => p.tvl > 0)
      .sort((a: { tvl: number }, b: { tvl: number }) => b.tvl - a.tvl)
      .slice(0, limit)
      .map((p: {
        name: string;
        tvl: number;
        category: string;
        chains: string[];
        change_1d: number;
        change_7d: number;
      }) => ({
        name: p.name,
        tvl: p.tvl,
        tvlFormatted: formatTvl(p.tvl),
        category: p.category,
        chains: p.chains?.slice(0, 3),
        change1d: p.change_1d,
        change7d: p.change_7d,
      }));

    return NextResponse.json({
      protocols: top,
      retrievedAt: new Date().toISOString(),
      _summary: `Retrieved top ${top.length} DeFi protocols by TVL. #1 is ${top[0]?.name} with ${top[0]?.tvlFormatted} TVL.`,
    });
  } catch {
    // Fallback mock data so demo always works
    return NextResponse.json({
      protocols: MOCK_PROTOCOLS.slice(0, limit),
      retrievedAt: new Date().toISOString(),
      _summary: `Retrieved top ${limit} DeFi protocols by TVL (mock data).`,
      _mock: true,
    });
  }
}

function formatTvl(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

const MOCK_PROTOCOLS = [
  { name: "Lido", tvl: 32100000000, tvlFormatted: "$32.1B", category: "Liquid Staking", chains: ["Ethereum"], change1d: 1.2, change7d: 5.4 },
  { name: "Aave V3", tvl: 18400000000, tvlFormatted: "$18.4B", category: "Lending", chains: ["Ethereum", "Arbitrum", "Polygon"], change1d: -0.8, change7d: 2.1 },
  { name: "EigenLayer", tvl: 14700000000, tvlFormatted: "$14.7B", category: "Restaking", chains: ["Ethereum"], change1d: 3.1, change7d: 12.3 },
  { name: "Uniswap", tvl: 9200000000, tvlFormatted: "$9.2B", category: "DEX", chains: ["Ethereum", "Arbitrum", "Base"], change1d: -1.5, change7d: -3.2 },
  { name: "MakerDAO", tvl: 8800000000, tvlFormatted: "$8.8B", category: "CDP", chains: ["Ethereum"], change1d: 0.4, change7d: 4.7 },
];
