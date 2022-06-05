const { expectRevert } = require("@openzeppelin/test-helpers");
const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { default: Web3 } = require("web3");

const MainContract = artifacts.require("MainContract");
const FractionToken = artifacts.require("baseFractionToken");
const NFTContract = artifacts.require("NFTGenerator");
const AuctionWithdraw = artifacts.require("ReclaimNftAuction");

contract ('ReclaimNftAuction', (accounts) => {
    let mainContract;
    let auctionContract;
    let nftContract;
    let iterator = 0;
    
    beforeEach(async () => {
        mainContract = await MainContract.deployed();
        auctionContract=  await AuctionWithdraw.deployed();s
        nftContract = await NFTContract.deployed();

        await nftContract.safeMint(accounts[0], iterator, {from: accounts[0]})
        await nftContract.approve(MainContract.address, iterator, {from: accounts[0]})
        await mainContract.depositNft(nftContract.address, iterator, {from: accounts[0]});
        await mainContract.createFraction(nftContract.address, iterator, 8, 8000, "tokenName", "TK", {from: accounts[0]});
    })
    it ('should get fraction id', async() => {
        //await mainContract.createFraction(nftContract.address, iterator, 8, 8000, "tokenName", "TK", {from: accounts[0]});
        //let fractionId = await mainContract.getLastFractionId(accounts[0])
        //
        //assert(fractionId == 1)
        await iterator++;
    })
})