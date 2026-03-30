"use client";

import { useState } from "react";
import Link from "next/link";

export default function ListToolPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    endpoint: "",
    priceXlm: "5",
    category: "data",
    walletAddress: "",
    emoji: "🔧",
  });
  const [submitted, setSubmitted] = useState(false);

  const emojis = ["📊", "🧠", "📰", "🔔", "🕸️", "🛢️", "🔍", "📈", "🤖", "⚡", "🗂️", "🔧"];

  function handleSubmit() {
    // In production: submit to a registry smart contract or API
    // For demo, just show success
    setSubmitted(true);
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(0,212,255,0.04)",
    border: "1px solid var(--border)",
    borderRadius: 5,
    color: "var(--text)",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
    fontFamily: "'Space Mono', monospace",
  };

  const labelStyle = {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "var(--muted)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 28px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,12,15,0.92)",
        backdropFilter: "blur(14px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }}>← Back</Link>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>
            Agent<span style={{ color: "var(--stellar)" }}>Cart</span>
            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13, marginLeft: 10 }}>/ List a Tool</span>
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px" }}>
        {submitted ? (
          <div style={{
            background: "var(--card)",
            border: "1px solid rgba(0,255,136,0.3)",
            borderRadius: 10,
            padding: "48px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
              Tool Submitted!
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              Your tool has been submitted for review. Once approved, agents on the network will be able to discover and pay for it automatically via Stellar.
            </div>
            <div style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 6,
              padding: "14px",
              fontSize: 12,
              color: "var(--stellar)",
              marginBottom: 24,
              textAlign: "left",
            }}>
              <div style={{ marginBottom: 6, color: "var(--muted)", fontSize: 10, letterSpacing: 1 }}>EARNINGS FLOW</div>
              Every time an agent calls your tool, <strong>{form.priceXlm} XLM</strong> is sent directly to your Stellar wallet <strong style={{ fontFamily: "monospace" }}>{form.walletAddress.slice(0, 10)}…</strong> — no middleman, instant settlement.
            </div>
            <Link href="/" style={{
              display: "inline-block",
              background: "var(--stellar)", color: "#000",
              padding: "10px 24px", borderRadius: 5,
              fontSize: 12, fontWeight: 700, textDecoration: "none",
            }}>
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
                List Your Tool
              </div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                Publish a paid tool to the AgentCart marketplace. Every time an AI agent calls your tool, XLM is sent instantly to your Stellar wallet — no API keys, no subscriptions, no middleman.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Emoji picker */}
              <div>
                <label style={labelStyle}>ICON</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {emojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      style={{
                        width: 40, height: 40,
                        background: form.emoji === e ? "rgba(0,212,255,0.15)" : "var(--card)",
                        border: `1px solid ${form.emoji === e ? "var(--stellar)" : "var(--border)"}`,
                        borderRadius: 6, fontSize: 20, cursor: "pointer",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle}>TOOL NAME</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. On-Chain Analytics API"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "none" }}
                  placeholder="What does your tool do? Be specific — agents use this to decide whether to call it."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Endpoint */}
              <div>
                <label style={labelStyle}>ENDPOINT URL</label>
                <input
                  style={inputStyle}
                  placeholder="https://your-api.com/endpoint"
                  value={form.endpoint}
                  onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                />
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 5 }}>
                  Must accept POST with JSON body. Return a _summary field for agent logs.
                </div>
              </div>

              {/* Category + Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="data">Data</option>
                    <option value="analysis">Analysis</option>
                    <option value="action">Action</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>PRICE PER CALL (XLM)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="5"
                    min="0.1"
                    step="0.5"
                    value={form.priceXlm}
                    onChange={(e) => setForm({ ...form, priceXlm: e.target.value })}
                  />
                </div>
              </div>

              {/* Wallet address */}
              <div>
                <label style={labelStyle}>YOUR STELLAR WALLET ADDRESS</label>
                <input
                  style={inputStyle}
                  placeholder="G... (your public key — earnings sent here)"
                  value={form.walletAddress}
                  onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                />
              </div>

              {/* Preview card */}
              {form.name && (
                <div>
                  <label style={labelStyle}>PREVIEW</label>
                  <div style={{
                    background: "var(--card)",
                    border: "1px solid var(--stellar)",
                    borderRadius: 6,
                    padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{ fontSize: 22 }}>{form.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                        {form.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {form.description.slice(0, 60)}{form.description.length > 60 ? "…" : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: "var(--stellar)", fontWeight: 700 }}>{form.priceXlm}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>XLM/call</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.endpoint || !form.walletAddress}
                style={{
                  background: form.name && form.endpoint && form.walletAddress ? "var(--stellar)" : "var(--border)",
                  color: form.name && form.endpoint && form.walletAddress ? "#000" : "var(--muted)",
                  border: "none",
                  padding: "13px",
                  borderRadius: 5,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  width: "100%",
                  transition: "all 0.2s",
                }}
              >
                Submit Tool to Marketplace
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
