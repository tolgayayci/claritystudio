# Clarity Studio User Guide

A browser-based AI playground for Clarity smart contract development on Stacks. Write, validate, deploy, and interact with contracts — no local setup required.

## Getting Started

**Login Process:**
1. Click "Launch IDE" on the homepage
2. Enter your **email address** for a magic link, or click **Continue with GitHub**
3. Click the link sent to your email (or authorize on GitHub)
4. Automatic redirect to your projects dashboard

No passwords needed — secure magic link and OAuth authentication.

---

## Projects Dashboard

Your dashboard has two tabs:

- **Projects** — All your Clarity contracts with status, last activity, and deployment count
- **Deployments** — History of all contracts deployed to Stacks testnet

**Project actions:**
- **Open** — Launch the editor for that project
- **Rename / Edit description** — Inline edit
- **Delete** — Permanently remove project

---

## Editor Interface

The IDE has two main panels: **Editor** (left) and **Contract Interface** (right).

### Editor Panel

- **Clarity Syntax Highlighting** — Full language support for `.clar` files
- **Auto-save** — Changes saved automatically as you type
- **Manual Save** — Ctrl+S (Cmd+S on Mac)

**Action Buttons:**
- **Check** — Validate Clarity syntax (instant, no transaction)
- **Deploy** — Deploy contract to Stacks testnet

### Validation

Click **Check** to validate your Clarity code. The editor shows:
- Inline error markers with line numbers
- Error details in the output panel below
- Green checkmark on success

### Deploying a Contract

1. Your testnet wallet is auto-generated and pre-funded via the Hiro faucet
2. Click **Deploy**
3. Confirm the contract name
4. Transaction broadcasts to Stacks testnet
5. You get a transaction ID and contract address (`ST....contract-name`)
6. View on [Stacks Explorer](https://explorer.hiro.so/?chain=testnet)

---

## Contract Interface

After deployment, the Contract Interface panel automatically loads your contract's functions from the Hiro API.

**Function types:**
- **Read-only** (blue) — Query state, no STX required, instant result
- **Public** (orange) — Modify state, broadcasts a transaction

**How to call a function:**
1. Click the function name to expand it
2. Fill in any required parameters
3. Click **Call** (read-only) or **Invoke** (public)
4. See the response or transaction ID

---

## AI Assistant

The built-in AI chat panel understands Clarity syntax and Stacks concepts.

**What you can ask:**
- "What's wrong with my contract?"
- "How do I implement a SIP-010 fungible token?"
- "Explain the difference between `tx-sender` and `contract-caller`"
- "Write a simple NFT contract"

The AI has full context of Clarity language features, Stacks primitives, and common patterns.

---

## Wallet

Your testnet wallet is:
- **Auto-generated** on first use and stored in your browser
- **Pre-funded** — the app requests testnet STX from the Hiro faucet automatically
- **Testnet only** — safe for development, no real funds

Your `ST...` address is shown in the editor header.

---

## Sharing Projects

Click the **Share** button in the editor header to toggle public sharing.

- **Private** (default) — only you can see it
- **Public** — anyone with the link can view the code (read-only)

Share the `/projects/:id/shared` URL with others.

---

## Clarity Language Quick Reference

```clarity
;; Data variables
(define-data-var counter uint u0)

;; Public function (modifies state)
(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (ok (var-get counter))))

;; Read-only function (free to query)
(define-read-only (get-counter)
  (ok (var-get counter)))

;; Constants
(define-constant ERR_NOT_FOUND (err u404))

;; Maps
(define-map balances principal uint)
```

**Resources:**
- [Clarity Reference](https://docs.stacks.co/clarity)
- [Stacks Testnet Explorer](https://explorer.hiro.so/?chain=testnet)
- [Hiro API Docs](https://docs.hiro.so)

---

**Ready to build on Stacks? Start coding in seconds at [claritystudio.app](https://claritystudio.app)**
