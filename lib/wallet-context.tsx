"use client";

export async function connectFreighter(): Promise<{ publicKey: string | null; error: string | null }> {
  try {
    const freighter = await import("@stellar/freighter-api");

    const connected = await freighter.isConnected();
    if (!connected) {
      return { publicKey: null, error: "Freighter not installed. Please install the Freighter browser extension." };
    }

    await freighter.requestAccess();

    // This version uses getPublicKey
    const result = await (freighter as any).getPublicKey();
    const publicKey = typeof result === "string" ? result : result?.publicKey ?? null;

    if (!publicKey) {
      return { publicKey: null, error: "Could not get public key. Please approve AgentCart in Freighter." };
    }

    return { publicKey, error: null };
  } catch (err) {
    return { publicKey: null, error: `Connection failed: ${String(err)}` };
  }
}

export async function checkFreighterNetwork(): Promise<{ isTestnet: boolean; networkName: string }> {
  try {
    const freighter = await import("@stellar/freighter-api");
    const result = await (freighter as any).getNetworkDetails();
    const isTestnet = result?.networkPassphrase?.includes("Test SDF") ?? false;
    return { isTestnet, networkName: result?.network ?? "unknown" };
  } catch {
    return { isTestnet: false, networkName: "unknown" };
  }
}
