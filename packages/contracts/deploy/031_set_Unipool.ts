import { DeployFunction } from "hardhat-deploy/types";
import { isOwnershipRenounced } from "../deploy-helpers";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  const Unipool = await midl.getDeployment("Unipool");
  const LQTY = await midl.getDeployment("LQTYToken");
  const swapTokenAddress = "0xd3A7aB6E7FC4294625B3bCF0A9584aFa11b19C17";

  if (!(await isOwnershipRenounced(Unipool?.address))) {
    console.log("Setting up Unipool...");
    console.log(Unipool?.address, LQTY?.address);

    await midl.callContract("Unipool", "setParams", {
      args: [LQTY?.address, swapTokenAddress, BigInt("1000000000000")]
    });
  }
  console.log("Unipool setting is queued");

  await midl.execute();
};
deploy.tags = ["main", "updateLQTYTokenContracts"];
deploy.dependencies = ["StabilityPool", "LQTYToken", "CommunityIssuance", "FeesRouter"];

export default deploy;
