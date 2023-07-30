// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

/// @title A contract for Crowd Funding
/// @author Olorunfemi Tayo
/// @notice This contract is to demo a sample funding project
/// @dev This implements price feed as our library

contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;
    // state variables
    uint256 public constant MIN_USD = 50 * 1e18; // we use the Wei format because our getConversionRate function returns amount in USD in Wei format. The constant keyword helps with gas efficiency
    address[] private s_funders; // created an array of people who calls the fund function
    mapping(address => uint256) private s_addressToAmountFunded; 
    address private immutable i_owner; // owner of contract. The immutable keyword helps with gas efficiency
    error NotOwner(); // a custom error handler. It helps with gas efficiency.
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

     // to ensure only the contract creator can call the withdraw function we do:
    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not owner");
        _;
    }

    /// @notice This function funds the contract
    /// @dev This implements price feed as our library
    function fund() public payable {
        require(
            (msg.value.getConversionRate(s_priceFeed)) >= MIN_USD,
            "ETH funding amount is too little"
        );
        s_funders.push(msg.sender); // push addresses to the funders array
        s_addressToAmountFunded[msg.sender] += msg.value; // map address to amount sent
    }

    //withdraw
    function withdraw() public onlyOwner {
        console.log("This is a withdrawal function");
        require(s_funders.length > 0, "No funders to withdraw from");

        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0); // we refresh the funders array after withdrawal
        // payable(msg.sender).transfer(address(this).balance);=> // this is withdrawal method using the transfer method
        // bool sendSuccess = payable(msg.sender).send(address(this).balance); => // this is withdrawal method using send method
        // require(sendSuccess, "Send Failure");
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(""); // this is withdrawal method using the call method
        // require(callSuccess, "Call Failure");
        if (!callSuccess && msg.sender != i_owner) {
            // rather than using the require keyword, we can use an error handler as it helps with gas efficiency.
            revert();
        }
    }

    receive() external payable {
        // this would help handle a scenraio where an address sends money to our contract without calling the fund function
        fund();
    }

    fallback() external payable {
        // this would help handle a scenraio where an address sends money to our contract without calling the fund function
        fund();
    }
}
