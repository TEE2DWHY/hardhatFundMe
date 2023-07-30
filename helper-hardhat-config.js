const networkConfig = {
  31337: {
    name: "localhost",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  1: {
    name: "eth",
    ethUsdPriceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
};

module.exports = {
  networkConfig,
};
