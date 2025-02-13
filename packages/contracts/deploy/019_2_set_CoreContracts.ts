import { DeployFunction } from "hardhat-deploy/types";
import { isOwnershipRenounced } from "../deploy-helpers";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();

  const PriceFeed = await midl.getDeployment("PriceFeed");
  const SortedTroves = await midl.getDeployment("SortedTroves");
  const TroveManager = await midl.getDeployment("TroveManager");
  const ActivePool = await midl.getDeployment("ActivePool");
  const DefaultPool = await midl.getDeployment("DefaultPool");
  const GasPool = await midl.getDeployment("GasPool");
  const StabilityPool = await midl.getDeployment("StabilityPool");
  const CollSurplusPool = await midl.getDeployment("CollSurplusPool");
  const LUSDToken = await midl.getDeployment("LUSDToken");
  const BorrowerOperations = await midl.getDeployment("BorrowerOperations");
  const CommunityIssuance = await midl.getDeployment("CommunityIssuance");
  const HintHelpers = await midl.getDeployment("HintHelpers");
  const LQTYStaking = await midl.getDeployment("LQTYStaking");
  const LQTY = await midl.getDeployment("LQTYToken");
  const mainOracle = (await midl.getDeployment("BTCOracle"))?.address;

  if (!(await isOwnershipRenounced(SortedTroves?.address))) {
    console.log("Setting up SortedTroves...");

    const maxBytes32 = "0x" + "f".repeat(64);

    await midl.callContract("SortedTroves", "setParams", {
      args: [maxBytes32, TroveManager?.address, BorrowerOperations?.address]
    });
    console.log("SortedTroves is set");
  }

  if (!(await isOwnershipRenounced(TroveManager?.address))) {
    console.log("Setting up Trove Manager...");
    await midl.callContract("TroveManager", "setAddresses", {
      args: [
        BorrowerOperations?.address,
        ActivePool?.address,
        DefaultPool?.address,
        StabilityPool?.address,
        GasPool?.address,
        CollSurplusPool?.address,
        PriceFeed?.address,
        LUSDToken?.address,
        SortedTroves?.address,
        LQTY?.address,
        LQTYStaking?.address
      ]
    });
    console.log("TroveManager is set");
  }

  if (!(await isOwnershipRenounced(PriceFeed?.address))) {
    console.log("Setting up Price Feed...");

    await midl.callContract("PriceFeed", "setAddresses", {
      args: [mainOracle, mainOracle]
    });

    console.log("PriceFeed is set");
  }

  if (!(await isOwnershipRenounced(BorrowerOperations?.address))) {
    console.log("Setting up BorrowerOperations...");

    await midl.callContract("BorrowerOperations", "setAddresses", {
      args: [
        TroveManager?.address,
        ActivePool?.address,
        DefaultPool?.address,
        StabilityPool?.address,
        GasPool?.address,
        CollSurplusPool?.address,
        PriceFeed?.address,
        SortedTroves?.address,
        LUSDToken?.address,
        LQTYStaking?.address
      ]
    });
    console.log("BorrowerOperations is set");
  }

  if (!(await isOwnershipRenounced(StabilityPool?.address))) {
    console.log("Setting up StabilityPool...");
    await midl.callContract("StabilityPool", "setAddresses", {
      args: [
        BorrowerOperations?.address,
        TroveManager?.address,
        ActivePool?.address,
        LUSDToken?.address,
        SortedTroves?.address,
        PriceFeed?.address,
        CommunityIssuance?.address
      ]
    });
    console.log("StabilityPool is set");
  }

  if (!(await isOwnershipRenounced(ActivePool?.address))) {
    console.log("Setting up ActivePool...");

    await midl.callContract("ActivePool", "setAddresses", {
      args: [
        BorrowerOperations?.address,
        TroveManager?.address,
        StabilityPool?.address,
        DefaultPool?.address
      ]
    });
    console.log("ActivePool is set");
  }

  if (!(await isOwnershipRenounced(DefaultPool?.address))) {
    console.log("Setting up DefaultPool...");

    await midl.callContract("DefaultPool", "setAddresses", {
      args: [TroveManager?.address, ActivePool?.address]
    });

    console.log("DefaultPool is set");
  }

  if (!(await isOwnershipRenounced(CollSurplusPool?.address))) {
    console.log("Setting up CollSurplusPool...");

    await midl.callContract("CollSurplusPool", "setAddresses", {
      args: [BorrowerOperations?.address, TroveManager?.address, ActivePool?.address]
    });
    console.log("CollSurplusPool is set");
  }

  if (!(await isOwnershipRenounced(HintHelpers?.address))) {
    console.log("Setting up HintHelpers...");

    await midl.callContract("HintHelpers", "setAddresses", {
      args: [SortedTroves?.address, TroveManager?.address]
    });
    console.log("HintHelpers is set");
  }
  /** (
  address _lqtyTokenAddress,
  address _lusdTokenAddress,
  address _troveManagerAddress, 
  address _borrowerOperationsAddress,
  address _activePoolAddress
) 
  external 
  onlyOwner 
  override 
{
  */

  if (!(await isOwnershipRenounced(LQTYStaking?.address))) {
    console.log("Setting up LQTYStaking..");

    await midl.callContract("LQTYStaking", "setAddresses", {
      args: [
        LQTY?.address,
        LUSDToken?.address,
        TroveManager?.address,
        BorrowerOperations?.address,
        ActivePool?.address
      ]
    });
    console.log("LQTYStaking set transaction queued");
  }
  await midl.execute();
};

deploy.tags = ["main", "setCoreContracts"];
deploy.dependencies = [
  "PriceFeed",
  "SortedTroves",
  "TroveManager",
  "ActivePool",
  "DefaultPool",
  "GasPool",
  "StabilityPool",
  "CollSurplusPool",
  "LUSDToken",
  "BorrowerOperations",
  "HOGToken",
  "HOGStaking",
  "CommunityIssuance",
  "HintHelpers",
  "LQTYStaking"
];

export default deploy;
