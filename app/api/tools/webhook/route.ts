import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentReceipt, buildPaymentRequired, parseReceiptHeader } from "@/lib/x402";

export async function POST(req: NextRequest) {
  const receipt = parseReceiptHeader(req.headers.get("X-Payment-Receipt"));
  if (!receipt) return buildPaymentRequired("webhook", "Webhook Dispatcher", 1);
  const { valid } = await verifyPaymentReceipt(receipt, 1, "webhook");
  if (!valid) return buildPaymentRequired("webhook", "Webhook Dispatcher", 1);
  const { message, channel } = await req.json().catch(() => ({ message: "", channel: "slack" }));
  return NextResponse.json({ success: true, channel, deliveredAt: new Date().toISOString(), x402: { paid: true, txHash: receipt.txHash }, _summary: `Message dispatched to ${channel} via x402-gated endpoint.` });
}
