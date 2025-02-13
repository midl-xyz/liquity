import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, fallback, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, goerli, sepolia, localhost, Chain } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig, getDefaultConnectors } from "connectkit";
import { Flex, Heading, ThemeUIProvider, Paragraph, Link } from "theme-ui";
import { WagmiMidlProvider } from "@midl-xyz/midl-js-executor-react";
import { MidlProvider } from "@midl-xyz/midl-js-react";
import { midlConfig } from "./config/midlConfig";

import { LiquityProvider } from "./hooks/LiquityContext";
import { WalletConnector } from "./components/WalletConnector";
import { TransactionProvider } from "./components/Transaction";
import { Icon } from "./components/Icon";
import { getConfig } from "./config";
import theme from "./theme";

import { DisposableWalletProvider } from "./testUtils/DisposableWalletProvider";
import { LiquityFrontend } from "./LiquityFrontend";
import { AppLoader } from "./components/AppLoader";
import { useAsyncValue } from "./hooks/AsyncValue";
import { midlRegtest } from "@midl-xyz/midl-js-executor";

const isDemoMode = import.meta.env.VITE_APP_DEMO_MODE === "true";

if (isDemoMode) {
  const ethereum = new DisposableWalletProvider(
    import.meta.env.VITE_APP_RPC_URL || `http://${window.location.hostname || "localhost"}:8545`,
    "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
  );

  Object.assign(window, { ethereum });
}

// Start pre-fetching the config
getConfig().then(config => {
  // console.log("Frontend config:");
  // console.log(config);
  Object.assign(window, { config });
});

const UnsupportedMainnetFallback: React.FC = () => (
  <Flex
    sx={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center"
    }}
  >
    <Heading sx={{ mb: 3 }}>
      <Icon name="exclamation-triangle" /> This app is for testing purposes only.
    </Heading>

    <Paragraph sx={{ mb: 3 }}>Please change your network to Görli or Sepolia.</Paragraph>

    <Paragraph>
      If you'd like to use the Liquity Protocol on mainnet, please pick a frontend{" "}
      <Link href="https://www.liquity.org/frontend">
        here <Icon name="external-link-alt" size="xs" />
      </Link>
      .
    </Paragraph>
  </Flex>
);

const UnsupportedNetworkFallback: React.FC = () => (
  <Flex
    sx={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center"
    }}
  >
    <Heading sx={{ mb: 3 }}>
      <Icon name="exclamation-triangle" /> Liquity is not supported on this network.
    </Heading>
    Please switch to mainnet, Görli or Sepolia.
  </Flex>
);

const queryClient = new QueryClient();

const appName = "Liquity";
const appDescription = "Decentralized borrowing protocol";

const App = () => {
  const config = useAsyncValue(getConfig);
  const loader = <AppLoader />;

  return (
    <ThemeUIProvider theme={theme}>
      {config.loaded && (
        <WagmiProvider
          config={createConfig({
            chains: [
              {
                ...midlRegtest,
                rpcUrls: {
                  default: {
                    http: [midlRegtest.rpcUrls.default.http[0]]
                  }
                }
              } as Chain
            ],
            transports: {
              [midlRegtest.id]: http(midlRegtest.rpcUrls.default.http[0])
            }
          })}
        >
          <MidlProvider config={midlConfig}>
            <QueryClientProvider client={queryClient}>
              <WagmiMidlProvider />
              <WalletConnector loader={loader}>
                <LiquityProvider
                  loader={loader}
                  unsupportedNetworkFallback={<UnsupportedNetworkFallback />}
                  unsupportedMainnetFallback={<UnsupportedMainnetFallback />}
                >
                  <TransactionProvider>
                    <LiquityFrontend loader={loader} />
                  </TransactionProvider>
                </LiquityProvider>
              </WalletConnector>
            </QueryClientProvider>
          </MidlProvider>
        </WagmiProvider>
      )}
    </ThemeUIProvider>
  );
};

export default App;
