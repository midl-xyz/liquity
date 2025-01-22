import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  await midl.deploy("CommunityIssuance", { args: [] });

  await midl.execute();
};

deploy.tags = ["main", "CommunityIssuance"];

export default deploy;
