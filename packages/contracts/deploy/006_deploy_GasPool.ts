import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("GasPool", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "GasPool"];

export default deploy;
