import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({
  deployments: { deploy, get },
  getNamedAccounts,
  getChainId
}) => {
  if ((await getChainId()) != process.env.DEPLOYMENT_PROTOCOL_CHAIN_ID) {
    // Protocol may only be deployed on the Arbitrum mainnet (chainId: 42161)
    return;
  }
  const TroveManager = await get("TroveManager");
  const SortedTroves = await get("SortedTroves");
  const { deployer } = await getNamedAccounts();

  await deploy("MultiTroveGetter", {
    from: deployer,
    log: true,
    args: [TroveManager.address, SortedTroves.address]
  });
};

deploy.tags = ["main", "MultiTroveGetter"];

export default deploy;
