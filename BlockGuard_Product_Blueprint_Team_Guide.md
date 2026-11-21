# BlockGuard — Product Blueprint & Team Development Guide

## 1. Project Overview

- **Product name:** BlockGuard
- **Product type:** AI-Powered Smart Contract Security Assistant
- **Tagline:** Analyze · Understand · Fix · Verify
- **Goal:** Build a prototype that helps developers analyze Solidity smart contracts, understand potential vulnerabilities, receive remediation suggestions, re-analyze code after fixes, generate an audit report, and register the report's integrity hash on Avalanche Fuji Testnet.
- **Core problem:** Smart contract vulnerabilities can cause serious losses. Early-stage developers, students, and small teams may not have the budget or security expertise for professional audits, and existing findings can be difficult to understand or fix.
- **Target users:**
  - Solidity / blockchain developers
  - Web3 startups and small development teams
  - Students and beginner smart-contract developers

### Product value proposition

BlockGuard makes smart-contract security analysis more understandable and actionable through a workflow:

1. Submit Solidity source code.
2. Scan for supported vulnerability patterns.
3. Explain findings in plain language, including attack scenarios and impact.
4. Suggest safer code.
5. Re-analyze the updated contract.
6. Generate a report.
7. Register report-integrity proof on Avalanche Fuji.
8. Verify whether a report's integrity matches its registered hash.

**Important limitation:** BlockGuard is a prototype security assistant, not a replacement for a professional security audit. A clean scan does **not** prove that a contract is secure.

---

## 2. MVP Scope

### Must-have features

- Solidity code input by paste or file upload
- Static scan for a small, clearly defined set of vulnerability patterns
- Findings with severity, code evidence, location, explanation, attack scenario, impact, and recommendation
- AI-assisted explanation and remediation suggestions
- Suggested code / fix display
- Re-analysis after code changes
- Audit report and export
- Report/source hash generation
- Register an integrity proof on Avalanche Fuji Testnet
- Verify a report against its registered hash

### Supported vulnerability patterns for the prototype

The first version may focus on these patterns:

- **Reentrancy**
- **Missing Access Control**
- **`tx.origin` Authentication**
- **Unsafe External Calls**
- **Arithmetic / Logic Issues**

The scanner is pattern-based and limited to the implemented rules. Findings should include evidence and confidence where possible. Do not claim comprehensive vulnerability detection.

### Out of scope unless the core MVP is completed

- Full professional-grade audit coverage
- Automatic execution of user-submitted code
- Complex multi-contract / dependency analysis
- Guaranteed secure automatic fixes
- Storing source code or full reports directly on-chain

---

## 3. Product Principles

- **Security-first:** Do not execute user-submitted contract code.
- **Evidence-based:** Each finding should be linked to code evidence and a location.
- **Actionable:** Explain the issue and provide a practical recommendation.
- **Transparent:** Show scanner limitations and avoid overstating confidence.
- **Understandable:** Use beginner-friendly explanations in addition to technical detail.
- **Integrity, not storage:** Blockchain records hashes and verification metadata, not source code or the complete report.
- **Honest states:** Never display successful analysis, remediation, or blockchain registration unless the operation actually succeeded.

---

## 4. Sitemap / Application Structure

### Public pages

- **Landing Page**
  - Product overview
  - Features
  - How it works
  - Supported vulnerability categories
  - CTA to start an audit
  - CTA to view a demo

### Application pages

- **Dashboard**
- **New Audit**
- **Processing**
- **Audit Report**
- **Finding Detail**
- **AI Remediation**
- **Audit Verification / Register Proof**
- **Verify Report**
- **Audit History**
- **Settings** (optional for MVP)

### MVP priority

**P0 — Build first**
- Landing Page
- Dashboard
- New Audit
- Processing state
- Audit Report
- Finding Detail / Remediation
- Audit Verification / Register Proof

**P1 — If time allows**
- Verify Report
- Audit History

**P2 — Optional**
- Settings and other enhancements

---

## 5. Design System

### Visual direction

Dark security-focused SaaS dashboard. Professional, modern, readable, and developer-oriented.

### Suggested colors

