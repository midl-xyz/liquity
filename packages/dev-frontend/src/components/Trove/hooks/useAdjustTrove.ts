import { Decimal, TroveAdjustmentParams } from "@liquity/lib-base";
import { deployments } from "@liquity/lib-ethers";
import { convertETHtoBTC } from "@midl-xyz/midl-js-executor";
import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention
} from "@midl-xyz/midl-js-executor-react";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useChainId } from "wagmi";
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
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const [, setTransactionState] = useTransactionState();
  const { addCompleteTxIntentionAsync } = useAddCompleteTxIntention();
  const chainId = useChainId();
  const { lusdToken } = deployments[chainId].addresses;
  const { sendBTCTransactionsAsync } = useSendBTCTransactions({});

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
      const { rawPopulatedTransaction } = await liquity.populate.adjustTrove(
        params,
        {
          maxBorrowingRate,
          borrowingFeeDecayToleranceMinutes
        },
        { gasLimit: 100000000n }
      );

      clearTxIntentions();

      const localUnsignedIntentions = [];
      localUnsignedIntentions.push(
        await addTxIntentionAsync({
          intention: {
            evmTransaction: {
              to: rawPopulatedTransaction.to as Address,
              data: rawPopulatedTransaction.data as `0x${string}`,
              value: rawPopulatedTransaction.value?.toBigInt()
            },
            satoshis: convertETHtoBTC(rawPopulatedTransaction.value.toBigInt()) * 1.01
          }
        })
      );

      if (params.withdrawCollateral !== undefined && params.withdrawCollateral.gt(0)) {
        localUnsignedIntentions.push(
          await addCompleteTxIntentionAsync({ assetsToWithdraw: [lusdToken as Address] })
        );
      }

      const btcTx = await finalizeBTCTransactionAsync({ assetsToWithdrawSize: 1 });

      const serializedTransactions: Address[] = [];
      for (const intention of localUnsignedIntentions) {
        try {
          serializedTransactions.push(
            await signIntentionAsync({
              intention: intention,
              txId: btcTx.tx.id
            })
          );
        } catch (e) {
          console.error("error on intent signing: ", intentError, e);
        }
      }

      const txHash = await sendBTCTransactionsAsync({
        btcTransaction: btcTx?.tx.hex,
        serializedTransactions
      });

      setTransactionState({ type: "waitingForConfirmationMidl", id: transactionId, tx: txHash[txHash.length-1] });
    }
  });
};
