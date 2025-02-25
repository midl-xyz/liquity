import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("CollSurplusPool", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "CollSurplusPool"];

export default deploy;
