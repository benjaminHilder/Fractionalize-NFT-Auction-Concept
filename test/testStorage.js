const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

describe.only("Storage functionality", async () => {
  let Storage;
  let Auction;
  let nftContract;
  let FractionToken;
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
    const auctionContract = await AuctionContract.deploy( storageContract.address);
    Auction = await auctionContract.deployed();

    const NFTGenerator = await ethers.getContractFactory("NFTGenerator");
    const nftGenerator = await NFTGenerator.deploy();
    nftContract = await nftGenerator.deployed();

    FractionToken = await ethers.getContractFactory("baseFractionToken");

    [addr1, addr2, addr3] = await ethers.getSigners();

    await nftContract.connect(addr1).safeMint(addr1.address, iterator);
    await nftContract.connect(addr1).approve(Storage.address, iterator);
    
  });

  it("Should allow a user to deposit an NFT they own", async() => {
    await expectRevert(
      Storage.connect(addr2).depositNft(nftContract.address, iterator),
      "VM Exception while processing transaction"
    )
    await Storage.connect(addr1).depositNft(nftContract.address, iterator); 

    let nftOwner = await nftContract.ownerOf(iterator);
    expect(nftOwner).to.equal(Storage.address); 

    let storageNftOwner = await Storage.getNftOwner(nftContract.address, iterator);
    expect(storageNftOwner).to.equal(addr1.address);

  })

  it("Should allow a user to create a fraction of an NFT they deposited",async() => {
    await Storage.connect(addr1).depositNft(nftContract.address, iterator);
    await Storage.connect(addr1).createFraction(nftContract.address,
                                                iterator,
                                                "tokenName",
                                                "TK",
                                                1000,
                                                8);
    
    let fractionAddress = await Storage.getFractionAddressFromNft(nftContract.address, iterator);
    let fractionInstance = await FractionToken.attach(fractionAddress);

    let fractionNftAddress = await fractionInstance.getNftAddress();
    let fractionNftId = await fractionInstance.getNftId();
    let fractionNftOwner = await fractionInstance.getNftOwner();
    let fractionTokenName = await fractionInstance.name(); 
    let fractionSymbol = await fractionInstance.symbol();
    let fractionSupply = await fractionInstance.totalSupply();
    let fractionRoyalty = await fractionInstance.getRoyaltyPercentage();

    expect(fractionNftAddress).to.equal(nftContract.address);
    expect(fractionNftId).to.equal(iterator);
    expect(fractionNftOwner).to.equal(addr1.address);
    expect(fractionTokenName).to.equal("tokenName");
    expect(fractionSymbol).to.equal("TK");
    expect(fractionSupply).to.equal(1000);
    expect(fractionRoyalty).to.equal(8)
  })

  it("SHOULDNT allow a user to create a fraction of an NFT they do not own", async() => {
      await Storage.connect(addr1).depositNft(nftContract.address, iterator);
      
      await expectRevert(
          Storage.connect(addr2).createFraction(nftContract.address,
                                                iterator,
                                                "tokenName",
                                                "TK",
                                                1000,
                                                8), 
        "VM Exception while processing transaction"
      )
  })

  it("should allow a user to withdraw an NFT if they have not fractioned an NFT of an NFT they own", async() => {
    await Storage.connect(addr1).depositNft(nftContract.address, iterator);
    await Storage.connect(addr1).withdrawNft(nftContract.address, iterator);

    let nftOwner = await nftContract.ownerOf(iterator);
    expect(nftOwner).to.equal(addr1.address); 

    let storageNftOwner = await String(await Storage.getNftOwner(nftContract.address, iterator));
    expect(storageNftOwner).to.equal("0x0000000000000000000000000000000000000000");
  })

  it("should allow a user to withdraw after they complete an NFT auction withdraw", async() => {
    await Storage.connect(addr1).depositNft(nftContract.address, iterator);
    await Storage.connect(addr1).createFraction(nftContract.address,
                                                iterator,
                                                "tokenName",
                                                "TK",
                                                1000,
                                                0);

    let fractionAddress = await Storage.getFractionAddressFromNft(nftContract.address, iterator);
    let fractionInstance = await FractionToken.attach(fractionAddress);

    await fractionInstance.connect(addr1).transfer(addr2.address, 100);

    await fractionInstance.connect(addr1).approve(Auction.address, 900);
    await Auction.connect(addr1).stakeTokens(fractionAddress, 900);

    await Auction.connect(addr1).startProposal(nftContract.address,
                                               iterator,
                                               2,
                                               20,
                                               100)

    await Auction.connect(addr1).voteOnProposal(nftContract.address, iterator, true, 900);
    await Auction.connect(addr1).bidOnAuction(nftContract.address, iterator, { value: 3 });
    await Storage.setAuctionAddress(Auction.address);

    network.provider.send("evm_increaseTime", [3600]);
    network.provider.send("evm_mine");

    await Auction.applyEndOfAuction(nftContract.address, iterator);
    await Storage.connect(addr1).withdrawNft(nftContract.address, iterator);
    
    let ownerOfNft = await nftContract.ownerOf(iterator);
    expect(ownerOfNft).to.equal(addr1.address)
  })

  it("SHOULDNT allow a user to withdraw an NFT they do not own", async() => {
    await Storage.connect(addr1).depositNft(nftContract.address, iterator);
    
    await expectRevert(
      Storage.connect(addr2).withdrawNft(nftContract.address, iterator),
      "VM Exception while processing transaction"
    )
  })
  
  it("SHOULDNT allow a user to withdraw an NFT if they have fraction and do not own all ERC20 tokens or have not completed auction withdraw", async() => {
    await Storage.connect(addr1).depositNft(nftContract.address, iterator);
    await Storage.connect(addr1).createFraction(nftContract.address,
                                                iterator,
                                                "tokenName",
                                                "TK",
                                                1000,
                                                0);

    let fractionAddress = await Storage.getFractionAddressFromNft(nftContract.address, iterator);
    let fractionInstance = await FractionToken.attach(fractionAddress);

    await fractionInstance.connect(addr1).transfer(addr2.address, 100);

    let balanceOfAddr1 = await fractionInstance.balanceOf(addr1.address);
    expect(balanceOfAddr1).to.equal(900);

    await expectRevert( 
      Storage.connect(addr1).withdrawNft(nftContract.address, iterator),
      "VM Exception while processing transaction"
    )
  })
});
