import { Decimal, Decimalish, TroveCreationParams } from "@liquity/lib-base";
import { deployments } from "@liquity/lib-ethers";
import { convertETHtoBTC, executorAddress } from "@midl-xyz/midl-js-executor";
import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention
} from "@midl-xyz/midl-js-executor-react";
import { useConfig, useStoreInternal } from "@midl-xyz/midl-js-react";
import { useMutation } from "@tanstack/react-query";
import { Address, encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { useChainId } from "wagmi";
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
  const { network } = useConfig();
  const { liquity } = useLiquity();
  const chainId = useChainId();
  const { finalizeBTCTransactionAsync, error: finilizeBTCError } = useFinalizeBTCTransaction();
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const evmAddress = useEVMAddress();
  const [, setTransactionState] = useTransactionState();
  const { sendBTCTransactionsAsync, error } = useSendBTCTransactions({});

  const { lusdToken } = deployments[chainId].addresses;

  const { addCompleteTxIntentionAsync } = useAddCompleteTxIntention();
  const {getState} = useStoreInternal()

  return useMutation({
    onError: error => {
      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)")
      });
    },
    mutationFn: async (params: TroveCreationParams<Decimalish>) => {
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
      const localUnsignedIntentions = [];


     
      localUnsignedIntentions.push(
        await addTxIntentionAsync({
          intention: {
            evmTransaction: {
              to: rawPopulatedTransaction.to as Address,
              data: rawPopulatedTransaction.data as `0x${string}`,
              value: rawPopulatedTransaction.value?.toBigInt()
            },
            satoshis: convertETHtoBTC(rawPopulatedTransaction.value.toBigInt()),
          }
        })
      );

      localUnsignedIntentions.push(
        await addTxIntentionAsync({
          intention: {
            evmTransaction: {
              to: lusdToken as Address,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: "approve",
                args: [executorAddress[network.id] as Address, maxUint256 - 1n]
              })
            }
          }
        })
      );

      localUnsignedIntentions.push(
        await addCompleteTxIntentionAsync({ assetsToWithdraw: [lusdToken as Address] })
      );

      const btcTx = await finalizeBTCTransactionAsync({ assetsToWithdrawSize: 1 });

      const serializedTransactions: Address[] = [];
      for (const intention of localUnsignedIntentions) {
        try {
          serializedTransactions.push(
            await signIntentionAsync({
              intention,
              txId: btcTx.tx.id
            })
          );
        } catch (e) {
          console.error("error on intent signing: ", intentError, e);
        }
      }
      console.log("ser: ", serializedTransactions);
      try {
        await sendBTCTransactionsAsync({
          btcTransaction: btcTx?.tx.hex,
          serializedTransactions
        });
      } catch (e) {
        console.error(e);
        console.error("sendTxError: ", error);
      }
    }
  });
};
