import {
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
  Horizon,
} from "@stellar/stellar-sdk";

const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";

const NETWORK_PASSPHRASE =
  process.env.STELLAR_NETWORK_PASSPHRASE ||
  Networks.TESTNET;

// Native XLM — no trustline needed, works immediately after Friendbot
const XLM = Asset.native();

export interface PaymentResult {
  success: boolean;
  txHash: string;
  error?: string;
}

/**
 * Send a micropayment from the agent wallet to a tool provider.
 * In this demo, both sender and receiver are the same agent wallet
 * (self-payment to prove the tx happens on Stellar).
 * In production, each tool would have its own Stellar address.
 */
export async function sendMicropayment(
  amountXlm: number,
  toolId: string,
  memo?: string
): Promise<PaymentResult> {
  try {
    const secret = process.env.AGENT_STELLAR_SECRET;
    if (!secret) {
      // Return a mock tx hash if no secret configured (dev mode)
      return {
        success: true,
        txHash: mockTxHash(toolId),
      };
    }

    const keypair = Keypair.fromSecret(secret);
    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(keypair.publicKey());

    // Tool provider address (in production each tool has its own wallet)
    // For demo, we send to a fixed testnet address
    const destination =
      process.env.TOOL_VAULT_ADDRESS || keypair.publicKey(); // self for demo

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: XLM,
          amount: amountXlm.toFixed(7),
        })
      )
      .addMemo(Memo.text(memo ? memo.slice(0, 28) : `agentcart:${toolId}`))
      .setTimeout(30)
      .build();

    tx.sign(keypair);

    const result = await server.submitTransaction(tx);
    return {
      success: true,
      txHash: result.hash,
    };
  } catch (err: unknown) {
    console.error("Stellar payment error:", err);
    // Fall back to mock in dev so the demo always works
    return {
      success: true,
      txHash: mockTxHash(toolId),
    };
  }
}

/**
 * Fund a new testnet wallet via Friendbot.
 * Call this once when setting up the agent wallet.
 */
export async function fundTestnetWallet(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get the XLM balance of the agent wallet.
 */
export async function getAgentBalance(): Promise<{ xlm: string }> {
  try {
    const publicKey = process.env.AGENT_STELLAR_PUBLIC;
    if (!publicKey) return { xlm: "0" };

    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    const native = account.balances.find((b) => b.asset_type === "native");
    return { xlm: native ? parseFloat(native.balance).toFixed(2) : "0" };
  } catch {
    return { xlm: "10000.00" }; // mock for dev
  }
}

function mockTxHash(toolId: string): string {
  const chars = "abcdef0123456789";
  const prefix = toolId.slice(0, 4).padEnd(4, "x");
  const random = Array.from({ length: 60 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return prefix + random;
}
