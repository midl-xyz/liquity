import React, { useEffect } from "react";

import { Decimal, TroveChange } from "@liquity/lib-base";

import { useWalletClient } from "wagmi";
import { useLiquity } from "../../hooks/LiquityContext";
import { WarningBubble } from "../WarningBubble";

export type GasEstimationState = { type: "idle" | "inProgress" } | { type: "complete"; gas: bigint };

type ExpensiveTroveChangeWarningParams = {
  troveChange?: Exclude<TroveChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
  gasEstimationState: GasEstimationState;
  setGasEstimationState: (newState: GasEstimationState) => void;
};

export const ExpensiveTroveChangeWarning: React.FC<ExpensiveTroveChangeWarningParams> = ({
  troveChange,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes,
  gasEstimationState,
  setGasEstimationState
}) => {
  const { liquity } = useLiquity();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (troveChange && troveChange.type !== "closure") {
      setGasEstimationState({ type: "inProgress" });

      let cancelled = false;

      const timeoutId = setTimeout(async () => {
        if (!cancelled) {
          // TODO: replace with estimateGas with stateOverride

          setGasEstimationState({ type: "complete", gas: 10000n });
        }
      }, 333);

      return () => {
        clearTimeout(timeoutId);
        cancelled = true;
      };
    } else {
      setGasEstimationState({ type: "idle" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [troveChange]);

  if (
    troveChange &&
    gasEstimationState.type === "complete" &&
    gasEstimationState.gas !== undefined &&
    gasEstimationState.gas >= 200000n
  ) {
    return troveChange.type === "creation" ? (
      <WarningBubble>
        The cost of opening a Trove in this collateral ratio range is rather high. To lower it,
        choose a slightly different collateral ratio.
      </WarningBubble>
    ) : (
      <WarningBubble>
        The cost of adjusting a Trove into this collateral ratio range is rather high. To lower it,
        choose a slightly different collateral ratio.
      </WarningBubble>
    );
  }

  return null;
};
