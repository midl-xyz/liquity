import { leatherConnector, xverseConnector } from "@midl-xyz/midl-js-connectors";
import { createConfig, MempoolSpaceProvider, regtest } from "@midl-xyz/midl-js-core";

export const midlConfig = createConfig({
  networks: [regtest],
  persist: true,
  provider: new MempoolSpaceProvider({
    regtest: import.meta.env.VITE_MEMPOOL_RPC || "https://mempool.regtest.midl.xyz"
  }), // Any is used coz we don't wanna give mainnet links
  connectors: [xverseConnector(), leatherConnector()]
});
