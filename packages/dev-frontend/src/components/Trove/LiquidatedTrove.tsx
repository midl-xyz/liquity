import React, { useCallback } from "react";
import { Card, Heading, Box, Button, Flex, NavLink } from "theme-ui";
import { CollateralSurplusAction } from "../CollateralSurplusAction";
import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { useTroveView } from "./context/TroveViewContext";
import { InfoMessage } from "../InfoMessage";
import { Link } from "../Link";

const select = ({ collateralSurplusBalance }: LiquityStoreState) => ({
  hasSurplusCollateral: !collateralSurplusBalance.isZero
});

export const LiquidatedTrove: React.FC = () => {
  const { hasSurplusCollateral } = useLiquitySelector(select);
  const { dispatchEvent } = useTroveView();

  const handleOpenTrove = useCallback(() => {
    dispatchEvent("OPEN_TROVE_PRESSED");
  }, [dispatchEvent]);

  return (
    <Card>
      <Heading>Position</Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="Your Position has been liquidated.">
          {hasSurplusCollateral
            ? "Please reclaim your remaining collateral before opening a new Position."
            : "You can mint MIDL•RUNE•STABLECOIN by opening a Position."}
        </InfoMessage>

        <Flex variant="layout.actions">
          {hasSurplusCollateral && <CollateralSurplusAction />}
          {!hasSurplusCollateral && <Button onClick={handleOpenTrove}>Open Position</Button>}

          <Box sx={{ alignSelf: "end", justifySelf: "end" }}>
            <NavLink
              href="https://medium.com/midl-xyz/pioneer-the-midl-testnet-56c412486f08"
              target="_blank"
              rel="noopener noreferrer"
            >
              Guide
            </NavLink>
          </Box>
        </Flex>
      </Box>
    </Card>
  );
};
