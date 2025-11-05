import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import './Dashboard.css'
import { getDashboardStats, getUser, createUser, updateUser } from '../services/firebaseService'

const Dashboard = () => {
  const { address, isConnected } = useAccount()
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
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the dashboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
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
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's your portfolio summary</p>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-label">Total Balance</span>
          </div>
          <div className="stat-value">${(stats.totalBalance || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">All time</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <span className="stat-label">Total Profit</span>
          </div>
          <div className="stat-value">${(stats.totalProfit || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">Lifetime earnings</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-header">
            <span className="stat-icon">💼</span>
            <span className="stat-label">Invested</span>
          </div>
          <div className="stat-value">${(stats.totalInvested || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">{stats.activePlans || 0} active</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-icon">💵</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-value">${(stats.availableBalance || 0).toLocaleString()}</div>
          <div className="stat-footer">
            <span className="stat-period">Ready to invest</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/deposit" className="action-btn primary">
          <span className="action-icon">⬇️</span>
          <span>Deposit</span>
        </Link>
        <Link to="/withdraw" className="action-btn secondary">
          <span className="action-icon">⬆️</span>
          <span>Withdraw</span>
        </Link>
        <Link to="/investments" className="action-btn success">
          <span className="action-icon">💎</span>
          <span>Invest Now</span>
        </Link>
        <Link to="/copy-trading" className="action-btn info">
          <span className="action-icon">👥</span>
          <span>Copy Trade</span>
        </Link>
      </div>

      <div className="dashboard-content">
        {/* Portfolio Assets */}
        <div className="content-card">
          <div className="card-header">
            <h2>Portfolio Assets</h2>
          </div>
          {stats.portfolio && stats.portfolio.length > 0 ? (
            <div className="assets-table">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Amount</th>
                    <th>Value</th>
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
              <p>No assets yet. Make a deposit to get started.</p>
              <Link to="/deposit" className="btn-link">Deposit Now</Link>
            </div>
          )}
        </div>

        {/* Active Copy Trades */}
        <div className="content-card">
          <div className="card-header">
            <h2>Active Copy Trades</h2>
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
            <h2>Recent Transactions</h2>
            <Link to="/transactions" className="view-all">View All →</Link>
          </div>
          {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
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
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
