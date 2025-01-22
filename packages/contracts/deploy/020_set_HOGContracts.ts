import { DeployFunction } from "hardhat-deploy/types";
import { isOwnershipRenounced } from "../deploy-helpers";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  const StabilityPool = await midl.getDeployment("StabilityPool");
  const CommunityIssuance = await midl.getDeployment("CommunityIssuance");
  const LQTYToken = await midl.getDeployment("LQTYToken");

  if (!(await isOwnershipRenounced(CommunityIssuance?.address))) {
    console.log("Setting up CommunityIssuance...");

    await midl.callContract("CommunityIssuance", "setAddresses", {
      args: [LQTYToken?.address, StabilityPool?.address]
    });
  }
  console.log("CommunityIssuance is set");

  await midl.execute();
};
deploy.tags = ["main", "updateHogTokenContracts"];
deploy.dependencies = ["StabilityPool", "HOGToken", "CommunityIssuance", "FeesRouter"];

export default deploy;
