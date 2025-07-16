import { DeployFunction } from "hardhat-deploy/types";
import { getDefaultAccount } from "@midl-xyz/midl-js-core";


const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();
  console.log("Openning position from user: ", midl.getEVMAddress());
  await midl.callContract("BorrowerOperations", "openTrove", {
    args: [
      "1000000000000000000",
      "1800000000000000000000",
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000"
    ],
    value: BigInt("1800000000000000000")
  });

  // await midl.callContract("LUSDToken", "transfer", {
  //   args: [
  //     "0xB903d817E32C9352E4aE7e369bB1ab1c7065a1B5",
  //     "1000000000000000000000"
  //   ],
  // });

  console.log("Open Position Queued");
  await midl.execute();
};

deploy.tags = ["main", "setOracle"];

export default deploy;
