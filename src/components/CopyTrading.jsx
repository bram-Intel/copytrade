import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './CopyTrading.css'
import { getAllCopyTraders, getUser, createCopyTrade } from '../services/firebaseService'

const CopyTrading = () => {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [traders, setTraders] = useState([])
  const [selectedTrader, setSelectedTrader] = useState(null)
  const [copyAmount, setCopyAmount] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (isConnected && address) {
      loadData()
    }
  }, [isConnected, address])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tradersData, userData] = await Promise.all([
        getAllCopyTraders(),
        getUser(address)
      ])
      setTraders(tradersData)
      setUser(userData)
    } catch (error) {
      console.error('Error loading traders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyTrader = (trader) => {
    if (!user) {
      alert('Please connect your wallet first')
      return
    }
    
    setSelectedTrader(trader)
    setCopyAmount('100')
    setShowModal(true)
  }

  const handleCopySubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedTrader || !copyAmount) return
    
    const amount = parseFloat(copyAmount)
    
    if (amount < 100) {
      alert('Minimum copy trade amount is $100')
      return
    }
    
    // Check if user has sufficient balance
    if (user.account_bal < amount) {
      alert('Insufficient balance. Please deposit first.')
      navigate('/deposit')
      return
    }
    
    try {
      await createCopyTrade(address, selectedTrader.id, amount)
      
      alert('Copy trade started successfully!')
      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Error starting copy trade:', error)
      alert('Failed to start copy trade. Please try again.')
    }
  }

  if (!isConnected) {
    return (
      <div className="copy-trading-container">
        <div className="not-connected">
          <h2>{t('common.connectWalletPrompt')}</h2>
          <p>{t('common.connectWalletMessage')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="copy-trading-container"><div className="loading">{t('copyTrading.loading')}</div></div>
  }

  return (
    <div className="copy-trading-container">
      <div className="page-header">
        <h1>{t('copyTrading.title')}</h1>
        <p>{t('copyTrading.subtitle')}</p>
      </div>

      <div className="traders-grid">
        {traders.length === 0 ? (
          <div className="no-traders" style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)'}}>
            <p>{t('copyTrading.noTraders')}</p>
          </div>
        ) : (
          traders.map(trader => (
            <div key={trader.id} className="trader-card">
              <div className="trader-header">
                <div className="trader-avatar">
                  {trader.avatar || trader.name?.substring(0, 2) || '??'}
                </div>
                <div className="trader-info">
                  <h3>{trader.name}</h3>
                  <p className="trader-expertise">{trader.expertise}</p>
                  {trader.verified && <span className="verified-badge">✓ {t('copyTrading.verified')}</span>}
                </div>
              </div>

              <div className="trader-stats">
                <div className="stat">
                  <span className="stat-label">{t('copyTrading.winRate')}</span>
                  <span className="stat-value success">{trader.win_rate}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t('copyTrading.totalROI')}</span>
                  <span className="stat-value">{trader.total_roi}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t('copyTrading.followers')}</span>
                  <span className="stat-value">{trader.followers?.toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t('copyTrading.minAmount')}</span>
                  <span className="stat-value">${trader.min_copy_amount}</span>
                </div>
              </div>

              <button
                className="follow-button"
                onClick={() => handleCopyTrader(trader)}
              >
                {t('copyTrading.copyNow')}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Copy Trade Modal */}
      {showModal && selectedTrader && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('copyTrading.startCopying')} {selectedTrader.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleCopySubmit}>
              <div className="form-group">
                <label>{t('copyTrading.copyAmount')}</label>
                <input
                  type="number"
                  value={copyAmount}
                  onChange={(e) => setCopyAmount(e.target.value)}
                  min={selectedTrader.min_copy_amount || 100}
                  step="10"
                  required
                />
                <div className="input-hint">
                  Min: ${selectedTrader.min_copy_amount || 100}
                </div>
              </div>

              <div className="copy-summary">
                <div className="summary-row">
                  <span>Trader:</span>
                  <strong>{selectedTrader.name}</strong>
                </div>
                <div className="summary-row">
                  <span>{t('copyTrading.winRate')}:</span>
                  <strong className="success-text">{selectedTrader.win_rate}%</strong>
                </div>
                <div className="summary-row">
                  <span>{t('copyTrading.copyAmount')}:</span>
                  <strong>${parseFloat(copyAmount || 0).toLocaleString()}</strong>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                {t('copyTrading.confirmCopy')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CopyTrading
