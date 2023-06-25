const { network } = require("hardhat");

const DECIMALS = 8; // constructor params for MockV3Aggregator
const INITIAL_ANSWER = 200000000000; //  constructor params for MockV3Aggregator: (two thousand and eight decimals)

const deployMock = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId === 31337) {
    log("Local netowrk detected! Deploying mocks..");
    await deploy("MockV3Aggregator", {
      from: deployer,
      contract: "MockV3Aggregator",
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], // this takes the constructor paramater for the MockV3Aggregator (can be checked from node modules/chainlink/src/test/MockV3Aggregator)
    });
    log("Mocks deployed!");
    log("------------------------------------------");
  }
};

module.exports = deployMock;

module.exports.tags = ["all", "mocks"];
