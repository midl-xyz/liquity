import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("TroveManager", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "TroveManager"];

export default deploy;
