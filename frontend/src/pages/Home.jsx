import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Contract, formatEther } from 'ethers';
import { useContracts, NFT_ABI, MARKETPLACE_ABI } from '../hooks/useContracts';

export default function Home({ web3 }) {
  const { account, signer, isOnSepolia } = web3;
  const { nftContractAddress, marketplaceContractAddress, loading: contractsLoading } = useContracts();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState({});

  useEffect(() => {
    if (nftContractAddress && marketplaceContractAddress && signer) {
      fetchListings();
    } else if (!contractsLoading) {
      setLoading(false);
    }
  }, [nftContractAddress, marketplaceContractAddress, signer, contractsLoading]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const marketplaceContract = new Contract(marketplaceContractAddress, MARKETPLACE_ABI, signer);
      const activeCount = await marketplaceContract.getActiveListingsCount();

      const fetchedListings = [];
      for (let i = 1; i <= Number(activeCount); i++) {
        try {
          const listing = await marketplaceContract.listings(i);
          if (listing.active) {
            const nftContract = new Contract(listing.nftContract, NFT_ABI, signer);
            const tokenURI = await nftContract.tokenURI(listing.tokenId);
            const json = Buffer.from(tokenURI.split(',')[1], 'base64').toString();
            const metadata = JSON.parse(json);

            fetchedListings.push({
              listingId: i,
              ...listing,
              metadata,
            });
          }
        } catch (err) {
          console.error(`Error fetching listing ${i}:`, err);
        }
      }
      setListings(fetchedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      alert('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async (listingId, price) => {
    if (!account) return alert('Please connect your wallet');
    if (!isOnSepolia) return alert('Please switch to Sepolia network');

    try {
      setBuying((prev) => ({ ...prev, [listingId]: true }));
      const marketplaceContract = new Contract(marketplaceContractAddress, MARKETPLACE_ABI, signer);
      const tx = await marketplaceContract.buyNFT(listingId, { value: price });
      alert('Transaction submitted...');
      await tx.wait();
      alert('NFT purchased!');
      fetchListings();
    } catch (err) {
      console.error('Error buying NFT:', err);
      alert('Failed to purchase NFT');
    } finally {
      setBuying((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  if (contractsLoading || loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#aaa' }}>
        <p>Loading marketplace...</p>
      </div>
    );
  }

  if (!nftContractAddress || !marketplaceContractAddress) {
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem', textAlign: 'center', color: '#ccc' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>Contracts Not Deployed</h2>
        <p style={{ marginBottom: '1rem' }}>The marketplace contracts need to be deployed to Sepolia network first.</p>
        <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
          <p>cd /app/contracts</p>
          <p># Add Sepolia RPC URL and Private Key to .env</p>
          <p>yarn deploy:sepolia</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '2rem', color: '#fff', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Dynamic SVG NFT Marketplace</h1>
        <p style={{ color: '#aaa' }}>Discover and collect unique on-chain generated SVG NFTs that evolve over time</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
        <div style={{ background: '#1b1f2a', padding: '1rem', borderRadius: '8px', textAlign: 'center', flex: 1, margin: '0 0.5rem' }}>
          <p style={{ fontSize: '1.5rem', color: '#0ff' }}>{listings.length}</p>
          <p style={{ color: '#aaa' }}>Active Listings</p>
        </div>
        <div style={{ background: '#1b1f2a', padding: '1rem', borderRadius: '8px', textAlign: 'center', flex: 1, margin: '0 0.5rem' }}>
          <p style={{ fontSize: '1.5rem', color: '#0af' }}>100%</p>
          <p style={{ color: '#aaa' }}>On-Chain SVG</p>
        </div>
        <div style={{ background: '#1b1f2a', padding: '1rem', borderRadius: '8px', textAlign: 'center', flex: 1, margin: '0 0.5rem' }}>
          <p style={{ fontSize: '1.5rem', color: '#a0f'}}>Dynamic</p>
          <p style={{ color: '#aaa' }}>Evolving Traits</p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div style={{ background: '#1b1f2a', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', marginBottom: '1rem' }}>No NFTs listed yet</p>
          <Link to="/mint">
            <button style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: '#0af', color: '#fff' }}>Mint Your First NFT</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {listings.map((listing) => (
            <div key={listing.listingId} style={{ background: '#1b1f2a', borderRadius: '8px', overflow: 'hidden', padding: '1rem' }}>
              <Link to={`/nft/${listing.tokenId}`}>
                <img src={listing.metadata.image} alt={listing.metadata.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
              </Link>
              <h3 style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{listing.metadata.name}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {listing.metadata.attributes.slice(0, 2).map((attr, idx) => (
                  <span key={idx} style={{ fontSize: '0.75rem', background: '#333', padding: '2px 6px', borderRadius: '4px' }}>
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
              <p>Price: {formatEther(listing.price)} ETH</p>
              {account && account.toLowerCase() === listing.seller.toLowerCase() ? (
                <button disabled style={{ padding: '0.5rem', borderRadius: '4px', background: '#555', color: '#aaa', width: '100%' }}>Your Listing</button>
              ) : (
                <button
                  onClick={() => handleBuyNFT(listing.listingId, listing.price)}
                  disabled={buying[listing.listingId] || !account}
                  style={{ padding: '0.5rem', borderRadius: '4px', background: '#0af', color: '#fff', width: '100%' }}
                >
                  {buying[listing.listingId] ? 'Buying...' : 'Buy Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