| Token | Hex |
|---|---|
| Background | `#0B0F19` |
| Surface | `#111827` |
| Elevated Surface | `#182234` |
| Border | `#263247` |
| Primary | `#6366F1` |
| Accent | `#22D3EE` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Main Text | `#F8FAFC` |
| Secondary Text | `#94A3B8` |

### Typography

- UI: Inter or Geist Sans
- Code: JetBrains Mono or Fira Code

### Components

- Card radius: approximately 12px
- Button radius: approximately 8px
- Dark panels and subtle borders
- Code editor with line numbers and syntax highlighting
- Severity badges with consistent colors
- Desktop-first layout; responsive behavior for smaller screens

### Suggested desktop layout

- Sidebar: approximately 240px
- Main content padding: approximately 32px
- Application shell: sidebar + top navigation + main content

---

## 6. Wireframe Specifications

These descriptions are intended to be implementation-ready so teammates can vibe-code separate modules without changing the shared product direction.

### 6.1 Landing Page

**Purpose:** Explain the product and guide visitors into the audit workflow.

**Layout:**

1. **Navbar**
   - BlockGuard logo
   - Features
   - How It Works
   - Security / Limitations
   - Connect Wallet (optional; wallet may only be needed later)

2. **Hero**
   - Headline: “Secure your smart contracts before they go live.”
   - Supporting text: BlockGuard analyzes Solidity code, explains potential vulnerabilities, suggests fixes, and helps verify report integrity.
   - Primary CTA: **Start Security Audit**
   - Secondary CTA: **Explore Demo**
   - Product preview: dashboard/report mockup

3. **How It Works**
   - Step 1: Submit Contract
   - Step 2: Analyze Vulnerabilities
   - Step 3: Understand & Fix
   - Step 4: Verify Report

4. **Supported Vulnerabilities**
   - Reentrancy
   - Access Control
   - `tx.origin`
   - Unsafe External Calls
   - Arithmetic / Logic Issues

5. **Limitations / Security Disclaimer**
   - Prototype analysis is limited to implemented rules.
   - AI suggestions require developer review.
   - The tool is not a professional audit.

6. **Footer**
   - Product links
   - GitHub / documentation if available
   - Disclaimer

**Interactions:**
- Start Security Audit → `/app/audit/new`
- Explore Demo → open a prepared sample report

---

### 6.2 Application Shell

**Sidebar:**
- Dashboard
- New Audit
- Audit History
- Verify Report
- Settings (optional)

**Bottom sidebar area:**
- Wallet status
- Network status (Fuji)
- User / settings area if implemented

**Top navigation:**
- Current page title
- Network badge
- Wallet button
- Optional search

**Wallet states:**
- Disconnected
- Connected (show shortened address)
- Wrong network
- Transaction pending
- Transaction success / failure

Wallet functionality should be implemented only where required. The audit workflow itself should not require a wallet until blockchain proof registration or verification.

---

### 6.3 Dashboard

**Purpose:** Give users an overview and entry point to audits.

**Top section:**
- Page title: Dashboard
- Short description
- **New Audit** CTA

**Stats cards:**
- Total Audits
- Critical Findings
- Verified Reports
- Contracts Analyzed (optional)

**Security Overview:**
- Overall / latest security score visualization
- Clear label that the score is a prototype indicator, not a formal security rating

**Vulnerability Distribution:**
- Breakdown by severity or vulnerability category

**Recent Audits table:**
- Project
- Contract
- Security Score
- Findings
- Audit Status
- Date
- View Report action

**States:**
- Empty state with CTA
- Loading
- Error
- Populated dashboard

---

### 6.4 New Audit Page

**Purpose:** Collect contract information and source code before analysis.

**Form fields:**
- Project Name
- Contract Name
- Network (prototype can default to Ethereum-compatible / Fuji context; clearly indicate analysis network if relevant)
- Solidity Version (detect from `pragma`, allow edit if needed)
- Source File Name

**Code input area:**
- Tabs: **Paste Code** / **Upload File** / **Sample Contract**
- Code editor with syntax highlighting and line numbers
- Upload `.sol` file
- Sample contracts:
  - `VulnerableVault.sol`
  - `VulnerableToken.sol`
  - `SecureVault.sol`

