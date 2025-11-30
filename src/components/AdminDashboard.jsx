import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminStats,
  getDeposits,
  updateDeposit,
  getWithdrawals,
  updateWithdrawal,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllCopyTraders,
  createCopyTrader,
  updateCopyTrader,
  deleteCopyTrader,
  getAllUserPlans,
  updateUserPlan,
  seedDefaultPlans,
  seedDefaultCopyTraders,
  uploadTraderImage
} from '../services/firebaseService'
import { serverTimestamp } from 'firebase/firestore'

// Admin password
const ADMIN_PASSWORD = 'MonPass'

const AdminDashboard = () => {
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [plans, setPlans] = useState([])
  const [traders, setTraders] = useState([])
  const [userPlans, setUserPlans] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(true)
  
  useEffect(() => {
    // Check if already authenticated in session
    const adminAuth = sessionStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
      setShowPasswordModal(false)
      loadData()
    }
  }, [])
  
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadData()
    }
  }, [isAuthenticated])
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setShowPasswordModal(false)
      sessionStorage.setItem('adminAuth', 'true')
      loadData()
    } else {
      alert('Incorrect password!')
      setPassword('')
    }
  }
  
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Seed default data if none exists
      await seedDefaultPlans()
      await seedDefaultCopyTraders()
      
      const [statsData, usersData, depositsData, withdrawalsData, plansData, tradersData, userPlansData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getDeposits(),
        getWithdrawals(),
        getAllPlans(),
        getAllCopyTraders(),
        getAllUserPlans()
      ])
      
      setStats(statsData)
      setUsers(usersData)
      setDeposits(depositsData)
      setWithdrawals(withdrawalsData)
      setPlans(plansData)
      setTraders(tradersData)
      setUserPlans(userPlansData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      alert('Error loading data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUserUpdate = async (userId, updates) => {
    try {
      // Ensure all balance fields are updated together
      const balanceUpdates = {
        ...updates,
        // Sync account_bal with total_balance for backward compatibility
        account_bal: updates.total_balance !== undefined ? updates.total_balance : updates.account_bal
      }
      
      await updateUser(userId, balanceUpdates)
      await loadData()
      setShowModal(false)
      alert('User updated successfully')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update user')
    }
  }
  
  const handleDepositUpdate = async (depositId, status) => {
    try {
      await updateDeposit(depositId, { status })
      await loadData()
      alert(`Deposit ${status}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update deposit')
    }
  }
  
  const handleWithdrawalUpdate = async (withdrawalId, status) => {
    try {
      await updateWithdrawal(withdrawalId, { status })
      await loadData()
      alert(`Withdrawal ${status}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update withdrawal')
    }
  }
  
  const handlePlanAction = async (action, planId = null, planData = null) => {
    try {
      if (action === 'create') {
        await createPlan(planData)
      } else if (action === 'update') {
        await updatePlan(planId, planData)
      } else if (action === 'delete') {
        if (!confirm('Delete this plan?')) return
        await deletePlan(planId)
      }
      await loadData()
      setShowModal(false)
      alert(`Plan ${action}d successfully`)
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to ${action} plan`)
    }
  }
  
  const handleTraderAction = async (action, traderId = null, traderData = null) => {
    try {
      if (action === 'create') {
        await createCopyTrader(traderData)
      } else if (action === 'update') {
        await updateCopyTrader(traderId, traderData)
      } else if (action === 'delete') {
        if (!confirm('Delete this trader?')) return
        await deleteCopyTrader(traderId)
      }
      await loadData()
      setShowModal(false)
      alert(`Trader ${action}d successfully`)
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to ${action} trader`)
    }
  }
  
  const handleInvestmentUpdate = async (investmentId, status) => {
    try {
      if (status === 'approved') {
        // When approving, set active to 'yes' and activated_at to current time
        await updateUserPlan(investmentId, { 
          status, 
          active: 'yes',
          activated_at: serverTimestamp()
        })
      } else {
        await updateUserPlan(investmentId, { status })
      }
      await loadData()
      alert(`Investment ${status}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update investment')
    }
  }
  
  if (loading && isAuthenticated) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }
  
  // Password Modal
  if (showPasswordModal) {
    return (
      <div className="admin-dashboard">
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h2>🔐 Admin Access</h2>
            <p>Enter admin password to continue</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                required
              />
              <button type="submit">Access Admin</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage platform operations</p>
      </div>
      
      {stats && (
        <div className="admin-stats">
          <StatCard icon="👥" value={stats.totalUsers} label="Total Users" sub={`${stats.activeUsers} active`} />
          <StatCard icon="💰" value={`$${stats.totalBalance.toFixed(2)}`} label="Total Balance" />
          <StatCard icon="📈" value={`$${stats.totalDeposits.toFixed(2)}`} label="Deposits" sub={`${stats.pendingDeposits} pending`} />
          <StatCard icon="📉" value={`$${stats.totalWithdrawals.toFixed(2)}`} label="Withdrawals" sub={`${stats.pendingWithdrawals} pending`} />
          <StatCard icon="💎" value={`$${stats.totalProfit.toFixed(2)}`} label="Total Profit" />
        </div>
      )}
      
      <div className="admin-tabs">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label={`Users (${users.length})`} />
        <TabButton active={activeTab === 'deposits'} onClick={() => setActiveTab('deposits')} label={`Deposits (${deposits.filter(d => d.status === 'pending').length})`} />
        <TabButton active={activeTab === 'withdrawals'} onClick={() => setActiveTab('withdrawals')} label={`Withdrawals (${withdrawals.filter(w => w.status === 'pending').length})`} />
        <TabButton active={activeTab === 'investments'} onClick={() => setActiveTab('investments')} label={`Investments (${userPlans.filter(up => up.status === 'pending').length})`} />
        <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} label={`Plans (${plans.length})`} />
        <TabButton active={activeTab === 'traders'} onClick={() => setActiveTab('traders')} label={`Traders (${traders.length})`} />
      </div>
      
      <div className="admin-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            deposits={deposits.filter(d => d.status === 'pending').slice(0, 5)}
            withdrawals={withdrawals.filter(w => w.status === 'pending').slice(0, 5)}
            onDepositUpdate={handleDepositUpdate}
            onWithdrawalUpdate={handleWithdrawalUpdate}
          />
        )}
        
        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEdit={(user) => {
              setSelectedItem(user)
              setModalType('edit-user')
              setShowModal(true)
            }}
            onUpdate={handleUserUpdate}
          />
        )}
        
        {activeTab === 'deposits' && (
          <DepositsTab deposits={deposits} onUpdate={handleDepositUpdate} />
        )}
        
        {activeTab === 'withdrawals' && (
          <WithdrawalsTab withdrawals={withdrawals} onUpdate={handleWithdrawalUpdate} />
        )}
        
        {activeTab === 'investments' && (
          <InvestmentsTab userPlans={userPlans} onUpdate={handleInvestmentUpdate} />
        )}
        
        {activeTab === 'plans' && (
          <PlansTab 
            plans={plans}
            onCreate={() => {
              setModalType('add-plan')
              setShowModal(true)
            }}
            onEdit={(plan) => {
              setSelectedItem(plan)
              setModalType('edit-plan')
              setShowModal(true)
            }}
            onDelete={(id) => handlePlanAction('delete', id)}
          />
        )}
        
        {activeTab === 'traders' && (
          <TradersTab 
            traders={traders}
            onCreate={() => {
              setModalType('add-trader')
              setShowModal(true)
            }}
            onEdit={(trader) => {
              setSelectedItem(trader)
              setModalType('edit-trader')
              setShowModal(true)
            }}
            onDelete={(id) => handleTraderAction('delete', id)}
          />
        )}
      </div>
      
      {showModal && (
        <Modal 
          type={modalType}
          item={selectedItem}
          onClose={() => {
            setShowModal(false)
            setSelectedItem(null)
          }}
          onSave={(data) => {
            if (modalType === 'edit-user') handleUserUpdate(selectedItem.id, data)
            else if (modalType === 'add-plan') handlePlanAction('create', null, data)
            else if (modalType === 'edit-plan') handlePlanAction('update', selectedItem.id, data)
            else if (modalType === 'add-trader') handleTraderAction('create', null, data)
            else if (modalType === 'edit-trader') handleTraderAction('update', selectedItem.id, data)
          }}
          onLoadData={loadData}
        />
      )}
    </div>
  )
}

const StatCard = ({ icon, value, label, sub }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-details">
      <h3>{value}</h3>
      <p>{label}</p>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  </div>
)

const TabButton = ({ active, onClick, label }) => (
  <button className={active ? 'active' : ''} onClick={onClick}>{label}</button>
)

const OverviewTab = ({ deposits, withdrawals, onDepositUpdate, onWithdrawalUpdate }) => (
  <div className="overview-tab">
    <h2>Pending Deposits</h2>
    {deposits.length === 0 ? <p>No pending deposits</p> : (
      <table className="admin-table">
        <thead>
          <tr><th>User</th><th>Amount</th><th>Method</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {deposits.map(d => (
            <tr key={d.id}>
              <td>{d.user?.substring(0, 8)}...</td>
              <td>${d.amount}</td>
              <td>{d.payment_mode}</td>
              <td>{new Date(d.created_at?.toDate()).toLocaleDateString()}</td>
              <td>
                <button className="btn-approve" onClick={() => onDepositUpdate(d.id, 'approved')}>Approve</button>
                <button className="btn-reject" onClick={() => onDepositUpdate(d.id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    
    <h2 style={{marginTop: '2rem'}}>Pending Withdrawals</h2>
    {withdrawals.length === 0 ? <p>No pending withdrawals</p> : (
      <table className="admin-table">
        <thead>
          <tr><th>User</th><th>Amount</th><th>Method</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {withdrawals.map(w => (
            <tr key={w.id}>
              <td>{w.user?.substring(0, 8)}...</td>
              <td>${w.amount}</td>
              <td>{w.payment_mode}</td>
              <td>{new Date(w.created_at?.toDate()).toLocaleDateString()}</td>
              <td>
                <button className="btn-approve" onClick={() => onWithdrawalUpdate(w.id, 'approved')}>Approve</button>
                <button className="btn-reject" onClick={() => onWithdrawalUpdate(w.id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)

const UsersTab = ({ users, searchTerm, setSearchTerm, onEdit }) => {
  const filtered = users.filter(u => 
    u.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="users-tab">
      <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
      <div style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Wallet</th>
              <th>Name/Email</th>
              <th>Total Balance</th>
              <th>Total Profit</th>
              <th>Invested</th>
              <th>Available</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.walletAddress?.substring(0, 10)}...</td>
                <td><div>{u.name || 'N/A'}</div><small>{u.email || 'N/A'}</small></td>
                <td>${(u.total_balance || 0).toFixed(2)}</td>
                <td>${(u.total_profit || 0).toFixed(2)}</td>
                <td>${(u.total_invested || 0).toFixed(2)}</td>
                <td>${(u.available_balance || 0).toFixed(2)}</td>
                <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                <td><span className={`badge ${u.kyc_status}`}>{u.kyc_status || 'pending'}</span></td>
                <td><button onClick={() => onEdit(u)} className="btn-edit">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const DepositsTab = ({ deposits, onUpdate }) => (
  <table className="admin-table">
    <thead><tr><th>TXN ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
    <tbody>
      {deposits.map(d => (
        <tr key={d.id}>
          <td>{d.txn_id}</td>
          <td>{d.user?.substring(0, 10)}...</td>
          <td>${d.amount}</td>
          <td>{d.payment_mode}</td>
          <td><span className={`badge ${d.status}`}>{d.status}</span></td>
          <td>{new Date(d.created_at?.toDate()).toLocaleString()}</td>
          <td>
            {d.status === 'pending' && (
              <>
                <button className="btn-approve" onClick={() => onUpdate(d.id, 'approved')}>Approve</button>
                <button className="btn-reject" onClick={() => onUpdate(d.id, 'rejected')}>Reject</button>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const WithdrawalsTab = ({ withdrawals, onUpdate }) => (
  <table className="admin-table">
    <thead><tr><th>TXN ID</th><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
    <tbody>
      {withdrawals.map(w => (
        <tr key={w.id}>
          <td>{w.txn_id}</td>
          <td>{w.user?.substring(0, 10)}...</td>
          <td>${w.amount}</td>
          <td>{w.payment_mode}</td>
          <td><span className={`badge ${w.status}`}>{w.status}</span></td>
          <td>{new Date(w.created_at?.toDate()).toLocaleString()}</td>
          <td>
            {w.status === 'pending' && (
              <>
                <button className="btn-approve" onClick={() => onUpdate(w.id, 'approved')}>Approve</button>
                <button className="btn-reject" onClick={() => onUpdate(w.id, 'rejected')}>Reject</button>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const PlansTab = ({ plans, onCreate, onEdit, onDelete }) => (
  <div className="plans-tab">
    <button className="btn-create" onClick={onCreate}>+ Create Plan</button>
    <div className="plans-grid">
      {plans.map(p => (
        <div key={p.id} className="plan-card">
          <h3>{p.name}</h3>
          <p>Min: ${p.min_price} | Max: ${p.max_price}</p>
          <p>ROI: {p.minr}% - {p.maxr}%</p>
          <p>Duration: {p.expiration}</p>
          <div className="plan-actions">
            <button onClick={() => onEdit(p)}>Edit</button>
            <button onClick={() => onDelete(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const TradersTab = ({ traders, onCreate, onEdit, onDelete }) => (
  <div className="traders-tab">
    <button className="btn-create" onClick={onCreate}>+ Add Trader</button>
    <div className="traders-grid">
      {traders.map(t => (
        <div key={t.id} className="trader-card">
          <div className="trader-avatar">
            {t.imageUrl ? (
              <img src={t.imageUrl} alt={t.name} className="trader-image" />
            ) : (
              t.avatar || t.name?.substring(0, 2) || '??'
            )}
          </div>
          <h3>{t.name}</h3>
          <p><strong>Expertise:</strong> {t.expertise}</p>
          <p><strong>Win Rate:</strong> {t.win_rate}%</p>
          <p><strong>Total ROI:</strong> {t.total_roi}%</p>
          <p><strong>Followers:</strong> {t.followers}</p>
          <p><strong>Min Amount:</strong> ${t.min_copy_amount}</p>
          <span className={`badge ${t.status}`}>{t.verified ? '✓ Verified' : 'Unverified'}</span>
          <div className="trader-actions">
            <button onClick={() => onEdit(t)}>Edit</button>
            <button onClick={() => onDelete(t.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const InvestmentsTab = ({ userPlans, onUpdate }) => (
  <table className="admin-table">
    <thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
    <tbody>
      {userPlans.filter(up => up.status === 'pending').map(up => (
        <tr key={up.id}>
          <td>{up.user?.substring(0, 10)}...</td>
          <td>{up.plan}</td>
          <td>${up.amount}</td>
          <td><span className={`badge ${up.status}`}>{up.status}</span></td>
          <td>{new Date(up.created_at?.toDate()).toLocaleString()}</td>
          <td>
            <button className="btn-approve" onClick={() => onUpdate(up.id, 'approved')}>Approve</button>
            <button className="btn-reject" onClick={() => onUpdate(up.id, 'rejected')}>Reject</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const Modal = ({ type, item, onClose, onSave, onLoadData }) => {
  const [formData, setFormData] = useState(item || {})
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Handle image upload for traders
    if (type.includes('trader') && imageFile) {
      try {
        setUploading(true)
        setUploadProgress(0)
        
        // Upload the image and get the URL
        const imageUrl = await uploadTraderImage(imageFile, item?.id || 'new')
        formData.imageUrl = imageUrl
        
        console.log('Image uploaded successfully:', imageUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
        alert(`Failed to upload image: ${error.message || 'Unknown error'}`)
        setUploading(false)
        return
      }
    }
    
    try {
      await onSave(formData)
      setUploading(false)
    } catch (error) {
      console.error('Error saving trader:', error)
      alert(`Failed to save trader: ${error.message || 'Unknown error'}`)
      setUploading(false)
    }
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{type.includes('add') ? 'Create' : 'Edit'} {type.split('-')[1]}</h2>
        <form onSubmit={handleSubmit}>
          {type.includes('user') && (
            <>
              <label>Name</label>
              <input type="text" placeholder="User Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <label>Email</label>
              <input type="email" placeholder="Email Address" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              
              <label>Account Balance (Legacy)</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.account_bal || 0} onChange={e => setFormData({...formData, account_bal: parseFloat(e.target.value)})} />
              
              <label>💰 Total Balance (Dashboard)</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.total_balance || 0} onChange={e => setFormData({...formData, total_balance: parseFloat(e.target.value)})} />
              
              <label>📈 Total Profit (Dashboard)</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.total_profit || 0} onChange={e => setFormData({...formData, total_profit: parseFloat(e.target.value)})} />
              
              <label>💼 Total Invested (Dashboard)</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.total_invested || 0} onChange={e => setFormData({...formData, total_invested: parseFloat(e.target.value)})} />
              
              <label>💵 Available Balance (Dashboard)</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.available_balance || 0} onChange={e => setFormData({...formData, available_balance: parseFloat(e.target.value)})} />
              
              <label>ROI / Profit (Legacy)</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.roi || 0} onChange={e => setFormData({...formData, roi: parseFloat(e.target.value)})} />
              
              <label>Bonus</label>
              <input type="number" step="0.01" placeholder="0.00" value={formData.bonus || 0} onChange={e => setFormData({...formData, bonus: parseFloat(e.target.value)})} />
              
              <label>Account Status</label>
              <select value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <label>KYC Status</label>
              <select value={formData.kyc_status || 'pending'} onChange={e => setFormData({...formData, kyc_status: e.target.value})}>
                <option value="pending">KYC Pending</option>
                <option value="verified">KYC Verified</option>
                <option value="rejected">KYC Rejected</option>
              </select>
            </>
          )}
          
          {type.includes('plan') && (
            <>
              <input type="text" placeholder="Plan Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input type="number" placeholder="Min Amount" value={formData.min_price || ''} onChange={e => setFormData({...formData, min_price: e.target.value})} required />
              <input type="number" placeholder="Max Amount" value={formData.max_price || ''} onChange={e => setFormData({...formData, max_price: e.target.value})} required />
              <input type="number" step="0.01" placeholder="Min ROI %" value={formData.minr || ''} onChange={e => setFormData({...formData, minr: e.target.value})} required />
              <input type="number" step="0.01" placeholder="Max ROI %" value={formData.maxr || ''} onChange={e => setFormData({...formData, maxr: e.target.value})} required />
              <input type="text" placeholder="Duration (e.g., 1 Month)" value={formData.expiration || ''} onChange={e => setFormData({...formData, expiration: e.target.value})} required />
              <input type="text" placeholder="Interval (e.g., Daily)" value={formData.increment_interval || ''} onChange={e => setFormData({...formData, increment_interval: e.target.value})} required />
            </>
          )}
          
          {type.includes('trader') && (
            <>
              <input type="text" placeholder="Trader Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input type="text" placeholder="Expertise (e.g., Forex & Crypto)" value={formData.expertise || ''} onChange={e => setFormData({...formData, expertise: e.target.value})} required />
              <input type="number" step="0.01" placeholder="Win Rate %" value={formData.win_rate || ''} onChange={e => setFormData({...formData, win_rate: e.target.value})} required />
              <input type="number" step="0.01" placeholder="Total ROI %" value={formData.total_roi || ''} onChange={e => setFormData({...formData, total_roi: e.target.value})} required />
              <input type="number" placeholder="Followers" value={formData.followers || ''} onChange={e => setFormData({...formData, followers: e.target.value})} required />
              <input type="number" placeholder="Min Copy Amount" value={formData.min_copy_amount || ''} onChange={e => setFormData({...formData, min_copy_amount: e.target.value})} required />
              
              {/* File upload for trader image */}
              <label>Trader Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                disabled={uploading}
              />
              {uploading && (
                <div style={{marginTop: '10px'}}>
                  <div>Uploading image...</div>
                  <div style={{fontSize: '12px', color: '#667eea'}}>{uploadProgress > 0 ? `${uploadProgress}%` : 'Preparing upload...'}</div>
                </div>
              )}
              {formData.imageUrl && !uploading && (
                <div style={{marginTop: '10px'}}>
                  <small>Current image:</small>
                  <div style={{display: 'flex', alignItems: 'center', marginTop: '5px'}}>
                    <img src={formData.imageUrl} alt="Current" style={{width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px'}} />
                    <button 
                      type="button" 
                      onClick={() => {
                        setFormData({...formData, imageUrl: null})
                        // Also clear the file input
                        const fileInput = document.querySelector('input[type="file"]')
                        if (fileInput) fileInput.value = ''
                      }}
                      style={{background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              
              <input type="text" placeholder="Avatar Initials (fallback)" value={formData.avatar || ''} onChange={e => setFormData({...formData, avatar: e.target.value})} />
              <select value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <label>
                <input type="checkbox" checked={formData.verified || false} onChange={e => setFormData({...formData, verified: e.target.checked})} />
                Verified Trader
              </label>
            </>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard