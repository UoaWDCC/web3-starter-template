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

// createAppKit must be called ONCE at module level, NOT inside a React component.
// If placed inside a component, it would re-initialise on every render and break wallet state.
import { createAppKit } from "@reown/appkit/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// TODO 3 ─ Import wagmiAdapter, projectId, and networks from your wagmi-config file.
// These were set up in wagmi-config.ts and contain everything AppKit needs to know
// about your supported chains and wallet adapter.

// Create ONE QueryClient for the entire application.
// React Query expects a single shared instance — recreating it inside a component
// would reset all cached state on every render.
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// Metadata displayed inside the WalletConnect modal.
// In production, `url` must match the domain registered in the Reown dashboard.
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

// Web3Provider wraps the application with Wagmi and React Query providers.
// The cookies prop comes from your Next.js root layout:
//
//   const cookies = headers().get("cookie")
//
// Passing cookies here allows Wagmi to rehydrate wallet connection state
// so the app does not briefly flash "disconnected" after a page reload.
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