**Analysis options:**
- Static Analysis
- AI Explanation
- Remediation Suggestions

**Actions:**
- Analyze Contract
- Cancel / Back to Dashboard

**Validation:**
- Required fields
- Non-empty Solidity source
- File type / size checks
- Handle invalid or unsupported input

**On submit:**
- Create an audit record
- Navigate to Processing state

---

### 6.5 Processing Page / State

**Purpose:** Communicate analysis progress honestly.

**Progress steps:**
1. Source received
2. Input validation
3. Static analysis
4. AI analysis
5. Findings generation
6. Report generation

Show:
- Current step
- Progress indicator
- Audit ID
- Helpful status text

**Error state:**
- Explain what failed
- Retry
- Return to editor / dashboard

Do not fake progress or claim completion before the backend returns a result.

---

### 6.6 Audit Report Page

**Purpose:** Present the overall analysis and findings.

**Header:**
- Project Name
- Contract Name
- Audit ID
- Audit Date
- Status
- Actions:
  - Re-analyze
  - Export Report
  - Register On-chain Proof

**Overview:**
- Prototype security score
- Risk level
- Summary
- Counts by severity:
  - Critical
  - High
  - Medium
  - Low
  - Informational

**Findings section:**
- Findings list / cards
- Severity badge
- Vulnerability category
- Function / line location
- Short description
- View Details

**Filters:**
- All
- Critical
- High
- Medium
- Low
- Informational

**Sorting:**
- Severity
- Line number

**Audit metadata:**
- Source hash
- Compiler version
- Scan date
- Scanner / prototype version

**Score disclaimer:**
Any score bands are internal prototype indicators, not an industry-standard security score. Example bands, if used:
- 90–100: Low
- 75–89: Moderate
- 50–74: High
- 0–49: Critical

Do not let a score imply that a contract is secure.

---

### 6.7 Finding Detail

Can be a right-side panel or a dedicated page.

**Information:**
- Finding title
- Severity
- Category
- Confidence
- File
- Function
- Start / end line
- Evidence code snippet (highlight relevant lines)
- Description
- Attack scenario
- Potential impact
- Recommendation

**Actions:**
- Generate Fix
- Copy Suggested Code
- Apply to Editor
- Re-analyze

**Finding status:**
- Open
- Fix Suggested
- Not Detected in Re-analysis
- Accepted

---

### 6.8 AI Remediation

**Purpose:** Show a proposed change and let the developer inspect it.

**Layout:**
- Original code
- Suggested code
- Diff or side-by-side view
- Explanation of:
  - What changed
  - Why it may be safer
  - Assumptions
  - Remaining risks

**Actions:**
- Copy Suggested Code
- Apply to Editor
- Re-analyze

**Important:** Do not say a suggested fix is guaranteed secure. The user must review it.

---

### 6.9 Re-analysis

After a code change, create a **new audit record** rather than silently overwriting the original.

Show:
- Previous score / findings
- New score / findings
- Findings no longer detected
- New findings
- Remaining findings

Use wording such as **“Not detected in re-analysis”**, not **“secure”** or **“fixed with certainty.”**

---

### 6.10 Audit Verification / Register Proof

**Purpose:** Register report integrity metadata on Avalanche Fuji.

**Show:**
- Audit ID
- Source Hash
- Report Hash
- Network: Avalanche Fuji Testnet
- Chain ID: `43113`
- Auditor Wallet Address
- Registration status

**Explain what is stored on-chain:**
- Audit ID
- Source hash
- Report hash
- Auditor address
- Timestamp / block metadata

**Not stored on-chain:**
- Source code
- Full audit report

**Actions:**
- Connect Wallet
- Switch to Fuji Testnet if necessary
- Register Proof

**States:**
- Wallet disconnected
- Wrong network
- Ready to register
- Transaction pending
- Registered successfully
- Transaction failed

On success, show:
- Transaction hash
- Block number (if available)
- Explorer link
- Registered hashes

Never hardcode transaction success.

---

