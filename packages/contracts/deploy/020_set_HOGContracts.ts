import { DeployFunction } from "hardhat-deploy/types";
import { createExecuteWithLog, isOwnershipRenounced } from "../deploy-helpers";
import { ethers } from "hardhat";
import { deployConfig } from "../deploy-helpers/deployConfig";

const deploy: DeployFunction = async ({ deployments, getNamedAccounts, getChainId }) => {
  if ((await getChainId()) !== process.env.DEPLOYMENT_PROTOCOL_CHAIN_ID) {
    return;
  }
  const { deployer } = await getNamedAccounts();
  const executeWithLog = createExecuteWithLog(deployments.execute);
  const StabilityPool = await deployments.get("StabilityPool");
  const CommunityIssuance = await deployments.get("CommunityIssuance");
  const LQTYToken = await deployments.get("LQTYToken");

  if ((await getChainId()) === process.env.DEPLOYMENT_PROTOCOL_CHAIN_ID) {
    if (!(await isOwnershipRenounced(CommunityIssuance.address))) {
      console.log("Setting up CommunityIssuance...");

      await executeWithLog(
        "CommunityIssuance",
        { from: deployer },
        "setAddresses",
        LQTYToken.address,
        StabilityPool.address
      );
    }
    console.log("CommunityIssuance is set");
  }
};
deploy.tags = ["main", "updateHogTokenContracts"];
deploy.dependencies = ["StabilityPool", "HOGToken", "CommunityIssuance", "FeesRouter"];

export default deploy;
