require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@openzeppelin/test-helpers");
require("@nomiclabs/hardhat-etherscan");

const fs =  require("fs");

const SECRETS = JSON.parse(
  fs.readFileSync("./secrets.json").toString().trim()
)

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.14",
  networks: {
    ropsten: {
      url: SECRETS.INFURA_ROPSTEN_URL,
      accounts: [`0x${SECRETS.PRIVATE_KEY}`]

    },

    rinkeby: {
      url: SECRETS.INFURA_RINKEBY_URL,
      accounts: [`0x${SECRETS.PRIVATE_KEY}`]
    }
  },

  etherscan: {
    apiKey: SECRETS.ETHERSCAN_KEY
  }
};
