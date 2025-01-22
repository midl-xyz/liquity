type DeploymentConfig = {
  multisigAddress: string;
  feesSetter: string;
  feesAdmin: string;
};

// Arbitrum Mainnet Deployment Config
export const deployConfig: DeploymentConfig = {
  multisigAddress: "0x5E5b88DEfa1A412C69644CB47E68107d97807E35", // Protocol's multisig that receives all HOG tokens on deployment https://app.safe.global/home?safe=eth:0x720e0a01069722DBa720B800FF2a9bd6d607effF
  feesSetter: "0x5E5b88DEfa1A412C69644CB47E68107d97807E35", // https://app.safe.global/home?safe=arb1:0x93Dc8f1AC887BA1A69Cc2fCa324740D38aB24E8C
  feesAdmin: "0x5E5b88DEfa1A412C69644CB47E68107d97807E35" // https://app.safe.global/home?safe=arb1:0x77cED5FaA9873F2fBD4c5D3B202F1CcAfDE272F2
};
