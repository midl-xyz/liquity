import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  console.log("Starting deployment process...");

  await midl.initialize();

  await midl.deploy("PriceFeed", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "PriceFeed"];

export default deploy;