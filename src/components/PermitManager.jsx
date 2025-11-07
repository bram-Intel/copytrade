import React, { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import permitService from '../services/permitService'
import './PermitManager.css'

const PermitManager = () => {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  
  const [tokens, setTokens] = useState([
    { name: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, chain: 'ethereum' },
    { name: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, chain: 'ethereum' },
    { name: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, chain: 'ethereum' },
    { name: 'BUSD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, chain: 'bsc' },
    { name: 'BNB-USDT', address: '0x55d398326f99059f77548524699bD69ADd087D56', decimals: 18, chain: 'bsc' }
  ])
  
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [amount, setAmount] = useState('')
  const [spender, setSpender] = useState('')
  const [deadline, setDeadline] = useState(24) // 24 hours
  const [signature, setSignature] = useState('')
  const [permitStatus, setPermitStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [unlimited, setUnlimited] = useState(false)

  // Update domain when chain changes
  useEffect(() => {
    if (isConnected && walletClient) {
      walletClient.getChainId().then(chainId => {
        permitService.setDomain(chainId, selectedToken.address)
      })
    }
  }, [isConnected, walletClient, selectedToken])

  // Handle token selection change
  const handleTokenChange = (e) => {
    const token = tokens.find(t => t.address === e.target.value)
    setSelectedToken(token)
    permitService.setDomain(null, token.address) // Will be updated with chainId
  }

  // Create and sign permit
  const handleCreatePermit = async () => {
    if (!isConnected || !walletClient) {
      setPermitStatus('Please connect your wallet first')
      return
    }

    if (!spender || !ethers.utils.isAddress(spender)) {
      setPermitStatus('Please enter a valid spender address')
      return
    }

    setIsLoading(true)
    setPermitStatus('Creating permit...')

    try {
      // Get token nonce
      const nonce = await permitService.getTokenNonce(publicClient, selectedToken.address, address)
      
      // Calculate deadline (current time + specified hours)
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 3600)
      
      // Create permit message
      let permitMessage
      if (unlimited) {
        permitMessage = permitService.createUnlimitedPermit(address, spender, nonce, deadlineTimestamp)
        setPermitStatus('Creating unlimited permit...')
      } else {
        // Convert amount to token decimals
        const amountInWei = ethers.utils.parseUnits(amount || '0', selectedToken.decimals)
        permitMessage = permitService.createPermitMessage(address, spender, amountInWei.toString(), nonce, deadlineTimestamp)
        setPermitStatus(`Creating permit for ${amount} ${selectedToken.name}...`)
      }

      // Sign permit
      const sig = await permitService.signPermit(walletClient, permitMessage)
      setSignature(sig)
      setPermitStatus(`Permit signed successfully! Signature: ${sig.substring(0, 20)}...${sig.substring(sig.length - 20)}`)
    } catch (error) {
      console.error('Error creating permit:', error)
      setPermitStatus(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Execute permit transfer
  const handleExecutePermit = async () => {
    if (!signature) {
      setPermitStatus('Please create a permit first')
      return
    }

    if (!isConnected || !walletClient) {
      setPermitStatus('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setPermitStatus('Executing permit transfer...')

    try {
      // Convert amount to token decimals
      const amountInWei = unlimited 
        ? ethers.constants.MaxUint256.toString()
        : ethers.utils.parseUnits(amount || '0', selectedToken.decimals)
      
      // Calculate deadline
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 3600)
      
      // Execute permit transfer
      const txHash = await permitService.executePermitTransfer(
        walletClient,
        selectedToken.address,
        address,
        spender,
        amountInWei.toString(),
        deadlineTimestamp,
        signature
      )
      
      setPermitStatus(`Transfer executed successfully! Transaction: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 10)}`)
    } catch (error) {
      console.error('Error executing permit:', error)
      setPermitStatus(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Create custom approval with multiple permissions
  const handleCreateCustomApproval = async () => {
    if (!isConnected || !walletClient) {
      setPermitStatus('Please connect your wallet first')
      return
    }

    if (!spender || !ethers.utils.isAddress(spender)) {
      setPermitStatus('Please enter a valid spender address')
      return
    }

    setIsLoading(true)
    setPermitStatus('Creating custom approval...')

    try {
      // Create permissions array
      const permissions = [{
        token: selectedToken.address,
        spender: spender,
        amount: unlimited 
          ? ethers.constants.MaxUint256.toString()
          : ethers.utils.parseUnits(amount || '0', selectedToken.decimals).toString(),
        deadline: Math.floor(Date.now() / 1000) + (deadline * 3600),
        unlimited: unlimited
      }]
      
      // Create custom approval message
      const approvalMessage = permitService.createCustomApprovalMessage(address, permissions)
      
      // Sign approval
      const sig = await permitService.signPermit(walletClient, approvalMessage)
      setSignature(sig)
      setPermitStatus(`Custom approval signed successfully! Signature: ${sig.substring(0, 20)}...${sig.substring(sig.length - 20)}`)
    } catch (error) {
      console.error('Error creating custom approval:', error)
      setPermitStatus(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="permit-manager">
        <h2>Permit Manager</h2>
        <p>Please connect your wallet to manage permits</p>
      </div>
    )
  }

  return (
    <div className="permit-manager">
      <h2>Permit Manager</h2>
      <p>Sign permits to grant approval for token transfers without further interaction</p>
      
      <div className="permit-form">
        <div className="form-group">
          <label>Token:</label>
          <select value={selectedToken.address} onChange={handleTokenChange}>
            {tokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.name} ({token.chain.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Spender Address:</label>
          <input
            type="text"
            value={spender}
            onChange={(e) => setSpender(e.target.value)}
            placeholder="0x..."
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={unlimited}
              onChange={(e) => setUnlimited(e.target.checked)}
            />
            Unlimited Approval
          </label>
        </div>
        
        {!unlimited && (
          <div className="form-group">
            <label>Amount ({selectedToken.name}):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="any"
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Deadline (hours):</label>
          <input
            type="number"
            value={deadline}
            onChange={(e) => setDeadline(Number(e.target.value))}
            min="1"
            max="8760" // 1 year
          />
        </div>
        
        <div className="form-actions">
          <button 
            onClick={handleCreatePermit} 
            disabled={isLoading}
            className="primary-btn"
          >
            {isLoading ? 'Processing...' : 'Create Permit'}
          </button>
          
          <button 
            onClick={handleCreateCustomApproval} 
            disabled={isLoading}
            className="secondary-btn"
          >
            {isLoading ? 'Processing...' : 'Create Custom Approval'}
          </button>
          
          {signature && (
            <button 
              onClick={handleExecutePermit} 
              disabled={isLoading}
              className="execute-btn"
            >
              {isLoading ? 'Executing...' : 'Execute Permit'}
            </button>
          )}
        </div>
      </div>
      
      {signature && (
        <div className="signature-display">
          <h3>Signature</h3>
          <div className="signature-text">
            {signature}
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(signature)}
            className="copy-btn"
          >
            Copy Signature
          </button>
        </div>
      )}
      
      {permitStatus && (
        <div className="status-display">
          <p>{permitStatus}</p>
        </div>
      )}
    </div>
  )
}

export default PermitManager