import { Decimal, TroveCreationParams } from "@liquity/lib-base";
import {
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeTxIntentions
} from "@midl-xyz/midl-js-executor-react";
import { useBroadcastTransaction, useMidlContext } from "@midl-xyz/midl-js-react";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useChainId, useWalletClient } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";
import { deployments } from "@liquity/lib-ethers";

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
  const chainId = useChainId();
  const { finalizeBTCTransactionAsync, signIntentionAsync } = useFinalizeTxIntentions();
  const evmAddress = useEVMAddress();
  const { data: walletClient } = useWalletClient();
  const { broadcastTransactionAsync } = useBroadcastTransaction();
  const [, setTransactionState] = useTransactionState();
  const {store} = useMidlContext();

  const {lusdToken} = deployments[chainId].addresses;

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

      await addTxIntentionAsync({
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
        shouldComplete: true,
        stateOverride: [{ balance: 100000000000000000000000000n, address: evmAddress }],
        assetsToWithdraw: [lusdToken as Address]
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
