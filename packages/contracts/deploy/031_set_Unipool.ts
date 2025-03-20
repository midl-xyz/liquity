import { DeployFunction } from "hardhat-deploy/types";
import { isOwnershipRenounced, lqtyTokenCheck } from "../deploy-helpers";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();
  const Unipool = await midl.getDeployment("Unipool");
  const LQTY = await midl.getDeployment("LQTYToken");
  const swapTokenAddress = "0xd271D32FbcaD93b2B3F52BCbde4dc6E1a1547fb2";
  if (!(await isOwnershipRenounced(Unipool?.address))) {
    console.log("Setting up Unipool...");
    console.log(Unipool?.address, LQTY?.address);
    await lqtyTokenCheck(LQTY?.address);
    await midl.callContract("Unipool", "setParams", {
      args: [LQTY?.address, swapTokenAddress, 250000000]
    });
  }
  console.log("Unipool setting is queued");
  await midl.execute();
};
deploy.tags = ["main", "updateLQTYTokenContracts"];
deploy.dependencies = ["StabilityPool", "LQTYToken", "CommunityIssuance", "FeesRouter"];

export default deploy;
