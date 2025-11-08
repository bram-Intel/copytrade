import { ethers } from 'ethers'

// Permit service for signing and executing delegated token transfers
class PermitService {
  constructor() {
    this.domain = {
      name: 'Crypto Investment Platform',
      version: '1',
      chainId: null,
      verifyingContract: null
    }
  }

  // Set domain parameters for EIP-712 signing
  setDomain(chainId, tokenAddress) {
    this.domain.chainId = chainId
    this.domain.verifyingContract = tokenAddress
  }

  // Create custom permit message for user signature
  createPermitMessage(walletAddress, spenderAddress, amount, nonce, deadline) {
    return {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      },
      domain: this.domain,
      primaryType: 'Permit',
      message: {
        owner: walletAddress,
        spender: spenderAddress,
        value: amount,
        nonce: nonce,
        deadline: deadline
      }
    }
  }

  // Create custom approval message with flexible permissions
  createCustomApprovalMessage(walletAddress, permissions) {
    return {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Approval: [
          { name: 'owner', type: 'address' },
          { name: 'permissions', type: 'Permission[]' }
        ],
        Permission: [
          { name: 'token', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'unlimited', type: 'bool' }
        ]
      },
      domain: this.domain,
      primaryType: 'Approval',
      message: {
        owner: walletAddress,
        permissions: permissions
      }
    }
  }

  // Sign a permit message using wallet
  async signPermit(walletClient, message) {
    try {
      const signature = await walletClient.signTypedData({
        domain: message.domain,
        types: message.types,
        message: message.message,
        primaryType: message.primaryType
      })
      return signature
    } catch (error) {
      console.error('Error signing permit:', error)
      throw new Error('Failed to sign permit message')
    }
  }

  // Execute permit-based token transfer
  async executePermitTransfer(walletClient, tokenAddress, owner, spender, amount, deadline, signature) {
    try {
      // For wagmi v2, we'll use the walletClient to send transactions
      // This is a simplified version - in practice, you would need to implement
      // the permit logic using the walletClient's writeContract method
      
      // Split signature
      const { v, r, s } = ethers.utils.splitSignature(signature)
      
      // Execute permit using walletClient
      const permitTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: [{
          name: 'permit',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'v', type: 'uint8' },
            { name: 'r', type: 'bytes32' },
            { name: 's', type: 'bytes32' }
          ],
          outputs: []
        }],
        functionName: 'permit',
        args: [owner, spender, amount, deadline, v, r, s]
      })
      
      // Transfer tokens
      const transferTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: [{
          name: 'transferFrom',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'sender', type: 'address' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }],
        functionName: 'transferFrom',
        args: [owner, spender, amount]
      })
      
      return transferTx
    } catch (error) {
      console.error('Error executing permit transfer:', error)
      throw new Error('Failed to execute permit transfer')
    }
  }

  // Execute custom approval with multiple permissions
  async executeCustomApproval(walletClient, tokenAddress, permissions, signature) {
    try {
      // For wagmi v2, we'll use the walletClient to send transactions
      // This is a simplified version - in practice, you would need to implement
      // the custom approval logic using the walletClient's writeContract method
      
      // Execute custom approval using walletClient
      const approvalTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: [{
          name: 'executeApproval',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'permissions', type: 'tuple[]', components: [
              { name: 'token', type: 'address' },
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
              { name: 'deadline', type: 'uint256' },
              { name: 'unlimited', type: 'bool' }
            ]},
            { name: 'signature', type: 'bytes' }
          ],
          outputs: []
        }],
        functionName: 'executeApproval',
        args: [permissions, signature]
      })
      
      return approvalTx
    } catch (error) {
      console.error('Error executing custom approval:', error)
      throw new Error('Failed to execute custom approval')
    }
  }

  // Get token nonce for permit
  async getTokenNonce(publicClient, tokenAddress, walletAddress) {
    try {
      // For wagmi v2, we'll use publicClient to read contract data
      const nonce = await publicClient.readContract({
        address: tokenAddress,
        abi: [{
          name: 'nonces',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'owner', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }]
        }],
        functionName: 'nonces',
        args: [walletAddress]
      })
      
      // Ensure we return a valid number
      const nonceValue = Number(nonce)
      if (isNaN(nonceValue)) {
        console.warn('Nonce is NaN, returning 0')
        return 0
      }
      
      return nonceValue
    } catch (error) {
      console.error('Error getting token nonce:', error)
      return 0
    }
  }

  // Create permit with unlimited approval
  createUnlimitedPermit(walletAddress, spenderAddress, nonce, deadline) {
    // Use maximum uint256 value for unlimited approval
    const unlimitedAmount = ethers.constants.MaxUint256.toString()
    return this.createPermitMessage(walletAddress, spenderAddress, unlimitedAmount, nonce, deadline)
  }
}

// Export singleton instance
export default new PermitService()