### 6.11 Verify Report Page

**Purpose:** Verify whether a report matches the hash registered on-chain.

**Inputs:**
- Upload report file (JSON preferred; PDF only if supported by a reliable extraction flow)
- Audit ID

**Process:**
1. Read report
2. Calculate report hash
3. Query registry contract
4. Compare submitted hash with registered hash

**Results:**
- **Valid:** hashes match
- **Mismatch:** hashes differ
- **Not Registered:** no matching audit record
- **Error:** verification could not be completed

Show submitted hash and registered hash when available.

---

### 6.12 Audit History

**Purpose:** Find and reopen previous audits.

**Table columns:**
- Project
- Contract
- Date
- Score
- Findings
- Audit Status
- Blockchain Status
- View

**Controls:**
- Search by project / contract
- Filter by status or severity
- Sort by date

Keep **Audit Status** and **Blockchain Verification Status** separate.

---

## 7. User Flows

### Flow A — First-time audit

1. Landing Page
2. Click **Start Security Audit**
3. Dashboard
4. Click **New Audit**
5. Enter project / contract details
6. Paste or upload Solidity code, or select a sample
7. Validate input
8. Click **Analyze Contract**
9. Processing
10. Audit Report
11. Open a finding
12. Review evidence, attack scenario, impact, and recommendation
13. Generate Fix
14. Review suggested code
15. Apply code to editor
16. Re-analyze
17. Compare previous and new results
18. Register proof on-chain
19. Connect wallet
20. Approve transaction on Fuji
21. Show transaction hash and verified registration

### Flow B — Returning user

1. Dashboard
2. Open a recent audit
3. View report
4. Open finding / remediation
5. Re-analyze or register proof
6. Export report if needed

### Flow C — Verify a report

1. Open Verify Report
2. Upload report
3. Enter Audit ID
4. Calculate report hash
5. Query Avalanche registry
6. Compare hashes
7. Display Valid / Mismatch / Not Registered / Error

---

## 8. Shared Data Model

All teammates should use the same schema. Do not independently rename fields or invent incompatible response structures.

### Audit

```ts
type AuditStatus = "pending" | "processing" | "completed" | "failed";

type BlockchainVerificationStatus =
  | "not_registered"
  | "pending"
  | "verified"
  | "failed";

interface Audit {
  id: string;
  projectName: string;
  contractName: string;
  fileName: string;
  sourceCode: string;
  sourceHash: string;
  compilerVersion: string;
  network: string;
  status: AuditStatus;
  securityScore: number | null;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  findings: Finding[];
  reportHash: string | null;
  blockchainVerification: BlockchainVerificationStatus;
  txHash: string | null;
  blockNumber: number | null;
  auditorAddress: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Finding

```ts
type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "informational";

type FindingCategory =
  | "reentrancy"
  | "access_control"
  | "tx_origin"
  | "unsafe_external_call"
  | "arithmetic"
  | "other";

type FindingStatus =
  | "open"
  | "fix_suggested"
  | "not_detected"
  | "accepted";

interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  confidence: number;
  location: {
    fileName: string;
    functionName: string | null;
    startLine: number;
    endLine: number;
  };
  evidence: string;
  description: string;
  attackScenario: string;
  impact: string;
  recommendation: string;
  fixedCode: string | null;
  status: FindingStatus;
}
```

### Audit Report

```ts
interface AuditReport {
  auditId: string;
  projectName: string;
  contractName: string;
  securityScore: number;
  riskLevel: string;
  summary: string;
  findings: Finding[];
  sourceHash: string;
  reportHash: string;
  generatedAt: string;
  blockchainProof?: {
    network: string;
    contractAddress: string;
    txHash: string;
    blockNumber: number;
  };
}
```

---

## 9. API Contract

Backend and frontend should agree on these endpoints before parallel development.

### Create Audit

`POST /api/audits`

Request:

```json
{
  "projectName": "Demo Project",
  "contractName": "VulnerableVault",
  "fileName": "VulnerableVault.sol",
  "sourceCode": "contract source...",
  "compilerVersion": "0.8.20",
  "network": "avalanche-fuji"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "auditId": "audit_123",
    "status": "processing"
  }
}
```

### Get Audit

`GET /api/audits/:auditId`

Returns audit status, report, findings, and metadata.

### Re-analyze

`POST /api/audits/:auditId/reanalyze`

Request:

```json
{
  "sourceCode": "updated contract source..."
}
```

Creates a **new audit**; do not overwrite the old audit.

### Generate Fix

`POST /api/audits/:auditId/findings/:findingId/fix`

Request:

```json
{
  "sourceCode": "current source code..."
}
```

Response should contain:
- `fixedCode`
- `explanation`
- `changes`
- assumptions / limitations if available

### Register Proof

`POST /api/audits/:auditId/proof`

Suggested request:

```json
{
  "sourceHash": "0x...",
  "reportHash": "0x...",
  "auditorAddress": "0x..."
}
```

The actual wallet transaction should be approved by the user. Frontend wallet integration may call the smart contract directly; backend may record status if needed.

### Verify

`POST /api/verify`

Request:

```json
{
  "auditId": "audit_123",
  "reportHash": "0x..."
}
```

Response should indicate:
- verified / mismatch / not registered
- registered report hash
- submitted report hash
- relevant transaction metadata, if available

### Error format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SOURCE",
    "message": "The submitted Solidity source is invalid."
  }
}
```

---

## 10. Repository Structure

Use a shared repository and clear module boundaries.

```text
blockguard/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── ui/
│       │   ├── audit/
│       │   ├── findings/
│       │   └── wallet/
│       ├── pages/
│       │   ├── LandingPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── NewAuditPage.tsx
│       │   ├── ProcessingPage.tsx
│       │   ├── AuditReportPage.tsx
│       │   ├── VerifyPage.tsx
│       │   └── HistoryPage.tsx
│       ├── services/
│       │   ├── auditService.ts
│       │   ├── verificationService.ts
│       │   └── walletService.ts
│       ├── types/
│       │   ├── audit.ts
│       │   └── finding.ts
│       └── ...
├── backend/
│   └── src/
│       ├── routes/
│       │   ├── auditRoutes.ts
│       │   └── verificationRoutes.ts
│       ├── services/
│       │   ├── scannerService.ts
│       │   ├── aiService.ts
│       │   ├── remediationService.ts
│       │   └── reportService.ts
│       ├── scanner/
│       │   ├── rules/
│       │   └── scanner.ts
│       ├── knowledge/
│       │   └── vulnerabilities.json
│       └── types/
│           └── audit.ts
├── contracts/
│   ├── AuditRegistry.sol
│   ├── scripts/
│   └── test/
├── sample-contracts/
│   ├── VulnerableVault.sol
│   └── SecureVault.sol
├── docs/
│   ├── product-blueprint.md
│   ├── api-contract.md
│   └── demo-flow.md
├── README.md
└── .env.example
```

### Suggested stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Routing: React Router
- Code editor: Monaco Editor (or simpler editor if time is limited)
- Backend: Node.js + Express + TypeScript
- AI: LLM API, with API key kept on backend
- Blockchain: Solidity + Hardhat or Foundry
- Wallet integration: ethers.js
- Network: Avalanche Fuji Testnet, Chain ID `43113`

---

## 11. Team Division

### Teammate 1 — UI/UX + Frontend

**Owns:**
- Design system and application shell
- Landing Page
- Dashboard
- New Audit form
- Code editor / upload
- Processing state
- Audit Report
- Finding Detail
- Remediation UI
- Re-analysis comparison
- Wallet connection UI
- Verify Report page if time allows
- API integration

**Must follow:**
- Shared data schema
- Shared API contract
- Consistent design tokens
- All buttons and navigation should work
- Include loading, empty, success, and error states
- Use schema-matching mock data only while backend is unavailable

### Teammate 2 — AI + Backend

**Owns:**
- Backend setup
- Static scanner
- Vulnerability rules
- AI explanation
- Attack scenario and impact
- Remediation suggestions
- Report generation
- Hash generation
- Audit / re-analysis APIs
- Validation and error handling

