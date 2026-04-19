# Web3 Wallet Connector Workshop

**Stack:** Next.js · wagmi · Reown AppKit (WalletConnect) · TanStack Query

---
## Pre-Workshop Setup 
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] MetaMask browser extension installed (https://metamask.io)
- [ ] A code editor (VS Code recommended)
- [ ] Create a free WalletConnect Project ID at https://walletconnect.network/
## Overview

You'll be integrating a wallet connector into a Next.js app using three files that each play a distinct role. By the end of this workshop you'll have a working connect/disconnect flow supporting MetaMask, WalletConnect, and Coinbase Wallet across multiple EVM chains.

---

## Part 1 — Architecture

The three files form a clear dependency chain. Think of it like a restaurant: `wagmi-config.ts` is the kitchen setup, `web3-provider.tsx` is the front-of-house staff, and `wallet-connector.tsx` is what the customer actually sees and touches.

```
wagmi-config.ts
│  Defines networks, RPC transports, and storage.
│  Exports wagmiAdapter and config.
│
└─▶ web3-provider.tsx
    │  Calls createAppKit once. Wraps your app in
    │  WagmiProvider + QueryClientProvider.
    │  Goes in your root layout.
    │
    └─▶ wallet-connector.tsx
           Consumes context via hooks.
           Renders the connect card or connected card
           depending on wallet state.
```
*Remote Procedure Call (RPC) is a communication protocol that allows a computer program to execute code on a separate server or machine as if it were a local function call

### File roles at a glance

| File | Role | You will... |
|---|---|---|
| `wagmi-config.ts` | Foundation — networks & transports | Add chains, swap RPC URLs |
| `web3-provider.tsx` | Context layer — providers & AppKit init | Set app metadata |
| `wallet-connector.tsx` | UI component — hooks & rendering | Add features and UI |

---

## Part 2 — Libraries

### Why these four packages?

**`wagmi ("We're All Gonna Make It")`**  
React hooks for Ethereum. Wraps viem and gives you `useBalance`, `useAccount`, `useSignMessage`, and more. You only need 2–3 hooks to ship a working integration.

**`@reown/appkit`**  
The WalletConnect modal UI. Handles MetaMask, WalletConnect QR, and Coinbase Wallet — all in one drop-in modal. Requires a free project ID from [WalletConnect](https://walletconnect.network/).

**`@tanstack/react-query`**  
Async state management. wagmi uses it internally for caching RPC calls. You don't interact with it directly — you just need `QueryClientProvider` in the tree.

**`@wagmi/core`**  
Framework-agnostic core used by the WagmiAdapter. Provides `createStorage` and `cookieStorage` for SSR-safe state persistence across page loads.

### Key hooks you'll use

| Hook | Returns | Use it to... |
|---|---|---|
| `useAppKit()` | `open()` | Open the connect/account/network modal |
| `useAppKitAccount()` | `address`, `isConnected`, `status` | Gate rendering on connection state |
| `useAppKitNetwork()` | `caipNetwork`, `chainId` | Display the active chain name and explorer URL |
| `useBalance({ address })` | `{ formatted, symbol, value }` | Show the user's native token balance |

> **Tip:** `open()` accepts an optional `view` parameter:  
> - `open({ view: "Networks" })` → opens the network switcher  
> - `open({ view: "Account" })` → opens account details (with disconnect)

---

## Part 3 — File Walkthrough

### `wagmi-config.ts`

```ts
import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
// ① Each import is just a typed config object — not a live connection
import { mainnet, arbitrum, polygon, optimism, base } from "@reown/appkit/networks";

// ② Your WalletConnect project ID — stored in .env.local
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// ③ The networks array controls which chains appear in the modal.
//    Order matters — the first item is the default chain.
export const networks = [mainnet, arbitrum, polygon, optimism, base];

// ④ WagmiAdapter wires everything together.
//    ssr: true enables cookie-based state so there's no hydration mismatch.
//    transports: one http() per chain — swap for Alchemy/Infura URLs in prod.
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [mainnet.id]: http(),   // public RPC — rate-limited, fine for dev
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;
```

**Things to configure here:**
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in your `.env.local`
- The `networks` array (add or remove chains)
- The `transports` object (swap public RPCs for Alchemy/Infura in production)

---

### `web3-provider.tsx`

```tsx
// ① createAppKit is called ONCE at module level, NOT inside a component.
//    If you put it inside a component, it re-initialises on every render.
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { wagmiAdapter, projectId, networks } from "@/lib/wagmi-config";

// ② One QueryClient for the whole app — don't recreate inside components
const queryClient = new QueryClient();

// ③ This metadata is displayed inside the WalletConnect modal.
//    In production, `url` must match your domain in the Reown dashboard.
const metadata = {
  name: "Wallet Connector",
  description: "Connect your wallet using WalletConnect",
  url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
  icons: ["/icon.svg"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata,
  features: { analytics: true },
});

// ④ The cookies prop comes from your Next.js root layout:
//    const cookies = headers().get("cookie")
//    It seeds client state so there's no flash of "disconnected" on reload.
export function Web3Provider({ children, cookies }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

**Things to configure here:**
- The `metadata` object (name, description, url, icons)
- `features` — toggle analytics, email login, etc.

---

### `wallet-connector.tsx`

```tsx
// ① Pull in all three AppKit hooks at the top of the component
const { open } = useAppKit();
const { address, isConnected, status } = useAppKitAccount();
const { caipNetwork, chainId } = useAppKitNetwork();

// ② useBalance auto-fetches on the active chain.
//    Cast address as `0x${string}` — wagmi requires this branded type.
const { data: balance } = useBalance({
  address: address as `0x${string}` | undefined,
});

// ③ The whole component is a simple conditional render.
//    !isConnected → show the "Connect Wallet" card
//     isConnected → show the connected state card
if (!isConnected) {
  return <ConnectCard onConnect={() => open()} />;
}

// ④ Useful values to display in the connected state:
//    caipNetwork.name          → "Ethereum", "Arbitrum One", etc.
//    caipNetwork.blockExplorers.default.url  → etherscan URL
//    balance.formatted         → "1.2345"
//    balance.symbol            → "ETH"
//    chainId                   → 1, 42161, etc.
```

**Things you'll add here:**
- Toast feedback on copy
- Chain-gated UI sections
- Additional balance or token displays

---

## Part 4 — Exercise

Complete the tasks below in order. Ask for help if you get stuck!

### Task 1 — Wire up your project ID
1. Create `.env.local` in the project root
2. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here`
3. Get a free project ID at [WalletConnect](https://walletconnect.network/)
4. Run `npm run dev` and confirm no environment error in the console

### Task 2 — Add a testnet
In `wagmi-config.ts`, add `sepolia` to the networks array:

```ts
import { mainnet, arbitrum, polygon, optimism, base, sepolia } from "@reown/appkit/networks";

export const networks = [mainnet, arbitrum, polygon, optimism, base, sepolia];

// Also add to transports:
transports: {
  // ...existing entries
  [sepolia.id]: http(),
}
```

Open the network switcher in the modal and confirm Sepolia appears.

### Task 3 — Add a copy toast
In `wallet-connector.tsx`, give users feedback when they copy their address:

```tsx
const [copied, setCopied] = useState(false);

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// In your JSX, next to the Copy button:
{copied && <span className="text-xs text-emerald-500">Copied!</span>}
```

### Task 4 — Gate a UI section
Below the balance card, add a placeholder panel that only renders when a wallet is connected:

```tsx
{isConnected && (
  <div className="rounded-lg bg-muted/50 p-4">
    <p className="text-xs font-medium text-muted-foreground mb-1">Your NFTs</p>
    <p className="text-sm text-muted-foreground">Coming soon...</p>
  </div>
)}
```

### Task 5 ★ — Stretch goal: private RPC
Replace the public `http()` transport for mainnet with a provider URL:

```ts
// In .env.local:
// NEXT_PUBLIC_ALCHEMY_MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/your_key

transports: {
  [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL),
  // ...rest unchanged
}
```

---

## Part 5 — Extension Ideas 

### ERC-20 token balances
Use `useBalance` with a `token` param to fetch any ERC-20 balance:

```ts
const { data: usdcBalance } = useBalance({
  address,
  token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on mainnet
});
```

Map over a list of contract addresses to build a portfolio view.

### Chain-gated content
Check the active chain and warn users if they're on the wrong network:

```tsx
import { mainnet } from "@reown/appkit/networks";

{chainId !== mainnet.id && (
  <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600">
    Please switch to Ethereum Mainnet to use this feature.
  </div>
)}
```

### Sign a message
Let users prove wallet ownership without sending a transaction:

```tsx
import { useSignMessage } from "wagmi";

const { signMessage, data: signature } = useSignMessage();

<button onClick={() => signMessage({ message: "Verify my wallet" })}>
  Sign to verify
</button>
{signature && <p className="font-mono text-xs break-all">{signature}</p>}
```

### Send ETH
Add a simple transfer form using `useSendTransaction`:

```tsx
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";

const { sendTransaction } = useSendTransaction();

sendTransaction({
  to: "0xRecipientAddress",
  value: parseEther("0.001"),
});
```

---

## Common Gotchas

**`createAppKit` inside a component**  
Always call it at module level. If it's inside a React component, it re-initialises on every render and breaks modal state.

**Missing `QueryClientProvider`**  
wagmi hooks will throw if `QueryClientProvider` isn't an ancestor. Make sure `Web3Provider` wraps your entire app in the root layout.

**Address type errors**  
wagmi's `useBalance` expects `0x${string}`, not plain `string`. Always cast: `address as \`0x${string}\``.

**Hydration mismatch**  
This is why we use `cookieStorage` and `ssr: true`. If you see hydration errors, check that `cookies` is being passed correctly from your root layout into `Web3Provider`.

**Rate limits on public RPCs**  
The default `http()` transport uses public endpoints that are heavily rate-limited. For anything beyond local dev, use Alchemy, Infura, or another provider.

---

## Resources

- [WalletConnect Docs](https://docs.walletconnect.network/)
- [wagmi docs](https://wagmi.sh)
- [viem docs](https://viem.sh)
- [Get a WalletConnect project ID](https://walletconnect.network/)
- [Alchemy (free RPC tier)](https://www.alchemy.com)
- [Infura (free RPC tier)](https://infura.io)