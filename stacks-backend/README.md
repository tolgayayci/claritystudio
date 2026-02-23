# Stacks Backend

Backend service for Clarity Studio providing Stacks smart contract operations on testnet.

## Features

- **Validate** - Syntax check Clarity smart contracts (uses clarinet if installed, falls back to basic checks)
- **Deploy** - Deploy Clarity contracts to Stacks testnet
- **Interface** - Fetch deployed contract ABI/interface
- **Call** - Call read-only contract functions
- **Wallet** - Generate new testnet wallets and request faucet STX
- **Account** - Query account balance and nonce

## Getting Started

```bash
npm install
npm run dev
```

The server starts on port 3001 by default.

## Environment

No environment variables required. The service uses the Stacks testnet by default (`https://api.testnet.hiro.so`).

Set `PORT` to change the listening port (default: 3001).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/validate` | Validate Clarity code |
| POST | `/deploy` | Deploy contract to testnet |
| GET | `/interface/:address/:name` | Get contract interface |
| POST | `/call-read` | Call read-only function |
| GET | `/wallet/new` | Generate new wallet |
| POST | `/wallet/faucet` | Request testnet STX |
| GET | `/account/:address` | Get account info |

## Build for Production

```bash
npm run build
npm start
```
