require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_URL = process.env.GOERLI_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_APIKEY;

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.18" }, { version: "0.8" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    goerli: {
      url: GOERLI_URL,
      account: [PRIVATE_KEY],
      chainId: 5,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      31337: 1,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
};
