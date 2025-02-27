import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { useAccounts, useBalance, useDisconnect } from "@midl-xyz/midl-js-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Box, Button, Flex, Heading, Text } from "theme-ui";
import { useOnClickOutside } from "usehooks-ts";
import { formatUnits } from "viem";
import { COIN, GT } from "../strings";
import { shortenAddress } from "../utils/shortenAddress";
import { useBondAddresses } from "./Bonds/context/BondAddressesContext";
import { useBondView } from "./Bonds/context/BondViewContext";
import { Icon } from "./Icon";

const select = ({ accountBalance, lusdBalance, lqtyBalance }: LiquityStoreState) => ({
  accountBalance,
  lusdBalance,
  lqtyBalance
});

export const UserAccount: React.FC = () => {
  const { lusdBalance: realLusdBalance } = useLiquitySelector(select);
  const { lusdBalance: customLusdBalance } = useBondView();
  const { LUSD_OVERRIDE_ADDRESS } = useBondAddresses();
  const { ordinalsAccount } = useAccounts();
  const { disconnectAsync } = useDisconnect();
  const { balance } = useBalance({ address: ordinalsAccount?.address ?? "" });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setMenuOpen(false));
  const queryClient = useQueryClient();

  const lusdBalance = LUSD_OVERRIDE_ADDRESS === null ? realLusdBalance : customLusdBalance;

  const handleDisconnect = async () => {
    await disconnectAsync();
    queryClient.refetchQueries();
  };

  if (!ordinalsAccount) {
    return null;
  }

  return (
    <Flex>
      <Box sx={{ position: "relative" }}>
        <Button
          variant="outline"
          sx={{ alignItems: "center", p: 2, mr: 3 }}
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        >
          <Icon name="user-circle" size="lg" />
          <Text as="span" sx={{ ml: 2, fontSize: 1 }}>
            {shortenAddress(ordinalsAccount!.address)}
          </Text>
        </Button>
        {menuOpen && (
          <Box
            ref={ref}
            sx={{
              position: "absolute",
              mt: 2,
              bg: "white",
              p: 4,
              boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
              borderRadius: 4,
              zIndex: 1000,
              right: 0,
              width: "300px"
            }}
          >
            <Button variant="ghost" onClick={handleDisconnect} sx={{ width: "100%" }}>
              Disconnect
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: ["none", "flex"],
          alignItems: "center"
        }}
      >
        <Icon name="wallet" size="lg" />

        {([
          ["BTC", Decimal.from(formatUnits(BigInt(balance), 8))],
          [COIN, Decimal.from(lusdBalance || 0)]
          // [GT, Decimal.from(lqtyBalance)]
          // ["bLUSD", Decimal.from(bLusdBalance || 0)]
        ] as const).map(([currency, balance], i) => (
          <Flex key={i} sx={{ ml: 3, flexDirection: "column" }}>
            <Heading sx={{ fontSize: 1 }}>{currency}</Heading>
            <Text sx={{ fontSize: 1 }}>{balance.prettify(4)}</Text>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};
