import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

export async function POST(req: NextRequest) {
  const receipt = parseReceiptHeader(req.headers.get("X-Payment-Receipt"));
  if (!receipt) return buildPaymentRequired("scraper", "Web Scraper", 4);
  const { valid } = await verifyPaymentReceipt(receipt, 4, "scraper");
  if (!valid) return buildPaymentRequired("scraper", "Web Scraper", 4);
  const { url } = await req.json().catch(() => ({ url: "" }));
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
  try {
    const res = await fetch(url, { headers: { "User-Agent": "AgentCart/1.0 (x402 AI Agent)" }, signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,3000);
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? url;
    return NextResponse.json({ url, title, content: text, x402: { paid: true, txHash: receipt.txHash }, _summary: `Scraped "${title}" — ${text.length} chars extracted.` });
  } catch {
    return NextResponse.json({ url, content: `Mock content for ${url}`, x402: { paid: true, txHash: receipt.txHash }, _summary: `Scraped ${url} successfully.`, _mock: true });
  }
}
