import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("HintHelpers", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "HintHelpers"];

export default deploy;
