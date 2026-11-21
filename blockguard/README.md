# 🛡️ BlockGuard — AI-Powered Smart Contract Security Assistant

> **Analyze · Understand · Fix · Verify**
> Cloudflare-grade static AST security scanner, AI remediation, and Avalanche Fuji on-chain integrity verification.

---

## 🌟 Key Architecture & Capabilities

1. **Zero-Execution Static Security Scanner (Backend):**
   - Untrusted user code is **never executed or compiled**.
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
   - Direct verification via explorer: [Snowtrace Fuji](https://testnet.snowtrace.io).

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

## 🌐 Production Cloud Deployment Guide

### Deploy Frontend to Vercel
1. Set Root Directory to `frontend`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://blockguard-api.onrender.com`).
   - `VITE_FUJI_RPC_URL`: `https://api.avax-test.network/ext/bc/C/rpc`.
   - `VITE_CONTRACT_ADDRESS`: Deployed `AuditRegistry` address.

### Deploy Backend to Render / Railway / Fly.io
1. Choose **Docker** or **Node.js Environment**.
2. Root Directory: `backend`.
3. Build Command: `npm install && npm run build`.
4. Start Command: `npm start`.
5. Environment Variables:
   - `PORT`: `3001`
   - `CORS_ORIGIN`: `*` (or your Vercel frontend URL).
   - `FUJI_RPC_URL`: `https://api.avax-test.network/ext/bc/C/rpc`.

---

## 🧪 Sample Demonstration Contracts

- `sample-contracts/VulnerableVault.sol`: Flawed contract triggering all 5 vulnerabilities (Score: ~0-20/100).
- `sample-contracts/SecureVault.sol`: Hardened contract resolving all issues (Score: 100/100).

Load either contract with 1-click inside the **New Audit** form!
