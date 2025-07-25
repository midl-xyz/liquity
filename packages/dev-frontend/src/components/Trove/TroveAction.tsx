import { Button } from "theme-ui";

import { Decimal, TroveChange } from "@liquity/lib-base";

import { useAdjustTrove } from "./hooks/useAdjustTrove";
import { useCloseTrove } from "./hooks/useCloseTrove";
import { useOpenTrove } from "./hooks/useOpenTrove";

type TroveActionProps = React.PropsWithChildren<{
  transactionId: string;
  change: Exclude<TroveChange<Decimal>, { type: "invalidCreation" }>;
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
}>;

// TODO: rewrite to MIDL.

export const TroveAction: React.FC<TroveActionProps> = ({
  children,
  transactionId,
  change,
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes
}) => {
  const adjustTrove = useAdjustTrove({
    maxBorrowingRate,
    borrowingFeeDecayToleranceMinutes,
    transactionId
  });
  const openTrove = useOpenTrove({
    maxBorrowingRate,
    borrowingFeeDecayToleranceMinutes,
    transactionId
  });

  const closeTrove = useCloseTrove({
    transactionId
  });

  return (
    <Button
      onClick={() => {
        if (change.type === "creation") {
          openTrove.mutate(change.params);
        }

        if (change.type === "adjustment") {
          adjustTrove.mutate(change.params);
        }

        if (change.type === "closure") {
          closeTrove.mutate();
        }
      }}
    >
      {children}
    </Button>
  );
};
