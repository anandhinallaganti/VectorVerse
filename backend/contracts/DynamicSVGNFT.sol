// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract DynamicSVGNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public mintPrice = 0.001 ether;

    struct NFTAttributes {
        uint256 mintTime;
        uint256 level;
        string color;
    }

    mapping(uint256 => NFTAttributes) public tokenAttributes;

    event NFTMinted(address indexed minter, uint256 indexed tokenId, uint256 mintTime);
    event NFTLeveledUp(uint256 indexed tokenId, uint256 newLevel);

    constructor() ERC721("DynamicSVGNFT", "DSVG") {}

    function mint() public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);

        string memory color = _generateColor(newTokenId);

        tokenAttributes[newTokenId] = NFTAttributes({
            mintTime: block.timestamp,
            level: 1,
            color: color
        });

        emit NFTMinted(msg.sender, newTokenId, block.timestamp);
        return newTokenId;
    }

    function levelUp(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        tokenAttributes[tokenId].level++;
        emit NFTLeveledUp(tokenId, tokenAttributes[tokenId].level);
    }

    function _generateColor(uint256 tokenId) private view returns (string memory) {
        uint256 rand = uint256(keccak256(abi.encodePacked(tokenId, block.timestamp, msg.sender))) % 6;
        if (rand == 0) return "#FF6B9D";
        if (rand == 1) return "#4ECDC4";
        if (rand == 2) return "#95E1D3";
        if (rand == 3) return "#FFD93D";
        if (rand == 4) return "#A594F9";
        return "#6BCB77";
    }

    function _generateSVG(uint256 tokenId) private view returns (string memory) {
        NFTAttributes memory attrs = tokenAttributes[tokenId];
        uint256 daysSinceMint = (block.timestamp - attrs.mintTime) / 1 days;
        uint256 size = 50 + (attrs.level * 10);
        uint256 rotation = (daysSinceMint * 15) % 360;

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#bg)"/>',
            '<g transform="translate(200, 200)">',
            '<g transform="rotate(', rotation.toString(), ')">',
            '<circle cx="0" cy="0" r="', size.toString(), '" fill="', attrs.color, '" opacity="0.8"/>',
            '<polygon points="0,-', (size + 20).toString(), ' ', (size / 2).toString(), ',0 -', (size / 2).toString(), ',0" fill="', attrs.color, '" opacity="0.6"/>',
            '</g>',
            '</g>',
            '<text x="200" y="350" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">',
            'Level ', attrs.level.toString(),
            '</text>',
            '<text x="200" y="375" font-family="Arial, sans-serif" font-size="14" fill="#888" text-anchor="middle">',
            'Token #', tokenId.toString(),
            '</text>',
            '</svg>'
        ));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        NFTAttributes memory attrs = tokenAttributes[tokenId];
        string memory svg = _generateSVG(tokenId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Dynamic SVG NFT #', tokenId.toString(), '",',
                        '"description": "An on-chain dynamic SVG NFT that evolves over time",',
                        '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
                        '"attributes": [',
                        '{"trait_type": "Level", "value": ', attrs.level.toString(), '},',
                        '{"trait_type": "Color", "value": "', attrs.color, '"},',
                        '{"trait_type": "Mint Time", "value": ', attrs.mintTime.toString(), '}',
                        ']}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }
}
