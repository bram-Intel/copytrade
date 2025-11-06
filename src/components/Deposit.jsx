import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import './Deposit.css'
import { createDeposit } from '../services/firebaseService'

const Deposit = () => {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [selectedCrypto, setSelectedCrypto] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [network, setNetwork] = useState('ERC20')

  const cryptoOptions = [
    { symbol: 'USDT', name: 'Tether', networks: ['ERC20', 'TRC20', 'BEP20'] },
    { symbol: 'BTC', name: 'Bitcoin', networks: ['Bitcoin'] },
    { symbol: 'ETH', name: 'Ethereum', networks: ['ERC20'] },
    { symbol: 'BNB', name: 'Binance Coin', networks: ['BEP20'] },
    { symbol: 'USDC', name: 'USD Coin', networks: ['ERC20', 'BEP20'] }
  ]

  const depositAddresses = {
    'USDT-ERC20': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    'USDT-TRC20': 'TXYZabcdefghijklmnopqrstuvwxyz123456',
    'USDT-BEP20': '0x8a3b9c7d6e5f4a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    'BTC-Bitcoin': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'ETH-ERC20': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    'BNB-BEP20': '0x8a3b9c7d6e5f4a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    'USDC-ERC20': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    'USDC-BEP20': '0x8a3b9c7d6e5f4a2b1c0d9e8f7a6b5c4d3e2f1a0b'
  }

  const currentCrypto = cryptoOptions.find(c => c.symbol === selectedCrypto)
  const depositAddress = depositAddresses[`${selectedCrypto}-${network}`]

  const handleCryptoChange = (symbol) => {
    setSelectedCrypto(symbol)
    const crypto = cryptoOptions.find(c => c.symbol === symbol)
    setNetwork(crypto.networks[0])
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depositAddress)
    alert(t('deposit.addressCopied'))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) < 10) {
      alert(t('deposit.minDeposit') + ' ' + selectedCrypto)
      return
    }
    
    try {
      // Create deposit record in Firebase
      await createDeposit({
        user: address,
        amount: parseFloat(amount),
        payment_mode: `${selectedCrypto} (${network})`,
        plan: null
      })
      
      alert(t('deposit.depositSuccess', { amount, crypto: selectedCrypto }))
      setAmount('')
    } catch (error) {
      console.error('Error creating deposit:', error)
      alert(t('deposit.depositError'))
    }
  }

  if (!isConnected) {
    return (
      <div className="deposit-page">
        <div className="not-connected">
          <h2>{t('common.connectWalletPrompt')}</h2>
          <p>{t('common.connectWalletMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="deposit-page">
      <div className="page-header">
        <h1>{t('deposit.title')}</h1>
        <p>Add funds to your account to start investing</p>
      </div>

      <div className="deposit-container">
        <div className="deposit-card">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>{t('deposit.selectCrypto')}</h3>
              <div className="crypto-grid">
                {cryptoOptions.map(crypto => (
                  <button
                    key={crypto.symbol}
                    type="button"
                    className={`crypto-option ${selectedCrypto === crypto.symbol ? 'active' : ''}`}
                    onClick={() => handleCryptoChange(crypto.symbol)}
                  >
                    <span className="crypto-symbol">{crypto.symbol}</span>
                    <span className="crypto-name">{crypto.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>{t('deposit.selectNetwork')}</h3>
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
            </div>

            <div className="form-section">
              <h3>{t('deposit.enterAmount')}</h3>
              <div className="amount-input-group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
                <span className="currency-label">{selectedCrypto}</span>
              </div>
            </div>

            <div className="deposit-address-section">
              <h3>{t('deposit.depositAddress')}</h3>
              <div className="address-display">
                <div className="address-text">{depositAddress}</div>
                <button type="button" className="copy-btn" onClick={copyToClipboard}>
                  📋 {t('deposit.copyAddress')}
                </button>
              </div>
              <div className="warning-box">
                <strong>⚠️ {t('deposit.important')}:</strong> {t('deposit.warning', { crypto: selectedCrypto, network })}
              </div>
            </div>

            <div className="deposit-info">
              <div className="info-row">
                <span>Minimum Deposit:</span>
                <strong>10 {selectedCrypto}</strong>
              </div>
              <div className="info-row">
                <span>Confirmations Required:</span>
                <strong>{selectedCrypto === 'BTC' ? '3' : '12'} blocks</strong>
              </div>
              <div className="info-row">
                <span>Estimated Arrival:</span>
                <strong>{selectedCrypto === 'BTC' ? '30-60 min' : '5-15 min'}</strong>
              </div>
            </div>

            <button type="submit" className="confirm-btn">
              {t('deposit.confirmDeposit')}
            </button>
          </form>
        </div>

        <div className="deposit-help">
          <h3>How to Deposit</h3>
          <ol>
            <li>Select the cryptocurrency you want to deposit</li>
            <li>Choose the correct network</li>
            <li>Copy the deposit address</li>
            <li>Send funds from your external wallet</li>
            <li>Wait for confirmations</li>
            <li>Funds will be credited automatically</li>
          </ol>

          <div className="help-note">
            <h4>Need Help?</h4>
            <p>If you have any questions or issues with your deposit, please contact our 24/7 support team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Deposit
