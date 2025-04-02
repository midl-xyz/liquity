type DeploymentConfig = {
  multisigAddress: string;
  feesSetter: string;
  feesAdmin: string;
};

// Arbitrum Mainnet Deployment Config
export const deployConfig: DeploymentConfig = {
  multisigAddress: "0x5E5b88DEfa1A412C69644CB47E68107d97807E35", 
  feesSetter: "0x5E5b88DEfa1A412C69644CB47E68107d97807E35", 
  feesAdmin: "0x5E5b88DEfa1A412C69644CB47E68107d97807E35" 
};
