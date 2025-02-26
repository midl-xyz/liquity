import {
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeTxIntentions
} from "@midl-xyz/midl-js-executor-react";
import { useBroadcastTransaction, useMidlContext } from "@midl-xyz/midl-js-react";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useWalletClient } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";

type OpenTroveParams = {
  transactionId: string;
};

export const useLiquidate = ({ transactionId }: OpenTroveParams) => {
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
    onError: (error: any) => {
      console.error(error);
      setTransactionState({
        type: "failed",
        id: transactionId,
        error:
          "details" in error
            ? new Error(error.details)
            : new Error("Failed to send transaction (try again)")
      });
    },
    mutationKey: ["liquidate", transactionId],
    mutationFn: async (ownerAddress: string) => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.liquidate(ownerAddress, {
        gasLimit: 100000000n
      });

      clearTxIntentions();

      await addTxIntentionAsync({
        intention: {
          hasDeposit: true,
          evmTransaction: {
            to: rawPopulatedTransaction.to as Address,
            data: rawPopulatedTransaction.data as `0x${string}`
          }
        }
      });

      const btcTx = await finalizeBTCTransactionAsync({
        feeRateMultiplier: 4,
        shouldComplete: true,
        stateOverride: [{ balance: 100000000000000000000000000n, address: evmAddress }]
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
