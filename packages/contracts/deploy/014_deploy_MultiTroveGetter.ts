import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  const TroveManager = await midl.getDeployment("TroveManager");
  const SortedTroves = await midl.getDeployment("TroveManager");

  await midl.deploy("MultiTroveGetter", {
    args: [TroveManager?.address, SortedTroves?.address]
  });
  await midl.execute();
};

deploy.tags = ["main", "MultiTroveGetter"];

export default deploy;
