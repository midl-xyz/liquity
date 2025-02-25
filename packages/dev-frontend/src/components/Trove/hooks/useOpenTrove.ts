import { useAddTxIntention, useClearTxIntentions } from "@midl-xyz/midl-js-executor-react";
import { useLiquity } from "../../../hooks/LiquityContext";
import { _InternalEthersLiquityConnection } from "@liquity/lib-ethers/dist/src/EthersLiquityConnection";
import { useMutation } from "@tanstack/react-query";
import { Decimal } from "@liquity/lib-base";
import { getAbi, deployments } from "@liquity/lib-ethers";
import { useChainId } from "wagmi";

type OpenTroveParams = {
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
};

export const useOpenTrove = ({
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes
}: OpenTroveParams) => {
  const { addTxIntention } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const chainId = useChainId();
  const { liquity } = useLiquity();

  const abis = getAbi(false, false);

  const { borrowerOperations } = deployments[chainId]!.addresses;

  console.log(borrowerOperations);

  return useMutation({
    mutationFn: async () => {
      clearTxIntentions();
      console.log("Opening Trove...");
      console.log(maxBorrowingRate);
      console.log(borrowingFeeDecayToleranceMinutes);
      console.log(borrowerOperations.interface);
    }
  });
};
