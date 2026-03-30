import Anthropic from "@anthropic-ai/sdk";
import { buildClaudeTools, getToolById } from "./tools";
import { sendMicropayment } from "./stellar";
import { AgentEvent, AgentStep, PaymentRecord } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are AgentCart, an AI agent that autonomously purchases and uses paid tools to complete research and analysis tasks.

Each tool costs XLM. Payment is processed via Stellar before execution. Tool costs are in each tool's description.

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

      yield { type: "step", step: makeStep("pay", `Purchasing: ${tool.name}`, `${tool.priceXlm} XLM via Stellar`) };

      const payment = await sendMicropayment(tool.priceXlm, tool.id, `agentcart:${tool.id}`);
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
          `Paid: ${tool.name}`,
          `${tool.priceXlm} XLM · TX: ${payment.txHash.slice(0, 8)}…${payment.txHash.slice(-4)}`,
          payment.txHash
        ),
      };

      yield { type: "step", step: makeStep("call", `Calling: ${tool.name}`, "Executing…") };

      const toolResult = await callTool(tool.id, toolUse.input as Record<string, unknown>);

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

async function callTool(toolId: string, input: Record<string, unknown>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/tools/${toolId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return { data: { error: "Tool call failed" }, summary: "Error from tool" };
  const data = await res.json();
  return { data, summary: data._summary || "Data retrieved" };
}

function makeStep(type: AgentStep["type"], title: string, detail: string, txHash?: string): AgentStep {
  return { id: crypto.randomUUID(), type, title, detail, txHash, timestamp: new Date() };
}
