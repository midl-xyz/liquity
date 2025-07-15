import { Decimal, TroveAdjustmentParams } from "@liquity/lib-base";
import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention,
} from "@midl-xyz/midl-js-executor-react";
import {
  useBroadcastTransaction,
  useMidlContext,
  useWaitForTransaction
} from "@midl-xyz/midl-js-react";
import { useMutation } from "@tanstack/react-query";
import { Address, parseEther } from "viem";
import { useWalletClient } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";

type OpenTroveParams = {
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
  transactionId: string;
};

export const useAdjustTrove = ({
  maxBorrowingRate,
  borrowingFeeDecayToleranceMinutes,
  transactionId,
}: OpenTroveParams) => {
  const { addTxIntentionAsync, txIntentions } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const {signIntentionAsync} = useSignIntention();

  const { finalizeBTCTransactionAsync } =
  useFinalizeBTCTransaction();
  const evmAddress = useEVMAddress();
  const { data: walletClient } = useWalletClient();
  const { broadcastTransactionAsync } = useBroadcastTransaction();
  const [, setTransactionState] = useTransactionState();
  const { waitForTransaction, isPending, isSuccess } = useWaitForTransaction();

  const { store } = useMidlContext();
  const {addCompleteTxIntention} = useAddCompleteTxIntention();

  const { sendBTCTransactionsAsync, isSuccess: isBroadcasted } = useSendBTCTransactions({
   
  });

  return useMutation({
    onError: (error) => {
      console.error(error);

      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)"),
      });
    },
    mutationFn: async (params: TroveAdjustmentParams<Decimal>) => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.adjustTrove(
        params as any,
        {
          maxBorrowingRate: maxBorrowingRate as any,
          borrowingFeeDecayToleranceMinutes,
        },
        { gasLimit: 100000000n },
      );

      clearTxIntentions();

      await addTxIntentionAsync({
        intention: {
          hasDeposit: params.depositCollateral !== undefined &&
            params.depositCollateral.gt(0),
          evmTransaction: {
            to: rawPopulatedTransaction.to as Address,
            data: rawPopulatedTransaction.data as `0x${string}`,
            value: rawPopulatedTransaction.value?.toBigInt(),
          },
        },
      });

      console.log(
        "shouldcomplete",
        params.withdrawCollateral !== undefined &&
          params.withdrawCollateral.gt(0),
      );

      const btcTx = await finalizeBTCTransactionAsync({
        feeRateMultiplier: 4,
     
        stateOverride: [
          {
            balance: parseEther("10000000000000000000000000000000000000"),
            address: evmAddress,
          },
        ],
      });
      if(params.withdrawCollateral !== undefined &&
          params.withdrawCollateral.gt(0)) {
            addCompleteTxIntention({assetsToWithdraw: [] as any})
          }


      const serializedTransactions = txIntentions
      .filter((it) => it.signedEvmTransaction)
      .map((it) => it.signedEvmTransaction);
      sendBTCTransactionsAsync({btcTransaction: btcTx?.tx.hex, serializedTransactions: serializedTransactions})
    },      
  

  });
};
