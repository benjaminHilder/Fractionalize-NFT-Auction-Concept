const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const StorageContract = artifacts.require("Storage");
const NFTContract = artifacts.require("NFTGenerator");
const AuctionContract = artifacts.require("Auction");

module.exports = async function (deployer, _network, accounts) {
    await deployer.deploy(StorageContract);
    await deployer.deploy(NFTContract);

    await deployer.deploy(AuctionContract, StorageContract.address )
}