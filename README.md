<div align="center">
  <h1>
    Clarity Studio
  </h1>

  <p align="center">
    The AI playground for Clarity smart contracts on Stacks — secured by Bitcoin.
  </p>

  <p align="center">
    <a href="https://claritystudio.app">claritystudio.app</a>
  </p>

  <br />
</div>

## ✨ Features

- **AI-Powered IDE** - Built-in Claude AI assistant that understands Clarity syntax, patterns, and best practices
- **Clarity Editor** - Monaco editor with Clarity syntax highlighting and autocomplete
- **Syntax Validation** - Instant feedback on Clarity errors before deployment
- **One-Click Deploy** - Deploy contracts to Stacks testnet with a pre-funded wallet
- **Contract Interface** - Auto-generated UI to call your deployed contract functions
- **Read-Only Calls** - Query contract state without spending STX
- **Deployment Dashboard** - Track all your testnet deployments
- **Project Sharing** - Share contracts with a public read-only link

## 🚀 Quick Start

1. Visit [claritystudio.app](https://claritystudio.app)
2. Sign in with email (magic link) or GitHub
3. Create a new project — starts with a Counter contract
4. Edit your Clarity code in the browser
5. Click **Check** to validate, then **Deploy** to testnet
6. Use the Contract Interface panel to call your functions

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Editor | Monaco Editor |
| Backend | Node.js/TypeScript (Express) |
| Blockchain | Stacks testnet via `@stacks/transactions` |
| AI | Claude (claude-sonnet-4-6) via streaming SSE |
| Auth | Supabase (email OTP + GitHub OAuth) |
| Database | Supabase PostgreSQL |

## 🔧 Local Development

### Prerequisites

- Node.js 20+
- npm

### Frontend

```bash
git clone https://github.com/tolgayayci/claritystudio
cd claritystudio
npm install
cp .env.example .env   # fill in Supabase + API URL
npm run dev
```

### Backend

```bash
cd stacks-backend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`, backend on `http://localhost:3001`.

### Environment Variables

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_URL=http://localhost:3001
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so
VITE_STACKS_EXPLORER_URL=https://explorer.hiro.so/?chain=testnet
```

## 📡 Backend API

The `stacks-backend` service (port 3001) handles all Stacks operations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/validate` | Clarity syntax validation |
| POST | `/deploy` | Deploy contract to testnet |
| GET | `/interface/:address/:name` | Fetch contract ABI |
| POST | `/call-read` | Call read-only function |
| GET | `/wallet/new` | Generate new STX wallet |
| POST | `/wallet/faucet` | Request testnet STX |
| GET | `/account/:address` | Get balance and nonce |
| POST | `/ai/chat` | AI chat (streaming SSE) |

## 🔗 Stacks Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Stacks Testnet Explorer](https://explorer.hiro.so/?chain=testnet)
- [Hiro API Docs](https://docs.hiro.so)
- [Clarinet — Local Clarity Development](https://docs.hiro.so/clarinet)

## 📄 License

MIT
