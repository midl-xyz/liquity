import React, { useState } from "react";
import { Box, Button, Card, Flex, Heading, Input, Label } from "theme-ui";


import { Icon } from "./Icon";
import { TransactionMidl } from "./Transaction";
import { useLiquidateUpTo } from "./Trove/hooks/useLiquidateUpTo";

export const LiquidationManager: React.FC = () => {
  const [numberOfTrovesToLiquidate, setNumberOfTrovesToLiquidate] = useState("90");

  const {mutate} = useLiquidateUpTo({
    transactionId: "batch-liquidate"
  });

  return (
    <Card>
      <Heading>Liquidate</Heading>

      <Box sx={{ p: [2, 3] }}>
        <Flex sx={{ alignItems: "stretch" }}>
          <Label>Up to</Label>

          <Input
            type="number"
            min="1"
            step="1"
            value={numberOfTrovesToLiquidate}
            onChange={e => setNumberOfTrovesToLiquidate(e.target.value)}
          />

          <Label>Troves</Label>

          <Flex sx={{ ml: 2, alignItems: "center" }}>
            <TransactionMidl
              id="batch-liquidate"
              tooltip="Liquidate"
              tooltipPlacement="bottom"
              send={() => {
                if (!numberOfTrovesToLiquidate) {
                  throw new Error("Invalid number");
                }

                return mutate(parseInt(numberOfTrovesToLiquidate, 10));
              }}
            >
              <Button variant="dangerIcon">
                <Icon name="trash" size="lg" />
              </Button>
            </TransactionMidl>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
};
