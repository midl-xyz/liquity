import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("ActivePool", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "ActivePool"];

export default deploy;
