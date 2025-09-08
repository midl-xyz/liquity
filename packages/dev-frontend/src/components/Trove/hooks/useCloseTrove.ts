import { Decimal, TroveAdjustmentParams } from "@liquity/lib-base";
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
import { Address, encodeAbiParameters, formatEther, keccak256, parseEther, toHex } from "viem";
import { useChainId } from "wagmi";
import { useLiquity } from "../../../hooks/LiquityContext";
import { useTransactionState } from "../../Transaction";
import { useAccounts, useRuneBalance } from "@midl-xyz/midl-js-react";

export const useCloseTrove = ({ transactionId }: { transactionId: string }) => {
  const { addTxIntentionAsync } = useAddTxIntention();
  const clearTxIntentions = useClearTxIntentions();
  const { liquity } = useLiquity();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionAsync, error: intentError } = useSignIntention();
  const { addCompleteTxIntentionAsync } = useAddCompleteTxIntention();
  const evmAddress = useEVMAddress();
  const [, setTransactionState] = useTransactionState();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions({});
  const chainId = useChainId();
  const { lusdToken } = deployments[chainId].addresses;
  const { rune } = useToken(lusdToken as Address);
  const { ordinalsAccount } = useAccounts();

  const { balance } = useRuneBalance({ address: ordinalsAccount.address, runeId: "17474:2" });

  return useMutation({
    onError: error => {
      setTransactionState({
        type: "failed",
        id: transactionId,
        error: new Error("Failed to send transaction (try again)")
      });
    },
    mutationFn: async (params: TroveAdjustmentParams<Decimal>) => {
      setTransactionState({ type: "waitingForApproval", id: transactionId });

      try {
        const { rawPopulatedTransaction } = await liquity.populate.closeTrove({
          gasLimit: 100000000n
        });

        clearTxIntentions();
        const localUnsignedIntentions = [];

        localUnsignedIntentions.push(
          await addTxIntentionAsync({
            intention: {
              evmTransaction: {
                to: rawPopulatedTransaction.to as Address,
                data: rawPopulatedTransaction.data as `0x${string}`
              },
              deposit: {
                runes: [
                  {
                    address: lusdToken as Address,
                    id: rune.id,
                    amount: BigInt(parseEther(params.repayLUSD.toString()))
                  }
                ]
              }
            }
          })
        );

        localUnsignedIntentions.push(await addCompleteTxIntentionAsync());

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

        const txHash = await sendBTCTransactionsAsync({
          btcTransaction: btcTx?.tx.hex,
          serializedTransactions
        });

        setTransactionState({
          type: "waitingForConfirmationMidl",
          id: transactionId,
          tx: txHash[txHash.length - 1]
        });
      } catch (e) {
        const btcBalanceError =
          "BTC balance is not enough to cover tx costs. Please fund your account and try again";
        console.error("Error: ", e);
        if (e.message === "No selected UTXOs") {
          e.message = btcBalanceError;
        }

        if (e.message === "No ordinals UTXOs") {
          e.message = "MIDL•RUNE•STABLECOIN balance is not enough to cover tx";
        }
        if (e.message === "Insufficient funds") {
          if (Decimal.from(formatEther(balance.balance)).lt(params.repayLUSD)) {
            e.message = "MIDL•RUNE•STABLECOIN balance is not enough";
          } else {
            e.message = btcBalanceError;
          }
        }
        setTransactionState({
          type: "failed",
          id: transactionId,
          error: e
        });
      }
    }
  });
};
