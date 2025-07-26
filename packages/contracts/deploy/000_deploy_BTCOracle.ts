import { DeployFunction } from "hardhat-deploy/types";
import { deployConfig } from "../deploy-helpers/deployConfig";

const deploy: DeployFunction = async ({ midl }) => {
  console.log("Starting deployment process...");

  await midl.initialize();
  console.log("starting deployment with: ", midl.getConfig()?.getState().accounts?.[0])
  await midl.deploy("BTCOracle", { args: [deployConfig.feesSetter, deployConfig.feesAdmin] });

  await midl.execute();
};

deploy.tags = ["main", "BTCOracle"];

export default deploy;
