# 🛡️ BlockGuard — AI-Powered Smart Contract Security Assistant

> **Analyze · Understand · Fix · Verify**  
> Cloudflare-grade static AST security scanner, AI remediation, and Avalanche Fuji on-chain integrity verification.

[![Avalanche Fuji](https://img.shields.io/badge/Blockchain-Avalanche%20Fuji-E84142?style=for-the-badge&logo=avalanche)](https://testnet.snowtrace.io/address/0x5352613D4164b18E5094251785501C110d7C9246)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Backend-TypeScript%20%2B%20Express-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Contract-Solidity%200.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)

---

## 🌟 Key Architecture & Capabilities

1. **Zero-Execution Static Security Scanner (Backend):**
   - Untrusted user code is **never executed or compiled**, protecting server infrastructure.
   - Pattern-based AST analysis covers the top 5 high-impact vulnerability vectors:
     - **BG-001: Reentrancy** (Checks-Effects-Interactions violation)
     - **BG-002: Missing Access Control** (Unprotected administrative functions)
     - **BG-003: tx.origin Phishing** (Insecure caller validation)
     - **BG-004: Unsafe External Calls** (Unchecked low-level call return flags)
     - **BG-005: Arithmetic Precision Loss** (Division before multiplication)
2. **AI Remediation & Split Diff Viewer (Frontend):**
   - Side-by-side visual diff of vulnerable vs. secure code.
   - 1-Click "Apply Fix & Re-Audit" workflow.
3. **Avalanche Fuji On-Chain Integrity Registry (Smart Contract):**
   - Records immutable cryptographic hashes (`sourceHash` and `reportHash`) on Avalanche Fuji Testnet (Chain ID `43113`).
   - Does **NOT** store plaintext source code or raw reports on chain.
   - Direct verification via explorer: [Snowtrace Fuji](https://testnet.snowtrace.io/address/0x5352613D4164b18E5094251785501C110d7C9246).

---

## 📁 Repository Structure

```text
.
├── blockguard/
│   ├── backend/               # Express + TypeScript Security Scanner & API
│   │   ├── src/scanner/       # AST & Regex Vulnerability Detection Engine
│   │   ├── src/services/      # Fuji Blockchain Client & Hash Integrity Service
│   │   └── Dockerfile
│   ├── contracts/             # Hardhat Avalanche Fuji Smart Contract Project
│   │   ├── contracts/         # AuditRegistry.sol
│   │   └── scripts/           # Deployment script with automatic ABI sync
│   ├── frontend/              # React 18 + Vite + TailwindCSS Web Application
│   │   ├── src/components/    # Code editor, Diff Viewer, Report Generator, Verify
│   │   └── Dockerfile
│   ├── sample-contracts/      # Vulnerable & Remediated Solidity test contracts
│   ├── test-suite/            # End-to-end and security attack simulations
│   └── docker-compose.yml     # Full-stack container orchestration
└── README.md                  # Project Documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 18
- npm >= 9
- (Optional) Docker & Docker Compose
- (Optional) MetaMask browser extension

### 2. One-Step Docker Deployment
```bash
cd blockguard
docker compose up --build
```
- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
- **Health Check:** `http://localhost:3001/health`

---

## 🛠️ Manual Step-by-Step Run

### Step A: Backend Setup
```bash
cd blockguard/backend
npm install
npm run build
npm start # or npm run dev for live reload
```
API runs on `http://localhost:3001`.

### Step B: Frontend Setup
```bash
cd blockguard/frontend
npm install
npm run build
npm run preview # or npm run dev for hot reload
```
Access UI on `http://localhost:3000`.

### Step C: Deploy Smart Contract to Avalanche Fuji
1. Configure `blockguard/contracts/.env`:
   ```env
   FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   FUJI_PRIVATE_KEY=your_private_key_without_0x
   ```
2. Get free testnet AVAX from the official faucet: [faucet.avax.network](https://faucet.avax.network)
3. Deploy:
   ```bash
   cd blockguard/contracts
   npm install
   npm run compile
   npx hardhat run scripts/deploy.ts --network fuji
   ```
   *The script will output the deployed contract address and sync the ABI to both Frontend and Backend automatically!*

---

## 🔒 Security & Privacy Notice
- **Non-Execution Model:** BlockGuard does not run untrusted smart contracts; analysis is strictly static.
- **On-chain Integrity:** Only SHA-256 / Keccak-256 hashes are anchored to Avalanche Fuji; no private source code or intellectual property is pushed to the public ledger.
