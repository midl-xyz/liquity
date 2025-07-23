import { Decimal, TroveAdjustmentParams } from "@liquity/lib-base";
import { deployments } from "@liquity/lib-ethers";
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
  const { addTxIntentionAsync, txIntentions } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const evmAddress = useEVMAddress();
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
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      const { rawPopulatedTransaction } = await liquity.populate.adjustTrove(
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
          hasDeposit: params.depositCollateral !== undefined && params.depositCollateral.gt(0),
          evmTransaction: {
            to: rawPopulatedTransaction.to as Address,
            data: rawPopulatedTransaction.data as `0x${string}`,
            value: rawPopulatedTransaction.value?.toBigInt()
          }
        }
      });

      console.log(
        "shouldcomplete",
        params.withdrawCollateral !== undefined && params.withdrawCollateral.gt(0)
      );

      if (params.withdrawCollateral !== undefined && params.withdrawCollateral.gt(0)) {
        await addCompleteTxIntentionAsync({ assetsToWithdraw: [lusdToken as Address] });
      }

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
