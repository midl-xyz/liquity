import type { DeployFunction } from "hardhat-deploy/types";
import proxyLogicDeployment from "../deployments/midl/ProxyLogic.json";

const deploy: DeployFunction = async ({ midl }) => {
 console.log("Starting deployment process...");

 await midl.initialize();

 await midl.deploy("ProxyContract", {});
  await midl.callContract("CommunityIssuance", "initialize", {
      args: [proxyLogicDeployment.address]
    });
 await midl.execute();

 await midl.save("ProxyLogic", {
  address: (await midl.getDeployment("ProxyContract")).address,
  abi: (await midl.getDeployment("ProxyLogic")).abi,
 });

 await midl.callContract("ProxyLogic", "functionFromLogicContract", {
  args: [...args],
  to: (await midl.getDeployment("ProxyContract")).address,
 });

 await midl.execute();
};

deploy.tags = ["main", "ReadTest"];

export default deploy;