import { Tool } from "@/types";

export const TOOLS: Tool[] = [
  {
    id: "defillama",
    name: "DeFiLlama Live Feed",
    description: "Real-time TVL, protocol stats across 200+ chains",
    emoji: "📊",
    priceXlm: 5,
    category: "data",
    endpoint: "/api/tools/defillama",
  },
  {
    id: "sentiment",
    name: "CryptoSentiment API",
    description: "Social + on-chain sentiment for 5,000+ tokens",
    emoji: "🧠",
    priceXlm: 8,
    category: "analysis",
    endpoint: "/api/tools/sentiment",
  },
  {
    id: "news",
    name: "News Intelligence",
    description: "Real-time news search with entity extraction",
    emoji: "📰",
    priceXlm: 3,
    category: "data",
    endpoint: "/api/tools/news",
  },
  {
    id: "webhook",
    name: "Webhook Dispatcher",
    description: "Send alerts to Slack, Telegram, or email",
    emoji: "🔔",
    priceXlm: 1,
    category: "action",
    endpoint: "/api/tools/webhook",
  },
  {
    id: "scraper",
    name: "Web Scraper",
    description: "Fetch and extract text content from any public URL",
    emoji: "🕸️",
    priceXlm: 4,
    category: "data",
    endpoint: "/api/tools/scraper",
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

// Build Claude tool_use definitions from registry
export function buildClaudeTools() {
  return TOOLS.map((tool) => ({
    name: tool.id,
    description: `${tool.name}: ${tool.description}. Costs ${tool.priceXlm} XLM per call. Payment is made automatically via Stellar before the tool executes.`,
    input_schema: getToolSchema(tool.id),
  }));
}

function getToolSchema(toolId: string) {
  switch (toolId) {
    case "defillama":
      return {
        type: "object" as const,
        properties: {
          limit: {
            type: "number",
            description: "Number of top protocols to return (default 5)",
          },
        },
        required: [],
      };
    case "sentiment":
      return {
        type: "object" as const,
        properties: {
          tokens: {
            type: "array",
            items: { type: "string" },
            description: "List of token symbols to analyze, e.g. ['BTC','ETH']",
          },
        },
        required: ["tokens"],
      };
    case "news":
      return {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: "Search query for news articles",
          },
          limit: {
            type: "number",
            description: "Number of articles to return (default 5)",
          },
        },
        required: ["query"],
      };
    case "webhook":
      return {
        type: "object" as const,
        properties: {
          message: {
            type: "string",
            description: "Message to dispatch",
          },
          channel: {
            type: "string",
            enum: ["slack", "telegram", "email"],
            description: "Target channel",
          },
        },
        required: ["message", "channel"],
      };
    case "scraper":
      return {
        type: "object" as const,
        properties: {
          url: {
            type: "string",
            description: "Full URL to scrape including https://",
          },
          mode: {
            type: "string",
            enum: ["summary", "full"],
            description: "summary returns first 3000 chars, full returns all",
          },
        },
        required: ["url"],
      };
    default:
      return { type: "object" as const, properties: {}, required: [] };
  }
}

