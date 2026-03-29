"use client";

import { useState } from "react";
import { connectFreighter } from "@/lib/wallet-context";

interface WalletConnectProps {
  onConnected: (publicKey: string) => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleConnect() {
    setStatus("connecting");
    setErrorMsg("");
    const { publicKey, error } = await connectFreighter();
    if (error || !publicKey) {
      setStatus("error");
      setErrorMsg(error ?? "Unknown error");
      return;
    }
    localStorage.setItem("agentcart_wallet", JSON.stringify({ publicKey }));
    onConnected(publicKey);
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999,
    }}>
      <div style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "44px 40px",
        width: "100%", maxWidth: 400,
        animation: "fadeSlideIn 0.3s ease forwards",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: "var(--stellar)",
            borderRadius: 14, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 28, margin: "0 auto 14px",
          }}>🛒</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24 }}>
            Agent<span style={{ color: "var(--stellar)" }}>Cart</span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 8, lineHeight: 1.65 }}>
            The marketplace where AI agents buy tools<br />
            with real XLM micropayments on Stellar.
          </div>
        </div>

        {/* What to expect */}
        <div style={{
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.15)",
          borderRadius: 8, padding: "14px 16px",
          marginBottom: 24,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {[
            { icon: "🪐", text: "Connect your Freighter wallet" },
            { icon: "⚡", text: "Set a XLM budget for your agent" },
            { icon: "💳", text: "Agent pays for tools automatically on-chain" },
            { icon: "✓",  text: "View every tx on Stellar Expert" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted)" }}>
              <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          disabled={status === "connecting"}
          style={{
            width: "100%",
            background: status === "connecting" ? "var(--border)" : "var(--stellar)",
            color: status === "connecting" ? "var(--muted)" : "#000",
            border: "none", borderRadius: 8,
            padding: "15px",
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            cursor: status === "connecting" ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
            letterSpacing: 0.5,
          }}
        >
          <span style={{ fontSize: 18 }}>🪐</span>
          {status === "connecting" ? "Connecting to Freighter…" : "Connect Freighter Wallet"}
        </button>

        {/* Error state */}
        {status === "error" && (
          <div style={{
            marginTop: 14,
            background: "rgba(255,71,87,0.08)",
            border: "1px solid rgba(255,71,87,0.25)",
            borderRadius: 6, padding: "12px 14px",
            fontSize: 11, color: "#ff4757", lineHeight: 1.6,
          }}>
            ⚠️ {errorMsg}
            {errorMsg.toLowerCase().includes("not") && (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  color: "var(--stellar)", marginTop: 8, fontSize: 11,
                  textDecoration: "none",
                }}
              >
                Download Freighter extension →
              </a>
            )}
          </div>
        )}

        {/* Freighter not installed help */}
        {status !== "error" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Don&apos;t have Freighter? </span>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: "var(--stellar)", textDecoration: "none" }}
            >
              Install it free →
            </a>
          </div>
        )}

        {/* Network badge */}
        <div style={{
          marginTop: 20, textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontSize: 10, color: "var(--green)",
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--green)", animation: "pulse 2s infinite",
          }} />
          Stellar Testnet · Real on-chain XLM transactions
        </div>
      </div>
    </div>
  );
}
