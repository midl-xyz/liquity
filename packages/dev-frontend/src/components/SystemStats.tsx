import { AddressZero } from "@ethersproject/constants";
import { Decimal, LiquityStoreState, Percent } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import React from "react";
import { Box, Card, Heading, Link, Text } from "theme-ui";

import { deployments } from "@liquity/lib-ethers";
import { regtest } from "@midl-xyz/midl-js-core";
import { useToken } from "@midl-xyz/midl-js-executor-react";
import { useAccounts, useRuneBalance } from "@midl-xyz/midl-js-react";
import { useLiquity } from "../hooks/LiquityContext";
import * as l from "../lexicon";
import { Statistic } from "./Statistic";
import { formatEther } from "viem";

const selectBalances = ({ accountBalance, lusdBalance, lqtyBalance }: LiquityStoreState) => ({
  accountBalance,
  lusdBalance,
  lqtyBalance
});

const Balances: React.FC = () => {
  const { accountBalance, lqtyBalance } = useLiquitySelector(selectBalances);
  const { rune } = useToken(deployments[regtest.id].lusdToken);

  const { ordinalsAccount } = useAccounts();
  const { balance: runeBalance } = useRuneBalance({
    runeId: rune?.id ?? "",
    address: ordinalsAccount?.address || "",
    query: {
      enabled: Boolean(rune?.id && ordinalsAccount?.address)
    }
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Heading>My Account Balances</Heading>
      <Statistic lexicon={l.ETH}>{accountBalance.prettify(6)}</Statistic>
      <Statistic lexicon={l.LUSD}>
        {Decimal.fromBigNumberString(formatEther(runeBalance.balance)).prettify()}
      </Statistic>
      <Statistic lexicon={l.LQTY}>{lqtyBalance.prettify()}</Statistic>
    </Box>
  );
};

const GitHubCommit: React.FC<{ children?: string }> = ({ children }) =>
  children?.match(/[0-9a-f]{40}/) ? (
    <Link href={`https://github.com/liquity/dev/commit/${children}`}>{children.substr(0, 7)}</Link>
  ) : (
    <>unknown</>
  );

type SystemStatsProps = {
  variant?: string;
  showBalances?: boolean;
};

const select = ({
  numberOfTroves,
  price,
  total,
  lusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  totalStakedLQTY,
  frontend
}: LiquityStoreState) => ({
  numberOfTroves,
  price,
  total,
  lusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  totalStakedLQTY,
  kickbackRate: frontend.status === "registered" ? frontend.kickbackRate : null
});

export const SystemStats: React.FC<SystemStatsProps> = ({ variant = "info", showBalances }) => {
  const {
    liquity: {
      connection: { version: contractsVersion, deploymentDate, frontendTag }
    }
  } = useLiquity();

  const {
    numberOfTroves,
    price,
    lusdInStabilityPool,
    total,
    borrowingRate,
    totalStakedLQTY,
    kickbackRate
  } = useLiquitySelector(select);

  const lusdInStabilityPoolPct =
    total.debt.nonZero && new Percent(lusdInStabilityPool.div(total.debt));
  const totalCollateralRatioPct = new Percent(total.collateralRatio(price));
  const borrowingFeePct = new Percent(borrowingRate);
  const kickbackRatePct = frontendTag === AddressZero ? "100" : kickbackRate?.mul(100).prettify();

  return (
    <Card {...{ variant }}>
      {showBalances && <Balances />}

      <Heading>Midl: Stable statistics</Heading>

      <Heading as="h2" sx={{ mt: 3, fontWeight: "body" }}>
        Protocol
      </Heading>

      <Statistic lexicon={l.BORROW_FEE}>{borrowingFeePct.toString(2)}</Statistic>

      <Statistic lexicon={l.TVL}>
        {total.collateral.shorten()} <Text sx={{ fontSize: 1 }}>&nbsp;BTC</Text>
        <Text sx={{ fontSize: 1 }}>
          &nbsp;(${Decimal.from(total.collateral.mul(price).toString()).shorten()})
        </Text>
      </Statistic>
      <Statistic lexicon={l.TROVES}>{Decimal.from(numberOfTroves).prettify(0)}</Statistic>
      <Statistic lexicon={l.LUSD_SUPPLY}>{total.debt.shorten()}</Statistic>
      {/* {lusdInStabilityPoolPct && (
        <Statistic lexicon={l.STABILITY_POOL_LUSD}>
          {lusdInStabilityPool.shorten()}
          <Text sx={{ fontSize: 1 }}>&nbsp;({lusdInStabilityPoolPct.toString(1)})</Text>
        </Statistic>
      )} */}
      <Statistic lexicon={l.TCR}>{totalCollateralRatioPct.prettify()}</Statistic>
      <Statistic lexicon={l.RECOVERY_MODE}>
        {total.collateralRatioIsBelowCritical(price) ? <Box color="danger">Yes</Box> : "No"}
      </Statistic>
    </Card>
  );
};
