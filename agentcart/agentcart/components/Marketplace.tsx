"use client";

import { TOOLS } from "@/lib/tools";
import { Tool } from "@/types";

interface MarketplaceProps {
  usedToolIds: string[];
}

export default function Marketplace({ usedToolIds }: MarketplaceProps) {
  return (
    <div style={{ padding: "16px 18px 0", overflow: "hidden" }}>
      <div style={{
        fontSize: 10,
        letterSpacing: 2,
        color: "var(--muted)",
        marginBottom: 12,
      }}>
        // TOOL MARKETPLACE
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {TOOLS.map((tool: Tool) => {
          const used = usedToolIds.includes(tool.id);
          return (
            <div
              key={tool.id}
              style={{
                background: "var(--card)",
                border: `1px solid ${used ? "var(--stellar)" : "var(--border)"}`,
                borderRadius: 6,
                padding: "11px 13px",
                display: "flex",
                alignItems: "center",
                gap: 11,
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.3s",
              }}
            >
              {/* Active left bar */}
              {used && (
                <div style={{
                  position: "absolute",
                  left: 0, top: 0, bottom: 0,
                  width: 3,
                  background: "var(--stellar)",
                }} />
              )}

              <div style={{ fontSize: 20, flexShrink: 0 }}>{tool.emoji}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--text)",
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  {tool.name}
                  {used && (
                    <span style={{
                      background: "rgba(0,255,136,0.1)",
                      color: "var(--green)",
                      border: "1px solid rgba(0,255,136,0.25)",
                      fontSize: 9,
                      padding: "1px 5px",
                      borderRadius: 3,
                    }}>
                      USED
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {tool.description}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: "var(--stellar)", fontWeight: 700 }}>
                  {tool.priceXlm.toFixed(2)}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>XLM/call</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit your own tool CTA */}
      <div style={{
        marginTop: 14,
        background: "rgba(0,212,255,0.04)",
        border: "1px dashed rgba(0,212,255,0.2)",
        borderRadius: 6,
        padding: "12px",
        textAlign: "center",
        fontSize: 11,
        color: "var(--muted)",
      }}>
        Want to earn XLM?{" "}
        <span style={{ color: "var(--stellar)", cursor: "pointer" }}>
          List your own paid tool →
        </span>
      </div>
    </div>
  );
}
