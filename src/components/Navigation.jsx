import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import './Navigation.css'

const Navigation = () => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">🚀 CryptoInvest</Link>
        </div>

        {isConnected && (
          <div className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/copy-trading" 
              className={`nav-link ${isActive('/copy-trading') ? 'active' : ''}`}
            >
              Copy Trading
            </Link>
            <Link 
              to="/investments" 
              className={`nav-link ${isActive('/investments') ? 'active' : ''}`}
            >
              Plans
            </Link>
            <Link 
              to="/transactions" 
              className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
            >
              Transactions
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              Profile
            </Link>
          </div>
        )}

        <div className="nav-actions">
          {isConnected ? (
            <>
              <div className="wallet-display">
                {address?.substring(0, 6)}...{address?.substring(38)}
              </div>
              <button onClick={() => disconnect()} className="disconnect-btn">
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={() => open()} className="connect-nav-btn">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
