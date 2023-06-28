const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("verification in progress");
  try {
    await run(verify, {
      address: contractAddress,
      constructorArguements: args,
    });
    console.log("verification is successful");
  } catch (err) {
    if (err.message.toLowerCase().includes("already verfied")) {
      console.log("Already verified");
    } else {
      console.log(err);
    }
  }
};

module.exports = verify;
