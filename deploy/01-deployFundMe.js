const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const deployFunc = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;
  if (chainId === 31337) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
    console.log(ethUsdPriceFeedAddress);
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"];
    console.log(ethUsdPriceFeedAddress);
  }
  log("-----------------------------------------");
  const fundMe = await deploy("FundMe", {
    // this allows us to flip between a localnetwork, testnet and mainnet chain.
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    // we need to wait if on a live network so we can verify properly
  });
  log(`FundMe deployed at ${fundMe.address}`);
};

module.exports = deployFunc;

module.exports.tags = ["all", "fundme"];
