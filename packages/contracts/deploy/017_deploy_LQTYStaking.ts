import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("LQTYStaking", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "LQTYStaking"];

export default deploy;
