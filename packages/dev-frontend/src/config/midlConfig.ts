import { leatherConnector, xverseConnector } from '@midl-xyz/midl-js-connectors';
import { createConfig, MempoolSpaceProvider, regtest } from '@midl-xyz/midl-js-core';

export const midlConfig = createConfig({
  networks: [regtest],
  persist: true,
  provider: new MempoolSpaceProvider({
    regtest: 'https://mempool.regtest.midl.xyz',
  } as any), // Any is used coz we don't wanna give mainnet links
  connectors: [leatherConnector(), xverseConnector()],
});
