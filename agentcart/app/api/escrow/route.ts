import { NextRequest, NextResponse } from "next/server";
import { buildBudgetTransferXDR, submitSignedTransaction, refundUnused } from "@/lib/stellar";

export async function POST(req: NextRequest) {
  const { action, userPublicKey, budgetXlm, signedXDR, spentXlm } = await req.json();

  switch (action) {
    case "build": {
      if (!userPublicKey || !budgetXlm) {
        return NextResponse.json({ error: "userPublicKey and budgetXlm required" }, { status: 400 });
      }
      const result = await buildBudgetTransferXDR(userPublicKey, budgetXlm);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({
        xdr: result.xdr,
        escrowAddress: process.env.AGENT_STELLAR_PUBLIC,
        budgetXlm,
      });
    }

    case "submit": {
      if (!signedXDR) {
        return NextResponse.json({ error: "signedXDR required" }, { status: 400 });
      }
      const result = await submitSignedTransaction(signedXDR);
      return NextResponse.json(result);
    }

    case "refund": {
      if (!userPublicKey || spentXlm === undefined || !budgetXlm) {
        return NextResponse.json({ error: "userPublicKey, spentXlm, budgetXlm required" }, { status: 400 });
      }
      const result = await refundUnused(userPublicKey, spentXlm, budgetXlm);
      return NextResponse.json(result);
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
