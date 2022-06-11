const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, balance } = require('@openzeppelin/test-helpers');

require("@nomiclabs/hardhat-waffle");

describe("Auction", function () {
  //let contract;
  //let owner;

  let storageContract;
  let auctionContract;
  let nftContract;

  let fractionInstance;
  let fractionAddress;

  let iterator = -1;

  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    await iterator++;
    
   const Storage = await ethers.getContractFactory("Storage");
   const storage = await Storage.deploy();
   storageContract = await storage.deployed();

   const Auction = await ethers.getContractFactory("Auction");
   const auction = await Auction.deploy(storageContract.address);
   auctionContract = await auction.deployed();

   const NFTGenerator = await ethers.getContractFactory("NFTGenerator");
   const nftGenerator = await NFTGenerator.deploy();
   nftContract = await nftGenerator.deployed();

   const [_owner, _addr1, _addr2] = await ethers.getSigners();

   owner = _owner;
   addr1 = _addr1;
   addr2 = _addr2;

   await nftContract.connect(owner).safeMint(owner.address, iterator)
   await nftContract.connect(owner).approve(storageContract.address, iterator)
   await storageContract.connect(owner).depositNft(nftContract.address, iterator);
   await storageContract.connect(owner).createFraction(nftContract.address, iterator, "tokenName", "TK", 8000, 8);
   
    fractionAddress = await storageContract.getFractionAddressFromNft(nftContract.address, iterator);
   const FractionToken = await ethers.getContractFactory("baseFractionToken");
   fractionInstance = await FractionToken.attach(fractionAddress)
  })

    it ('should be able to let an address stake their tokens into the auction contract', async() => {

  await fractionInstance.connect(owner).approve(auctionContract.address, 1)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
        expect(balanceOfAuction).to.equal(1)
        //assert (balanceOfAuction == 1)
    })

    it ('SHOULD NOT be able to stake more tokens than what the account owns', async() => {
        await fractionInstance.connect(owner).approve(auctionContract.address, 8000)  
        await fractionInstance.connect(owner).transfer(addr1.address, 1)

        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        expect(balanceOfAccount1).to.equal(1)

        try {
            await auctionContract.connect(owner).stakeTokens(fractionAddress, 8000)}
        catch {
            console.log("could not send more tokens than owned")}

    })

    it ('should be able to let an address withdraw their tokens after they stake it in the auction contract', async() => {
        await fractionInstance.connect(owner).approve(auctionContract.address, 1)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
        expect(balanceOfAuction).to.equal(1)

        await auctionContract.connect(owner).unstakeTokens(fractionAddress, 1)
        balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
        expect(balanceOfAuction).to.equal(0)

        let balanceOfAccount0 = await fractionInstance.balanceOf(owner.address);
        expect(balanceOfAccount0).to.equal(8000)

    })

    it ('SHOULD NOT be able to withdraw more tokens than what is staked by address', async() => {
        await fractionInstance.connect(owner).approve(auctionContract.address, 1)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        await fractionInstance.connect(owner).transfer(owner.address, 1);

        await fractionInstance.connect(owner).approve(auctionContract.address, 1) 
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        let balanceOfAuctionContract = await fractionInstance.balanceOf(auctionContract.address);
        expect(balanceOfAuctionContract).to.equal(2)

        try { 
            await auctionContract.connect(owner).unstakeTokens(fractionAddress, 2)}
        catch {
            console.log ("could not withdraw more tokens than what was staked")}
    })

    it ('should allow a user to start a proposal with an NFT they deposited', async() => {
        await fractionInstance.connect(owner).transfer(addr1.address, 6000)
        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        //royalty fees reduce 6000 to 5520
        expect(balanceOfAccount1).to.eq(5520)

        await fractionInstance.connect(owner).approve(auctionContract.address, 1)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
        expect(balanceOfAuction).to.equal(1)

        await auctionContract.connect(owner).startProposal(nftContract.address, iterator, 2, 20, 1);

        let isNftInProposal = await auctionContract.getIsNftInProposal(nftContract.address, iterator);
        console.log("isNftInProposal: " + isNftInProposal)
        expect(isNftInProposal).to.equal(true)


        let proposalStartPrice = await auctionContract.getProposalStartPrice(nftContract.address, iterator);
        console.log("proposalStartPrice: " + proposalStartPrice);
        expect(proposalStartPrice).to.equal(2)

        let proposalInitiator = await auctionContract.getProposalInitiator(nftContract.address, iterator);
        console.log("proposalInitiator: " + proposalInitiator);
        expect(proposalInitiator).to.equal(owner.address)

        let proposalFinishTime = await auctionContract.getProposalFinishTime(nftContract.address, iterator);
        console.log("proposalFinishTime: " + proposalFinishTime);
        //add an expect here

        let proposalTotalVoted = await auctionContract.getProposalTotalVoted(nftContract.address, iterator)
        console.log("proposalTotalVoted: " + proposalTotalVoted)
        expect(proposalTotalVoted).to.equal(1)

        let proposalScore = await auctionContract.getProposalScore(nftContract.address, iterator);
        console.log("proposalscore: " + proposalScore);
        expect(proposalScore).to.equal(1)

    })

    it('SHOULD NOT let you create a proposal of an NFT you do not own', async() => {
        await fractionInstance.connect(owner).transfer(addr1.address, 6000)
        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        //royalty fees reduce 6000 to 5520
        expect(balanceOfAccount1).to.equal(5520);

        await fractionInstance.connect(owner).approve(auctionContract.address, 1)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
        expect(balanceOfAuction).to.equal(1);

        try {
            await auctionContract.connect(owner).startProposal(nftContract.address, iterator, 2, 20, 1)}
        catch {
            await console.log("address could not start a proposal of an NFT they do not own")}
        
    })

    it('should let an address vote on the proposal if they own tokens', async() => {
        await fractionInstance.connect(owner).transfer(addr1.address, 1000, )

        await fractionInstance.connect(owner).approve(auctionContract.address, 101)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 101)

        //let balanceOfAuction = await fractionInstance.balanceOf(auctionContract.address);
        //assert (balanceOfAuction == 1)

        await auctionContract.connect(owner).startProposal(nftContract.address, iterator, 2, 20, 100);

        await auctionContract.connect(owner).voteOnProposal(nftContract.address, iterator, true, 1);

        let totalVoted = await auctionContract.getProposalTotalVoted(nftContract.address,iterator);
        expect(totalVoted).to.equal(101);

        let score = await auctionContract.getProposalScore(nftContract.address,iterator);

        expect(score).to.equal(101);

        await fractionInstance.connect(owner).approve(auctionContract.address, 1)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 1)

        await auctionContract.connect(owner).voteOnProposal(nftContract.address, iterator, false, 1);

        score = await auctionContract.getProposalScore(nftContract.address,iterator);
        totalVoted = await auctionContract.getProposalTotalVoted(nftContract.address,iterator);
        expect(score).to.equal(100);
        expect(totalVoted).to.equal(102);
    })

    it('should be able to start an auction when 50% of tokens vote yes for an auction', async() => {
        await fractionInstance.connect(owner).approve(auctionContract.address, 8000)  

        await auctionContract.connect(owner).stakeTokens(fractionAddress, 8000)

        await auctionContract.connect(owner).startProposal(nftContract.address, iterator, 2, 20, 100);

        await auctionContract.connect(owner).voteOnProposal(nftContract.address, iterator, true, 4000);

        let isNftInAuction = await auctionContract.getIfNftIsInAuction(nftContract.address, iterator);
        expect(isNftInAuction).to.equal(true);

        let IsNftInProposal = await auctionContract.getIsNftInProposal(nftContract.address, iterator);
        expect(IsNftInProposal).to.equal(false);
    })

    it('should reset all proposal variables when an auction starts', async() => {
        await fractionInstance.connect(owner).approve(auctionContract.address, 8000)  
        await auctionContract.connect(owner).stakeTokens(fractionAddress, 8000)

        await auctionContract.connect(owner).startProposal(nftContract.address, iterator, 2, 20, 100);

        await auctionContract.connect(owner).voteOnProposal(nftContract.address, iterator, true, 4000);

        let isNftInAuction = await auctionContract.getIfNftIsInAuction(nftContract.address, iterator);
        expect(isNftInAuction).to.equal(true)

        let isNftInProposal = await auctionContract.getIsNftInProposal(nftContract.address, iterator);
        expect(isNftInProposal).to.equal(false)

        let proposalFinishTime = await auctionContract.getProposalFinishTime(nftContract.address, iterator);
        expect(proposalFinishTime).to.equal(0)

        let totalVoted = await auctionContract.getProposalTotalVoted(nftContract.address,iterator);
        expect(totalVoted).to.equal(0)

        let score = await auctionContract.getProposalScore(nftContract.address, iterator);
        expect(score).to.equal(0)

        let nftProposalStartPrice = await auctionContract.getProposalStartPrice(nftContract.address, iterator);
        expect(nftProposalStartPrice).to.equal(0)

        //figure out how to test this or change the default address to another
        //let proposalInitiator = await auctionContract.getProposalInitiator(nftContract, iterator);
        //assert(proposalInitiator == "0x000000000000000000000000000000000000dEaD")
    })  
      it ('should be able to bid on an auction', async() => {
          await fractionInstance.connect(owner).approve(auctionContract.address, 8000)  
          await auctionContract.connect(owner).stakeTokens(fractionAddress, 8000)

          await auctionContract.connect(owner).startProposal(nftContract.address, iterator, 2, 20, 100);

          await auctionContract.connect(owner).voteOnProposal(nftContract.address, iterator, true, 4000);

          let isNftInAuction = await auctionContract.getIfNftIsInAuction(nftContract.address, iterator);
          expect(isNftInAuction).to.equal(true)

          //web3.eth.sendTransaction({to:await auctionContract.bidOnAuction(nftContract.address, iterator), from: accounts[0], value: 300000000000000000000000000000})
      })

});