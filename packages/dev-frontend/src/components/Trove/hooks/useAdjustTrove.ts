import { Decimal, TroveAdjustmentParams } from "@liquity/lib-base";
import {
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeTxIntentions
} from "@midl-xyz/midl-js-executor-react";
import {
  useBroadcastTransaction,
  useConfig,
  useMidlContext,
  useStore
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
  transactionId
}: OpenTroveParams) => {
  const { addTxIntentionAsync } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const { finalizeBTCTransactionAsync, signIntentionAsync } = useFinalizeTxIntentions();
  const evmAddress = useEVMAddress();
  const { data: walletClient } = useWalletClient();
  const { broadcastTransactionAsync } = useBroadcastTransaction();
  const [, setTransactionState] = useTransactionState();

  const { store } = useMidlContext();

  return useMutation({
    onError: error => {
      console.error(error);

      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)")
      });
    },
    mutationFn: async (params: TroveAdjustmentParams<Decimal>) => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.adjustTrove(
        params,
        {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        },
        { gasLimit: 100000000n }
      );

      clearTxIntentions();

      const intention = await addTxIntentionAsync({
        intention: {
          hasDeposit: params.depositCollateral !== undefined && params.depositCollateral.gt(0),
          evmTransaction: {
            to: rawPopulatedTransaction.to as Address,
            data: rawPopulatedTransaction.data as `0x${string}`,
            value: rawPopulatedTransaction.value?.toBigInt()
          }
        }
      });

      console.log(
        "shouldcomplete",
        params.withdrawCollateral !== undefined && params.withdrawCollateral.gt(0)
      );

      const btcTx = await finalizeBTCTransactionAsync({
        feeRateMultiplier: 4,
        shouldComplete: params.withdrawCollateral !== undefined && params.withdrawCollateral.gt(0),
        stateOverride: [
          { balance: parseEther("10000000000000000000000000000000000000"), address: evmAddress }
        ]
      });

      let txId;

      for (const it of store.getState().intentions ?? []) {
        const signed = await signIntentionAsync({ intention: it, txId: btcTx.tx.id });
        const hash = await walletClient?.sendRawTransaction({ serializedTransaction: signed });

        if (!txId) {
          txId = hash;
        }
      }

      setTransactionState({
        type: "waitingForConfirmationMidl",
        id: transactionId,
        tx: txId!
      });
      await broadcastTransactionAsync({ tx: btcTx.tx.hex });
    }
  });
};
