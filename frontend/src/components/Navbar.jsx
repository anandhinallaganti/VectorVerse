import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { formatAddress } from '../hooks/useWeb3';

export default function Navbar({ web3 }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { account, connectWallet, disconnectWallet, isConnecting, isOnSepolia, switchToSepolia } = web3;

  const navLinks = [
    { path: '/', label: 'Marketplace' },
    { path: '/mint', label: 'Mint NFT' },
    { path: '/my-nfts', label: 'My NFTs' },
  ];

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid #555',
    background: '#0af',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    margin: '0.25rem 0',
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    color: '#0af',
    border: '1px solid #0af',
  };

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #444', background: '#111', padding: '0.5rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(45deg, #0ff, #00f)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold' }}>
            NFT
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', background: 'linear-gradient(to right, #0ff, #00f)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Dynamic NFT
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === link.path ? '#0ff' : '#ccc',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Wallet buttons */}
          {account && !isOnSepolia && <button onClick={switchToSepolia} style={outlineButtonStyle}>Switch to Sepolia</button>}
          {account ? (
            <button onClick={disconnectWallet} style={outlineButtonStyle}>{formatAddress(account)}</button>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting} style={buttonStyle}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#ccc', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                textDecoration: 'none',
                color: location.pathname === link.path ? '#0ff' : '#ccc',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              {link.label}
            </Link>
          ))}
          {account && !isOnSepolia && <button onClick={switchToSepolia} style={outlineButtonStyle}>Switch to Sepolia</button>}
          {account ? (
            <button onClick={disconnectWallet} style={outlineButtonStyle}>{formatAddress(account)}</button>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting} style={buttonStyle}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
