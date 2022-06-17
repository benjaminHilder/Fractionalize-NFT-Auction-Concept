// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  //const Greeter = await hre.ethers.getContractFactory("Greeter");
  // greeter = await Greeter.deploy("Hello, Hardhat!");

  //await greeter.deployed();

  const Storage = await hre.ethers.getContractFactory("Storage");
  const storage = await Storage.deploy();
  await storage.deployed();

  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(storage.address);
  await auction.deployed();

  const NftGenerator = await hre.ethers.getContractFactory("NFTGenerator");
  const nftGenerator = await NftGenerator.deploy();
  await nftGenerator.deployed();

  //console.log("Greeter deployed to:", greeter.address);
  console.log("Storage address: " + storage.address);
  console.log("Auction address: " + auction.address);
  console.log("NFTGenerator address: " + nftGenerator.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
