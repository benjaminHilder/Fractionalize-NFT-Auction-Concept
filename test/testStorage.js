const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Storage functionality", async () => {
  let Storage;
  let Auction;
  let nftContract;
  let fractionAddress;
  let fractionInstance;

  let iterator = -1;

  let addr1;
  let addr2;
  let addr3;

  beforeEach(async () => {
    iterator++;

    const StorageContract = await ethers.getContractFactory("Storage");
    const storageContract = await StorageContract.deploy();
    Storage = await storageContract.deployed();

    const AuctionContract = await ethers.getContractFactory("Auction");
    const auctionContract = await AuctionContract.deploy(
      storageContract.address
    );
    Auction = await auctionContract.deployed();

    const NFTGenerator = await ethers.getContractFactory("NFTGenerator");
    const nftGenerator = await NFTGenerator.deploy();
    nftContract = await nftGenerator.deployed();

    [addr1, addr2, addr3] = await ethers.getSigners();

    await nftContract.connect(addr1).safeMint(addr1.address, iterator);
    await nftContract.connect(addr1).approve(Storage.address, iterator);
    await Storage.connect(addr1).depositNft(nftContract.address, iterator);
    await Storage.connect(addr1).createFraction(
      nftContract.address,
      iterator,
      "tokenName",
      "TK",
      1000,
      8
    );

    fractionAddress = await Storage.getFractionAddressFromNft(
      nftContract.address,
      iterator
    );
    const FractionContract = await ethers.getContractFactory(
      "baseFractionToken"
    );
    fractionInstance = await FractionContract.attach(fractionAddress);
  });
});
