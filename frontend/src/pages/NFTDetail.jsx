import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Contract, parseEther, formatEther } from 'ethers';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useContracts, NFT_ABI, MARKETPLACE_ABI } from '../hooks/useContracts';
import { Loader2, ExternalLink, ArrowLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function NFTDetail({ web3 }) {
  const { tokenId } = useParams();
  const { account, signer, isOnSepolia } = web3;
  const { nftContractAddress, marketplaceContractAddress, loading: contractsLoading } =
    useContracts();
  const navigate = useNavigate();

  const [nftData, setNftData] = useState(null);
  const [owner, setOwner] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listPrice, setListPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  useEffect(() => {
    if (tokenId && nftContractAddress && signer) {
      fetchNFTData();
    }
  }, [tokenId, nftContractAddress, signer]);

  const fetchNFTData = async () => {
    try {
      setLoading(true);
      const nftContract = new Contract(nftContractAddress, NFT_ABI, signer);

      const tokenURI = await nftContract.tokenURI(tokenId);
      const ownerAddress = await nftContract.ownerOf(tokenId);
      const json = Buffer.from(tokenURI.split(',')[1], 'base64').toString();
      const metadata = JSON.parse(json);

      setNftData(metadata);
      setOwner(ownerAddress);

      // Check if listed
      if (marketplaceContractAddress) {
        const marketplaceContract = new Contract(
          marketplaceContractAddress,
          MARKETPLACE_ABI,
          signer
        );
        const activeCount = await marketplaceContract.getActiveListingsCount();

        for (let i = 1; i <= Number(activeCount); i++) {
          const listingData = await marketplaceContract.listings(i);
          if (
            listingData.active &&
            Number(listingData.tokenId) === Number(tokenId) &&
            listingData.nftContract.toLowerCase() === nftContractAddress.toLowerCase()
          ) {
            setListing({ listingId: i, ...listingData });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      toast.error('Failed to load NFT details');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelUp = async () => {
    if (!account || !isOnSepolia) return;

    try {
      setIsLevelingUp(true);
      const nftContract = new Contract(nftContractAddress, NFT_ABI, signer);
      const tx = await nftContract.levelUp(tokenId);

      toast.info('Leveling up...');
      await tx.wait();

      toast.success('NFT leveled up!');
      fetchNFTData();
    } catch (error) {
      console.error('Error leveling up:', error);
      toast.error('Failed to level up NFT');
    } finally {
      setIsLevelingUp(false);
    }
  };

  const handleListNFT = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsListing(true);
      const nftContract = new Contract(nftContractAddress, NFT_ABI, signer);
      const marketplaceContract = new Contract(
        marketplaceContractAddress,
        MARKETPLACE_ABI,
        signer
      );

      // Check approval
      const isApproved = await nftContract.isApprovedForAll(account, marketplaceContractAddress);
      if (!isApproved) {
        const approveTx = await nftContract.setApprovalForAll(marketplaceContractAddress, true);
        toast.info('Approving marketplace...');
        await approveTx.wait();
      }

      // List NFT
      const price = parseEther(listPrice);
      const tx = await marketplaceContract.listNFT(nftContractAddress, tokenId, price);

      toast.info('Listing NFT...');
      await tx.wait();

      toast.success('NFT listed successfully!');
      setListPrice('');
      fetchNFTData();
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT');
    } finally {
      setIsListing(false);
    }
  };

  const handleCancelListing = async () => {
    try {
      setIsCancelling(true);
      const marketplaceContract = new Contract(
        marketplaceContractAddress,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await marketplaceContract.cancelListing(listing.listingId);
      toast.info('Cancelling listing...');
      await tx.wait();

      toast.success('Listing cancelled');
      fetchNFTData();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast.error('Failed to cancel listing');
    } finally {
      setIsCancelling(false);
    }
  };

  if (contractsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="glass border-slate-700">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-200">NFT Not Found</h2>
            <Link to="/">
              <Button variant="outline">Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = account && owner && account.toLowerCase() === owner.toLowerCase();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="nft-detail-page">
      <Link
        to="/"
        className="inline-flex items-center text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div className="fade-in">
          <Card className="glass border-slate-700 overflow-hidden">
            <div className="nft-image">
              <img src={nftData.image} alt={nftData.name} className="w-full" />
            </div>
          </Card>

          {/* Attributes */}
          <Card className="glass border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-slate-200">Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {nftData.attributes.map((attr, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">{attr.trait_type}</p>
                    <p className="font-medium text-slate-200">{attr.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NFT Details */}
        <div className="fade-in space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-slate-200">{nftData.name}</h1>
            <p className="text-slate-400">{nftData.description}</p>
          </div>

          {/* Owner Info */}
          <Card className="glass border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-slate-200">
                      {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : ''}
                    </p>
                    {isOwner && <Badge variant="secondary">You</Badge>}
                  </div>
                </div>
                {owner && (
                  <a
                    href={`https://sepolia.etherscan.io/address/${owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listing Info */}
          {listing && (
            <Card className="glass border-cyan-500/30">
              <CardContent className="p-4">
                <p className="text-xs text-slate-400 mb-1">Listed Price</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {formatEther(listing.price)} ETH
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {isOwner && (
            <Card className="glass border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Level Up */}
                <Button
                  onClick={handleLevelUp}
                  disabled={isLevelingUp || !isOnSepolia}
                  variant="outline"
                  className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  data-testid="level-up-btn"
                >
                  {isLevelingUp ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Leveling Up...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Level Up NFT
                    </>
                  )}
                </Button>

                {/* List/Cancel Listing */}
                {listing ? (
                  <Button
                    onClick={handleCancelListing}
                    disabled={isCancelling}
                    variant="destructive"
                    className="w-full"
                    data-testid="cancel-listing-btn"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Listing'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-300">
                      List for Sale (ETH)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-slate-200"
                      data-testid="list-price-input"
                    />
                    <Button
                      onClick={handleListNFT}
                      disabled={isListing || !listPrice || !isOnSepolia}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      data-testid="list-nft-btn"
                    >
                      {isListing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Listing...
                        </>
                      ) : (
                        'List NFT'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contract Info */}
          <Card className="glass border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-sm">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Token ID</span>
                <span className="font-mono text-slate-200">{tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Token Standard</span>
                <span className="text-slate-200">ERC-721</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blockchain</span>
                <span className="text-slate-200">Sepolia</span>
              </div>
              <a
                href={`https://sepolia.etherscan.io/token/${nftContractAddress}?a=${tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mt-2"
              >
                View on Etherscan <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}