import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("DefaultPool", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "DefaultPool"];

export default deploy;
