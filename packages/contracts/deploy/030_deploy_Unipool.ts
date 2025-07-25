import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();
  // await midl.deploy("Unipool", {
  //   args: []
  // });
  await midl.execute();
};

deploy.tags = ["main", "Unipool"];

export default deploy;
