"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

//TODO: Import the wagmiAdapter, projectId, and networks from your wagmi-config file

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

const metadata = {
  name: "Wallet Connector",
  description: "Connect your wallet using WalletConnect",
  url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
  icons: ["/icon.svg"],
};

//TODO: Create the appKit instance with the appropriate configuration
createAppKit({
});

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
    //TODO: Wrap the children with the WagmiProvider and QueryClientProvider, passing the appropriate props
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
