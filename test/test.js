const { expectRevert } = require("@openzeppelin/test-helpers");
const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { default: Web3 } = require("web3");

const StorageContract = artifacts.require("Storage");
const FractionToken = artifacts.require("baseFractionToken");
const NftContract = artifacts.require("NFTGenerator");
const AuctionContract = artifacts.require("Auction");

contract ('ReclaimNftAuction', (accounts) => {
    let storageContract;
    let auctionContract;
    let nftContract;
    let fractionInstance;
    let iterator = 0;
    
    beforeEach(async () => {
        storageContract = await StorageContract.deployed();
        auctionContract= await AuctionContract.deployed();
        nftContract = await NftContract.deployed();

        await nftContract.safeMint(accounts[0], iterator, {from: accounts[0]})
        await nftContract.approve(MainContract.address, iterator, {from: accounts[0]})
        await storageContract.depositNft(nftContract.address, iterator, {from: accounts[0]});
        await storageContract.createFraction(nftContract.address, iterator, "tokenName", "TK", 8000, 8, {from: accounts[0]});
        let fractionAddress = await storageContract.getFractionAddressFromNft(nftContract.address, iterator);
        fractionInstance = await FractionToken.at(fractionAddress);
    })
    it ('should be able to let an address stake their tokens into the auction contract', async() => {
        fractionInstance.approve(auctionContract.address, fractionInstance.balanceOf(accounts[0]), {from: accounts[0]})
        auctionContract.stakeTokens(fractionInstance, fractionInstance.balanceOf(accounts[0]))
        await iterator++;
    })
})