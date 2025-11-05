import React from 'react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { mainnet, polygon, bsc, arbitrum } from 'wagmi/chains'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import HomePage from './components/HomePage'
import ClaimPage from './components/ClaimPage'
import Dashboard from './components/Dashboard'
import CopyTrading from './components/CopyTrading'
import Investments from './components/Investments'
import Deposit from './components/Deposit'
import Withdrawal from './components/Withdrawal'
import Transactions from './components/Transactions'
import Profile from './components/Profile'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

// WalletConnect Project ID
const projectId = '8978f301642afe033dcdcd7b9b9fcec1'

// Define chains
const chains = [mainnet, polygon, bsc, arbitrum]

// Create wagmi config
const metadata = {
  name: 'Crypto Investment Platform',
  description: 'Professional crypto investment and copy trading platform',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`]
}

// Enhanced configuration for better mobile support
const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  // WalletConnect configuration for QR code support
  walletConnectOptions: {
    projectId: projectId,
    metadata: metadata,
    relayUrl: 'wss://relay.walletconnect.com',
    // Add these for better QR code connectivity
    qrModalOptions: {
      themeMode: 'dark',
      explorerRecommendedWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      ],
    },
  }
})

// Create Web3Modal with mobile-optimized configuration
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'system-ui, -apple-system, sans-serif',
    '--w3m-accent': '#667eea',
    '--w3m-border-radius-master': '12px'
  },
  enableAnalytics: false,
  enableOnramp: false,
  // QR Code Modal Configuration
  defaultChain: mainnet,
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  ],
  // Mobile optimization
  mobileWallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      links: {
        native: 'metamask://',
        universal: 'https://metamask.app.link'
      }
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      links: {
        native: 'trust://',
        universal: 'https://link.trustwallet.com'
      }
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      links: {
        native: 'rainbow://',
        universal: 'https://rainbow.me'
      }
    }
  ],
  // Desktop wallets
  desktopWallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      links: {
        native: '',
        universal: 'https://metamask.io'
      }
    }
  ]
})

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/claim" element={<ClaimPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/copy-trading" element={<CopyTrading />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdrawal />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/portfolio" element={<Dashboard />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </WagmiConfig>
  )
}

export default App