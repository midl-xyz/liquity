import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  //   await midl.callContract("BorrowerOperations", "openTrove", {
  //     args: [
  //       "1000000000000000000",
  //       "1800000000000000000000",
  //       "0x0000000000000000000000000000000000000000",
  //       "0x0000000000000000000000000000000000000000"
  //     ],
  //     value: BigInt("1500000000000000000")
  //   });

  //   console.log("Open Position Queued");

  await midl.execute();
};

deploy.tags = ["main", "setOracle"];

export default deploy;
