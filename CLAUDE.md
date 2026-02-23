# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start frontend development server with hot reload
- `npm run build` - Build frontend production version
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code linting

### Backend Development (Node.js/TypeScript)
- `cd stacks-backend && npm run dev` - Start the Stacks backend server (port 3001)
- `cd stacks-backend && npm run build` - Build backend for production
- `cd stacks-backend && npm start` - Run built backend

### Supabase
- `supabase login` - Authenticate with Supabase CLI
- `supabase link --project-ref <ref>` - Link to clarity-studio project
- `supabase db push` - Apply migrations to linked project
- `supabase db diff` - Generate migration from schema changes

## Project Architecture

**Clarity Studio** (claritystudio.app) is a browser-based IDE for writing, validating, and deploying Clarity smart contracts on the Stacks blockchain (Bitcoin Layer 2).

### Core Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js/TypeScript (Express) in `stacks-backend/`
- **UI**: Radix UI components with Tailwind CSS and shadcn/ui
- **Authentication**: Supabase Auth (email OTP + GitHub OAuth)
- **Database**: Supabase PostgreSQL (project: `clarity-studio`)
- **Code Editor**: Monaco Editor with Clarity syntax highlighting
- **Blockchain**: Stacks testnet via `https://api.testnet.hiro.so`
- **Analytics**: Google Analytics integration

### Application Structure

**Pages & Routing**:
- `/` - Public landing page (Clarity Studio branding)
- `/projects` - Protected projects dashboard (Projects + Deployments tabs)
- `/projects/:id` - Protected contract editor/IDE
- `/projects/:id/shared` - Public shared project view
- `/s/:token` - Short project share link

**Key Directories**:
- `src/pages/` - Main application pages
- `src/components/` - Reusable UI components organized by feature
- `src/lib/` - Core utilities, API clients, Stacks configuration
- `src/hooks/` - Custom React hooks
- `src/contexts/` - React contexts (StacksWalletContext, AuthContext)
- `stacks-backend/` - Node.js/TypeScript backend service
- `supabase/migrations/` - Database schema migrations

### Stacks/Clarity Integration Architecture
- **Single-file Contract Development**: One `.clar` file per project (no file explorer)
- **Validation Pipeline**: `stacks-backend` validates Clarity syntax via clarinet or basic check
- **Built-in Wallet**: Auto-generated testnet STX wallet stored in localStorage
- **Contract Deployment**: `@stacks/transactions` makeContractDeploy + broadcastTransaction
- **Method Calling**: Auto-generated interface from `/v2/contracts/interface` API

### stacks-backend API Endpoints (port 3001)
- `POST /validate` — Clarity syntax check (clarinet or basic)
- `POST /deploy` — Deploy contract to Stacks testnet
- `GET /interface/:address/:name` — Proxy to Hiro API contract interface
- `POST /call-read` — Call read-only contract function
- `GET /wallet/new` — Generate new STX testnet wallet (BIP39)
- `POST /wallet/faucet` — Request testnet STX from Hiro faucet
- `GET /account/:address` — Get STX balance and nonce

### Authentication & Data Flow
- Supabase Auth: email OTP + GitHub OAuth
- Protected routes via `PrivateRoute` component
- User projects stored in Supabase: code, clarity_version, deployments
- Wallet: auto-generated, persisted in localStorage as `clarity_studio_wallet`

### Configuration & Environment
- Environment variables in `.env.example` → copy to `.env`
- Stacks config in `src/lib/config.ts`
- Supabase client in `src/lib/supabase.ts`
- Backend URL: `VITE_API_URL` (default: `http://localhost:3001`)
- Path aliases: `@/*` maps to `src/*`

### Build & Deployment
- Frontend: Vite (target: claritystudio.app via Netlify)
- Backend: Node.js with ts-node-dev for dev, compiled JS for production
- Tailwind CSS for styling
- ESLint with React hooks + TypeScript rules

## Clarity Language Notes

### Key Characteristics
- **Interpreted** (not compiled to WASM) — source published on-chain
- **Decidable** — guaranteed to halt in finite steps
- **No reentrancy** — structurally impossible
- **LISP-styled syntax** with parentheses
- **Statically typed** with built-in overflow protection

### Contract Definitions
- `define-public` — Public state-changing functions
- `define-read-only` — Read-only query functions
- `define-data-var` — Persistent state variables
- `define-map` — Key-value data stores
- `define-constant` — Immutable constants
- `define-fungible-token` — SIP-010 fungible token
- `define-non-fungible-token` — SIP-009 NFT

### Stacks Testnet
- API: `https://api.testnet.hiro.so`
- Explorer: `https://explorer.hiro.so/?chain=testnet`
- Faucet: `POST https://api.testnet.hiro.so/extended/v1/faucets/stx?address={addr}`
- Contract addresses: `ST{address}.{contract-name}`
- Testnet STX addresses start with `ST`

### Deployment Flow
- User clicks Deploy → EditorPage calls `deployContract()` from `api.ts`
- `stacks-backend` POST /deploy → `makeContractDeploy` + `broadcastTransaction`
- Returns `{txId, contractAddress, explorerUrl}`
- Frontend saves deployment to Supabase `deployments` table
- Contract interface loaded via `GET /interface/:address/:name`

## Supabase Setup (for new developers)
1. Create project at supabase.com named `clarity-studio`
2. `supabase link --project-ref <ref>`
3. `supabase db push`
4. Enable GitHub OAuth in Auth > Providers > GitHub
5. Copy `.env.example` to `.env` and fill in values
