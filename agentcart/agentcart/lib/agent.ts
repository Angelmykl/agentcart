import Anthropic from "@anthropic-ai/sdk";
import { buildClaudeTools, getToolById } from "./tools";
import { sendMicropayment } from "./stellar";
import { AgentEvent, AgentStep, PaymentRecord } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are AgentCart, an AI agent that autonomously purchases and uses paid tools to complete research and analysis tasks.

Each tool costs XLM. Payment is processed via the x402 protocol on Stellar before execution. Tool costs are in each tool's description.

Guidelines:
- Plan before calling tools — think about which tools you actually need
- Only call tools necessary for the task
- Stay within the user's XLM budget
- After gathering enough data, synthesise a clear, actionable final answer
- Do not call more tools than needed`;

export async function* runAgent(
  task: string,
  budgetXlm: number,
  userPublicKey: string | null = null,
): AsyncGenerator<AgentEvent> {
  const tools = buildClaudeTools();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];
  let spentXlm = 0;
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  yield {
    type: "step",
    step: makeStep(
      "think",
      `Wallet: ${userPublicKey ? `${userPublicKey.slice(0, 6)}…${userPublicKey.slice(-4)}` : "server"}`,
      `Budget: ${budgetXlm} XLM · "${task.slice(0, 72)}${task.length > 72 ? "…" : ""}"`
    ),
  };

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      yield { type: "result", result: text, totalSpent: spentXlm };
      return;
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (toolUseBlocks.length === 0) break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const tool = getToolById(toolUse.name);
      if (!tool) continue;

      if (spentXlm + tool.priceXlm > budgetXlm) {
        yield { type: "error", message: `Budget cap of ${budgetXlm} XLM reached. Stopping.` };
        return;
      }

      // Step 1: Attempt tool call → expect 402
      yield { type: "step", step: makeStep("think", `Requesting: ${tool.name}`, "Checking payment requirements…") };

      // Step 2: Pay via Stellar (x402 flow)
      yield { type: "step", step: makeStep("pay", `Purchasing: ${tool.name}`, `${tool.priceXlm} XLM via x402/Stellar`) };

      const payment = await sendMicropayment(
        tool.priceXlm,
        tool.id,
        `x402:${tool.id}:${Date.now()}`
      );

      spentXlm = Math.round((spentXlm + tool.priceXlm) * 100) / 100;

      const paymentRecord: PaymentRecord = {
        id: crypto.randomUUID(),
        toolId: tool.id,
        toolName: tool.name,
        amountXlm: tool.priceXlm,
        txHash: payment.txHash,
        timestamp: new Date(),
        status: payment.success ? "confirmed" : "failed",
        paidBy: userPublicKey ?? "server",
      };

      yield { type: "payment", payment: paymentRecord };

      yield {
        type: "step",
        step: makeStep(
          "pay",
          `x402 Paid: ${tool.name}`,
          `${tool.priceXlm} XLM · TX: ${payment.txHash.slice(0, 8)}…${payment.txHash.slice(-4)}`,
          payment.txHash
        ),
      };

      // Step 3: Retry tool call with X-Payment-Receipt header
      yield { type: "step", step: makeStep("call", `Calling: ${tool.name}`, "Sending X-Payment-Receipt header…") };

      const toolResult = await callToolWithReceipt(
        tool.id,
        toolUse.input as Record<string, unknown>,
        payment.txHash,
        tool.priceXlm
      );

      yield { type: "step", step: makeStep("call", `Done: ${tool.name}`, toolResult.summary) };

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(toolResult.data),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  yield { type: "error", message: "Max iterations reached without a final answer." };
}

/**
 * Call tool with X-Payment-Receipt header (x402 protocol)
 */
async function callToolWithReceipt(
  toolId: string,
  input: Record<string, unknown>,
  txHash: string,
  amountXlm: number
): Promise<{ data: unknown; summary: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const receipt = JSON.stringify({
    txHash,
    paidAt: Date.now(),
    amountXlm,
    memo: `x402:${toolId}`,
  });

  const res = await fetch(`${baseUrl}/api/tools/${toolId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Payment-Receipt": receipt,         // x402 payment proof
      "X-Payment-Version": "x402/1.0",
      "X-Payment-Scheme": "stellar",
    },
    body: JSON.stringify(input),
  });

  // Handle 402 — should not happen since we paid, but handle gracefully
  if (res.status === 402) {
    return { data: { error: "Payment not accepted" }, summary: "Payment verification failed" };
  }

  if (!res.ok) {
    return { data: { error: "Tool call failed" }, summary: "Error from tool" };
  }

  const data = await res.json();
  return { data, summary: data._summary || "Data retrieved" };
}

function makeStep(type: AgentStep["type"], title: string, detail: string, txHash?: string): AgentStep {
  return { id: crypto.randomUUID(), type, title, detail, txHash, timestamp: new Date() };
}
