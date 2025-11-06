import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import './Transactions.css'
import { getTransactions } from '../services/firebaseService'

const Transactions = () => {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions()
    }
  }, [isConnected, address])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const txData = await getTransactions(address)
      setTransactions(txData)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter)

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'active': return 'info'
      default: return 'default'
    }
  }

  if (!isConnected) {
    return (
      <div className="transactions-page">
        <div className="not-connected">
          <h2>{t('common.connectWalletPrompt')}</h2>
          <p>{t('common.connectWalletMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>{t('transactions.title')}</h1>
        <p>{t('transactions.subtitle')}</p>
      </div>

      <div className="transactions-container">
        <div className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('transactions.all')}
          </button>
          <button 
            className={`filter-btn ${filter === 'deposit' ? 'active' : ''}`}
            onClick={() => setFilter('deposit')}
          >
            {t('transactions.deposits')}
          </button>
          <button 
            className={`filter-btn ${filter === 'withdrawal' ? 'active' : ''}`}
            onClick={() => setFilter('withdrawal')}
          >
            {t('transactions.withdrawals')}
          </button>
          <button 
            className={`filter-btn ${filter === 'investment' ? 'active' : ''}`}
            onClick={() => setFilter('investment')}
          >
            {t('transactions.investments')}
          </button>
          <button 
            className={`filter-btn ${filter === 'copy_trade' ? 'active' : ''}`}
            onClick={() => setFilter('copy_trade')}
          >
            Copy Trades
          </button>
          <button 
            className={`filter-btn ${filter === 'profit' ? 'active' : ''}`}
            onClick={() => setFilter('profit')}
          >
            {t('transactions.profits')}
          </button>
        </div>

        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>{t('transactions.date')} & {t('transactions.time')}</th>
                <th>{t('transactions.type')}</th>
                <th>{t('transactions.amount')}</th>
                <th>{t('transactions.status')}</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <div className="date-cell">
                      <span className="date">{new Date(tx.date).toLocaleDateString()}</span>
                      <span className="time">{new Date(tx.date).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`tx-type ${tx.type}`}>
                      {tx.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="amount-cell">
                      <span className="amount">{tx.amount}</span>
                      <span className="currency">{tx.currency}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <div className="details-cell">
                      {tx.plan && <span className="detail-item">Plan: {tx.plan}</span>}
                      {tx.trader && <span className="detail-item">Trader: {tx.trader}</span>}
                      {tx.source && <span className="detail-item">Source: {tx.source}</span>}
                      {tx.roi && <span className="detail-item">ROI: {tx.roi}</span>}
                      {tx.profit && <span className="detail-item profit">Profit: +${tx.profit}</span>}
                      {tx.txHash && (
                        <a 
                          href={`https://etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-hash"
                        >
                          View on Explorer →
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <button className="view-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="no-transactions">
              <p>{t('transactions.noTransactions')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Transactions
