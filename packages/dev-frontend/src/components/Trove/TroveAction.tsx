import { Button } from "theme-ui";

import { Decimal, TroveChange } from "@liquity/lib-base";

import { useLiquity } from "../../hooks/LiquityContext";
import { useTransactionFunction } from "../Transaction";
import { useAdjustTrove } from "./hooks/useAdjustTrove";
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
  const { liquity } = useLiquity();
  const adjustTrove = useAdjustTrove();
  const { mutate } = useOpenTrove({
    maxBorrowingRate,
    borrowingFeeDecayToleranceMinutes
  });

  // const [sendTransaction] = useTransactionFunction(
  //   transactionId,
  //   change.type === "creation"
  //     ? liquity.send.openTrove.bind(liquity.send, change.params, {
  //         maxBorrowingRate,
  //         borrowingFeeDecayToleranceMinutes
  //       })
  //     : change.type === "closure"
  //     ? liquity.send.closeTrove.bind(liquity.send)
  //     : liquity.send.adjustTrove.bind(liquity.send, change.params, {
  //         maxBorrowingRate,
  //         borrowingFeeDecayToleranceMinutes
  //       })
  // );

  return (
    <Button
      onClick={() => {
        mutate();
      }}
    >
      {children}
    </Button>
  );
};
