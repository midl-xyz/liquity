import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("SortedTroves", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "SortedTroves"];

export default deploy;
