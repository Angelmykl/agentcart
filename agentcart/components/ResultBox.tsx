"use client";

interface ResultBoxProps {
  result: string;
  totalSpent: number;
  durationMs: number;
}

export default function ResultBox({ result, totalSpent, durationMs }: ResultBoxProps) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid rgba(0,255,136,0.25)",
      borderRadius: 8,
      overflow: "hidden",
      animation: "fadeSlideIn 0.4s ease forwards",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid rgba(0,255,136,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 10,
        letterSpacing: 2,
        color: "var(--green)",
      }}>
        <span>// RESULT</span>
        <span style={{ color: "var(--muted)", letterSpacing: 0.5 }}>
          {(durationMs / 1000).toFixed(1)}s · {totalSpent.toFixed(2)} XLM spent
        </span>
      </div>

      {/* Content */}
      <div style={{
        padding: "16px 14px",
        fontSize: 13,
        lineHeight: 1.7,
        color: "var(--text)",
        whiteSpace: "pre-wrap",
      }}>
        {result}
      </div>
    </div>
  );
}
