import { useState } from 'react';
import { Contract } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContracts, NFT_ABI } from '@/hooks/useContracts';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Mint({ web3 }) {
  const { account, signer, isOnSepolia } = web3;
  const { nftContractAddress, loading: contractsLoading } = useContracts();
  const [minting, setMinting] = useState(false);
  const navigate = useNavigate();

  const handleMint = async () => {
    if (!account) return toast.error('Please connect your wallet');
    if (!isOnSepolia) return toast.error('Please switch to Sepolia network');

    try {
      setMinting(true);
      const nftContract = new Contract(nftContractAddress, NFT_ABI, signer);
      const mintPrice = await nftContract.mintPrice();
      const tx = await nftContract.mint({ value: mintPrice });
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();

      let tokenId;
      try {
        const transferEvent = receipt.logs.find(
          (log) => log.topics[0] === nftContract.interface.getEvent('Transfer').topicHash
        );
        if (transferEvent) tokenId = parseInt(transferEvent.topics[3], 16);
      } catch (e) {
        console.error('Error parsing tokenId:', e);
      }

      toast.success('NFT minted successfully!');
      navigate(tokenId ? `/nft/${tokenId}` : '/my-nfts');
    } catch (error) {
      console.error('Minting error:', error);
      toast.error(error.message || 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  if (contractsLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}>
        <Loader2 style={{ width: 48, height: 48, color: '#0ff', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const pageStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #0ff, #00f)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    marginBottom: '0.5rem'
  };

  const gridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    width: '100%'
  };

  const cardStyle = {
    background: 'rgba(26,26,46,0.7)',
    border: '1px solid #444',
    borderRadius: '12px',
    padding: '1rem',
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '300px'
  };

  const svgContainer = {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '350px'
  };

  const buttonStyle = {
    width: '100%',
    height: '3rem',
    fontSize: '1rem',
    background: 'linear-gradient(to right, #0ff, #00f)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const disabledButton = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: 'not-allowed'
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Mint Dynamic SVG NFT</h1>
        <p style={{ color: '#ccc', fontSize: '1rem' }}>
          Create your unique on-chain NFT that evolves over time
        </p>
      </div>

      {/* Grid */}
      <div style={gridStyle}>
        {/* NFT Preview */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>NFT Preview</h2>
          <div style={svgContainer}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" style={{ width: '100%', height: 'auto' }}>
              <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#16213e" />
                </linearGradient>
              </defs>
              <rect width="400" height="400" fill="url(#bg)" />
              <g transform="translate(200,200)">
                <circle cx="0" cy="0" r="60" fill="#4ECDC4" opacity="0.8" />
                <polygon points="0,-80 30,0 -30,0" fill="#4ECDC4" opacity="0.6" />
              </g>
              <text x="200" y="350" fontFamily="Arial" fontSize="24" fill="white" textAnchor="middle">
                Level 1
              </text>
              <text x="200" y="375" fontFamily="Arial" fontSize="14" fill="#888" textAnchor="middle">
                Token #?
              </text>
            </svg>
          </div>
          <p style={{ color: '#ccc', textAlign: 'center', fontSize: '0.875rem' }}>
            Your NFT will have unique colors and attributes generated at mint time
          </p>
        </div>

        {/* Mint Details */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Mint Details</h2>

          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #444' }}>
              <span style={{ color: '#aaa' }}>Price</span>
              <span style={{ color: '#0ff', fontWeight: 'bold' }}>0.001 ETH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #444' }}>
              <span style={{ color: '#aaa' }}>Network</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>Sepolia Testnet</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #444' }}>
              <span style={{ color: '#aaa' }}>Storage</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>100% On-Chain</span>
            </div>
          </div>

          <div style={{ background: 'rgba(30,30,50,0.6)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ width: 16, height: 16, color: '#0ff' }} />
              Dynamic Features
            </h4>
            <ul style={{ color: '#ccc', marginLeft: '1.25rem', marginTop: '0.25rem', listStyleType: 'disc', fontSize: '0.875rem' }}>
              <li>Unique color generated at mint</li>
              <li>Level system (can be upgraded)</li>
              <li>Rotation based on days since mint</li>
              <li>Size increases with level</li>
            </ul>
          </div>

          <button
            onClick={handleMint}
            disabled={minting || !account || !isOnSepolia}
            style={minting || !account || !isOnSepolia ? disabledButton : buttonStyle}
          >
            {minting ? 'Minting...' : 'Mint NFT'}
          </button>

          {!account && <p style={{ color: '#ccc', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>Connect your wallet to mint</p>}
          {account && !isOnSepolia && <p style={{ color: '#ff0', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>Please switch to Sepolia network</p>}
        </div>
      </div>
    </div>
  );
}
