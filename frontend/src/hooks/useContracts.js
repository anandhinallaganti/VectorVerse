import { useState, useEffect } from "react";

// NFT ABI
export const NFT_ABI = [
  "function mint() public payable returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function approve(address to, uint256 tokenId) public",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function getTotalSupply() public view returns (uint256)",
  "function mintPrice() public view returns (uint256)",
  "function levelUp(uint256 tokenId) public",
  "function tokenAttributes(uint256 tokenId) public view returns (uint256 mintTime, uint256 level, string memory color)",
];

// Marketplace ABI
export const MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) external returns (uint256)",
  "function buyNFT(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function updateListingPrice(uint256 listingId, uint256 newPrice) external",
  "function getListing(uint256 listingId) external view returns (tuple(address seller, address nftContract, uint256 tokenId, uint256 price, bool active))",
  "function getActiveListingsCount() external view returns (uint256)",
  "function listings(uint256 listingId) external view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool active)",
  "function platformFee() external view returns (uint256)",
];

export const useContracts = () => {
  const [nftContractAddress, setNftContractAddress] = useState(null);
  const [marketplaceContractAddress, setMarketplaceContractAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractAddresses = async () => {
      try {
        const res = await fetch("/deployments/sepolia-deployments.json"); // <- JSON in public folder
        const data = await res.json();
        setNftContractAddress(data.nftContract);
        setMarketplaceContractAddress(data.marketplaceContract);
      } catch (err) {
        console.error("Failed to load contract addresses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractAddresses();
  }, []);

  return {
    nftContractAddress,
    marketplaceContractAddress,
    loading,
  };
};
