import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  const TroveManager = await midl.getDeployment("TroveManager");
  const StabilityPool = await midl.getDeployment("StabilityPool");
  const BorrowerOperations = await midl.getDeployment("BorrowerOperations");

  await midl.initialize();

  await midl.deploy("LUSDToken", {
    args: [TroveManager?.address, StabilityPool?.address, BorrowerOperations?.address]
  });

  await midl.execute();
};

deploy.tags = ["main", "LUSDToken"];

export default deploy;
