"use client";

// ① createAppKit should be called ONCE at module level, NOT inside a React component.
// If placed inside a component, it would re-initialise every render and break wallet state.
import { createAppKit } from "@reown/appkit/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";

import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// TODO: Import the wagmiAdapter, projectId, and networks from your wagmi-config file
// These are defined in the Wagmi configuration and contain the chain configuration,
// WalletConnect project ID, and adapter used by AppKit.

// ② Create ONE QueryClient for the entire application.
// React Query expects a single shared client instance.
// Creating this inside a component would recreate it on every render.
const queryClient = new QueryClient();

// Ensure the WalletConnect Project ID exists before continuing.
// This environment variable should be stored in `.env.local`.
if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// ③ Metadata displayed inside the WalletConnect modal.
// In production, the `url` must match the domain registered in the Reown dashboard.
const metadata = {
  name: "Wallet Connector",
  description: "Connect your wallet using WalletConnect",
  url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
  icons: ["/icon.svg"],
};

// TODO: Create the AppKit instance with the appropriate configuration.
// AppKit connects Wagmi + WalletConnect together and controls the wallet modal.
//
// Students should configure:
// - adapters → include wagmiAdapter
// - projectId → WalletConnect project ID
// - networks → supported blockchain networks
// - defaultNetwork → usually the first network in the array
// - metadata → app information shown in the wallet modal
createAppKit({
});

// ④ Web3Provider wraps the application with Wagmi and React Query providers.
// The cookies prop is passed from the Next.js root layout:
//
// const cookies = headers().get("cookie")
//
// This allows Wagmi to restore wallet connection state from cookies
// so the app does not briefly show "disconnected" after a page reload.
export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {

  // Convert cookies into Wagmi's initial state so wallet connection
  // persists across refreshes in SSR environments.
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    // TODO: Wrap the children with both:
    // 1. WagmiProvider → passes the Wagmi config and initial state
    // 2. QueryClientProvider → provides the React Query client
    //
    // The structure should look like:
    // WagmiProvider
    //   └ QueryClientProvider
    //       └ children
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}