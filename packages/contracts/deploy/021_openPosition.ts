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
  //     "0x28AF4A718995D5B523b2607d146232B72391C2AF",
  //     "1000000000000000000000"
  //   ],
  // });

  console.log("Open Position Queued");
  await midl.execute();
};

deploy.tags = ["main", "setOracle"];

export default deploy;
