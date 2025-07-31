import React, { useCallback } from "react";
import { Card, Heading, Box, Flex, Button, NavLink } from "theme-ui";
import { InfoMessage } from "../InfoMessage";
import { useTroveView } from "./context/TroveViewContext";

export const NoTrove: React.FC = () => {
  const { dispatchEvent } = useTroveView();

  const handleOpenTrove = useCallback(() => {
    dispatchEvent("OPEN_TROVE_PRESSED");
  }, [dispatchEvent]);

  return (
    <Card>
      <Heading>Position</Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="You haven't minted any MIDL•RUNE•STABLECOIN yet.">
          You can mint MIDL•RUNE•STABLECOIN by opening a Position.
        </InfoMessage>

        <Flex variant="layout.actions">
          <Button onClick={handleOpenTrove}>Mint: Open Position</Button>
        </Flex>

        <Box sx={{ alignSelf: "end", justifySelf: "end" }}>
          <NavLink
            href="https://medium.com/midl-xyz/pioneer-the-midl-testnet-56c412486f08"
            target="_blank"
            rel="noopener noreferrer"
          >
            Guide
          </NavLink>
        </Box>
      </Box>
    </Card>
  );
};
