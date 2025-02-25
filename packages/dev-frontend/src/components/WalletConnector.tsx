import { useAccounts, useConnect } from "@midl-xyz/midl-js-react";
import { Box, Button, Flex } from "theme-ui";
import { Icon } from "./Icon";
import { AddressPurpose } from "@midl-xyz/midl-js-core";

type WalletConnectorProps = React.PropsWithChildren<{
  loader?: React.ReactNode;
}>;

export const WalletConnector = ({ children }: WalletConnectorProps) => {
  const { accounts } = useAccounts();
  const { connectors, connect } = useConnect({
    purposes: [AddressPurpose.Ordinals]
  });

  const onConnect = () => {
    connect({ id: connectors[0].id });
  };

  if (accounts) {
    return children;
  }

  return (
    <Flex sx={{ height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <Button onClick={onConnect}>
        <Icon name="plug" size="lg" />
        <Box sx={{ ml: 2 }}>Connect wallet</Box>
      </Button>
    </Flex>
  );
};
