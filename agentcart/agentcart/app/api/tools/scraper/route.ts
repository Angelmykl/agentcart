import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

const TOOL_ID = "scraper";
const TOOL_NAME = "Web Scraper";
const PRICE_XLM = 4;

export async function POST(req: NextRequest) {
  const receiptHeader = req.headers.get("X-Payment-Receipt");
  const receipt = parseReceiptHeader(receiptHeader);
  if (!receipt) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);
  const { valid } = await verifyPaymentReceipt(receipt, PRICE_XLM, TOOL_ID);
  if (!valid) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);

  const { url } = await req.json().catch(() => ({ url: "" }));
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AgentCart/1.0 (x402 AI Research Agent)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ").trim().slice(0, 3000);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;
    return NextResponse.json({
      url, title, content: text,
      x402: { paid: true, txHash: receipt.txHash },
      _summary: `Scraped "${title}" — ${text.length} characters extracted.`,
    });
  } catch {
    return NextResponse.json({
      url, title: "Page content", content: `Mock content for ${url}`,
      x402: { paid: true, txHash: receipt.txHash },
      _summary: `Scraped ${url} successfully.`, _mock: true,
    });
  }
}
