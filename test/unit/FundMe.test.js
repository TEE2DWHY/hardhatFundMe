const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async () => {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const priceFeedAddress = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
  const sendValue = ethers.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    fundMe = await fundMeFactory.deploy(priceFeedAddress);
    const mockV3AggregatorFactory = await ethers.getContractFactory(
      "MockV3Aggregator"
    );
    mockV3Aggregator = await mockV3AggregatorFactory.deploy();
  });

  describe("constructor", function () {
    it("sets the aggregator addresses correctly", async () => {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async () => {
    it("Fails if you don't send enough eth", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to send more ETH!"
      );
    });
    it("updated the amount funded data structure", async () => {
      // to run only this we can do: npx hardhat test --grep "amount funded"
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Adds funders to array of funders", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });

    describe("withdraw", async () => {
      beforeEach(async () => {
        await fundMe.fund({ value: sendValue });
      });
    });

    it("withdraw eth from a single funder", async () => {
      //Arrange
      const startingFundingBalance = await fundMe.provider.getBalance(
        // the fundMe contract comes with a provider, we could have also done ethers.provider..
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundingBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      //Assert
      assert.equal(endingFundingBalance, 0);
      assert.equal(
        startingFundingBalance.add(startingDeployerBalance).toString(),
        endingFundingBalance.add(endingDeployerBalance).add(gasCost).toString()
      );
    });
    it("is allows us to withdraw with multiple funders", async () => {
      // Arrange
      const accounts = await ethers.getSigners();
      for (i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.cheaperWithdraw();
      // Let's comapre gas costs :)
      // const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
      console.log(`GasCost: ${withdrawGasCost}`);
      console.log(`GasUsed: ${gasUsed}`);
      console.log(`GasPrice: ${effectiveGasPrice}`);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      // Assert
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(withdrawGasCost).toString()
      );
      // Make a getter for storage variables
      await expect(fundMe.getFunder(0)).to.be.reverted;

      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("Only allows the owner to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const fundMeConnectedContract = await fundMe.connect(accounts[1]);
      await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
        "FundMe__NotOwner"
      );
    });
  });
});
