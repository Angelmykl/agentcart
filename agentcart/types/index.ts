// Tool definitions for the marketplace
export interface Tool {
  id: string;
  name: string;
  description: string;
  emoji: string;
  priceXlm: number; // price per call in XLM
  category: "data" | "analysis" | "action";
  endpoint: string; // internal API route
}

// A single payment transaction on Stellar
export interface PaymentRecord {
  id: string;
  toolId: string;
  toolName: string;
  amountXlm: number;
  txHash: string;
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
  paidBy: string; // user's Stellar public key or "server"
}

// A step the agent took during execution
export interface AgentStep {
  id: string;
  type: "think" | "pay" | "call" | "result";
  title: string;
  detail: string;
  txHash?: string;
  timestamp: Date;
}

// Full agent run state
export interface AgentRun {
  id: string;
  task: string;
  budgetXlm: number;
  spentXlm: number;
  steps: AgentStep[];
  payments: PaymentRecord[];
  result: string | null;
  status: "idle" | "running" | "complete" | "error";
}

// Streamed event from the /api/agent SSE endpoint
export type AgentEvent =
  | { type: "step"; step: AgentStep }
  | { type: "payment"; payment: PaymentRecord }
  | { type: "result"; result: string; totalSpent: number }
  | { type: "error"; message: string };
