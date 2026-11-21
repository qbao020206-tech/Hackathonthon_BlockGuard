import { Finding } from '../types';

export interface RemediationDiff {
  findingId: string;
  originalSnippet: string;
  remediatedSnippet: string;
  explanation: string;
  whySafer: string[];
}

export function generateRemediation(finding: Finding): RemediationDiff {
  let originalSnippet = finding.snippet;
  let remediatedSnippet = finding.suggestedFix;
  let explanation = '';
  let whySafer: string[] = [];

  switch (finding.ruleId) {
    case 'BG-001':
      explanation = 'Replaced the vulnerable reentrant pattern with the Checks-Effects-Interactions (CEI) design pattern and added nonReentrant protection.';
      whySafer = [
        'User balance is deducted BEFORE any external call is initiated.',
        'Prevents recursive fallback calls from siphoning additional funds.',
        'Uses nonReentrant mutex lock to block concurrent function entries.'
      ];
      break;

    case 'BG-002':
      explanation = 'Restricted administrative execution by introducing an explicit onlyOwner modifier on the function signature.';
      whySafer = [
        'Only the verified contract owner address can invoke fee or state changes.',
        'Blocks unauthenticated transactions from arbitrary callers or front-running bots.',
        'Protects governance and economic integrity.'
      ];
      break;

    case 'BG-003':
      explanation = 'Substituted tx.origin with msg.sender to verify the immediate caller rather than the transaction originator.',
      whySafer = [
        'Eliminates phishing exploits executed through intermediary contracts.',
        'Ensures caller authorization cannot be hijacked via malicious dApp redirects.',
        'Complies with Ethereum & Avalanche security best practices.'
      ];
      break;

    case 'BG-004':
      explanation = 'Enforced inspection of the low-level return boolean (bool success, ) and asserted positive completion with require().';
      whySafer = [
        'Guarantees transaction aborts and state reverts if the recipient cannot accept payment.',
        'Eliminates silent failures and accounting mismatches.',
        'Avoids phantom balance deductions.'
      ];
      break;

    case 'BG-005':
      explanation = 'Reordered arithmetic operations to execute multiplication before integer division.',
      whySafer = [
        'Prevents intermediate truncation to zero in Solidity integer math.',
        'Maintains high mathematical precision for reward and fee computations.',
        'Added zero-check on the denominator to guard against division-by-zero panics.'
      ];
      break;

    default:
      explanation = 'Applied recommended code fixes according to static audit standards.';
      whySafer = ['Follows standard Solidity security design patterns.'];
  }

  return {
    findingId: finding.id,
    originalSnippet,
    remediatedSnippet,
    explanation,
    whySafer
  };
}
