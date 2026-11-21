import { Finding, AuditReport } from '../types';
import { SCANNER_RULES } from './rules';
import { calculateSourceHash, calculateReportHash } from '../services/hasher';

/**
 * Pure AST/pattern-based static analysis engine.
 * SECURITY GUARANTEE: NEVER executes or compiles arbitrary untrusted code.
 */
export function analyzeContract(sourceCode: string, contractName = 'SmartContract.sol'): AuditReport {
  const lines = sourceCode.split('\n');
  const findings: Finding[] = [];

  // Run all static rules
  for (const rule of SCANNER_RULES) {
    try {
      const results = rule.check(lines, sourceCode);
      findings.push(...results);
    } catch (err) {
      console.error(`Error running rule ${rule.id}:`, err);
    }
  }

  // Count severities
  const summary = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'CRITICAL').length,
    high: findings.filter(f => f.severity === 'HIGH').length,
    medium: findings.filter(f => f.severity === 'MEDIUM').length,
    low: findings.filter(f => f.severity === 'LOW').length,
    informational: findings.filter(f => f.severity === 'INFORMATIONAL').length,
  };

  // Compute security score (0-100)
  // Deductions: Critical: 30, High: 20, Medium: 10, Low: 5
  let score = 100;
  score -= summary.critical * 30;
  score -= summary.high * 20;
  score -= summary.medium * 10;
  score -= summary.low * 5;
  score = Math.max(0, Math.min(100, score));

  // Generate deterministic ID and hashes
  const sourceHash = calculateSourceHash(sourceCode);
  const auditId = 'audit-' + sourceHash.slice(2, 18);

  // Guarantee finding IDs are globally unique and scoped to this audit
  findings.forEach((f, idx) => {
    f.id = `${auditId}-f${idx + 1}`;
  });

  const reportHash = calculateReportHash({
    id: auditId,
    contractName,
    sourceHash,
    securityScore: score,
    findingsCount: findings.length,
  });

  return {
    id: auditId,
    contractName,
    sourceCode,
    sourceHash,
    reportHash,
    securityScore: score,
    createdAt: new Date().toISOString(),
    findings,
    summary,
    onChainStatus: {
      isRegistered: false,
    }
  };
}
