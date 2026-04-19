# WDCC x Web3UOA Workshop Guide
## Building a Wallet Connector with WalletConnect

**Duration:** ~1 hour  
**Audience:** Students familiar with React/Next.js, new to Web3  
**Goal:** Students will implement a fully functional wallet connector that works with MetaMask and other Web3 wallets

---

## Pre-Workshop Setup (For Instructor)

### 1. Repository Setup
Ensure your GitHub repository has two branches:
- `main` - Complete working solution
- `starter` - Skeleton code with TODOs for students

### 2. Student Prerequisites
Share these requirements with students **before** the workshop:
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] MetaMask browser extension installed (https://metamask.io)
- [ ] A code editor (VS Code recommended)
- [ ] Create a free WalletConnect Project ID at https://cloud.reown.com

### 3. Pre-Workshop Instructions for Students
```bash
# Clone the starter branch
git clone -b starter <your-repo-url>
cd <repo-name>

# Install dependencies
pnpm install

# Create .env.local file
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here" > .env.local

# Start the dev server
pnpm dev
```

---

## Workshop Agenda

| Time | Section | Description |
|------|---------|-------------|
| 0:00 - 0:10 | Introduction | Web3 concepts & workshop overview |
| 0:10 - 0:25 | Step 1 | Configure wagmi & networks |
| 0:25 - 0:40 | Step 2 | Set up Web3Provider |
| 0:40 - 0:55 | Step 3 | Implement WalletConnector hooks |
| 0:55 - 1:00 | Wrap-up | Testing & Q&A |

---

## Section 1: Introduction (10 minutes)

### Talking Points

#### What is Web3?
> "Web3 refers to a decentralized internet built on blockchain technology. Unlike Web2 where companies control your data, Web3 lets users own their data and digital assets through cryptographic wallets."

#### What is a Wallet?
> "A crypto wallet is like your digital identity on the blockchain. It has a public address (like an email) that others can send assets to, and a private key (like a password) that lets you authorize transactions. **You never share your private key.**"

#### What is WalletConnect?
> "WalletConnect is an open protocol that lets your web app communicate with various wallets. Instead of building separate integrations for MetaMask, Rainbow, Coinbase Wallet, etc., WalletConnect provides one unified connection method."

#### What We're Building Today
Show the completed `/wallet` page and demonstrate:
1. Clicking "Connect Wallet"
2. Connecting with MetaMask
3. Viewing wallet address, balance, and network
4. Switching networks
5. Disconnecting

### Key Concepts to Explain

| Term | Simple Explanation |
|------|-------------------|
| **Wallet Address** | Your public identifier on the blockchain (0x...) |
| **Chain/Network** | Different blockchains (Ethereum, Polygon, etc.) |
| **RPC** | Remote Procedure Call - how your app talks to the blockchain |
| **Provider** | The service that connects your app to blockchain nodes |
| **Signer** | The wallet that can sign/authorize transactions |

---

## Section 2: Step 1 - Configure Wagmi (15 minutes)

**File:** `lib/wagmi-config.ts`

### Teaching Flow

#### 2.1 Explain the File Purpose (2 min)
> "This configuration file tells our app which blockchain networks to support and how to connect to them. Think of it as setting up the 'phone lines' between your app and various blockchains."

#### 2.2 Live Code Together

**First, explain the imports:**
```typescript
import { cookieStorage, createStorage } from "wagmi";
import { mainnet, arbitrum, polygon, optimism, base } from "wagmi/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
```

> "We import pre-configured chain definitions from wagmi. Each chain object contains RPC URLs, chain IDs, native currencies, and block explorer URLs."

**Then, implement the networks array:**
```typescript
// STEP 1: Define which blockchain networks your app will support
export const networks = [mainnet, arbitrum, polygon, optimism, base];
```

> "We're supporting 5 networks. Mainnet is Ethereum's main network where real transactions happen. The others are Layer 2 solutions that offer faster, cheaper transactions."

**Next, set up the project ID:**
```typescript
// STEP 2: Get your WalletConnect Project ID from environment variables
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}
```

> "The Project ID authenticates your app with WalletConnect's relay servers. Without it, wallet connections won't work."

**Finally, create the adapter:**
```typescript
// STEP 3: Create the Wagmi adapter with SSR support
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});
```

> "The adapter bridges WalletConnect's AppKit with wagmi. We use cookie storage for SSR compatibility - this prevents hydration mismatches between server and client."

#### 2.3 Checkpoint
Ask students to verify their code compiles without errors:
```bash
# The dev server should show no errors
```

### Common Questions

**Q: Why these specific networks?**
> "These are the most popular EVM-compatible networks. You can add any chain from `wagmi/chains` or define custom ones."

**Q: What's the difference between mainnet and testnets?**
> "Mainnet uses real money. Testnets like Sepolia use free test tokens - perfect for development. For this workshop, we'll connect to mainnet but won't send any transactions."

---

## Section 3: Step 2 - Web3Provider (15 minutes)

**File:** `components/web3-provider.tsx`

### Teaching Flow

#### 3.1 Explain the Provider Pattern (2 min)
> "React providers wrap your app to share data with all child components. We need three providers: QueryClientProvider for data fetching, WagmiProvider for wallet state, and AppKit for the connection UI."

#### 3.2 Live Code Together

**Set up React Query:**
```typescript
// STEP 1: Create a QueryClient for data fetching/caching
const queryClient = new QueryClient();
```

> "React Query handles caching and refetching blockchain data. When you check your balance, it caches the result and automatically refreshes it."

**Initialize AppKit (this is the key part):**
```typescript
// STEP 2: Configure the metadata for your dApp
const metadata = {
  name: "WDCC x Web3UOA",
  description: "Learn Web3 Development",
  url: typeof window !== "undefined" ? window.location.origin : "",
  icons: ["/icon.png"],
};

// STEP 3: Initialize AppKit - this creates the modal UI
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: false,
  },
});
```

> "The metadata appears in wallet connection prompts. Users see your app name and icon when approving the connection - it builds trust."

**Wire up the providers:**
```typescript
// STEP 4: Wrap children with the necessary providers
return (
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </WagmiProvider>
);
```

> "The order matters! WagmiProvider must wrap QueryClientProvider. This gives all child components access to wallet state and cached data."

#### 3.3 Verify the Modal Works
Have students:
1. Save the file
2. Navigate to `/wallet` in the browser
3. Click "Connect Wallet" - they should see the AppKit modal!

> "The modal won't connect yet because we haven't implemented the hooks, but seeing it appear means our provider setup is correct."

### Common Issues

| Issue | Solution |
|-------|----------|
| "projectId is not defined" | Check the import from `@/lib/wagmi-config` |
| Hydration mismatch warnings | Ensure `ssr: true` is set in wagmi-config |
| Modal doesn't appear | Check browser console for errors |

---

## Section 4: Step 3 - WalletConnector Hooks (15 minutes)

**File:** `components/wallet-connector.tsx`

### Teaching Flow

#### 4.1 Explain Wagmi Hooks (3 min)
> "Wagmi provides React hooks that automatically sync with wallet state. When the user connects or disconnects, these hooks update and your UI re-renders."

Show the hooks we'll use:
```typescript
useAccount()    // → address, isConnected, status
useBalance()    // → balance data for an address  
useChainId()    // → current chain ID
useDisconnect() // → disconnect function
```

#### 4.2 Live Code Together

**Implement useAccount:**
```typescript
// STEP 1: Get account information
// This hook provides: address, isConnected, isConnecting, isDisconnected
const { address, isConnected } = useAccount();
```

> "useAccount is your primary hook for connection state. The address is the user's wallet address, and isConnected tells you if they're currently connected."

**Implement useBalance:**
```typescript
// STEP 2: Get the wallet balance
// Pass the connected address to fetch its native token balance
const { data: balance } = useBalance({
  address: address,
});
```

> "useBalance fetches the native token balance (ETH on Ethereum, MATIC on Polygon, etc.). It automatically refetches when the network changes."

**Implement useChainId:**
```typescript
// STEP 3: Get the current chain ID
// This tells us which network the user is connected to
const chainId = useChainId();
```

> "Chain ID is a unique identifier for each network. Ethereum mainnet is 1, Polygon is 137, etc. We use this to show the network name."

**Implement useDisconnect:**
```typescript
// STEP 4: Get the disconnect function
// Call this to disconnect the wallet
const { disconnect } = useDisconnect();
```

> "Simple hook that returns a function to disconnect the wallet. We'll wire this to our disconnect button."

#### 4.3 Wire Up the UI

Show how these values connect to the existing UI:
```tsx
// The UI already exists - it just needs the real values!

// Address display
<span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>

// Balance display  
<span>{parseFloat(balance?.formatted || "0").toFixed(4)} {balance?.symbol}</span>

// Network display
<span>{chainName}</span>

// Disconnect button
<button onClick={() => disconnect()}>Disconnect</button>
```

#### 4.4 Test the Complete Flow
Guide students through:
1. Click "Connect Wallet"
2. Select MetaMask (or scan QR with mobile wallet)
3. Approve the connection in MetaMask
4. See their address, balance, and network appear
5. Try switching networks in MetaMask - watch the UI update!
6. Click Disconnect

### Celebration Moment!
> "You've just built a production-ready wallet connector! This same pattern powers real DeFi apps, NFT marketplaces, and DAOs."

---

## Section 5: Wrap-up & Q&A (5 minutes)

### Recap Key Learnings
1. **wagmi-config.ts** - Defines supported networks and creates the adapter
2. **web3-provider.tsx** - Wraps the app with providers for wallet state
3. **wallet-connector.tsx** - Uses hooks to read wallet data and render UI

### What's Next?
Share these resources for students who want to continue learning:

| Topic | Resource |
|-------|----------|
| Wagmi Documentation | https://wagmi.sh |
| Reown (WalletConnect) Docs | https://docs.reown.com |
| Viem (low-level library) | https://viem.sh |
| Build a Token Transfer | wagmi's `useWriteContract` hook |
| Read Smart Contracts | wagmi's `useReadContract` hook |

### Challenge Ideas
For students who finish early or want homework:
1. Add a "Copy Address" button that copies to clipboard
2. Display a different icon for each network
3. Add support for ENS names (show `vitalik.eth` instead of the address)
4. Implement a "Send ETH" form using `useSendTransaction`

---

## Troubleshooting Guide

### Common Issues During Workshop

#### "MetaMask not detected"
- Ensure MetaMask extension is installed and unlocked
- Try refreshing the page
- Check if another wallet extension is interfering

#### "Connection rejected"
- User may have clicked "Reject" in MetaMask
- Check if the site is blocked in MetaMask settings

#### "Wrong network" warnings
- This is normal - the app supports multiple networks
- User can switch networks in MetaMask or use the app's network switcher

#### Balance shows 0
- This is likely correct - testnet accounts start empty
- On mainnet, the user may simply have no ETH

#### "Module not found" errors
```bash
# Ensure dependencies are installed
pnpm install
```

#### Environment variable issues
```bash
# Check .env.local exists and has the correct format
cat .env.local
# Should show: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=xxx

# Restart dev server after changing env vars
pnpm dev
```

---

## Appendix: Complete Code Reference

If students get stuck, they can check out the `main` branch:
```bash
# See the completed solution
git diff starter main -- lib/wagmi-config.ts
git diff starter main -- components/web3-provider.tsx  
git diff starter main -- components/wallet-connector.tsx
```

Or view specific files:
```bash
git show main:lib/wagmi-config.ts
git show main:components/web3-provider.tsx
git show main:components/wallet-connector.tsx
```

---

## Instructor Notes

### Timing Adjustments
- If running behind: Skip the network switching demo, focus on basic connect/disconnect
- If running ahead: Add the ENS challenge or discuss smart contract interactions

### Engagement Tips
- Have students share their wallet addresses in chat (public addresses are safe to share!)
- Show a block explorer (etherscan.io) and look up a student's address
- Demonstrate what happens when you reject a connection request

### After the Workshop
- Share the `main` branch link for reference
- Consider creating a Discord channel for follow-up questions
- Collect feedback on what worked well and what was confusing

---

**Good luck with your workshop!**
