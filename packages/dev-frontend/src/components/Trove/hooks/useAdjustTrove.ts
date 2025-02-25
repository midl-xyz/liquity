import { useAddTxIntention } from "@midl-xyz/midl-js-executor-react";
import { encodeFunctionData } from "viem";
import { useLiquity } from "../../../hooks/LiquityContext";
import { _InternalEthersLiquityConnection } from "@liquity/lib-ethers/dist/src/EthersLiquityConnection";

export const useAdjustTrove = () => {
  const { addTxIntention } = useAddTxIntention();
  const { liquity } = useLiquity();

  const { borrowerOperations } = (liquity.connection as _InternalEthersLiquityConnection)._contracts;

  return () => {
    // addTxIntention({
    //     reset: true,
    //     intention: {
    //         evmTransaction: {
    //             to: "",
    //             data: encodeFunctionData({
    //                 abi: [],
    //                 functionName: "",
    //                 args: []
    //             })
    //         }
    //     }
    // })
  };
};
