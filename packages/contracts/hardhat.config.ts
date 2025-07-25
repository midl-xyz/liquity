import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@midl-xyz/hardhat-deploy";
import "hardhat-abi-exporter";
import exportDeployment from "./tasks/export";

import * as dotenv from "dotenv";
import { MempoolSpaceProvider } from "@midl-xyz/midl-js-core";
dotenv.config();

const packageJson = require("./package.json");

const newAccounts = process.env.PK_DEPLOYER !== undefined ? [process.env.PK_DEPLOYER as string] : [];

task("deploy:export", "Export deployment data", async (_, hre) => {
  console.log("Exporting deployment data...");
  await exportDeployment(hre);
  console.log("Deployment data exported!");
});

task("deploy", "Export deployment data", async (_, hre, runSuper) => {
  await runSuper();
  console.log("Exporting deployment data...");
  await exportDeployment(hre);
  console.log("Deployment data exported!");
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.4.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100
          }
        }
      },
      {
        version: "0.5.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100
          }
        }
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100
          }
        }
      },
      {
        version: "0.6.11",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100
          }
        }
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100
          }
        }
      }
    ]
  },
  midl: {
    path: "deployments",
    networks: {
      default: {
        mnemonic: process.env.MNEMONIC1!,
        confirmationsRequired: 1,
        btcConfirmationsRequired: 1,
        hardhatNetwork: "default",
        network: {
          explorerUrl: "https://mempool.regtest.midl.xyz",
          id: "regtest",
          network: "regtest"
        },
        provider: new MempoolSpaceProvider({
          "regtest": "https://mempool.regtest.midl.xyz",
        } as any)
      },
    }

  },
  networks: {
    default: {
      url: "https://rpc.regtest.midl.xyz",
      chainId: 777
    }
  },

  mocha: { timeout: 12000000 },

  gasReporter: {
    enabled: true,
    gasPrice: 0.01
  },

  abiExporter: {
    path: "./dist",
    runOnCompile: true,
    clear: true,
    flat: false,
    pretty: false
  }
};

export default config;
