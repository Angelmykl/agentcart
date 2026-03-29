"use client";

// Freighter wallet helpers — used by WalletConnect component
// Freighter is the official Stellar browser wallet extension (like MetaMask for Stellar)

export async function connectFreighter(): Promise<{ publicKey: string | null; error: string | null }> {
  try {
    const freighter = await import("@stellar/freighter-api");

    const connected = await freighter.isConnected();
    if (!connected) {
      return { publicKey: null, error: "Freighter not installed. Please install the Freighter browser extension." };
    }

    // Request the user to approve the connection
    await freighter.requestAccess();

    // Get wallet address
    const result = await freighter.getAddress();
    if (result.error || !result.address) {
      return { publicKey: null, error: "Access denied. Please approve AgentCart in Freighter." };
    }

    return { publicKey: result.address, error: null };
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
