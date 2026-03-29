"use client";

import Link from "next/link";

interface HeaderProps {
  publicKey: string | null;
  xlmBalance: string;
  onDisconnect: () => void;
}

export default function Header({ publicKey, xlmBalance, onDisconnect }: HeaderProps) {
  const shortKey = publicKey
    ? `${publicKey.slice(0, 6)}…${publicKey.slice(-4)}`
    : null;

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 28px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(10,12,15,0.92)",
      backdropFilter: "blur(14px)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 30, height: 30, background: "var(--stellar)",
          borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
        }}>🛒</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)" }}>
          Agent<span style={{ color: "var(--stellar)" }}>Cart</span>
        </span>
        <span style={{
          fontSize: 9, color: "var(--muted)",
          background: "var(--card)", border: "1px solid var(--border)",
          padding: "2px 6px", borderRadius: 3, letterSpacing: 1, marginLeft: 2,
        }}>STELLAR TESTNET</span>
      </Link>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 11, color: "var(--green)",
          background: "rgba(0,255,136,0.07)",
          border: "1px solid rgba(0,255,136,0.2)",
          padding: "4px 10px", borderRadius: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--green)", animation: "pulse 2s infinite",
          }} />
          Live
        </div>

        {/* Connected wallet pill */}
        {publicKey && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--card)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 6,
            padding: "6px 12px",
          }}>
            <span style={{
              fontSize: 9, letterSpacing: 1,
              color: "var(--stellar)",
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.2)",
              padding: "2px 6px", borderRadius: 3,
            }}>
              🪐 FREIGHTER
            </span>

            <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
              {shortKey}
            </span>

            <span style={{ fontSize: 12, color: "var(--stellar)", fontWeight: 700 }}>
              {xlmBalance} XLM
            </span>

            <a
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none" }}
              title="View on Stellar Expert"
            >↗</a>

            <button
              onClick={onDisconnect}
              title="Disconnect"
              style={{
                background: "none", border: "none",
                color: "var(--muted)", fontSize: 11,
                cursor: "pointer", padding: "0 2px",
                lineHeight: 1,
              }}
            >✕</button>
          </div>
        )}

        {/* List Tool CTA */}
        <Link href="/list-tool" style={{
          background: "var(--stellar)", color: "#000",
          padding: "7px 14px", borderRadius: 4,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          textDecoration: "none",
        }}>
          + List Tool
        </Link>
      </div>
    </header>
  );
}
