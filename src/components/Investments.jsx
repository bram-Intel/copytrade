import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import './Investments.css'
import { getAllPlans, getUser, createUserPlan } from '../services/firebaseService'

const Investments = () => {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [investAmount, setInvestAmount] = useState('')
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
      const [plansData, userData] = await Promise.all([
        getAllPlans(),
        getUser(address)
      ])
      setPlans(plansData)
      setUser(userData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvest = (plan) => {
    if (!user) {
      alert('Please connect your wallet first')
      return
    }
    
    setSelectedPlan(plan)
    setInvestAmount(plan.min_price.toString())
    setShowModal(true)
  }

  const handleInvestSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPlan || !investAmount) return
    
    const amount = parseFloat(investAmount)
    
    // Validate amount
    if (amount < parseFloat(selectedPlan.min_price) || amount > parseFloat(selectedPlan.max_price)) {
      alert(`Amount must be between $${selectedPlan.min_price} and $${selectedPlan.max_price}`)
      return
    }
    
    // Check if user has sufficient balance
    if (user.account_bal < amount) {
      alert('Insufficient balance. Please deposit first.')
      // Redirect to deposit page
      navigate('/deposit')
      return
    }
    
    try {
      // Create user plan
      await createUserPlan(address, selectedPlan.id, amount)
      
      alert('Investment successful!')
      setShowModal(false)
      loadData() // Reload data
    } catch (error) {
      console.error('Error investing:', error)
      alert('Failed to invest. Please try again.')
    }
  }

  if (!isConnected) {
    return (
      <div className="investments-page">
        <div className="not-connected">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view investment plans</p>
        </div>
      </div>
    )
  }

  return (
    <div className="investments-page">
      <div className="page-header">
        <h1>Investment Plans</h1>
        <p>Choose a plan that fits your investment goals</p>
      </div>

      <div className="plans-grid">
        {loading ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)'}}>Loading plans...</div>
        ) : plans.length === 0 ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.6)'}}>No investment plans available</div>
        ) : (
          plans.map((plan, index) => (
            <div key={plan.id} className={`plan-card ${index === 2 ? 'featured' : ''}`}>
              {index === 2 && <div className="featured-badge">Most Popular</div>}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-roi">{plan.minr}% - {plan.maxr}%</div>
                <p className="plan-duration">{plan.expiration}</p>
              </div>

              <div className="plan-range">
                <div className="range-item">
                  <span className="range-label">Min Investment</span>
                  <span className="range-value">${parseFloat(plan.min_price).toLocaleString()}</span>
                </div>
                <div className="range-item">
                  <span className="range-label">Max Investment</span>
                  <span className="range-value">${parseFloat(plan.max_price).toLocaleString()}</span>
                </div>
              </div>

              <div className="plan-features">
                <h4>Features:</h4>
                <ul>
                  <li><span className="check-icon">✓</span>ROI: {plan.minr}% - {plan.maxr}%</li>
                  <li><span className="check-icon">✓</span>Duration: {plan.expiration}</li>
                  <li><span className="check-icon">✓</span>Returns every {plan.increment_interval}</li>
                  <li><span className="check-icon">✓</span>Secure & Transparent</li>
                </ul>
              </div>

              <button 
                className="invest-btn"
                onClick={() => handleInvest(plan)}
              >
                Invest Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* Investment Modal */}
      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invest in {selectedPlan.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleInvestSubmit}>
              <div className="form-group">
                <label>Investment Amount (USD)</label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min={selectedPlan.min_price}
                  max={selectedPlan.max_price}
                  step="100"
                  required
                />
                <div className="input-hint">
                  Min: ${selectedPlan.min_price.toLocaleString()} - Max: ${selectedPlan.max_price.toLocaleString()}
                </div>
              </div>

              <div className="investment-summary">
                <div className="summary-row">
                  <span>Investment Amount:</span>
                  <strong>${parseFloat(investAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Expected ROI:</span>
                  <strong className="success-text">{selectedPlan.minr}% - {selectedPlan.maxr}%</strong>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <strong>{selectedPlan.expiration}</strong>
                </div>
                <div className="summary-row total">
                  <span>Min Expected Return:</span>
                  <strong className="success-text">
                    ${(parseFloat(investAmount || 0) * (1 + parseFloat(selectedPlan.minr) / 100)).toLocaleString()}
                  </strong>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Confirm Investment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Investments
