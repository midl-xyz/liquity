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

export const useCloseTrove = ({ transactionId }: { transactionId: string }) => {
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
      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)")
      });
    },
    mutationFn: async () => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.closeTrove({
        gasLimit: 100000000n
      });

      clearTxIntentions();

      await addTxIntentionAsync({
        intention: {
          hasWithdraw: true,
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
