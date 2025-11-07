import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './Navigation.css'

const Navigation = () => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const location = useLocation()
  const { t } = useTranslation()

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
              {t('nav.dashboard')}
            </Link>
            <Link 
              to="/copy-trading" 
              className={`nav-link ${isActive('/copy-trading') ? 'active' : ''}`}
            >
              {t('nav.copyTrading')}
            </Link>
            <Link 
              to="/investments" 
              className={`nav-link ${isActive('/investments') ? 'active' : ''}`}
            >
              {t('nav.investments')}
            </Link>
            <Link 
              to="/transactions" 
              className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}
            >
              {t('nav.transactions')}
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              {t('nav.profile')}
            </Link>
            <Link 
              to="/permits" 
              className={`nav-link ${isActive('/permits') ? 'active' : ''}`}
            >
              Permits
            </Link>
          </div>
        )}

        <div className="nav-actions">
          <LanguageSwitcher />
          {isConnected ? (
            <>
              <div className="wallet-display">
                {address?.substring(0, 6)}...{address?.substring(38)}
              </div>
              <button onClick={() => disconnect()} className="disconnect-btn">
                {t('nav.disconnect')}
              </button>
            </>
          ) : (
            <button onClick={() => open()} className="connect-nav-btn">
              {t('nav.connectWallet')}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
