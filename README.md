# Dynamic SVG NFT Marketplace 🖼️⛓️

A decentralized NFT marketplace that enables the creation, visualization, and trading of **fully on-chain dynamic SVG NFTs**. Unlike traditional NFT platforms that rely on static metadata and off-chain storage, this project leverages blockchain smart contracts to render NFTs dynamically using SVGs stored entirely on-chain.

---

## 🚀 Features

- Fully decentralized NFT marketplace  
- On-chain dynamic SVG generation  
- Real-time NFT visual updates based on smart contract logic  
- Secure minting, listing, and trading of NFTs  
- Wallet integration (MetaMask compatible)  
- Transparent and immutable NFT metadata  
- EVM-compatible smart contract architecture  

---

## 🧩 Project Architecture

The system consists of the following major components:

- **Smart Contracts** – Handle NFT minting, ownership, metadata, and marketplace transactions  
- **Dynamic SVG Engine** – Generates SVG images on-chain  
- **Frontend Interface** – User-friendly web interface for interacting with NFTs  
- **Blockchain Network** – Ethereum or EVM-compatible blockchain  

---

## 🛠️ Tech Stack

### Blockchain
- Ethereum (EVM compatible)
- Solidity
- OpenZeppelin

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript
- Ethers.js

### Tools
- Hardhat 
- MetaMask
- VS Code
- Git & GitHub

---

## ⚙️ Installation & Setup

### Prerequisites
Ensure the following are installed on your system:

- Node.js (v16 or later)
- npm or yarn
- Git
- MetaMask browser extension
- Ethereum testnet access (e.g., Sepolia)

---

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/VectorVerse.git
2. Navigate to the project directory:
   ```bash
   cd dynamic-svg
3. Install Project dependencies:
   ```bash
   npm install
4. Run the Hardhat Node
   ```bash
   npx hardhat node --hostname 127.0.0.1
5. Open a new terminal and Deploy the contracts
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
6. Save the deployed contract address and ABI for frontend integration.

---

### Frontend Setup

1. Navigate to frontend directory
   ```bash
   cd frontend
2. Install frontend dependencies:
   ```bash
   npm install
3. Start the development server:
   ```bash
   npm run dev
4. Open your browser and visit:
   ```bash
   http://localhost:5173/

---

## 📌 Usage


1. Connect your wallet using MetaMask.

2. Mint a new Dynamic SVG NFT by providing the required parameters.

3. View the minted NFT rendered directly from on-chain SVG data.

4. List the NFT on the marketplace for sale.

5. Purchase NFTs securely through smart contract transactions.

6. View owned NFTs under the "My NFTs" section.

---

## 🔐 Security Considerations

- All NFT metadata and SVG images are stored entirely on-chain.
- Smart contracts ensure transparent and trustless transactions.
- Users must manually approve transactions via their wallet.
- No centralized storage or servers are used for NFT data.

---

## 🧪 Testing

Run smart contract tests using the following command:

```bash
npx hardhat test



