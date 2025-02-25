import { DeployFunction } from "hardhat-deploy/types";
import { deployConfig } from "../deploy-helpers/deployConfig";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("BorrowerOperations", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "BorrowerOperations"];

export default deploy;
