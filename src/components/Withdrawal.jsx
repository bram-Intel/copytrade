import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import './Withdrawal.css'
import { createWithdrawal, getUser, getUserPortfolio } from '../services/firebaseService'

const Withdrawal = () => {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [selectedCrypto, setSelectedCrypto] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [network, setNetwork] = useState('ERC20')
  const [withdrawalAddress, setWithdrawalAddress] = useState('')
  const [user, setUser] = useState(null)
  const [portfolio, setPortfolio] = useState([])

  useEffect(() => {
    if (isConnected && address) {
      loadUserData()
    }
  }, [isConnected, address])

  const loadUserData = async () => {
    try {
      const [userData, portfolioData] = await Promise.all([
        getUser(address),
        getUserPortfolio(address)
      ])
      setUser(userData)
      setPortfolio(portfolioData)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const cryptoOptions = [
    { symbol: 'USDT', name: 'Tether', networks: ['ERC20', 'TRC20', 'BEP20'], fee: 5 },
    { symbol: 'BTC', name: 'Bitcoin', networks: ['Bitcoin'], fee: 0.0005 },
    { symbol: 'ETH', name: 'Ethereum', networks: ['ERC20'], fee: 0.01 },
    { symbol: 'BNB', name: 'Binance Coin', networks: ['BEP20'], fee: 0.001 },
    { symbol: 'USDC', name: 'USD Coin', networks: ['ERC20', 'BEP20'], fee: 5 }
  ]

  const currentCrypto = cryptoOptions.find(c => c.symbol === selectedCrypto)
  const currentAsset = portfolio.find(a => a.asset === selectedCrypto)
  const maxAmount = currentAsset?.amount || 0
  const receiveAmount = amount ? (parseFloat(amount) - currentCrypto?.fee).toFixed(8) : '0'

  const handleCryptoChange = (symbol) => {
    setSelectedCrypto(symbol)
    const crypto = cryptoOptions.find(c => c.symbol === symbol)
    setNetwork(crypto.networks[0])
  }

  const handleMaxClick = () => {
    setAmount(maxAmount.toString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!withdrawalAddress) {
      alert(t('withdrawal.invalidAddress'))
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    if (parseFloat(amount) > maxAmount) {
      alert(t('withdrawal.insufficientBalance'))
      return
    }
    
    if (parseFloat(amount) < 20) {
      alert('Minimum withdrawal is 20 ' + selectedCrypto)
      return
    }
    
    try {
      // Create withdrawal request in Firebase
      await createWithdrawal({
        user: address,
        amount: parseFloat(amount),
        payment_mode: `${selectedCrypto} (${network})`,
        paydetails: withdrawalAddress
      })
      
      alert(t('withdrawal.withdrawalSuccess', { amount, crypto: selectedCrypto }))
      setAmount('')
      setWithdrawalAddress('')
      loadUserData() // Reload data
    } catch (error) {
      console.error('Error creating withdrawal:', error)
      alert(t('withdrawal.withdrawalError'))
    }
  }

  if (!isConnected) {
    return (
      <div className="withdrawal-page">
        <div className="not-connected">
          <h2>{t('common.connectWalletPrompt')}</h2>
          <p>{t('common.connectWalletMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="withdrawal-page">
      <div className="page-header">
        <h1>{t('withdrawal.title')}</h1>
        <p>{t('withdrawal.pageSubtitle')}</p>
      </div>

      <div className="withdrawal-container">
        <div className="withdrawal-card">
          <div className="balance-overview">
            <h3>{t('withdrawal.availableBalance')}</h3>
            <div className="balance-grid">
              {portfolio.map(asset => (
                <div key={asset.asset} className="balance-item">
                  <span className="asset-symbol">{asset.asset}</span>
                  <span className="asset-amount">{asset.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>{t('withdrawal.selectCrypto')}</h3>
              <div className="crypto-grid">
                {cryptoOptions.map(crypto => {
                  const asset = portfolio.find(a => a.asset === crypto.symbol)
                  const isAvailable = asset && asset.amount > 0
                  
                  return (
                    <button
                      key={crypto.symbol}
                      type="button"
                      className={`crypto-option ${selectedCrypto === crypto.symbol ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      onClick={() => isAvailable && handleCryptoChange(crypto.symbol)}
                      disabled={!isAvailable}
                    >
                      <span className="crypto-symbol">{crypto.symbol}</span>
                      <span className="crypto-name">{crypto.name}</span>
                      {isAvailable && (
                        <span className="available-amount">{asset.amount.toLocaleString(undefined, {maximumFractionDigits: 4})}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="form-section">
              <h3>{t('withdrawal.selectNetwork')}</h3>
              <div className="network-grid">
                {currentCrypto?.networks.map(net => (
                  <button
                    key={net}
                    type="button"
                    className={`network-option ${network === net ? 'active' : ''}`}
                    onClick={() => setNetwork(net)}
                  >
                    {net}
                  </button>
                ))}
              </div>
              <div className="network-fee">
                {t('withdrawal.networkFee')}: {currentCrypto?.fee} {selectedCrypto}
              </div>
            </div>

            <div className="form-section">
              <h3>{t('withdrawal.withdrawalAddress')}</h3>
              <input
                type="text"
                className="address-input"
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                placeholder={t('withdrawal.enterAddress', { crypto: selectedCrypto })}
                required
              />
            </div>

            <div className="form-section">
              <h3>{t('withdrawal.enterAmount')}</h3>
              <div className="amount-input-group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('withdrawal.enterAmountPlaceholder')}
                  step="0.01"
                  min="0"
                  max={maxAmount}
                  required
                />
                <span className="currency-label">{selectedCrypto}</span>
              </div>
              <div className="amount-actions">
                <button 
                  type="button" 
                  className="max-btn"
                  onClick={handleMaxClick}
                >
                  {t('withdrawal.max')}
                </button>
                <span className="available-text">
                  {t('withdrawal.available')}: {maxAmount.toLocaleString(undefined, {maximumFractionDigits: 8})} {selectedCrypto}
                </span>
              </div>
            </div>

            <div className="withdrawal-summary">
              <div className="summary-row">
                <span>{t('withdrawal.amount')}:</span>
                <strong>{amount || '0'} {selectedCrypto}</strong>
              </div>
              <div className="summary-row">
                <span>{t('withdrawal.networkFee')}:</span>
                <strong>-{currentCrypto?.fee} {selectedCrypto}</strong>
              </div>
              <div className="summary-row total">
                <span>{t('withdrawal.youWillReceive')}:</span>
                <strong className="receive-amount">
                  {receiveAmount} {selectedCrypto}
                </strong>
              </div>
            </div>

            <div className="warning-box">
              <strong>⚠️ {t('withdrawal.important')}:</strong> {t('withdrawal.warning')}
            </div>

            <button type="submit" className="withdraw-btn">
              {t('withdrawal.confirmWithdrawal')}
            </button>
          </form>
        </div>

        <div className="withdrawal-info">
          <h3>{t('withdrawal.withdrawalInformation')}</h3>
          
          <div className="info-section">
            <h4>{t('withdrawal.processingTime')}</h4>
            <p>{t('withdrawal.processingTimeDescription')}</p>
          </div>

          <div className="info-section">
            <h4>{t('withdrawal.minimumWithdrawal')}</h4>
            <ul>
              <li>{t('withdrawal.minUSDT')}</li>
              <li>{t('withdrawal.minBTC')}</li>
              <li>{t('withdrawal.minETH')}</li>
              <li>{t('withdrawal.minBNB')}</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>{t('withdrawal.importantNotes')}</h4>
            <ul>
              <li>{t('withdrawal.note1')}</li>
              <li>{t('withdrawal.note2')}</li>
              <li>{t('withdrawal.note3')}</li>
              <li>{t('withdrawal.note4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Withdrawal
