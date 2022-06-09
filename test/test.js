//const { expectRevert, balance } = require("@openzeppelin/test-helpers");
const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { default: Web3 } = require("web3");
const { time } = require('@openzeppelin/test-helpers');
const { advanceTime,
        advanceBlock,
        advanceTimeAndBlock,
        takeSnapshot,
        revertToSnapShot} = require('./helper/time');

        const helper = require('./helper/time');

const StorageContract = artifacts.require("Storage");
const FractionToken = artifacts.require("baseFractionToken");
const NftContract = artifacts.require("NFTGenerator");
const AuctionContract = artifacts.require("Auction");

contract ('ReclaimNftAuction', (accounts) => {
    let storageContract;
    let auctionContract;
    let nftContract;
    let fractionAddress;
    let fractionInstance;
    let iterator = -1;
    
    beforeEach(async () => {
        await iterator++;
        storageContract = await StorageContract.deployed();
        auctionContract= await AuctionContract.deployed();
        nftContract = await NftContract.deployed();
        
        await nftContract.safeMint(accounts[0], iterator, {from: accounts[0]})
        await nftContract.approve(storageContract.address, iterator, {from: accounts[0]})
        await storageContract.depositNft(nftContract.address, iterator, {from: accounts[0]});
        await storageContract.createFraction(nftContract.address, iterator, "tokenName", "TK", 8000, 8, {from: accounts[0]});
        fractionAddress = await storageContract.getFractionAddressFromNft(nftContract.address, iterator);

        fractionInstance = await FractionToken.at(fractionAddress);

    })

    it ('should be able to increase block', async() => {
        let timeBefore = await helper.takeSnapshot();
        
        helper.advanceTime(1 * 100);
        let timeAfter = await auctionContract.getTimestamp();

        console.log("time before: " + timeBefore + " time after: " + timeAfter);
    })
    //it ('should be able to let an address stake their tokens into the auction contract', async() => {
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[0]})
//
    //    let balanfceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
    //    assert (balanceOfAuction == 1)
    //})
//
    //it ('SHOULD NOT be able to stake more tokens than what the account owns', async() => {
    //    await fractionInstance.approve(auctionContract.address, 8000, {from: accounts[0]})  
    //    await fractionInstance.transfer(accounts[1], 1, {from: accounts[0]})
//
    //    let balanceOfAccount1 = await fractionInstance.balanceOf(accounts[1]);
    //    assert(balanceOfAccount1 == 1);
//
    //    try {
    //        await auctionContract.stakeTokens(fractionAddress, 8000, {from: accounts[0]})}
    //    catch {
    //        console.log("could not send more tokens than owned")}
//
//
//
    //})
//
    //it ('should be able to let an address withdraw their tokens after they stake it in the auction contract', async() => {
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[0]})
//
    //    let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
    //    assert (balanceOfAuction == 1)
//
    //    await auctionContract.unstakeTokens(fractionAddress, 1, {from: accounts[0]})
    //    balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
    //    assert (balanceOfAuction == 0)
    //    
    //    let balanceOfAccount0 = await fractionInstance.balanceOf(accounts[0]);
    //    assert(balanceOfAccount0 == 8000)
//
//
    //})
//
    //it ('SHOULD NOT be able to withdraw more tokens than what is staked by address', async() => {
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[0]})
//
    //    await fractionInstance.transfer(accounts[1], 1, {from: accounts[0]});
//
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[1]}) 
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[1]})
//
    //    let balanceOfAuctionContract = await fractionInstance.balanceOf(auctionContract.address);
    //    assert(balanceOfAuctionContract == 2)
//
    //    try { 
    //        await auctionContract.unstakeTokens(fractionAddress, 2, {from: accounts[0]})}
    //    catch {
    //        console.log ("could not withdraw more tokens than what was staked")}
//
//
    //})
//
    //it ('should allow a user to start a proposal with an NFT they deposited', async() => {
    //    await fractionInstance.transfer(accounts[1], 6000, {from: accounts[0]})
    //    let balanceOfAccount1 = await fractionInstance.balanceOf(accounts[1]);
    //    //royalty fees reduce 6000 to 5520
    //    assert(balanceOfAccount1 == 5520);
//
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[0]})
//
    //    let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
    //    assert (balanceOfAuction == 1)
//
    //    await auctionContract.startProposal(nftContract.address, iterator, 2, 20, 1, {from: accounts[0]});
    //    
    //    let isNftInProposal = await auctionContract.getIsNftInProposal(NftContract.address, iterator);
    //    console.log("isNftInProposal: " + isNftInProposal)
    //    assert (isNftInProposal == true);
//
    //    let proposalStartPrice = await auctionContract.getProposalStartPrice(NftContract.address, iterator);
    //    console.log("proposalStartPrice: " + proposalStartPrice);
    //    assert (proposalStartPrice == 2)
//
    //    let proposalInitiator = await auctionContract.getProposalInitiator(NftContract.address, iterator);
    //    console.log("proposalInitiator: " + proposalInitiator);
    //    assert(proposalInitiator == accounts[0])
//
    //    let proposalFinishTime = await auctionContract.getProposalFinishTime(NftContract.address, iterator);
    //    console.log("proposalFinishTime: " +proposalFinishTime);
//
    //    let proposalTotalVoted = await auctionContract.getProposalTotalVoted(NftContract.address, iterator)
    //    console.log("proposalTotalVoted: " + proposalTotalVoted)
    //    assert(proposalTotalVoted == 1)
