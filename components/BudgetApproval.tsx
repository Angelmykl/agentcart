"use client";

import { useState } from "react";

interface BudgetApprovalProps {
  task: string;
  budgetXlm: number;
  userPublicKey: string;
  onApproved: (txHash: string) => void;
  onCancel: () => void;
}

type Status = "idle" | "building" | "signing" | "submitting" | "error";

export default function BudgetApproval({ task, budgetXlm, userPublicKey, onApproved, onCancel }: BudgetApprovalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleApprove() {
    setStatus("building");
    setErrorMsg("");
    try {
      const buildRes = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "build", userPublicKey, budgetXlm }),
      });
      const { xdr, error: buildError } = await buildRes.json();
      if (buildError) throw new Error(buildError);

      setStatus("signing");
      const freighter = await import("@stellar/freighter-api");
      const result = await (freighter as any).signTransaction(xdr, {
        network: "TESTNET",
        networkPassphrase: "Test SDF Network ; September 2015",
        accountToSign: userPublicKey,
      });
      const signedXDR = typeof result === "string" ? result : result?.signedTxXdr ?? result;
      if (!signedXDR) throw new Error("Freighter did not return signed transaction");

      setStatus("submitting");
      const submitRes = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", signedXDR }),
      });
      const { success, txHash, error: submitError } = await submitRes.json();
      if (!success || submitError) throw new Error(submitError || "Submission failed");
      onApproved(txHash);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("declined") || msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("cancel")) {
        setStatus("idle");
        return;
      }
      setStatus("error");
      setErrorMsg(msg);
    }
  }

  const statusLabel: Record<Status, string> = {
    idle: `Approve ${budgetXlm} XLM`,
    building: "Preparing transaction…",
    signing: "Waiting for Freighter…",
    submitting: "Submitting to Stellar…",
    error: "Try Again",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14, padding: "36px 32px", width: "100%", maxWidth: 420, animation: "fadeSlideIn 0.25s ease forwards" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚡</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Approve Agent Budget</div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>Freighter will pop up once to approve the budget. The agent pays for tools automatically from there.</div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>TASK</div>
          <div style={{ color: "var(--text)" }}>{task.slice(0, 120)}{task.length > 120 ? "…" : ""}</div>
        </div>

        <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>From</span>
            <span style={{ color: "var(--text)", fontFamily: "monospace" }}>{userPublicKey.slice(0, 8)}…{userPublicKey.slice(-6)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>To</span>
            <span style={{ color: "var(--muted)", fontFamily: "monospace" }}>AgentCart Escrow</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 14 }}>
            <span style={{ color: "var(--muted)" }}>Max Budget</span>
            <span style={{ color: "var(--stellar)", fontWeight: 700, fontSize: 18 }}>{budgetXlm} XLM</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8, textAlign: "right" }}>Unused XLM is refunded after the task completes</div>
        </div>

        {status === "signing" && (
          <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "var(--amber)", marginBottom: 14, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ animation: "pulse 1s infinite" }}>🪐</span>
            Check your Freighter extension now…
          </div>
        )}

        {status === "error" && (
          <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", borderRadius: 6, padding: "10px 14px", fontSize: 11, color: "#ff4757", marginBottom: 14, lineHeight: 1.5 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} disabled={status === "submitting"} style={{ flex: 1, background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 7, padding: "12px", fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleApprove} disabled={["building","signing","submitting"].includes(status)} style={{ flex: 2, background: ["building","signing","submitting"].includes(status) ? "var(--border)" : "var(--stellar)", color: ["building","signing","submitting"].includes(status) ? "var(--muted)" : "#000", border: "none", borderRadius: 7, padding: "12px", fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: ["building","signing","submitting"].includes(status) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
            {["building","signing","submitting"].includes(status) && <span style={{ animation: "pulse 1s infinite" }}>◉</span>}
            {statusLabel[status]}
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
          Stellar Testnet · Real on-chain transaction
        </div>
      </div>
    </div>
  );
}
