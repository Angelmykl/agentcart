"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import WalletConnect from "@/components/WalletConnect";
import BudgetApproval from "@/components/BudgetApproval";
import TaskInput from "@/components/TaskInput";
import AgentSteps from "@/components/AgentSteps";
import ResultBox from "@/components/ResultBox";
import Marketplace from "@/components/Marketplace";
import PaymentLedger from "@/components/PaymentLedger";
import { AgentEvent, AgentStep, PaymentRecord } from "@/types";

export default function Home() {
  // ── Wallet ──────────────────────────────────────────────────────────────────
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState("—");

  useEffect(() => {
    const saved = localStorage.getItem("agentcart_wallet");
    if (saved) {
      try {
        const { publicKey: pk } = JSON.parse(saved);
        if (pk) {
          setPublicKey(pk);
          fetchBalance(pk);
        }
      } catch {}
    }
  }, []);

  function fetchBalance(pk: string) {
    fetch(`/api/wallet?publicKey=${pk}`)
      .then((r) => r.json())
      .then((d) => setXlmBalance(d.xlm ?? "—"))
      .catch(() => {});
  }

  function handleConnected(pk: string) {
    setPublicKey(pk);
    fetchBalance(pk);
  }

  function handleDisconnect() {
    setPublicKey(null);
    setXlmBalance("—");
    localStorage.removeItem("agentcart_wallet");
  }

  // ── Budget approval modal ────────────────────────────────────────────────────
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [pendingBudget, setPendingBudget] = useState(50);
  const [showApproval, setShowApproval] = useState(false);
  const [budgetTxHash, setBudgetTxHash] = useState<string | null>(null);

  // ── Agent run state ──────────────────────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(50);
  const [durationMs, setDurationMs] = useState(0);
  const [usedToolIds, setUsedToolIds] = useState<string[]>([]);

  const leftRef = useRef<HTMLDivElement>(null);
  const totalSpentRef = useRef(0);

  // Called when user clicks Run Agent — show approval modal first
  function handleRunRequest(task: string, budgetXlm: number) {
    setPendingTask(task);
    setPendingBudget(budgetXlm);
    setShowApproval(true);
  }

  // Called after Freighter approves and XLM is sent to escrow
  function handleApproved(txHash: string) {
    setShowApproval(false);
    setBudgetTxHash(txHash);
    if (pendingTask) {
      startAgentRun(pendingTask, pendingBudget);
    }
  }

  function handleCancelApproval() {
    setShowApproval(false);
    setPendingTask(null);
  }

  async function startAgentRun(task: string, budgetXlm: number) {
    setIsRunning(true);
    setSteps([]); setPayments([]); setResult(null);
    setTotalSpent(0); totalSpentRef.current = 0;
    setBudget(budgetXlm); setUsedToolIds([]);
    const t0 = Date.now();
    let finalResult = "";
    let txCount = 0;

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, budgetXlm, userPublicKey: publicKey }),
      });

      if (!res.ok) throw new Error("Agent API failed");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            const dur = Date.now() - t0;
            setDurationMs(dur);
            setIsRunning(false);
            if (finalResult) {
              saveToHistory(task, finalResult, totalSpentRef.current, txCount, dur);
              // Refund unused XLM
              if (publicKey) {
                fetch("/api/escrow", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "refund",
                    userPublicKey: publicKey,
                    spentXlm: totalSpentRef.current,
                    budgetXlm,
                  }),
                }).then(() => fetchBalance(publicKey));
              }
            }
            break outer;
          }
          try {
            const event: AgentEvent = JSON.parse(raw);
            if (event.type === "payment") txCount++;
            if (event.type === "result") finalResult = event.result;
            handleEvent(event, t0);
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
    setTimeout(() => leftRef.current?.scrollTo({ top: leftRef.current.scrollHeight, behavior: "smooth" }), 100);
  }

  function saveToHistory(task: string, res: string, spent: number, txCount: number, dur: number) {
    try {
      const existing = JSON.parse(localStorage.getItem("agentcart_history") || "[]");
      existing.push({
        id: crypto.randomUUID(), task, result: res,
        totalSpent: spent, txCount, durationMs: dur, publicKey,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("agentcart_history", JSON.stringify(existing.slice(-50)));
    } catch {}
  }

  function handleEvent(event: AgentEvent, t0: number) {
    switch (event.type) {
      case "step":
        setSteps((prev) => {
          const idx = prev.findIndex((s) => s.title === event.step.title && s.type === event.step.type);
          if (idx >= 0) { const n = [...prev]; n[idx] = event.step; return n; }
          return [...prev, event.step];
        });
        setTimeout(() => leftRef.current?.scrollTo({ top: leftRef.current.scrollHeight, behavior: "smooth" }), 50);
        break;
      case "payment":
        setPayments((prev) => [...prev, event.payment]);
        setTotalSpent((prev) => {
          const next = Math.round((prev + event.payment.amountXlm) * 100) / 100;
          totalSpentRef.current = next;
          return next;
        });
        setUsedToolIds((prev) => prev.includes(event.payment.toolId) ? prev : [...prev, event.payment.toolId]);
        break;
      case "result":
        setResult(event.result);
        setTotalSpent(event.totalSpent);
        totalSpentRef.current = event.totalSpent;
        setIsRunning(false);
        setDurationMs(Date.now() - t0);
        break;
      case "error":
        console.error("Agent error:", event.message);
        setIsRunning(false);
        break;
    }
  }

  return (
    <div style={{ position: "relative", zIndex: 1, height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Freighter connect gate */}
      {!publicKey && <WalletConnect onConnected={handleConnected} />}

      {/* Budget approval modal */}
      {showApproval && pendingTask && publicKey && (
        <BudgetApproval
          task={pendingTask}
          budgetXlm={pendingBudget}
          userPublicKey={publicKey}
          onApproved={handleApproved}
          onCancel={handleCancelApproval}
        />
      )}

      <Header publicKey={publicKey} xlmBalance={xlmBalance} onDisconnect={handleDisconnect} />

      {/* Sub-nav */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "0 28px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,12,15,0.7)",
      }}>
        {[
          { label: "Agent Console", href: "/" },
          { label: "History", href: "/history" },
          { label: "List a Tool", href: "/list-tool" },
        ].map((tab, i) => (
          <Link key={tab.href} href={tab.href} style={{
            padding: "10px 14px", fontSize: 11, textDecoration: "none",
            color: i === 0 ? "var(--stellar)" : "var(--muted)",
            borderBottom: i === 0 ? "2px solid var(--stellar)" : "2px solid transparent",
            letterSpacing: 0.5,
          }}>
            {tab.label}
          </Link>
        ))}

        {/* Budget tx confirmation */}
        {budgetTxHash && (
          <div style={{ marginLeft: "auto", fontSize: 10, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
            ✓ Budget locked ·
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${budgetTxHash}`}
              target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--stellar)", textDecoration: "none" }}
            >
              View TX ↗
            </a>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
        <div ref={leftRef} style={{
          padding: "20px 24px",
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <TaskInput onRun={handleRunRequest} isRunning={isRunning} />
          <AgentSteps steps={steps} isRunning={isRunning} />
          {result && <ResultBox result={result} totalSpent={totalSpent} durationMs={durationMs} />}
          <div style={{ height: 24 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <Marketplace usedToolIds={usedToolIds} />
          </div>
          <PaymentLedger payments={payments} budgetXlm={budget} spentXlm={totalSpent} />
        </div>
      </div>
    </div>
  );
}