**Security requirements:**
- Never execute user-submitted code
- Validate source size and format
- Keep API secrets on backend
- Handle malformed AI output
- Use structured JSON responses
- Do not promise comprehensive detection
- Make scanner evidence traceable to source code

### Teammate 3 — Blockchain

**Owns:**
- `AuditRegistry.sol`
- Register audit proof
- Verify registered proof
- Contract tests
- Fuji deployment
- ABI and deployed address
- Wallet connection / chain switching support
- Transaction states and explorer link

**Contract concept:**
- `registerAudit(auditId, sourceHash, reportHash)`
- `verifyAudit(auditId, reportHash)`
- `getAudit(auditId)`
- Event: `AuditRegistered`

Store integrity metadata, not source code or full reports. Use Chain ID `43113` for Fuji.

### Teammate 4 — Product / QA / Demo (if available)

**Owns:**
- Vulnerability research and rule test cases
- Sample vulnerable and fixed contracts
- Product documentation
- Demo script
- Pitch / presentation
- Integration testing
- UI and API QA
- Backup demo assets

### Integration Owner

One person should coordinate integration and be responsible for:
- Merging modules
- Maintaining shared schema
- Resolving API / ABI mismatches
- End-to-end testing
- Deployment
- Final demo readiness

---

## 12. Integration Rules

1. **Use one shared repository.**
2. Agree on the data schema and API contract before coding separate modules.
3. Do not independently rename or change shared fields.
4. Frontend mock data must use the exact shared schema.
5. Backend should return the agreed structure.
6. Blockchain module should provide ABI, deployed address, and documented functions.
7. Every page must support appropriate idle / loading / success / empty / error states.
8. Do not hardcode successful blockchain transactions.
9. Keep audit status separate from blockchain verification status.
10. Create new audit records for re-analysis; do not silently overwrite.
11. Commit frequently and use feature branches.
12. Integrate early rather than waiting until all modules are “finished.”

### Suggested branches

- `feature/ui-dashboard`
- `feature/audit-scanner`
- `feature/ai-analysis`
- `feature/avalanche-registry`

---

## 13. Prompt Templates for Vibe Coding

### Prompt A — Frontend teammate

> Build the BlockGuard frontend based on the shared Product Blueprint. Use React, Vite, TypeScript, Tailwind, and React Router. Follow the design system, sitemap, wireframes, user flows, and shared data schema exactly. Implement the Landing Page, application shell, Dashboard, New Audit, Processing, Audit Report, Finding Detail, Remediation, Re-analysis, Audit Verification, and Verify Report as time allows. Use mock data that follows the shared schema while the API is unavailable. Keep API calls inside service modules. All navigation and buttons must work. Include loading, empty, error, and success states. Do not hardcode successful blockchain registration. Deliver working source code, setup instructions, and `.env.example`.

### Prompt B — AI / Backend teammate

> Build BlockGuard’s backend using Node.js, Express, and TypeScript. Follow the shared API contract and data schema. Implement a pattern-based Solidity scanner for the agreed MVP vulnerabilities, evidence and line locations, structured findings, AI explanations, attack scenarios, impact, recommendations, remediation suggestions, report generation, hashing, audit creation, retrieval, and re-analysis. Never execute user-submitted source code. Validate inputs, limit source size, keep API keys on the backend, handle malformed AI responses, and return consistent error objects. Clearly communicate scanner limitations. Deliver endpoints, sample responses, tests, setup instructions, and `.env.example`.

### Prompt C — Blockchain teammate

> Build BlockGuard’s Avalanche Fuji Testnet integrity registry. Implement and test `AuditRegistry.sol` with functions to register an audit ID and source/report hashes, retrieve the audit, and verify a submitted report hash. Emit an `AuditRegistered` event. Deploy to Fuji (Chain ID 43113), and provide the ABI, deployed address, deployment instructions, tests, and frontend integration guidance. The contract must store hashes and metadata only—not source code or full reports. The frontend must request wallet approval and show real transaction states; never fake success.

### Prompt D — Integration / QA teammate

