import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("StabilityPool", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "StabilityPool"];

export default deploy;
