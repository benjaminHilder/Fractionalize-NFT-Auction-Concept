const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fraction token functionality", async() => {
    let fractionAddress;
    let FractionToken;
    let fractionInstance
    let Storage
    let Auction
    let nftContract;
    let iterator = -1;

    let addr1;
    let addr2;
    let addr3;
    beforeEach(async() => {
        await iterator++;

        [addr1, addr2, addr3] = await ethers.getSigners();

        const StorageContract = await ethers.getContractFactory("Storage");
        const storageContract = await StorageContract.deploy();
        Storage = await storageContract.deployed();

        const AuctionContract = await ethers.getContractFactory("Auction");
        const auctionContract = await AuctionContract.deploy(storageContract.address);
        Auction = await auctionContract.deployed();

        const NftGenerator = await ethers.getContractFactory("NFTGenerator");
        const nftGenerator = await NftGenerator.deploy();
        nftContract = await nftGenerator.deployed();

        await nftContract.connect(addr1).safeMint(addr1.address, iterator)
        await nftContract.connect(addr1).approve(storageContract.address, iterator)
        await Storage.connect(addr1).depositNft(nftContract.address, iterator);
        await Storage.connect(addr1).createFraction(nftContract.address, iterator, "tokenName", "TK", 1000, 8);

        fractionAddress = await Storage.connect(addr1).getFractionAddressFromNft(nftContract.address, iterator)
        const FractionToken = await ethers.getContractFactory("baseFractionToken");
        fractionInstance = await FractionToken.attach(fractionAddress);
        
        await Storage.connect(addr1).setAuctionAddress(Auction.address);
        await Storage.setAuctionAddressInFraction(fractionAddress);
    })

    it("should transfer the correct amount of royaltys to nft owner and correct amount left to the reciever", async() => {
        await fractionInstance.connect(addr1).transfer(addr2.address, 100);
        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        let balanceOfAccount2 = await fractionInstance.balanceOf(addr2.address);

        expect(balanceOfAccount1).to.equal(908);
        expect(balanceOfAccount2).to.equal(92);
    })

    it("should have the fraction token avoid royaltys if transfering to auction contract", async() => {
        await fractionInstance.connect(addr1).approve(Auction.address, 1000)  
        await Auction.connect(addr1).stakeTokens(fractionAddress, 1000);

        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        expect(balanceOfAccount1).to.equal(0);
        
        let balanceAccountIn1Auction = await Auction.getAddressTokenBalance(fractionAddress, addr1.address)
        expect(balanceAccountIn1Auction).to.equal(1000);
    })

    it("should have the fraction token avoid royalty sending from the auction contract", async() => {
        await fractionInstance.connect(addr1).approve(Auction.address, 1000)  
        await Auction.connect(addr1).stakeTokens(fractionAddress, 1000);

        await Auction.connect(addr1).unstakeTokens(fractionAddress, 1000);

        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        expect(balanceOfAccount1).to.equal(1000);
    })

    it("should burn tokens", async() => {
        await fractionInstance.connect(addr1).burn(100);
        let balanceOfAccount1 = await fractionInstance.balanceOf(addr1.address);
        expect(balanceOfAccount1).to.equal(900);
    })



    
})