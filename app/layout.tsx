import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentCart — Paid Tools for AI Agents on Stellar",
  description:
    "A marketplace where AI agents autonomously purchase and use tools via Stellar x402 micropayments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
