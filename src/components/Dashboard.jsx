import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Dashboard.css'
import { getDashboardStats, getUser, createUser, updateUser } from '../services/firebaseService'

const Dashboard = () => {
  const { address, isConnected } = useAccount()
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      loadDashboard()
    }
  }, [isConnected, address])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      
      // Check if user exists, if not create
      let user = await getUser(address)
      if (!user) {
        await createUser(address)
        user = await getUser(address)
      }
      
      // Migrate old users: if they don't have the new balance fields, initialize them
      if (user && (user.total_balance === undefined || user.total_balance === null)) {
        console.log('Migrating user to new balance fields...')
        const migrationData = {
          total_balance: user.account_bal || 0,
          total_profit: user.roi || 0,
          total_invested: 0,
          available_balance: user.account_bal || 0
        }
        await updateUser(address, migrationData)
        user = await getUser(address)
      }
      
      // Get dashboard stats - now with error handling
      const dashboardData = await getDashboardStats(address)
      console.log('Dashboard data loaded:', dashboardData)
      setStats(dashboardData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      // Set default stats on error
      setStats({
        totalBalance: 0,
        totalProfit: 0,
        totalInvested: 0,
        availableBalance: 0,
        activePlans: 0,
        activeCopyTrades: 0,
        recentTransactions: [],
        portfolio: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="not-connected">
          <h2>{t('common.connectWalletPrompt')}</h2>
          <p>{t('common.connectWalletMessage')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">{t('dashboard.loading')}</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="dashboard-container">
        <div className="not-connected">
          <h2>Error Loading Dashboard</h2>
          <p>Please refresh the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-label">{t('dashboard.totalBalance')}</span>
          </div>
          <div className="stat-value">${(stats.totalBalance || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">{t('dashboard.allTime')}</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <span className="stat-label">{t('dashboard.totalProfit')}</span>
          </div>
          <div className="stat-value">${(stats.totalProfit || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">{t('dashboard.lifetimeEarnings')}</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <span className="stat-icon">💼</span>
            <span className="stat-label">{t('dashboard.invested')}</span>
          </div>
          <div className="stat-value">${(stats.totalInvested || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">{stats.activePlans || 0} {t('dashboard.active')}</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-icon">💵</span>
            <span className="stat-label">{t('dashboard.available')}</span>
          </div>
          <div className="stat-value">${(stats.availableBalance || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">{t('dashboard.readyToInvest')}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/deposit" className="action-btn primary">
          <span className="action-icon">⬇️</span>
          <span>{t('dashboard.makeDeposit')}</span>
        </Link>
        <Link to="/withdraw" className="action-btn secondary">
          <span className="action-icon">⬆️</span>
          <span>{t('dashboard.requestWithdrawal')}</span>
        </Link>
        <Link to="/investments" className="action-btn success">
          <span className="action-icon">💎</span>
          <span>{t('dashboard.viewInvestments')}</span>
        </Link>
        <Link to="/copy-trading" className="action-btn info">
          <span className="action-icon">👥</span>
          <span>{t('dashboard.exploreCopyTrading')}</span>
        </Link>
      </div>

      <div className="dashboard-content">
        {/* Portfolio Assets */}
        <div className="content-card">
          <div className="card-header">
            <h2>{t('dashboard.activePortfolio')}</h2>
          </div>
          {stats.portfolio && stats.portfolio.length > 0 ? (
            <div className="assets-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('dashboard.asset')}</th>
                    <th>{t('dashboard.amount')}</th>
                    <th>{t('dashboard.value')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.portfolio.map((asset, index) => (
                    <tr key={index}>
                      <td>
                        <div className="asset-info">
                          <span className="asset-symbol">{asset.asset}</span>
                        </div>
                      </td>
                      <td>{asset.amount?.toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
                      <td>${(asset.amount * 1).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('dashboard.noAssets')}</p>
              <Link to="/deposit" className="btn-link">{t('dashboard.makeDeposit')}</Link>
            </div>
          )}
        </div>

        {/* Active Copy Trades */}
        <div className="content-card">
          <div className="card-header">
            <h2>{t('copyTrading.title')}</h2>
            <Link to="/copy-trading" className="view-all">View All →</Link>
          </div>
          {stats.activeCopyTrades > 0 ? (
            <div className="empty-state">
              <p>You have {stats.activeCopyTrades} active copy trades</p>
              <Link to="/copy-trading" className="btn-link">View Details</Link>
            </div>
          ) : (
            <div className="empty-state">
              <p>No active trades. Start copy trading to see live trades here.</p>
              <Link to="/copy-trading" className="btn-link">Browse Traders</Link>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="content-card full-width">
          <div className="card-header">
            <h2>{t('dashboard.recentTransactions')}</h2>
            <Link to="/transactions" className="view-all">View All →</Link>
          </div>
          {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('dashboard.type')}</th>
                    <th>{t('dashboard.amount')}</th>
                    <th>{t('dashboard.status')}</th>
                    <th>{t('dashboard.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`tx-type ${tx.type}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="tx-amount">${tx.amount}</td>
                      <td>
                        <span className={`tx-status ${tx.status}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>{new Date(tx.created_at?.toDate()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('dashboard.noTransactions')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
