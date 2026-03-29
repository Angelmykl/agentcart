import { NextRequest, NextResponse } from "next/server";
import { Horizon } from "@stellar/stellar-sdk";

const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";

// Returns XLM balance + public key for any wallet
// ?publicKey=G... → user's Freighter wallet
// no param → server/guest wallet
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicKey =
    searchParams.get("publicKey") ?? process.env.AGENT_STELLAR_PUBLIC ?? null;

  if (!publicKey) {
    return NextResponse.json({ xlm: "0", publicKey: null });
  }

  try {
    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return NextResponse.json({
      xlm: native ? parseFloat(native.balance).toFixed(2) : "0",
      publicKey,
    });
  } catch {
    // Account not funded yet or network error
    return NextResponse.json({ xlm: "0", publicKey });
  }
}
