const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const verify = require("../utils/verify");
require("dotenv").config();

const deployFunc = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // this allows us to flip between a localnetwork, testnet and mainnet chain
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
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    gasLimit: 2000000,
    // we need to wait if on a live network so we can verify properly
  });
  log(`FundMe deployed at ${fundMe.address}`);
  if (chainId !== 31337 && process.env.ETHERSCAN_APIKEY) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

module.exports = deployFunc;

module.exports.tags = ["all", "fundme"];
