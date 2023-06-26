// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    uint256 public constant MAX_USD = 1000 * 1e18; // we use the Wei format because our getConversionRate function returns amount in USD in Wei format. The constant keyword helps with gas efficiency
    address[] public funders; // created an array of people who calls the fund function
    mapping(address => uint256) public addressToAmountFunded; // mapped each address to the amount they've funded
    address public immutable i_owner; // owner of contract. The immutable keyword helps with gas efficiency
    error NotOwner(); // a custom error handler. It helps with gas efficiency.
    AggregatorV3Interface priceFeed;

    constructor(address priceFeedAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    // funding
    function fund() public payable {
        require(
            (msg.value.getConversionRate(priceFeed)) <= MAX_USD,
            "ETH funding amount exceeded"
        );
        funders.push(msg.sender); // push addresses to the funders array
        addressToAmountFunded[msg.sender] += msg.value; // map address to amount sent
    }

    //withdraw
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex]; // we get the funder address from the first index
            addressToAmountFunded[funder] = 0; // we reset the amount funded by funder to 0
        }
        funders = new address[](0); // we refresh the funders array after withdrawal
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

    // to ensure only the contract creator can call the withdraw function we do:
    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not owner");
        _;
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
