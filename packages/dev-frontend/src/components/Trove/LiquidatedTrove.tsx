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
      <Heading>Trove</Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="Your Trove has been liquidated.">
          {hasSurplusCollateral
            ? "Please reclaim your remaining collateral before opening a new Trove."
            : "You can borrow BUSD by opening a Trove."}
        </InfoMessage>

        <Flex variant="layout.actions">
          {hasSurplusCollateral && <CollateralSurplusAction />}
          {!hasSurplusCollateral && <Button onClick={handleOpenTrove}>Open Trove</Button>}

          <Box sx={{alignSelf: "end"}}>
            <NavLink href="https://medium.com/midl-xyz/pioneer-the-midl-testnet-56c412486f08">
              Guide
            </NavLink>
          </Box>
        </Flex>
      </Box>
    </Card>
  );
};
