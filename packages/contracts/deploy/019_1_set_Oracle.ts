import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async ({ midl }) => {
  await midl.initialize();
  await midl.callContract("BTCOracle", "feedBaseFeeValue", {
    args: ["95000000000000000000000", 1]
  });
  await midl.callContract("BTCOracle", "feedBaseFeeValue", {
    args: ["95000000000000000000000", 2]
  });
  await midl.callContract("BTCOracle", "feedBaseFeeValue", {
    args: ["95000000000000000000000", 3]
  });
  await midl.callContract("BTCOracle", "grantRole", {
    args: [
      "0x8e4f01b2ef10e587f670bbfd448bba9a57a36fd9c81549b587269120cb62b24d",
      "0x01C4a9F3E6D3dCf439Ea637DC84dE401B9472b2F"
    ]
  });
  console.log("Setting BTCOracle");
  await midl.execute();
};

deploy.tags = ["main", "setOracle"];

export default deploy;
