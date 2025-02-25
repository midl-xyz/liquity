import { DeploymentsExtension } from "hardhat-deploy/types";
import { ethers } from "@midl-xyz/ethers";

export const createExecuteWithLog = (execute: DeploymentsExtension["execute"]) => async (
  ...args: Parameters<DeploymentsExtension["execute"]>
) => {
  const [contractName, , methodName] = args;

  console.log(`executing "${contractName}.${methodName}"`);

  const receipt = await execute.apply(execute, args);

  console.log(`tx "${contractName}.${methodName}": ${receipt.transactionHash}`);

  return receipt;
};

export const isOwnershipRenounced = async (contractAddress: any) => {
  try {
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider("https://evm-rpc.regtest.midl.xyz");

    // Connect to contract
    const contract = new ethers.Contract(
      contractAddress,
      ["function owner() external view returns (address)"],
      provider
    );

    // Call owner function
    const owner = await contract.owner();
    console.log("owner: ", owner);

    // Check if ownership is renounced
    return owner === ethers.ZeroAddress;
  } catch (error) {
    console.error("Error checking ownership renouncement:", error);
    return false;
  }
};

export const lqtyTokenCheck = async (contractAddress: any) => {
  try {
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider("https://evm-rpc.regtest.midl.xyz");

    // Connect to contract
    const contract = new ethers.Contract(
      contractAddress,
      ["function getLpRewardsEntitlement() external view returns (uint256)"],
      provider,
      7
    );

    // Call owner function
    const getLpRewardsEntitlement = await contract.getLpRewardsEntitlement();

    console.log(getLpRewardsEntitlement);

    // Check if ownership is renounced
    return getLpRewardsEntitlement;
  } catch (error) {
    console.error("Error checking ownership renouncement:", error);
    return false;
  }
};

export const timeValues = {
  SECONDS_IN_ONE_MINUTE: 60,
  SECONDS_IN_ONE_HOUR: 60 * 60,
  SECONDS_IN_ONE_DAY: 60 * 60 * 24,
  SECONDS_IN_ONE_WEEK: 60 * 60 * 24 * 7,
  SECONDS_IN_SIX_WEEKS: 60 * 60 * 24 * 7 * 6,
  SECONDS_IN_ONE_MONTH: 60 * 60 * 24 * 30,
  SECONDS_IN_ONE_YEAR: 60 * 60 * 24 * 365,
  MINUTES_IN_ONE_WEEK: 60 * 24 * 7,
  MINUTES_IN_ONE_MONTH: 60 * 24 * 30,
  MINUTES_IN_ONE_YEAR: 60 * 24 * 365
};
