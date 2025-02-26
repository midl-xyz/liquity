import { useAccounts, useConnect } from "@midl-xyz/midl-js-react";
import { Box, Button, Container, Flex } from "theme-ui";
import { Icon } from "./Icon";
import { AddressPurpose } from "@midl-xyz/midl-js-core";
import { useState } from "react";
import useKeypress from "../hooks/useKeyPress";
import { Header } from "./Header";
import { LiquityLogo } from "./LiquityLogo";
import { Nav } from "./Nav";
import { SideNav } from "./SideNav";

type WalletConnectorProps = React.PropsWithChildren<{
  loader?: React.ReactNode;
}>;

export const WalletConnector = ({ children }: WalletConnectorProps) => {
  const { accounts } = useAccounts();
  const { connectors, connectAsync } = useConnect({
    purposes: [AddressPurpose.Ordinals]
  });

  const [modalOpen, setModalOpen] = useState(false);

  useKeypress("Escape", () => {
    setModalOpen(false);
  });

  if (accounts) {
    return children;
  }

  return (
    <>
      <Flex sx={{ height: "100vh", flexDirection: "column" }}>
        <Container variant="header" sx={{ height: 62 }}>
          <Flex sx={{ alignItems: "center", flex: 1 }}>
            <LiquityLogo height={32} />

            <Box
              sx={{
                mx: [2, 3],
                width: "0px",
                height: "100%",
                borderLeft: ["none", "1px solid lightgrey"]
              }}
            />

            <>
              <SideNav hideLinks />
              <Nav hideLinks />
            </>
          </Flex>
        </Container>

        <Box sx={{ flex: 1, justifyContent: "center", alignItems: "center", display: "flex" }}>
          <Button
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <Icon name="plug" size="lg" />
            <Box sx={{ ml: 2 }}>Connect wallet</Box>
          </Button>
        </Box>
      </Flex>

      {modalOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bg: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            onClick={() => setModalOpen(false)}
            style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
          />

          <Box
            sx={{
              bg: "white",
              p: 4,
              borderRadius: 4,
              boxShadow: "0 0 16px rgba(0, 0, 0, 0.25)",
              position: "relative",
              minWidth: "300px"
            }}
          >
            <Box sx={{ mb: 3, fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>
              Select wallet
            </Box>

            {connectors.map(connector => (
              <Button
                key={connector.id}
                onClick={async () => {
                  await connectAsync({ id: connector.id });
                  setModalOpen(false);
                }}
                sx={{ mb: 2, width: "100%" }}
              >
                {connector.name}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};
