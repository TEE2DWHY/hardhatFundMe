// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; // imported the Chain link aggreagtor

library PriceConverter {
    // We firstly want to get the current price of ETH
    function getPrice(
        AggregatorV3Interface priceFeed // with this we dont have to hardcode the price feed address like we did before
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    // We want to get the price in USD for an amount of ETH
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 amountInUsd = (ethPrice * ethAmount) / 1e18;
        return amountInUsd;
    }
}
