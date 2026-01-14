import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Mint from './pages/Mint';
import MyNFTs from './pages/MyNFTs';
import NFTDetail from './pages/NFTDetail';
import { useWeb3 } from './hooks/useWeb3';

function App() {
  const web3 = useWeb3();

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar web3={web3} />
        <Routes>
          <Route path="/" element={<Home web3={web3} />} />
          <Route path="/mint" element={<Mint web3={web3} />} />
          <Route path="/my-nfts" element={<MyNFTs web3={web3} />} />
          <Route path="/nft/:tokenId" element={<NFTDetail web3={web3} />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;