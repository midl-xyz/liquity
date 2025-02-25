import { Decimal, TroveCreationParams } from "@liquity/lib-base";
import {
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeTxIntentions
} from "@midl-xyz/midl-js-executor-react";
import { useBroadcastTransaction } from "@midl-xyz/midl-js-react";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useWalletClient } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";

type OpenTroveParams = {
  maxBorrowingRate: Decimal;
  borrowingFeeDecayToleranceMinutes: number;
  transactionId: string;
};

export const useOpenTrove = ({
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

  return useMutation({
    onError: error => {
      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)")
      });
    },
    mutationFn: async (params: TroveCreationParams<Decimal>) => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.openTrove(
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
          hasDeposit: true,
          evmTransaction: {
            to: rawPopulatedTransaction.to as Address,
            data: rawPopulatedTransaction.data as `0x${string}`,
            value: rawPopulatedTransaction.value?.toBigInt()
          }
        }
      });

      const btcTx = await finalizeBTCTransactionAsync({
        feeRateMultiplier: 4,
        stateOverride: [{ balance: 100000000000000000000000000n, address: evmAddress }]
      });

      const signed = await signIntentionAsync({ intention, txId: btcTx.tx.id });
      const txId = await walletClient?.sendRawTransaction({ serializedTransaction: signed });

      setTransactionState({
        type: "waitingForConfirmationMidl",
        id: transactionId,
        tx: txId!
      });

      await broadcastTransactionAsync({ tx: btcTx.tx.hex });
    }
  });
};
