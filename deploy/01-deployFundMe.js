const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const deployFunc = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const ethUsdPriceFeedAddress =
    networkConfig[chainId]["ethUsdPriceFeedAddress"];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
  });
};

// const deployFunc = async () => {
//   console.log("hi");
// };

module.exports = deployFunc;
