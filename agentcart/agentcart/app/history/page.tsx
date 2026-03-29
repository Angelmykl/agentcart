"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryRun {
  id: string;
  task: string;
  result: string;
  totalSpent: number;
  txCount: number;
  durationMs: number;
  timestamp: string;
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<HistoryRun[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("agentcart_history");
      if (stored) setRuns(JSON.parse(stored));
    } catch {}
  }, []);

  function clearHistory() {
    localStorage.removeItem("agentcart_history");
    setRuns([]);
  }

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
          <Link href="/" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }}>
            ← Back
          </Link>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18 }}>
            Agent<span style={{ color: "var(--stellar)" }}>Cart</span>
            <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13, marginLeft: 10 }}>/ History</span>
          </span>
        </div>
        {runs.length > 0 && (
          <button onClick={clearHistory} style={{
            background: "none", border: "1px solid var(--border)",
            color: "var(--muted)", padding: "6px 12px", borderRadius: 4, fontSize: 11,
          }}>
            Clear History
          </button>
        )}
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {runs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 14 }}>No agent runs yet.</div>
            <Link href="/" style={{
              display: "inline-block", marginTop: 16,
              color: "var(--stellar)", fontSize: 12, textDecoration: "none",
            }}>
              Run your first task →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 2 }}>
              // {runs.length} RUNS · SORTED BY RECENT
            </div>

            {[...runs].reverse().map((run) => (
              <div key={run.id} style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}>
                {/* Run header */}
                <div style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    {new Date(run.timestamp).toLocaleString()} ·{" "}
                    <span style={{ color: "var(--stellar)" }}>{run.totalSpent.toFixed(2)} XLM</span>
                    {" "}· {run.txCount} tx · {(run.durationMs / 1000).toFixed(1)}s
                  </div>
                  <div style={{
                    background: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.2)",
                    color: "var(--green)",
                    fontSize: 10, padding: "2px 7px", borderRadius: 3,
                  }}>
                    COMPLETE
                  </div>
                </div>

                {/* Task */}
                <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text)", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)", fontSize: 10, letterSpacing: 1 }}>TASK // </span>
                  {run.task}
                </div>

                {/* Result preview */}
                <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  {run.result.slice(0, 200)}{run.result.length > 200 ? "…" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
