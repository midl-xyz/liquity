import { Decimal, Decimalish, TroveCreationParams } from "@liquity/lib-base";
import { deployments } from "@liquity/lib-ethers";
import { executorAddress } from "@midl-xyz/midl-js-executor";
import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention
} from "@midl-xyz/midl-js-executor-react";
import { useConfig } from "@midl-xyz/midl-js-react";
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
  const { addTxIntentionAsync, txIntentions } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { network } = useConfig();
  const { liquity } = useLiquity();
  const chainId = useChainId();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const evmAddress = useEVMAddress();
  const [, setTransactionState] = useTransactionState();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions({});

  const { lusdToken } = deployments[chainId].addresses;

  const { addCompleteTxIntentionAsync } = useAddCompleteTxIntention();

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
      console.log("clearing intentions");
      clearTxIntentions();
      console.log("adding first intention");

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
      console.log(
        "adding completion intention targeting executor at address: ",
        executorAddress[network.id]
      );

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
      });

      console.log("currentTxIntentions: ", txIntentions);
      await addCompleteTxIntentionAsync({ assetsToWithdraw: [lusdToken as Address] });
      console.log("finalizing btc tx");

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
