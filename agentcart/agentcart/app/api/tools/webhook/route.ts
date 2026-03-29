import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, channel } = await req.json();

  // In production: integrate with Slack/Telegram/email APIs
  // For demo, we just log and return success
  console.log(`[Webhook] Channel: ${channel} | Message: ${message}`);

  return NextResponse.json({
    success: true,
    channel,
    deliveredAt: new Date().toISOString(),
    messagePreview: message.slice(0, 100),
    _summary: `Message dispatched to ${channel} successfully.`,
  });
}
