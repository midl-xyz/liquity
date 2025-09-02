/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  define: {
    'import.meta.env.VITE_EVM_RPC': JSON.stringify(process.env.EVM_RPC || 'https://rpc.regtest.midl.xyz'),
    'import.meta.env.VITE_MEMPOOL_RPC': JSON.stringify(process.env.MEMPOOL_RPC || 'https://mempool.regtest.midl.xyz')
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["assert", "buffer", "events", "http", "https", "stream", "util", "zlib"]
    })
  ],
  optimizeDeps: {
    include: ["@liquity/providers", "@liquity/lib-ethers", "@liquity/lib-base", "@liquity/lib-react"]
  },
  build: {
    commonjsOptions: {
      include: ["**.cjs", "**.js"]
    }
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/setupTests.ts",
    testTimeout: 10000
  },
  server: {
    cors: false
  }
});
