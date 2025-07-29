import { deployments } from "@liquity/lib-ethers";
import {
  useAddCompleteTxIntention,
  useAddTxIntention,
  useClearTxIntentions,
  useEVMAddress,
  useFinalizeBTCTransaction,
  useSendBTCTransactions,
  useSignIntention,
  useToken
} from "@midl-xyz/midl-js-executor-react";
import { useMutation } from "@tanstack/react-query";
import { Address, encodeAbiParameters, parseEther, toHex } from "viem";
import { useChainId, useClient, useConfig } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";
import { Decimal, TroveAdjustmentParams } from "@liquity/lib-base";
import { createStateOverride } from "@midl-xyz/midl-js-executor";
import { useConfigInternal } from "@midl-xyz/midl-js-react";
import { keccak256 } from "viem";

export const useCloseTrove = ({ transactionId }: { transactionId: string }) => {
  const { addTxIntentionAsync, txIntentions } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const { finalizeBTCTransactionAsync, error } = useFinalizeBTCTransaction();
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const { addCompleteTxIntentionAsync } = useAddCompleteTxIntention();
  const evmAddress = useEVMAddress();
  const [, setTransactionState] = useTransactionState();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions({});
  const chainId = useChainId();
  const { lusdToken } = deployments[chainId].addresses;
  const { rune } = useToken(lusdToken as Address);
  const config = useConfigInternal();
  const client = useClient;
  return useMutation({
    onError: error => {
      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)")
      });
    },
    mutationFn: async (params: TroveAdjustmentParams<Decimal>) => {
      try {
        setTransactionState({ type: "waitingForApproval", id: transactionId });

        const { rawPopulatedTransaction } = await liquity.populate.closeTrove({
          gasLimit: 100000000n
        });

        clearTxIntentions();
        console.log("DEBT: ", params.repayLUSD.toString(), rune.id, lusdToken);
        const localUnsignedIntentions = [];

        localUnsignedIntentions.push(
          await addTxIntentionAsync({
            intention: {
              evmTransaction: {
                to: rawPopulatedTransaction.to as Address,
                data: rawPopulatedTransaction.data as `0x${string}`
              },
              hasRunesDeposit: true,
              runes: [
                {
                  address: lusdToken as Address,
                  id: rune.id,
                  value: BigInt(parseEther(params.repayLUSD.toString()))
                }
              ]
            }
          })
        );

        localUnsignedIntentions.push(
          await addCompleteTxIntentionAsync({ assetsToWithdraw: [] as any })
        );

        const slot = keccak256(
          encodeAbiParameters(
            [
              {
                type: "address"
              },
              { type: "uint256" }
            ],
            [evmAddress, 2n]
          )
        );

        const customStateOverride = [
          {
            address: lusdToken as Address,
            stateDiff: [
              {
                slot,
                value: toHex(BigInt(parseEther(params.repayLUSD.toString())) as any, { size: 32 })
              }
            ]
          }
        ];
        const btcTx = await finalizeBTCTransactionAsync({
          stateOverride: customStateOverride
        });

        console.log("signing intentions: ");
        console.log(txIntentions);
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

        await sendBTCTransactionsAsync({
          btcTransaction: btcTx?.tx.hex,
          serializedTransactions
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
};
