"use client";

import { useState } from "react";

interface TaskInputProps {
  onRun: (task: string, budget: number) => void;
  isRunning: boolean;
}

const EXAMPLE_TASKS = [
  "Research the top 5 DeFi protocols by TVL today and write an investment summary with sentiment analysis.",
  "Find the latest news on Ethereum Layer 2 scaling solutions and summarize key developments.",
  "Analyze sentiment for BTC, ETH, and SOL and give me a short-term trading outlook.",
  "What are the top lending protocols right now and which has the best yield opportunities?",
];

export default function TaskInput({ onRun, isRunning }: TaskInputProps) {
  const [task, setTask] = useState(EXAMPLE_TASKS[0]);
  const [budget, setBudget] = useState("1.00");

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
        <span>// TASK</span>
        <span style={{ color: "var(--stellar)", fontSize: 10 }}>claude-sonnet-4 · tool_use</span>
      </div>

      {/* Textarea */}
      <textarea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        disabled={isRunning}
        placeholder="Describe what you want the agent to research or do…"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          color: "var(--text)",
          fontSize: 13,
          lineHeight: 1.65,
          padding: "14px",
          resize: "none",
          outline: "none",
          minHeight: 90,
          opacity: isRunning ? 0.6 : 1,
        }}
      />

      {/* Examples */}
      <div style={{
        padding: "0 14px 10px",
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
      }}>
        {EXAMPLE_TASKS.slice(1).map((t, i) => (
          <button
            key={i}
            onClick={() => setTask(t)}
            disabled={isRunning}
            style={{
              background: "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.15)",
              color: "var(--muted)",
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            {t.slice(0, 40)}…
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Budget */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}>
          <span>Budget cap:</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            step="1"
            min="1"
            max="500"
            disabled={isRunning}
            style={{
              background: "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "var(--stellar)",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              width: 70,
              outline: "none",
            }}
          />
          <span style={{ color: "var(--stellar)" }}>XLM</span>
        </div>

        {/* Run button */}
        <button
          onClick={() => onRun(task, parseFloat(budget) || 1)}
          disabled={isRunning || !task.trim()}
          style={{
            background: isRunning ? "var(--border)" : "var(--stellar)",
            color: isRunning ? "var(--muted)" : "#000",
            border: "none",
            padding: "8px 18px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
          }}
        >
          {isRunning ? (
            <>
              <span style={{ animation: "pulse 1s infinite" }}>◉</span>
              Running…
            </>
          ) : (
            <>▶ Run Agent</>
          )}
        </button>
      </div>
    </div>
  );
}
