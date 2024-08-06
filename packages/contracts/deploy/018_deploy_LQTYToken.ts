import { DeployFunction } from "hardhat-deploy/types";
import { deployConfig } from "../deploy-helpers/deployConfig";

// Protocol's Token is deployed before the rest of the protocol

const deploy: DeployFunction = async ({
  deployments: { deploy, get },
  getNamedAccounts,
  getChainId
}) => {
  if ((await getChainId()) != process.env.DEPLOYMENT_PROTOCOL_TOKEN_CHAIN_ID) {
    console.log(
      await getChainId(),
      "network isn't supposed to be deployed at. ENV network is ",
      process.env.DEPLOYMENT_PROTOCOL_TOKEN_CHAIN_ID
    );
    // LQTY token may only be deployed on the Ethereum Mainnet (chainId: 1)
    return;
  }
  const CommunityIssuance = await get("CommunityIssuance");
  const LQTYStaking = await get("LQTYStaking");

  const { deployer } = await getNamedAccounts();

  const { multisigAddress } = deployConfig;

  await deploy("LQTYToken", {
    from: deployer,
    log: true,
    args: [
      CommunityIssuance.address,
      LQTYStaking.address,
      multisigAddress,
      multisigAddress,
      multisigAddress
    ]
  });
};

deploy.tags = ["main", "LQTYToken"];

export default deploy;
