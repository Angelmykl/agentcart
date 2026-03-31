import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

const TOOL_ID = "webhook";
const TOOL_NAME = "Webhook Dispatcher";
const PRICE_XLM = 1;

export async function POST(req: NextRequest) {
  const receiptHeader = req.headers.get("X-Payment-Receipt");
  const receipt = parseReceiptHeader(receiptHeader);
  if (!receipt) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);
  const { valid } = await verifyPaymentReceipt(receipt, PRICE_XLM, TOOL_ID);
  if (!valid) return buildPaymentRequired(TOOL_ID, TOOL_NAME, PRICE_XLM);

  const { message, channel } = await req.json().catch(() => ({ message: "", channel: "slack" }));
  console.log(`[x402 Webhook] Channel: ${channel} | Message: ${message}`);

  return NextResponse.json({
    success: true, channel,
    deliveredAt: new Date().toISOString(),
    messagePreview: message.slice(0, 100),
    x402: { paid: true, txHash: receipt.txHash },
    _summary: `Message dispatched to ${channel} via x402-gated endpoint.`,
  });
}
