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
import PermitManager from './components/PermitManager'
import './App.css'

// WalletConnect Project ID - Get a new one from https://cloud.walletconnect.com
const projectId = '8978f301642afe033dcdcd7b9b9fcec1'

if (!projectId) {
  throw new Error('WalletConnect Project ID is required')
}

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
})

// Create Web3Modal with simplified, working configuration
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  themeMode: 'dark',
  // Essential settings only
  enableAnalytics: false,
  enableOnramp: false,
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
              <Route path="/permits" element={<PermitManager />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </WagmiConfig>
  )
}

export default App