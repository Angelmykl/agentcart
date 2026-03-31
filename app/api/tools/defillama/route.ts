import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

const TOOL_ID = "defillama";
const TOOL_NAME = "DeFiLlama Live Feed";
const PRICE_XLM = 5;

export async function POST(req: NextRequest) {
  const receipt = parseReceiptHeader(req.headers.get("X-Payment-Receipt"));
  if (!receipt) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);
  const { valid } = await verifyPaymentReceipt(receipt, PRICE_XLM, TOOL_ID);
  if (!valid) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);

  const { limit = 5 } = await req.json().catch(() => ({}));
  try {
    const res = await fetch("https://api.llama.fi/protocols", { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("failed");
    const protocols = await res.json();
    const top = protocols.filter((p: {tvl:number}) => p.tvl > 0).sort((a: {tvl:number}, b: {tvl:number}) => b.tvl - a.tvl).slice(0, limit).map((p: {name:string;tvl:number;category:string;chains:string[];change_1d:number;change_7d:number}) => ({ name: p.name, tvl: p.tvl, tvlFormatted: p.tvl >= 1e9 ? `$${(p.tvl/1e9).toFixed(1)}B` : `$${(p.tvl/1e6).toFixed(1)}M`, category: p.category, chains: p.chains?.slice(0,3), change1d: p.change_1d, change7d: p.change_7d }));
    return NextResponse.json({ protocols: top, retrievedAt: new Date().toISOString(), x402: { paid: true, txHash: receipt.txHash }, _summary: `Top ${top.length} DeFi protocols. #1: ${top[0]?.name} with ${top[0]?.tvlFormatted} TVL.` });
  } catch {
    const mock = [
      { name: "Lido", tvl: 32100000000, tvlFormatted: "$32.1B", category: "Liquid Staking", chains: ["Ethereum"], change1d: 1.2, change7d: 5.4 },
      { name: "Aave V3", tvl: 18400000000, tvlFormatted: "$18.4B", category: "Lending", chains: ["Ethereum"], change1d: -0.8, change7d: 2.1 },
      { name: "EigenLayer", tvl: 14700000000, tvlFormatted: "$14.7B", category: "Restaking", chains: ["Ethereum"], change1d: 3.1, change7d: 12.3 },
      { name: "Uniswap", tvl: 9200000000, tvlFormatted: "$9.2B", category: "DEX", chains: ["Ethereum"], change1d: -1.5, change7d: -3.2 },
      { name: "MakerDAO", tvl: 8800000000, tvlFormatted: "$8.8B", category: "CDP", chains: ["Ethereum"], change1d: 0.4, change7d: 4.7 },
    ].slice(0, limit);
    return NextResponse.json({ protocols: mock, retrievedAt: new Date().toISOString(), x402: { paid: true, txHash: receipt.txHash }, _summary: `Top ${limit} DeFi protocols by TVL.`, _mock: true });
  }
}