> Integrate the frontend, backend, and blockchain modules using the shared schema and API contract. Test the complete user flow: submit Solidity source → analyze → view findings → generate remediation → re-analyze → generate report → register report hash on Fuji → verify report. Fix broken navigation, API/ABI mismatches, invalid states, and errors. Ensure there are no hardcoded successful transactions or exposed API keys. Confirm responsive layout and provide a final QA checklist, setup/deployment guide, and known limitations.

---

## 14. Demo Scenario

Use a prepared sample contract with a few real, supported issues and a corresponding safer version.

### Suggested sample

`VulnerableVault.sol` containing a clearly demonstrable:
- Reentrancy issue
- Missing access control
- `tx.origin` authentication (if implemented in the scanner)

Keep the sample aligned with the scanner’s actual rules. Do not include findings the scanner cannot detect.

### Demo sequence

1. Landing Page
2. Start Audit
3. New Audit
4. Load sample contract
5. Analyze
6. Show report and severity summary
7. Open a finding
8. Explain evidence, attack scenario, impact, recommendation
9. Generate suggested fix
10. Show code diff
11. Apply / paste fix
12. Re-analyze
13. Show changed findings
14. Register report proof
15. Connect wallet and approve Fuji transaction
16. Show transaction hash / explorer
17. Verify report hash

### Backup plan

If the AI service or testnet is unavailable:
- Use a prepared sample report
- Use pre-generated remediation code
- Keep a real Fuji transaction proof if one has been registered beforehand
- Clearly label which parts are live and which are sample/demo data

---

## 15. Final MVP Checklist

### Product
- [ ] Product story and value proposition are clear
- [ ] Scope is limited to implementable MVP features
- [ ] Limitations are visible

### Frontend
- [ ] Landing Page
- [ ] Dashboard
- [ ] New Audit
- [ ] Processing
- [ ] Audit Report
- [ ] Finding Detail
- [ ] Remediation
- [ ] Re-analysis
- [ ] Audit Verification
- [ ] Verify Report (if time)
- [ ] Navigation works
- [ ] Loading / empty / error / success states

### Backend
- [ ] Source validation
- [ ] Scanner rules
- [ ] Findings include evidence and location
- [ ] AI response is structured
- [ ] Remediation endpoint
- [ ] Audit retrieval
- [ ] Re-analysis creates a new audit
- [ ] Report generation
- [ ] Hash generation
- [ ] Error handling
- [ ] API secrets protected

### Blockchain
- [ ] Contract tests
- [ ] Fuji deployment
- [ ] ABI and address shared
- [ ] Wallet connection
- [ ] Chain ID validation
- [ ] Register proof
- [ ] Verify proof
- [ ] Real transaction status
- [ ] Explorer link

### Integration / Demo
- [ ] All modules use shared schema
- [ ] End-to-end workflow tested
- [ ] No fake success states
- [ ] Demo sample contract prepared
- [ ] Backup report prepared
- [ ] Known limitations documented
- [ ] README and setup instructions complete

---

## 16. Team Alignment Message

> We thống nhất phát triển theo Product Blueprint này. Mọi người đọc kỹ scope, wireframe, user flow, data schema và API contract trước khi vibe code từng module. MVP core là: nhập Solidity code → scan 3–5 vulnerability patterns → AI giải thích + đề xuất fix → re-analyze → report → đăng ký report integrity proof trên Avalanche Fuji → verify hash. Frontend có thể dùng mock data nhưng phải đúng schema trong lúc backend đang phát triển. Không tự thêm feature ngoài scope trước khi core flow chạy end-to-end. Mục tiêu là một sản phẩm demo hoàn chỉnh, các module tích hợp được với nhau, không phải những màn hình/code rời rạc.

---

## 17. Critical Notes

- Scanner coverage is limited; report the actual rules implemented.
- AI explanations and fixes are suggestions, not guarantees.
- A score is a prototype indicator and must not be presented as a formal standard.
- “Not detected” is not equivalent to “secure.”
- Re-analysis should preserve previous audit records.
- Blockchain registration verifies integrity of hashes, not the correctness or security of the audit.
- Source code and full report should not be placed on-chain.
- Never fake a completed scan, AI fix, wallet transaction, or verification result.
