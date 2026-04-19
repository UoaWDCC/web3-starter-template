import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// ① Import the networks you want to support.
// Each import is just a typed configuration object — it does NOT create
// a live RPC connection yet. Connections are configured later via transports.
import {} from "@reown/appkit/networks";

// ② Your WalletConnect Project ID.
// This should be stored in `.env.local` as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
// It allows the WalletConnect modal to communicate with their relay servers.
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Fail fast if the environment variable is missing.
if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// ③ The networks array controls which chains appear in the wallet modal.
// Order matters — the first item will be the default selected chain.
export const networks = [];

// ④ WagmiAdapter wires Wagmi + WalletConnect together.
// - ssr: true enables cookie-based state persistence to prevent
//   hydration mismatches in server-rendered frameworks like Next.js.
// - storage: uses cookies so wallet connection state can survive reloads.
// - transports: defines the RPC provider for each supported chain.
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),

  ssr: true,
  projectId,
  networks,

  // - transports can be configured here if you want to use custom transports or add analytics
  transports: {
  },
});

// ⑤ Export the Wagmi configuration so it can be used
// by the WagmiProvider in your React app.
export const config = wagmiAdapter.wagmiConfig;