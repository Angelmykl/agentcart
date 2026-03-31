import { NextRequest, NextResponse } from "next/server";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicKey = searchParams.get("publicKey") ?? process.env.AGENT_STELLAR_PUBLIC ?? null;

  if (!publicKey) return NextResponse.json({ xlm: "0", publicKey: null });

  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${publicKey}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({ xlm: "0", publicKey });
    const data = await res.json();
    const native = data.balances?.find((b: { asset_type: string }) => b.asset_type === "native");
    const xlm = native ? parseFloat(native.balance).toFixed(2) : "0";
    return NextResponse.json({ xlm, publicKey });
  } catch {
    return NextResponse.json({ xlm: "0", publicKey });
  }
}
