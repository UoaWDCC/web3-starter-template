"use client";

// ─────────────────────────────────────────────────────────────
// web3-provider.tsx — Context Layer
//
// This file sits between wagmi-config.ts and your UI components.
// It is responsible for:
//   - initialising AppKit (the WalletConnect modal) once at app startup
//   - wrapping your app in the React providers that wagmi hooks depend on
//   - restoring wallet connection state from cookies on page reload
// It must wrap your entire app — place it in your root layout.
// Any component that uses a wagmi or AppKit hook must be a descendant of Web3Provider.
// ─────────────────────────────────────────────────────────────

import { createAppKit } from "@reown/appkit/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// TODO 3 ─ Import wagmiAdapter, projectId, and networks from your wagmi-config file.
// These were set up in wagmi-config.ts and contain everything AppKit needs to know
// about your supported chains and wallet adapter.

// Create ONE QueryClient for the entire application.
// Fetches data for wagmi hooks, such as useBalance, and caches it according to React Query's rules.
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// Metadata displayed inside the WalletConnect modal.
// Metadata : structured information that describes, explains, locates, or manages information resources. 
// In this case, it provides details about your app to users when they open the wallet connection modal.
const metadata = {
  name: "Wallet Connector",
  description: "Connect your wallet using WalletConnect",
  url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
  icons: ["/icon.svg"],
};

// TODO 4 ─ Fill in the createAppKit call below.
// This initialises the WalletConnect modal and connects it to your Wagmi adapter.
createAppKit({
});

// Web3Provider is the component that wraps your entire app and provides wallet connection context to all child components.
export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    // TODO 5 ─ Wrap children in both providers in the correct order:
    //
    // WagmiProvider        → must be outermost, passes the wagmi config and initial state
    //   └ QueryClientProvider  → provides React Query to wagmi's internal hooks
    //       └ children
    //
    // Swapping the order or omitting either provider will cause hook errors.
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}