//
    //    let proposalScore = await auctionContract.getProposalScore(NftContract.address, iterator);
    //    console.log("proposalscore: " + proposalScore);
    //    assert(proposalScore == 1)
//
    //})
//
    //it('SHOULD NOT let you create a proposal of an NFT you do not own', async() => {
    //    await fractionInstance.transfer(accounts[1], 6000, {from: accounts[0]})
    //    let balanceOfAccount1 = await fractionInstance.balanceOf(accounts[1]);
    //    //royalty fees reduce 6000 to 5520
    //    assert(balanceOfAccount1 == 5520);
//
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[1]})  
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[1]})
//
    //    let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
    //    assert (balanceOfAuction == 1)
//
    //    try {
    //        await auctionContract.startProposal(nftContract.address, iterator, 2, 20, 1, {from: accounts[1]})}
    //    catch {
    //        await console.log("address could not start a proposal of an NFT they do not own")}
    //    
    //})
//
    //it('should let an address vote on the proposal if they own tokens', async() => {
    //    await fractionInstance.transfer(accounts[1], 1000, {from: accounts[0]})
//
    //    await fractionInstance.approve(auctionContract.address, 101, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 101, {from: accounts[0]})
//
    //    //let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
    //    //assert (balanceOfAuction == 1)
//
    //    await auctionContract.startProposal(nftContract.address, iterator, 2, 20, 100, {from: accounts[0]});
//
    //    await auctionContract.voteOnProposal(nftContract.address, iterator, true, 1, {from: accounts[0]});
//
    //    let totalVoted = await auctionContract.getProposalTotalVoted(nftContract.address,iterator);
    //    assert(totalVoted == 101);
//
    //    let score = await auctionContract.getProposalScore(nftContract.address,iterator);
    //    assert(score == 101);
//
    //    await fractionInstance.approve(auctionContract.address, 1, {from: accounts[1]})  
    //    await auctionContract.stakeTokens(fractionAddress, 1, {from: accounts[1]})
//
    //    await auctionContract.voteOnProposal(nftContract.address, iterator, false, 1, {from: accounts[1]});
    //    
    //    score = await auctionContract.getProposalScore(nftContract.address,iterator);
    //    totalVoted = await auctionContract.getProposalTotalVoted(nftContract.address,iterator);
    //    assert(score == 100);
    //    assert(totalVoted == 102);
    //})
//
    //it('should be able to start an auction when 50% of tokens vote yes for an auction', async() => {
    //    await fractionInstance.approve(auctionContract.address, 8000, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 8000, {from: accounts[0]})
//
    //    await auctionContract.startProposal(nftContract.address, iterator, 2, 20, 100, {from: accounts[0]});
//
    //    await auctionContract.voteOnProposal(nftContract.address, iterator, true, 4000, {from: accounts[0]});
//
    //    let isNftInAuction = await auctionContract.getIfNftIsInAuction(nftContract.address, iterator);
    //    assert(isNftInAuction == true);
//
    //    let IsNftInProposal = await auctionContract.getIsNftInProposal(nftContract.address, iterator);
    //    assert(IsNftInProposal == false);
    //})
//
    //it('should reset all proposal variables when an auction starts', async() => {
    //    await fractionInstance.approve(auctionContract.address, 8000, {from: accounts[0]})  
    //    await auctionContract.stakeTokens(fractionAddress, 8000, {from: accounts[0]})
//
    //    await auctionContract.startProposal(nftContract.address, iterator, 2, 20, 100, {from: accounts[0]});
//
    //    await auctionContract.voteOnProposal(nftContract.address, iterator, true, 4000, {from: accounts[0]});
//
    //    let isNftInAuction = await auctionContract.getIfNftIsInAuction(nftContract.address, iterator);
    //    assert(isNftInAuction == true);
//
    //    let IsNftInProposal = await auctionContract.getIsNftInProposal(nftContract.address, iterator);
    //    assert(IsNftInProposal == false);
//
    //    let proposalFinishTime = await auctionContract.getProposalFinishTime(nftContract.address, iterator);
    //    assert(proposalFinishTime == 0)
//
    //    let totalVoted = await auctionContract.getProposalTotalVoted(nftContract.address,iterator);
    //    assert(totalVoted == 0);
//
    //    let score = await auctionContract.getProposalScore(nftContract.address, iterator);
    //    assert(score == 0);
//
    //    let nftProposalStartPrice = await auctionContract.getProposalStartPrice(nftContract.address, iterator);
    //    assert(nftProposalStartPrice == 0);
//
    //    //figure out how to test this or change the default address to another
    //    //let proposalInitiator = await auctionContract.getProposalInitiator(nftContract, iterator);
    //    //assert(proposalInitiator == "0x000000000000000000000000000000000000dEaD")
    //})

  //  it ('should be able to bid on an auction', async() => {
  //      await fractionInstance.approve(auctionContract.address, 8000, {from: accounts[0]})  
  //      await auctionContract.stakeTokens(fractionAddress, 8000, {from: accounts[0]})
//
  //      await auctionContract.startProposal(nftContract.address, iterator, 2, 20, 100, {from: accounts[0]});
//
  //      await auctionContract.voteOnProposal(nftContract.address, iterator, true, 4000, {from: accounts[0]});
//
  //      let isNftInAuction = await auctionContract.getIfNftIsInAuction(nftContract.address, iterator);
  //      assert(isNftInAuction == true);
//
  //      web3.eth.sendTransaction({to:await auctionContract.bidOnAuction(nftContract.address, iterator), from: accounts[0], value: 300000000000000000000000000000})
  //  })






})