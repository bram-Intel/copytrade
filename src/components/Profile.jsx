import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import './Profile.css'

const Profile = () => {
  const { walletAddress } = useAuth()
  const { isConnected } = useAccount()
  const { t } = useTranslation()
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    country: 'United States',
    city: 'New York',
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  if (!isConnected) {
    return (
      <div className="profile-page">
        <div className="not-connected">
          <h2>{t('common.connectWalletPrompt')}</h2>
          <p>{t('common.connectWalletMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>{t('nav.profile')}</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              {profileData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="user-info">
              <h2>{profileData.name}</h2>
              <p className="wallet-address">
                {walletAddress?.substring(0, 10)}...{walletAddress?.substring(32)}
              </p>
            </div>
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={profileData.country}
                  onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group full-width">
                <label>City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            )}
          </form>
        </div>

        <div className="settings-card">
          <h3>Security Settings</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <strong>Two-Factor Authentication</strong>
              <p>Add an extra layer of security to your account</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={profileData.twoFactorEnabled}
                onChange={(e) => setProfileData({...profileData, twoFactorEnabled: e.target.checked})}
              />
              <span className="slider"></span>
            </label>
          </div>

          <h3>Notification Preferences</h3>

          <div className="setting-item">
            <div className="setting-info">
              <strong>Email Notifications</strong>
              <p>Receive transaction and account updates via email</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={profileData.emailNotifications}
                onChange={(e) => setProfileData({...profileData, emailNotifications: e.target.checked})}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <strong>SMS Notifications</strong>
              <p>Receive important alerts via SMS</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={profileData.smsNotifications}
                onChange={(e) => setProfileData({...profileData, smsNotifications: e.target.checked})}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
