"use client";

import { PaymentRecord } from "@/types";

interface PaymentLedgerProps {
  payments: PaymentRecord[];
  budgetXlm: number;
  spentXlm: number;
}

export default function PaymentLedger({ payments, budgetXlm, spentXlm }: PaymentLedgerProps) {
  const pct = Math.min((spentXlm / budgetXlm) * 100, 100);

  return (
    <div style={{
      padding: "14px 18px",
      background: "rgba(0,0,0,0.25)",
      borderTop: "1px solid var(--border)",
      height: 230,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        fontSize: 10,
        letterSpacing: 2,
        color: "var(--muted)",
        marginBottom: 10,
      }}>
        // PAYMENT LEDGER · STELLAR TESTNET
      </div>

      {/* Budget bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--muted)",
          marginBottom: 5,
        }}>
          <span>
            Spent:{" "}
            <strong style={{ color: "var(--stellar)" }}>
              {spentXlm.toFixed(2)} XLM
            </strong>
          </span>
          <span>Budget: {budgetXlm.toFixed(0)} XLM</span>
        </div>
        <div style={{
          height: 4,
          background: "var(--border)",
          borderRadius: 2,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: pct > 80
              ? "linear-gradient(90deg, var(--amber), var(--red))"
              : "linear-gradient(90deg, var(--stellar), var(--green))",
            borderRadius: 2,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Tx list */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
        {payments.length === 0 ? (
          <div style={{
            fontSize: 11,
            color: "var(--muted)",
            textAlign: "center",
            marginTop: 20,
          }}>
            No transactions yet
          </div>
        ) : (
          payments.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                padding: "7px 10px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                animation: "slideInRight 0.3s ease forwards",
                animationDelay: `${idx * 0.05}s`,
                opacity: 0,
              }}
            >
              <div style={{ color: "var(--green)", fontSize: 13 }}>✓</div>
              <div style={{ flex: 1, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.toolName}
              </div>
              <div style={{ color: "var(--stellar)", fontWeight: 700, flexShrink: 0 }}>
                -{p.amountXlm.toFixed(2)} XLM
              </div>
              <div style={{ fontSize: 9, color: "var(--stellar)", flexShrink: 0 }}>
                🪐
              </div>
              <div style={{
                fontSize: 10,
                color: "var(--muted)",
                flexShrink: 0,
                fontFamily: "monospace",
              }}>
                {new Date(p.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stellar explorer link */}
      {payments.length > 0 && (
        <a
          href={`https://stellar.expert/explorer/testnet`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 10,
            color: "var(--muted)",
            marginTop: 8,
            textDecoration: "none",
          }}
        >
          View on Stellar Expert ↗
        </a>
      )}
    </div>
  );
}
