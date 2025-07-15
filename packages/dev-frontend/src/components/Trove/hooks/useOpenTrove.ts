import { Decimal, Decimalish, TroveCreationParams } from "@liquity/lib-base";
import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention} from "@midl-xyz/midl-js-executor-react";
import { useBroadcastTransaction, useConfig, useMidlContext } from "@midl-xyz/midl-js-react";
import { useMutation } from "@tanstack/react-query";
import { Address, encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { useChainId, useWalletClient } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";
import { deployments } from "@liquity/lib-ethers";
import { executorAddress } from "@midl-xyz/midl-js-executor";

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
  const { addTxIntentionAsync, txIntentions } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const {network} = useConfig();
  const { liquity } = useLiquity();
  const chainId = useChainId();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const {signIntentionAsync} = useSignIntention();
  const evmAddress = useEVMAddress();
  const { data: walletClient } = useWalletClient();
  const [, setTransactionState] = useTransactionState();
  const {store} = useMidlContext();
    const { sendBTCTransactionsAsync, isSuccess: isBroadcasted } = useSendBTCTransactions({});

  const {lusdToken} = deployments[chainId].addresses;

  const {addCompleteTxIntentionAsync} = useAddCompleteTxIntention();

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
        params as any,
        {
          maxBorrowingRate: maxBorrowingRate as any,
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

      await addCompleteTxIntentionAsync({assetsToWithdraw: [lusdToken as Address]});

      const btcTx = await finalizeBTCTransactionAsync({
        feeRateMultiplier: 4,
        stateOverride: [{ balance: 100000000000000000000000000n, address: evmAddress }],
      });

      const serializedTransactions = txIntentions
      .filter((it) => it.signedEvmTransaction)
      .map((it) => it.signedEvmTransaction);
      await sendBTCTransactionsAsync({btcTransaction: btcTx?.tx.hex, serializedTransactions: serializedTransactions}); 
    }
  });
};
