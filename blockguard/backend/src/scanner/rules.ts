import { Finding, Severity } from '../types';

export interface ScannerRule {
  id: string;
  name: string;
  severity: Severity;
  description: string;
  attackScenario: string;
  impact: string;
  recommendation: string;
  check: (lines: string[], fullSource: string) => Finding[];
}

export const SCANNER_RULES: ScannerRule[] = [
  // Rule 1: Reentrancy
  {
    id: 'BG-001',
    name: 'Reentrancy Vulnerability',
    severity: 'CRITICAL',
    description: 'External calls (e.g., .call{value: ...}) execute before state variable changes, allowing malicious contracts to recursively call back and drain funds.',
    attackScenario: 'Attacker deploys an exploit contract with a fallback/receive function that calls withdraw() again before the victim contract decrements the balance.',
    impact: 'Catastrophic drain of contract Ether or tokens; complete loss of user deposits.',
    recommendation: 'Apply the Checks-Effects-Interactions pattern: update user balances and internal state BEFORE making any external ether transfer. Additionally, implement OpenZeppelin ReentrancyGuard nonReentrant modifier.',
    check: (lines: string[], fullSource: string) => {
      const findings: Finding[] = [];
      const funcRegex = /function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)[^{]*\{/g;
      let match;

      while ((match = funcRegex.exec(fullSource)) !== null) {
        const funcName = match[1];
        const funcStartIndex = match.index;
        
        // Find function body end
        let openBraces = 0;
        let funcEndIndex = -1;
        for (let i = funcStartIndex; i < fullSource.length; i++) {
          if (fullSource[i] === '{') openBraces++;
          if (fullSource[i] === '}') {
            openBraces--;
            if (openBraces === 0) {
              funcEndIndex = i;
              break;
            }
          }
        }

        if (funcEndIndex === -1) continue;
        const funcBody = fullSource.slice(funcStartIndex, funcEndIndex + 1);

        // Check if external call occurs before state decrement/mutation
        const callMatch = funcBody.search(/\.(call|transfer|send)\s*(\{[^}]*\})?\s*\(/);
        const stateMutationMatch = funcBody.search(/(\w+\[[^\]]+\]\s*(-=|\+=|=)|balances\[[^\]]+\]\s*(-=|=))/);

        if (callMatch !== -1 && stateMutationMatch !== -1 && callMatch < stateMutationMatch) {
          // Calculate line numbers
          const beforeCall = fullSource.slice(0, funcStartIndex + callMatch);
          const lineStart = beforeCall.split('\n').length;
          const lineEnd = lineStart + 4;
          const snippet = lines.slice(Math.max(0, lineStart - 2), Math.min(lines.length, lineEnd + 2)).join('\n');

          findings.push({
            id: `finding-reentrancy-${findings.length + 1}`,
            ruleId: 'BG-001',
            name: `Reentrancy in function '${funcName}()'`,
            severity: 'CRITICAL',
            lineStart,
            lineEnd,
            snippet,
            description: `Function '${funcName}' performs a low-level external call before updating contract balance/state.`,
            attackScenario: `An attacker exploits the fallback handler to re-invoke '${funcName}()' recursively, siphoning vault funds before balance reaches zero.`,
            impact: 'Complete drainage of pool or user balances.',
            recommendation: 'Update state balances prior to external call, or use a nonReentrant modifier.',
            suggestedFix: `// Remediation: Checks-Effects-Interactions\nbalances[msg.sender] -= amount;\n(bool success, ) = msg.sender.call{value: amount}("");\nrequire(success, "Transfer failed");`
          });
        }
      }

      return findings;
    }
  },

  // Rule 2: Missing Access Control
  {
    id: 'BG-002',
    name: 'Missing Access Control',
    severity: 'HIGH',
    description: 'Sensitive administrative or financial functions are publicly accessible without authentication modifiers like onlyOwner or hasRole.',
    attackScenario: 'Any arbitrary user or bot invokes the unrestricted function to change fees, drain treasury, or seize privileged variables.',
    impact: 'Unauthorized takeover, unauthorized fee manipulation, or theft of funds.',
    recommendation: 'Add proper access control modifiers (e.g., onlyOwner, onlyRole) to all state-changing administrative routines.',
    check: (lines: string[], fullSource: string) => {
      const findings: Finding[] = [];
      const sensitiveNames = /(setFee|setWithdrawalFee|setOwner|mint|drain|pause|withdrawAll|setAdmin)/i;

      lines.forEach((line, idx) => {
        if (/function\s+([a-zA-Z0-9_]+)/.test(line) && sensitiveNames.test(line)) {
          const isPublicOrExternal = /public|external/.test(line);
          const hasOwnerModifier = /onlyOwner|onlyRole|auth|restricted/.test(line);

          if (isPublicOrExternal && !hasOwnerModifier) {
            const lineNum = idx + 1;
            const snippet = lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 4)).join('\n');
            const match = line.match(/function\s+([a-zA-Z0-9_]+)/);
            const fnName = match ? match[1] : 'sensitiveFunction';

            findings.push({
              id: `finding-access-${findings.length + 1}`,
              ruleId: 'BG-002',
              name: `Missing Access Control on '${fnName}'`,
              severity: 'HIGH',
              lineStart: lineNum,
              lineEnd: lineNum + 2,
              snippet,
              description: `Administrative function '${fnName}' is declared public/external without access restriction.`,
              attackScenario: `Unauthenticated callers can directly execute '${fnName}' to modify critical parameters or seize protocol assets.`,
              impact: 'Arbitrary parameter tampering or asset loss.',
              recommendation: 'Restricted execution with onlyOwner or OpenZeppelin AccessControl modifier.',
              suggestedFix: `function ${fnName}(...) external onlyOwner {\n    // privileged logic\n}`
            });
          }
        }
      });

      return findings;
    }
  },

  // Rule 3: tx.origin Phishing
  {
    id: 'BG-003',
    name: 'Phishing Vulnerability via tx.origin',
    severity: 'HIGH',
    description: 'Authorization relies on tx.origin instead of msg.sender. In Solidity, tx.origin returns the original sender of the transaction across intermediate calls.',
    attackScenario: 'An attacker tricks the contract owner into calling a malicious contract, which in turn calls this contract. Because tx.origin is still the owner, the check passes.',
    impact: 'Unauthorized transfer of ownership, funds, or permissions via phishing.',
    recommendation: 'Always authenticate the immediate caller using msg.sender instead of tx.origin.',
    check: (lines: string[], _fullSource: string) => {
      const findings: Finding[] = [];

      lines.forEach((line, idx) => {
        if (/tx\.origin/.test(line) && /require|if|==/.test(line)) {
          const lineNum = idx + 1;
          const snippet = lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 2)).join('\n');

          findings.push({
            id: `finding-txorigin-${findings.length + 1}`,
            ruleId: 'BG-003',
            name: 'Insecure tx.origin Authentication',
            severity: 'HIGH',
            lineStart: lineNum,
            lineEnd: lineNum,
            snippet,
            description: 'Authentication relies on tx.origin, leaving the contract susceptible to proxy/phishing attacks.',
            attackScenario: 'Owner is tricked into interacting with an attacker contract which invokes this method. The check succeeds because tx.origin is the victim.',
            impact: 'Complete bypass of access control; theft of assets.',
            recommendation: 'Replace tx.origin with msg.sender for access control.',
            suggestedFix: line.replace(/tx\.origin/g, 'msg.sender')
          });
        }
      });

      return findings;
    }
  },

  // Rule 4: Unsafe External Calls
  {
    id: 'BG-004',
    name: 'Unchecked Low-Level External Call',
    severity: 'MEDIUM',
    description: 'Low-level calls like .call{value: ...}("") return a boolean success flag. Failing to check this flag causes silent transaction failure without reverting state.',
    attackScenario: 'External contract runs out of gas or deliberately reverts. The calling contract proceeds as if the transfer succeeded, leading to accounting desynchronization.',
    impact: 'State corruption, silent failure of fund transfers, loss of user accounting.',
    recommendation: 'Always capture and check the boolean return value: (bool success, ) = target.call(...); require(success, "Call failed");',
    check: (lines: string[], _fullSource: string) => {
      const findings: Finding[] = [];

      lines.forEach((line, idx) => {
        if (/\.call\{/.test(line) && !/(\(bool\s+\w+|require\s*\(.*\.call|if\s*\(.*\.call)/.test(line)) {
          const lineNum = idx + 1;
          const snippet = lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 2)).join('\n');

          findings.push({
            id: `finding-unsafecall-${findings.length + 1}`,
            ruleId: 'BG-004',
            name: 'Unchecked Low-Level Call',
            severity: 'MEDIUM',
            lineStart: lineNum,
            lineEnd: lineNum,
            snippet,
            description: 'External low-level call is invoked without inspecting the returned boolean status.',
            attackScenario: 'Transfer fails silently on recipient side while caller state updates as if funds were paid.',
            impact: 'Token or accounting mismatch; lost funds.',
            recommendation: 'Verify return value with require(success, "Transfer failed").',
            suggestedFix: `(bool success, ) = recipient.call{value: amount}("");\nrequire(success, "Transfer failed");`
          });
        }
      });

      return findings;
    }
  },

  // Rule 5: Arithmetic & Logic Issues
  {
    id: 'BG-005',
    name: 'Precision Loss in Arithmetic (Division Before Multiplication)',
    severity: 'MEDIUM',
    description: 'Performing division before multiplication in integer arithmetic leads to truncation and severe precision loss (often rounding down to 0).',
    attackScenario: 'When users claim rewards or yield, (amount / total) evaluates to 0 for amounts smaller than total, causing users to receive zero rewards while burning gas.',
    impact: 'Incorrect reward distribution, economic exploit, or zero payouts.',
    recommendation: 'Perform all multiplications first, then perform division at the very end: (amount * rate) / total.',
    check: (lines: string[], _fullSource: string) => {
      const findings: Finding[] = [];

      lines.forEach((line, idx) => {
        // Pattern: (a / b) * c or a / b * c
        if (/\([a-zA-Z0-9_]+\s*\/\s*[a-zA-Z0-9_]+\)\s*\*|\b[a-zA-Z0-9_]+\s*\/\s*[a-zA-Z0-9_]+\s*\*/.test(line)) {
          const lineNum = idx + 1;
          const snippet = lines.slice(Math.max(0, idx - 1), Math.min(lines.length, idx + 2)).join('\n');

          findings.push({
            id: `finding-arithmetic-${findings.length + 1}`,
            ruleId: 'BG-005',
            name: 'Division Precedes Multiplication',
            severity: 'MEDIUM',
            lineStart: lineNum,
            lineEnd: lineNum,
            snippet,
            description: 'Integer division before multiplication causes truncation to zero.',
            attackScenario: 'Calculations result in 0 whenever numerator < denominator in intermediate division step.',
            impact: 'Calculated values become 0 or severely undervalued.',
            recommendation: 'Multiply first, then divide: (amount * rate) / total.',
            suggestedFix: line.replace(/\(([a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)\)\s*\*\s*([a-zA-Z0-9_]+)/, '($1 * $3) / $2')
          });
        }
      });

      return findings;
    }
  }
];
