import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy DynamicSVGNFT
  const DynamicSVGNFTFactory = await ethers.getContractFactory("DynamicSVGNFT");
  const dynamicSVG = await DynamicSVGNFTFactory.deploy();
  await dynamicSVG.deployed();
  console.log("✅ DynamicSVGNFT deployed at:", dynamicSVG.address);

  // Deploy NFTMarketplace
  const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplaceFactory.deploy();
  await marketplace.deployed();
  console.log("✅ NFTMarketplace deployed at:", marketplace.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
