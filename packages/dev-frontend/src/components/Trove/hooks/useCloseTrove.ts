import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention
} from "@midl-xyz/midl-js-executor-react";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";

export const useCloseTrove = ({ transactionId }: { transactionId: string }) => {
  const { addTxIntentionAsync, txIntentions } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const { addCompleteTxIntentionAsync } = useAddCompleteTxIntention();
  const evmAddress = useEVMAddress();
  const [, setTransactionState] = useTransactionState();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions({});

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

      await addCompleteTxIntentionAsync({ assetsToWithdraw: [] as any });

      const btcTx = await finalizeBTCTransactionAsync({
        feeRateMultiplier: 4,
        stateOverride: [{ balance: 100000000000000000000000000n, address: evmAddress }]
      });

      console.log("signing intentions: ");
      console.log(txIntentions);
      for (const intention of txIntentions) {
        try {
          await signIntentionAsync({
            intention: intention,
            txId: btcTx.tx.id
          });
        } catch (e) {
          console.error("error on intent signing: ", intentError, e);
        }
      }

      const serializedTransactions = txIntentions
        .filter(it => it.signedEvmTransaction)
        .map(it => it.signedEvmTransaction);
      await sendBTCTransactionsAsync({
        btcTransaction: btcTx?.tx.hex,
        serializedTransactions: serializedTransactions
      });
    }
  });
};
