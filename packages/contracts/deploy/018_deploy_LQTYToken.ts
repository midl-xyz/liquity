import { DeployFunction } from "hardhat-deploy/types";
import { deployConfig } from "../deploy-helpers/deployConfig";

// Protocol's Token is deployed before the rest of the protocol

const deploy: DeployFunction = async ({ midl }) => {
  const CommunityIssuance = await midl.getDeployment("CommunityIssuance");
  const LQTYStaking = await midl.getDeployment("LQTYStaking");

  const { multisigAddress } = deployConfig;

  await midl.initialize();

  await midl.deploy("LQTYToken", {
    args: [
      CommunityIssuance?.address,
      LQTYStaking?.address,
      multisigAddress,
      multisigAddress,
      multisigAddress
    ]
  });

  await midl.execute();
};

deploy.tags = ["main", "LQTYToken"];

export default deploy;
