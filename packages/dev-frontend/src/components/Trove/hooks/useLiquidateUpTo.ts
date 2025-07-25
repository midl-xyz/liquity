import {
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useSignIntention
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

export const useLiquidateUpTo = ({ transactionId }: OpenTroveParams) => {
  const { addTxIntentionAsync } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const {signIntentionAsync} = useSignIntention();
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
    mutationFn: async (maximumNumberOfTrovesToLiquidate: number) => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.liquidateUpTo(
        maximumNumberOfTrovesToLiquidate,
        {
          gasLimit: 100000000n
        }
      );

      clearTxIntentions();

      await addTxIntentionAsync({
        intention: {
          evmTransaction: {
            to: rawPopulatedTransaction.to as Address,
            data: rawPopulatedTransaction.data as `0x${string}`
          }
        }
      });
      // TODO: Update
      // const btcTx = await finalizeBTCTransactionAsync({
      //   feeRateMultiplier: 4,
      //   shouldComplete: true,
      //   stateOverride: [{ balance: 100000000000000000000000000n, address: evmAddress }]
      // });

    //   let txId;

    //   for (const it of store.getState().intentions ?? []) {
    //     const signed = await signIntentionAsync({ intention: it, txId: btcTx.tx.id });
    //     const hash = await walletClient?.sendRawTransaction({ serializedTransaction: signed });

    //     if (!txId) {
    //       txId = hash;
    //     }
    //   }

    //   setTransactionState({
    //     type: "waitingForConfirmationMidl",
    //     id: transactionId,
    //     tx: txId!
    //   });

    //   await broadcastTransactionAsync({ tx: btcTx.tx.hex });
    }
  });
};
