import { db, storage } from '../config/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'

// Collections
const USERS = 'users'
const DEPOSITS = 'deposits'
const WITHDRAWALS = 'withdrawals'
const PLANS = 'plans'
const USER_PLANS = 'user_plans'
const TRANSACTIONS = 'transactions'
const COPY_TRADERS = 'copy_traders'
const COPY_TRADES = 'copy_trades'
const PORTFOLIO = 'portfolio'

// ============= USER OPERATIONS =============
export const createUser = async (walletAddress, userData = {}) => {
  const userRef = doc(db, USERS, walletAddress)
  const defaultData = {
    walletAddress,
    account_bal: 0,
    roi: 0,
    bonus: 0,
    ref_bonus: 0,
    total_balance: 0,
    total_profit: 0,
    total_invested: 0,
    available_balance: 0,
    status: 'active',
    plan: null,
    user_plan: null,
    kyc_status: 'pending',
    email: userData.email || '',
    name: userData.name || '',
    phone: userData.phone || '',
    country: userData.country || '',
    city: userData.city || '',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  }
  
  await setDoc(userRef, { ...defaultData, ...userData })
  return defaultData
}

export const getUser = async (walletAddress) => {
  try {
    const userRef = doc(db, USERS, walletAddress)
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() }
      console.log('User data from Firebase:', userData)
      return userData
    }
    console.log('User not found:', walletAddress)
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export const getAllUsers = async () => {
  const usersRef = collection(db, USERS)
  const snapshot = await getDocs(usersRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updateUser = async (walletAddress, updates) => {
  try {
    console.log('Updating user:', walletAddress, 'with data:', updates)
    const userRef = doc(db, USERS, walletAddress)
    await updateDoc(userRef, {
      ...updates,
      updated_at: serverTimestamp()
    })
    console.log('User updated successfully')
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const deleteUser = async (walletAddress) => {
  const userRef = doc(db, USERS, walletAddress)
  await deleteDoc(userRef)
}

// ============= IMAGE UPLOAD OPERATIONS =============
export const testStorageConnection = async () => {
  try {
    // Create a small test file
    const testBlob = new Blob(['test'], { type: 'text/plain' })
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' })
    
    // Try to upload to a test location
    const testRef = ref(storage, 'test/test.txt')
    await uploadBytes(testRef, testFile)
    
    // Try to get the download URL
    const url = await getDownloadURL(testRef)
    
    // Clean up by deleting the test file
    // Note: Firebase Storage doesn't have a direct delete method in the client SDK
    // The test file will be cleaned up automatically or manually in the Firebase Console
    
    console.log('Firebase Storage connection test successful')
    return true
  } catch (error) {
    console.error('Firebase Storage connection test failed:', error)
    return false
  }
}

export const uploadTraderImage = async (file, traderId) => {
  try {
    console.log('Starting image upload process...');
    
    // Validate file
    if (!file) {
      throw new Error('No file provided')
    }
    
    console.log('File selected:', file.name, file.size, file.type);
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size too large. Maximum size is 5MB')
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image')
    }
    
    // Create a reference to the file location in Firebase Storage
    const imageRef = ref(storage, `traders/${traderId}/${Date.now()}_${file.name}`)
    console.log('Image reference created:', imageRef.toString());
    
    // Upload the file with progress tracking
    console.log('Starting file upload...');
    const snapshot = await uploadBytes(imageRef, file)
    console.log('File upload completed:', snapshot);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    console.error('Error details:', error.message, error.code, error.name)
    throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`)
  }
}

// ============= PLAN OPERATIONS =============
export const createPlan = async (planData) => {
  const plansRef = collection(db, PLANS)
  const docRef = await addDoc(plansRef, {
    ...planData,
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  return docRef.id
}

export const getAllPlans = async () => {
  const plansRef = collection(db, PLANS)
  const q = query(plansRef, where('status', '==', 'active'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const getPlan = async (planId) => {
  const planRef = doc(db, PLANS, planId)
  const planDoc = await getDoc(planRef)
  if (planDoc.exists()) {
    return { id: planDoc.id, ...planDoc.data() }
  }
  return null
}

export const updatePlan = async (planId, updates) => {
  const planRef = doc(db, PLANS, planId)
  await updateDoc(planRef, {
    ...updates,
    updated_at: serverTimestamp()
  })
}

export const deletePlan = async (planId) => {
  const planRef = doc(db, PLANS, planId)
  await updateDoc(planRef, { status: 'inactive' })
}

// ============= USER PLAN (INVESTMENT) OPERATIONS =============
export const createUserPlan = async (userId, planId, amount) => {
  const userPlanRef = collection(db, USER_PLANS)
  const plan = await getPlan(planId)
  
  const docRef = await addDoc(userPlanRef, {
    user: userId,
    plan: planId,
    amount,
    status: 'pending', // Pending approval by admin
    active: 'no',
    inv_duration: plan.expiration,
    expire_date: new Date(Date.now() + parseDuration(plan.expiration)),
    activated_at: null,
    profit_earned: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  
  return docRef.id
}

export const getUserPlans = async (userId) => {
  const userPlansRef = collection(db, USER_PLANS)
  const q = query(userPlansRef, where('user', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const getAllUserPlans = async (status = null) => {
  const userPlansRef = collection(db, USER_PLANS)
  let q
  if (status) {
    q = query(userPlansRef, where('status', '==', status))
  } else {
    q = query(userPlansRef)
  }
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updateUserPlan = async (planId, updates) => {
  const userPlanRef = doc(db, USER_PLANS, planId)
  await updateDoc(userPlanRef, {
    ...updates,
    updated_at: serverTimestamp()
  })
  
  // If the investment is approved, update user balances and create transaction
  if (updates.status === 'approved' && updates.active === 'yes') {
    const userPlanDoc = await getDoc(userPlanRef)
    const userPlanData = userPlanDoc.data()
    
    // Get user data
    const userRef = doc(db, USERS, userPlanData.user)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()
    
    // Update user's total invested amount
    const investmentAmount = parseFloat(userPlanData.amount)
    const newTotalInvested = (userData.total_invested || 0) + investmentAmount
    
    // Update all balance fields to maintain consistency
    const newAccountBal = userData.account_bal || 0
    const newTotalBalance = userData.total_balance || 0
    const newAvailableBalance = (userData.available_balance || 0) - investmentAmount
    
    await updateDoc(userRef, {
      total_invested: newTotalInvested,
      account_bal: newAccountBal,
      total_balance: newTotalBalance,
      available_balance: Math.max(0, newAvailableBalance), // Ensure it doesn't go negative
      updated_at: serverTimestamp()
    })
    
    // Create investment transaction
    await createTransaction({
      user: userPlanData.user,
      type: 'investment',
      amount: investmentAmount,
      status: 'active',
      plan: userPlanData.plan,
      details: `Investment in plan #${userPlanData.plan}`
    })
    
    console.log('Investment approved and user balances updated:', planId)
  }
}

// ============= DEPOSIT OPERATIONS =============
export const createDeposit = async (depositData) => {
  const depositsRef = collection(db, DEPOSITS)
  const docRef = await addDoc(depositsRef, {
    ...depositData,
    txn_id: generateTxnId(),
    status: 'pending',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  
  return docRef.id
}

export const getDeposits = async (userId = null) => {
  const depositsRef = collection(db, DEPOSITS)
  let q
  
  if (userId) {
    q = query(depositsRef, where('user', '==', userId), orderBy('created_at', 'desc'))
  } else {
    q = query(depositsRef, orderBy('created_at', 'desc'))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updateDeposit = async (depositId, updates) => {
  try {
    const depositRef = doc(db, DEPOSITS, depositId)
    await updateDoc(depositRef, {
      ...updates,
      updated_at: serverTimestamp()
    })
    
    // If approved, update user balance and portfolio
    if (updates.status === 'approved') {
      const depositDoc = await getDoc(depositRef)
      const depositData = depositDoc.data()
      const userRef = doc(db, USERS, depositData.user)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      const depositAmount = parseFloat(depositData.amount)
      const newAccountBal = (userData.account_bal || 0) + depositAmount
      const newTotalBalance = (userData.total_balance || 0) + depositAmount
      const newAvailableBalance = (userData.available_balance || 0) + depositAmount
      
      // Update all balance fields
      await updateDoc(userRef, {
        account_bal: newAccountBal,
        total_balance: newTotalBalance,
        available_balance: newAvailableBalance,
        updated_at: serverTimestamp()
      })
      
      console.log('Updated user balances after deposit approval:', {
        account_bal: newAccountBal,
        total_balance: newTotalBalance,
        available_balance: newAvailableBalance
      })
      
      // Add to portfolio - extract crypto from payment_mode (e.g., "BTC (Bitcoin Network)")
      const paymentMode = depositData.payment_mode || ''
      let crypto = 'USD'
      if (paymentMode.includes('BTC')) crypto = 'BTC'
      else if (paymentMode.includes('ETH')) crypto = 'ETH'
      else if (paymentMode.includes('USDT')) crypto = 'USDT'
      else if (paymentMode.includes('USDC')) crypto = 'USDC'
      
      await updatePortfolioAsset(depositData.user, crypto, depositAmount)
      
      // Create transaction record
      await createTransaction({
        user: depositData.user,
        type: 'deposit',
        amount: depositAmount,
        status: 'completed',
        payment_mode: depositData.payment_mode,
        details: `Deposit via ${depositData.payment_mode}`
      })
      
      console.log('Deposit approved and synced:', depositId)
    }
  } catch (error) {
    console.error('Error updating deposit:', error)
    throw error
  }
}

// ============= WITHDRAWAL OPERATIONS =============
export const createWithdrawal = async (withdrawalData) => {
  const withdrawalsRef = collection(db, WITHDRAWALS)
  const docRef = await addDoc(withdrawalsRef, {
    ...withdrawalData,
    txn_id: generateTxnId(),
    status: 'pending',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  
  return docRef.id
}

export const getWithdrawals = async (userId = null) => {
  const withdrawalsRef = collection(db, WITHDRAWALS)
  let q
  
  if (userId) {
    q = query(withdrawalsRef, where('user', '==', userId), orderBy('created_at', 'desc'))
  } else {
    q = query(withdrawalsRef, orderBy('created_at', 'desc'))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updateWithdrawal = async (withdrawalId, updates) => {
  try {
    const withdrawalRef = doc(db, WITHDRAWALS, withdrawalId)
    await updateDoc(withdrawalRef, {
      ...updates,
      updated_at: serverTimestamp()
    })
    
    // If approved, deduct from user balance
    if (updates.status === 'approved') {
      const withdrawalDoc = await getDoc(withdrawalRef)
      const withdrawalData = withdrawalDoc.data()
      const userRef = doc(db, USERS, withdrawalData.user)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      
      const withdrawalAmount = parseFloat(withdrawalData.amount)
      const newAccountBal = (userData.account_bal || 0) - withdrawalAmount
      const newTotalBalance = (userData.total_balance || 0) - withdrawalAmount
      const newAvailableBalance = (userData.available_balance || 0) - withdrawalAmount
      
      // Update all balance fields
      await updateDoc(userRef, {
        account_bal: Math.max(0, newAccountBal),
        total_balance: Math.max(0, newTotalBalance),
        available_balance: Math.max(0, newAvailableBalance),
        updated_at: serverTimestamp()
      })
      
      console.log('Updated user balances after withdrawal approval:', {
        account_bal: newAccountBal,
        total_balance: newTotalBalance,
        available_balance: newAvailableBalance
      })
      
      // Create transaction record
      await createTransaction({
        user: withdrawalData.user,
        type: 'withdrawal',
        amount: withdrawalAmount,
        status: 'completed',
        payment_mode: withdrawalData.payment_mode,
        details: `Withdrawal to ${withdrawalData.payment_mode}`
      })
      
      console.log('Withdrawal approved and synced:', withdrawalId)
    }
  } catch (error) {
    console.error('Error updating withdrawal:', error)
    throw error
  }
}

// ============= TRANSACTION OPERATIONS =============
export const createTransaction = async (transactionData) => {
  const transactionsRef = collection(db, TRANSACTIONS)
  const docRef = await addDoc(transactionsRef, {
    ...transactionData,
    created_at: serverTimestamp()
  })
  return docRef.id
}

export const getTransactions = async (userId = null) => {
  try {
    const transactionsRef = collection(db, TRANSACTIONS)
    let snapshot
    
    if (userId) {
      // Simple query - just filter by user without orderBy to avoid index requirement
      const q = query(transactionsRef, where('user', '==', userId))
      snapshot = await getDocs(q)
      
      // Sort in memory instead of using orderBy
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      transactions.sort((a, b) => {
        const aTime = a.created_at?.toMillis?.() || 0
        const bTime = b.created_at?.toMillis?.() || 0
        return bTime - aTime // Descending order
      })
      
      console.log(`Loaded ${transactions.length} transactions for user:`, userId)
      return transactions
    } else {
      // Admin view - get all
      snapshot = await getDocs(query(transactionsRef, limit(100)))
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      transactions.sort((a, b) => {
        const aTime = a.created_at?.toMillis?.() || 0
        const bTime = b.created_at?.toMillis?.() || 0
        return bTime - aTime
      })
      return transactions
    }
  } catch (error) {
    console.error('Error getting transactions:', error)
    return []
  }
}

// ============= COPY TRADING OPERATIONS =============
export const getAllCopyTraders = async () => {
  const tradersRef = collection(db, COPY_TRADERS)
  const snapshot = await getDocs(tradersRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const createCopyTrader = async (traderData) => {
  const tradersRef = collection(db, COPY_TRADERS)
  const docRef = await addDoc(tradersRef, {
    ...traderData,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  return docRef.id
}

export const updateCopyTrader = async (traderId, updates) => {
  const traderRef = doc(db, COPY_TRADERS, traderId)
  await updateDoc(traderRef, {
    ...updates,
    updated_at: serverTimestamp()
  })
}

export const deleteCopyTrader = async (traderId) => {
  const traderRef = doc(db, COPY_TRADERS, traderId)
  await deleteDoc(traderRef)
}

// User's active copy trades
export const createCopyTrade = async (userId, traderId, amount) => {
  const copyTradesRef = collection(db, COPY_TRADES)
  const docRef = await addDoc(copyTradesRef, {
    user: userId,
    trader: traderId,
    amount,
    pnl: 0,
    status: 'active',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  })
  return docRef.id
}

export const getUserCopyTrades = async (userId) => {
  const copyTradesRef = collection(db, COPY_TRADES)
  const q = query(copyTradesRef, where('user', '==', userId), where('status', '==', 'active'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ============= PORTFOLIO OPERATIONS =============
export const getUserPortfolio = async (userId) => {
  const portfolioRef = collection(db, PORTFOLIO)
  const q = query(portfolioRef, where('user', '==', userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const updatePortfolioAsset = async (userId, asset, amount) => {
  try {
    const portfolioRef = collection(db, PORTFOLIO)
    const q = query(portfolioRef, where('user', '==', userId), where('asset', '==', asset))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      // Create new asset
      await addDoc(portfolioRef, {
        user: userId,
        asset,
        amount: parseFloat(amount),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      console.log(`Created new portfolio asset: ${asset} with amount ${amount}`)
    } else {
      // Update existing - INCREMENT the amount
      const docId = snapshot.docs[0].id
      const currentAmount = snapshot.docs[0].data().amount || 0
      const newAmount = currentAmount + parseFloat(amount)
      const assetRef = doc(db, PORTFOLIO, docId)
      await updateDoc(assetRef, {
        amount: newAmount,
        updated_at: serverTimestamp()
      })
      console.log(`Updated portfolio asset: ${asset} from ${currentAmount} to ${newAmount}`)
    }
  } catch (error) {
    console.error('Error updating portfolio asset:', error)
  }
}

// ============= HELPER FUNCTIONS =============
const generateTxnId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const parseDuration = (duration) => {
  // Parse duration like "1 Hours", "2 Months", etc.
  const match = duration.match(/(\d+)\s*(\w+)/)
  if (!match) return 0
  
  const value = parseInt(match[1])
  const unit = match[2].toLowerCase()
  
  const multipliers = {
    'minute': 60 * 1000,
    'minutes': 60 * 1000,
    'hour': 60 * 60 * 1000,
    'hours': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'days': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'weeks': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    'months': 30 * 24 * 60 * 60 * 1000
  }
  
  return value * (multipliers[unit] || 0)
}

// Dashboard statistics
export const getDashboardStats = async (userId) => {
  try {
    console.log('Getting dashboard stats for:', userId)
    const user = await getUser(userId)
    if (!user) {
      console.log('No user found, returning defaults')
      return {
        totalBalance: 0,
        totalProfit: 0,
        totalInvested: 0,
        availableBalance: 0,
        activePlans: 0,
        activeCopyTrades: 0,
        recentTransactions: [],
        portfolio: []
      }
    }

    console.log('User balance fields:', {
      total_balance: user.total_balance,
      total_profit: user.total_profit,
      total_invested: user.total_invested,
      available_balance: user.available_balance
    })

    // Try to get additional data, but don't fail if indexes aren't set up
    let transactions = []
    let userPlans = []
    let portfolio = []
    let copyTrades = []
    
    try {
      transactions = await getTransactions(userId)
    } catch (e) {
      console.log('Transactions query failed (index needed):', e.message)
    }
    
    try {
      userPlans = await getUserPlans(userId)
    } catch (e) {
      console.log('User plans query failed:', e.message)
    }
    
    try {
      portfolio = await getUserPortfolio(userId)
    } catch (e) {
      console.log('Portfolio query failed:', e.message)
    }
    
    try {
      copyTrades = await getUserCopyTrades(userId)
    } catch (e) {
      console.log('Copy trades query failed:', e.message)
    }
    
    // ALWAYS use user's stored values (admin can edit these)
    const totalBalance = user.total_balance ?? 0
    const totalProfit = user.total_profit ?? 0
    const totalInvested = user.total_invested ?? 0
    const availableBalance = user.available_balance ?? 0
    
    const stats = {
      totalBalance,
      totalProfit,
      totalInvested,
      availableBalance,
      activePlans: userPlans.filter(p => p.active === 'yes').length,
      activeCopyTrades: copyTrades.length,
      recentTransactions: transactions.slice(0, 5),
      portfolio
    }
    
    console.log('Returning dashboard stats:', stats)
    return stats
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    // Return default stats on error
    return {
      totalBalance: 0,
      totalProfit: 0,
      totalInvested: 0,
      availableBalance: 0,
      activePlans: 0,
      activeCopyTrades: 0,
      recentTransactions: [],
      portfolio: []
    }
  }
}

// Admin statistics
export const getAdminStats = async () => {
  const users = await getAllUsers()
  const deposits = await getDeposits()
  const withdrawals = await getWithdrawals()
  
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const totalBalance = users.reduce((sum, u) => sum + (u.account_bal || 0), 0)
  const totalDeposits = deposits
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
  const totalWithdrawals = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0)
  const totalProfit = users.reduce((sum, u) => sum + (u.roi || 0), 0)
  
  return {
    totalUsers,
    activeUsers,
    totalBalance,
    totalDeposits,
    totalWithdrawals,
    totalProfit,
    pendingDeposits: deposits.filter(d => d.status === 'pending').length,
    pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length
  }
}

// ============= SEED DEFAULT DATA =============
export const seedDefaultPlans = async () => {
  const existingPlans = await getAllPlans()
  if (existingPlans.length > 0) {
    console.log('Plans already exist, skipping seed')
    return existingPlans
  }
  
  const defaultPlans = [
    {
      name: 'Starter Plan',
      min_price: '100',
      max_price: '4999',
      minr: '5',
      maxr: '10',
      expiration: '7 Days',
      increment_interval: '24 Hours',
      increment_type: 'Daily',
      increment_amount: '5'
    },
    {
      name: 'Basic Plan',
      min_price: '5000',
      max_price: '14999',
      minr: '10',
      maxr: '15',
      expiration: '14 Days',
      increment_interval: '24 Hours',
      increment_type: 'Daily',
      increment_amount: '10'
    },
    {
      name: 'Premium Plan',
      min_price: '15000',
      max_price: '49999',
      minr: '15',
      maxr: '25',
      expiration: '30 Days',
      increment_interval: '24 Hours',
      increment_type: 'Daily',
      increment_amount: '15'
    },
    {
      name: 'VIP Plan',
      min_price: '50000',
      max_price: '999999',
      minr: '25',
      maxr: '40',
      expiration: '60 Days',
      increment_interval: '24 Hours',
      increment_type: 'Daily',
      increment_amount: '25'
    }
  ]
  
  const createdPlans = []
  for (const plan of defaultPlans) {
    const planId = await createPlan(plan)
    createdPlans.push({ id: planId, ...plan })
  }
  
  console.log('Default plans created:', createdPlans.length)
  return createdPlans
}

export const seedDefaultCopyTraders = async () => {
  const existingTraders = await getAllCopyTraders()
  if (existingTraders.length > 0) {
    console.log('Traders already exist, skipping seed')
    return existingTraders
  }
  
  const defaultTraders = [
    {
      name: 'Michael Chen',
      expertise: 'Forex & Crypto',
      win_rate: '87',
      total_roi: '245',
      followers: '1247',
      min_copy_amount: '100',
      status: 'active',
      verified: true,
      avatar: 'MC'
    },
    {
      name: 'Sarah Williams',
      expertise: 'Stock Trading',
      win_rate: '92',
      total_roi: '312',
      followers: '2134',
      min_copy_amount: '250',
      status: 'active',
      verified: true,
      avatar: 'SW'
    },
    {
      name: 'James Rodriguez',
      expertise: 'Options Trading',
      win_rate: '78',
      total_roi: '189',
      followers: '856',
      min_copy_amount: '500',
      status: 'active',
      verified: true,
      avatar: 'JR'
    },
    {
      name: 'Emma Thompson',
      expertise: 'Cryptocurrency',
      win_rate: '85',
      total_roi: '278',
      followers: '1523',
      min_copy_amount: '200',
      status: 'active',
      verified: true,
      avatar: 'ET'
    },
    {
      name: 'David Kim',
      expertise: 'Day Trading',
      win_rate: '81',
      total_roi: '198',
      followers: '945',
      min_copy_amount: '150',
      status: 'active',
      verified: true,
      avatar: 'DK'
    },
    {
      name: 'Lisa Martinez',
      expertise: 'Swing Trading',
      win_rate: '89',
      total_roi: '267',
      followers: '1689',
      min_copy_amount: '300',
      status: 'active',
      verified: true,
      avatar: 'LM'
    }
  ]
  
  const createdTraders = []
  for (const trader of defaultTraders) {
    const traderId = await createCopyTrader(trader)
    createdTraders.push({ id: traderId, ...trader })
  }
  
  console.log('Default copy traders created:', createdTraders.length)
  return createdTraders
}