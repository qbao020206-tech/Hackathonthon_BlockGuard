export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface Finding {
  id: string;
  ruleId: string;
  name: string;
  severity: Severity;
  lineStart: number;
  lineEnd: number;
  snippet: string;
  description: string;
  attackScenario: string;
  impact: string;
  recommendation: string;
  suggestedFix: string;
}

export interface AuditReport {
  id: string;
  contractName: string;
  sourceCode: string;
  sourceHash: string; // bytes32 hex (0x...)
  reportHash: string; // bytes32 hex (0x...)
  securityScore: number; // 0-100
  createdAt: string;
  findings: Finding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  onChainStatus?: {
    isRegistered: boolean;
    txHash?: string;
    registeredAt?: number;
    auditor?: string;
  };
}

export interface VerifyRequest {
  auditId: string;
  reportHash?: string;
  reportContent?: string;
}

export interface VerificationResult {
  status: 'VALID' | 'MISMATCH' | 'NOT_REGISTERED';
  auditId: string;
  expectedReportHash?: string;
  onChainReportHash?: string;
  sourceHash?: string;
  auditor?: string;
  timestamp?: number;
  blockExplorerUrl?: string;
  message: string;
}
