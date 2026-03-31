"use client";

// Freighter wallet helpers
// Handles multiple versions of @stellar/freighter-api

export async function connectFreighter(): Promise<{ publicKey: string | null; error: string | null }> {
  try {
    const freighter = await import("@stellar/freighter-api");

    // Check if installed
    const connected = await freighter.isConnected();
    if (!connected) {
      return { publicKey: null, error: "Freighter not installed. Please install the Freighter browser extension." };
    }

    // Request access
    await freighter.requestAccess();

    // Try getAddress first (newer API), fall back to getPublicKey (older API)
    let publicKey: string | null = null;

    if (typeof (freighter as any).getAddress === "function") {
      const result = await (freighter as any).getAddress();
      // result can be { address: string } or just a string depending on version
      publicKey = typeof result === "string" ? result : result?.address ?? null;
    } else if (typeof (freighter as any).getPublicKey === "function") {
      const result = await (freighter as any).getPublicKey();
      publicKey = typeof result === "string" ? result : result?.publicKey ?? null;
    }

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
    const result = await freighter.getNetworkDetails();
    const isTestnet = result.networkPassphrase?.includes("Test SDF") ?? false;
    return { isTestnet, networkName: result.network ?? "unknown" };
  } catch {
    return { isTestnet: false, networkName: "unknown" };
  }
}
