"use client";

import { AgentStep } from "@/types";

interface AgentStepsProps {
  steps: AgentStep[];
  isRunning: boolean;
}

const STEP_STYLE: Record<AgentStep["type"], { bg: string; color: string; icon: string }> = {
  think: { bg: "rgba(255,71,87,0.12)", color: "#ff4757", icon: "🧠" },
  pay:   { bg: "rgba(0,212,255,0.12)", color: "#00d4ff", icon: "💳" },
  call:  { bg: "rgba(255,184,0,0.12)", color: "#ffb800", icon: "⚡" },
  result:{ bg: "rgba(0,255,136,0.12)", color: "#00ff88", icon: "✓" },
};

export default function AgentSteps({ steps, isRunning }: AgentStepsProps) {
  if (steps.length === 0 && !isRunning) return null;

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        fontSize: 10,
        letterSpacing: 2,
        color: "var(--muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span>// AGENT REASONING</span>
        {isRunning && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--amber)", fontSize: 11 }}>
            THINKING
            <span style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "inline-block",
                  width: 4, height: 4,
                  borderRadius: "50%",
                  background: "var(--amber)",
                  animation: `blink 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Steps */}
      <div style={{ padding: "8px 0" }}>
        {steps.map((step, idx) => {
          const style = STEP_STYLE[step.type];
          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 14px",
                animation: "fadeSlideIn 0.35s ease forwards",
                animationDelay: `${idx * 0.05}s`,
                opacity: 0,
              }}
            >
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                width: 22, height: 22,
                borderRadius: "50%",
                background: style.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11,
                marginTop: 1,
              }}>
                {style.icon}
              </div>

              {/* Body */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {step.detail}
                </div>
                {step.txHash && (
                  <div style={{
                    display: "inline-block",
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    color: "var(--stellar)",
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 3,
                    marginTop: 5,
                    letterSpacing: 0.5,
                  }}>
                    TX: {step.txHash.slice(0, 8)}…{step.txHash.slice(-6)}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>
                {new Date(step.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
