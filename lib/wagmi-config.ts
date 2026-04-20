import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// ─────────────────────────────────────────────────────────────
// wagmi-config.ts — Foundation Layer
//
// This file is the starting point for the entire wallet integration.
// It defines:
//   - which blockchain networks your app supports
//   - how your app connects to those networks (via transports)
//   - how wallet connection state is stored across page reloads
//
// Everything configured here is imported and used by web3-provider.tsx,
// which sets up the React context that the rest of your app depends on.
// ─────────────────────────────────────────────────────────────

// TODO 1 ─ Import the networks you want to support.
// Each named export is a typed config object —
// it does NOT create a live connection. The actual connection is defined
// later in the transports object below.
import { } from "@reown/appkit/networks";

// Your WalletConnect Project ID, read from .env.local.
// This allows the WalletConnect modal to communicate with Reown's relay servers.
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// TODO 1 (cont.) ─ Add the networks you imported above to this array.
// Order matters — the first item will be the default selected chain
// when a user opens the wallet modal.
export const networks = [];

// WagmiAdapter wires Wagmi + WalletConnect together into a single adapter
// that the providers in web3-provider.tsx can consume.
//
// - storage          persists wallet connection state in cookies across reloads
// - transports       defines the RPC endpoint for each supported chain
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,

  // TODO 2 (cont.) ─ Add one http() entry per network you added above.
  transports: {
  },
});

// Export the Wagmi config so it can be consumed by WagmiProvider
// in web3-provider.tsx.
export const config = wagmiAdapter.wagmiConfig;