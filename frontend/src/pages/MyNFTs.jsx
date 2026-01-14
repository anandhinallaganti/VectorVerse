import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Contract } from 'ethers';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useContracts, NFT_ABI } from '../hooks/useContracts';

export default function MyNFTs({ web3 }) {
  const { account, signer } = web3;
  const { nftContractAddress, loading: contractsLoading } = useContracts();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account || !signer || !nftContractAddress) {
      setLoading(false);
      return;
    }

    const nftContract = new Contract(nftContractAddress, NFT_ABI, signer);

    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const totalSupply = await nftContract.getTotalSupply();
        const ownedNFTs = [];

        for (let i = 1; i <= Number(totalSupply); i++) {
          try {
            const owner = await nftContract.ownerOf(i);
            if (owner.toLowerCase() === account.toLowerCase()) {
              const tokenURI = await nftContract.tokenURI(i);
              const json = Buffer.from(tokenURI.split(',')[1], 'base64').toString();
              const metadata = JSON.parse(json);
              ownedNFTs.push({ tokenId: i, metadata });
            }
          } catch {}
        }

        setNfts(ownedNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        toast.error('Failed to load your NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();

    // Listen for Transfer events to update in real-time
    const onTransfer = (from, to, tokenId) => {
      if (to.toLowerCase() === account.toLowerCase()) {
        const tokenIdNum = Number(tokenId);
        // Prevent duplicates
        if (!nfts.find(n => n.tokenId === tokenIdNum)) {
          nftContract.tokenURI(tokenIdNum)
            .then(uri => {
              const json = Buffer.from(uri.split(',')[1], 'base64').toString();
              const metadata = JSON.parse(json);
              setNfts(prev => [...prev, { tokenId: tokenIdNum, metadata }]);
            })
            .catch(console.error);
        }
      }
    };

    nftContract.on('Transfer', onTransfer);

    return () => {
      nftContract.off('Transfer', onTransfer);
    };
  }, [account, signer, nftContractAddress]);

  if (!account) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh',
      }}>
        <div style={{
          maxWidth: 500, padding: 40, backgroundColor: 'rgba(20, 24, 31, 0.9)',
          borderRadius: 16, textAlign: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.4)',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: '#e2e8f0' }}>
            Connect Your Wallet
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>
            Please connect your wallet to view your NFT collection
          </p>
        </div>
      </div>
    );
  }

  if (contractsLoading || loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh',
        flexDirection: 'column', textAlign: 'center'
      }}>
        <Loader2 className="animate-spin" style={{ width: 50, height: 50, color: '#22d3ee', marginBottom: 16 }} />
        <p style={{ color: '#94a3b8', fontSize: 18 }}>Loading your NFTs...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: 42, fontWeight: 800,
          background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 10
        }}>
          My NFT Collection
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 18 }}>
          View and manage your dynamic SVG NFTs
        </p>
      </header>

      {nfts.length === 0 ? (
        <div style={{
          backgroundColor: 'rgba(20, 24, 31, 0.9)',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: 60,
          maxWidth: 600,
          margin: '0 auto',
          boxShadow: '0 0 20px rgba(0,0,0,0.4)',
        }}>
          <p style={{ color: '#94a3b8', fontSize: 20, marginBottom: 20 }}>
            You don’t own any NFTs yet.
          </p>
          <Link to="/mint">
            <button style={{
              background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
              color: 'white',
              fontSize: 16,
              padding: '12px 30px',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              transition: '0.3s',
            }}
              onMouseOver={e => e.currentTarget.style.opacity = 0.9}
              onMouseOut={e => e.currentTarget.style.opacity = 1}>
              Mint Your First NFT
            </button>
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
          justifyItems: 'center'
        }}>
          {nfts.map((nft) => (
            <div key={nft.tokenId} style={{
              backgroundColor: 'rgba(20, 24, 31, 0.9)',
              border: '1px solid #334155',
              borderRadius: 16,
              overflow: 'hidden',
              width: 260,
              boxShadow: '0 0 15px rgba(0,0,0,0.3)',
              transition: '0.3s',
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Link to={`/nft/${nft.tokenId}`}>
                <img
                  src={nft.metadata.image}
                  alt={nft.metadata.name}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </Link>
              <div style={{ padding: 16 }}>
                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                  {nft.metadata.name}
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                  marginBottom: 12
                }}>
                  {nft.metadata.attributes.map((attr, idx) => (
                    <span key={idx} style={{
                      fontSize: 12,
                      backgroundColor: 'rgba(51,65,85,0.5)',
                      border: '1px solid #475569',
                      borderRadius: 6,
                      padding: '4px 8px',
                      color: '#cbd5e1'
                    }}>
                      {attr.trait_type}: {attr.value}
                    </span>
                  ))}
                </div>
                <Link to={`/nft/${nft.tokenId}`}>
                  <button style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #475569',
                    borderRadius: 8,
                    padding: '8px 0',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    transition: '0.3s',
                  }}
                    onMouseOver={e => {
                      e.currentTarget.style.color = '#22d3ee';
                      e.currentTarget.style.borderColor = '#22d3ee';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = '#475569';
                    }}>
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
