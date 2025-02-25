import { createConfig, regtest, leather } from "@midl-xyz/midl-js-core";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore yarn doesn't like this import
import { satsConnect } from '@midl-xyz/midl-js-core/connectors/sats-connect';

export const midlConfig = createConfig({
  networks: [regtest],
  connectors: [satsConnect(), leather()],
  persist: true,
});