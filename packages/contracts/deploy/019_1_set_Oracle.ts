import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.callContract("BTCOracle", "feedBaseFeeValue", {
    args: ["105000000000000000000000", 2]
  });
  console.log("Setting BTCOracle");

  await midl.execute();
};

deploy.tags = ["main", "setOracle"];

export default deploy;
