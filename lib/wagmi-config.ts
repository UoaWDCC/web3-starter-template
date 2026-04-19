import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

//TODO: Import the networks you want to support from "@reown/appkit/networks"
import { mainnet, arbitrum, polygon, optimism, base } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

//TODO: Add networks and transports as needed
export const networks = [mainnet, arbitrum, polygon, optimism, base];

//TODO: Create the wagmiAdapter with the appropriate configuration
// - transports can be configured here if you want to use custom transports or add analytics
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
  },
});

export const config = wagmiAdapter.wagmiConfig;
