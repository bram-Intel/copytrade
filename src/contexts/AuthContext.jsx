import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { auth, db } from '../config/firebase'
import { signInAnonymously } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const { address, isConnected } = useAccount()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      if (isConnected && address) {
        try {
          // Sign in anonymously to Firebase (wallet address as identifier)
          const result = await signInAnonymously(auth)
          setUser(result.user)

          // Check if user exists in Firestore
          const userRef = doc(db, 'users', address)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            setUserData(userSnap.data())
          } else {
            // Create new user document
            const newUserData = {
              walletAddress: address,
              createdAt: new Date().toISOString(),
              balance: 0,
              portfolio: [],
              trades: [],
              followedTraders: []
            }
            await setDoc(userRef, newUserData)
            setUserData(newUserData)
          }
        } catch (error) {
          console.error('Authentication error:', error)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    }

    initAuth()
  }, [address, isConnected])

  const value = {
    user,
    userData,
    walletAddress: address,
    isAuthenticated: isConnected && user !== null,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
