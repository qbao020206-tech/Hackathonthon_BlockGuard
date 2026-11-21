import fs from 'fs';
import path from 'path';

const LOGS_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const ACCESS_LOG_FILE = path.join(LOGS_DIR, 'access.log');
const SECURITY_LOG_FILE = path.join(LOGS_DIR, 'security.log');

export interface SecurityLogEvent {
  timestamp?: string;
  type: 'AUDIT_SCAN' | 'REANALYZE' | 'ONCHAIN_REGISTER' | 'VERIFY_CHECK' | 'RATE_LIMIT' | 'ERROR';
  ip?: string;
  contractName?: string;
  auditId?: string;
  sourceHash?: string;
  reportHash?: string;
  securityScore?: number;
  criticalCount?: number;
  details?: any;
}

class Logger {
  private write(filePath: string, message: string) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(filePath, formatted, 'utf8');
  }

  public logAccess(ip: string, method: string, url: string, statusCode: number, durationMs: number) {
    const msg = `${ip} - ${method} ${url} -> ${statusCode} (${durationMs}ms)`;
    this.write(ACCESS_LOG_FILE, msg);
    console.log(`📡 [ACCESS] ${msg}`);
  }

  public logSecurity(event: SecurityLogEvent) {
    const jsonStr = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event
    });
    this.write(SECURITY_LOG_FILE, jsonStr);
    console.log(`🛡️  [SECURITY] [${event.type}] AuditId: ${event.auditId || 'N/A'} - ${event.contractName || ''} (Score: ${event.securityScore ?? 'N/A'})`);
  }

  public error(context: string, error: any) {
    const msg = `ERROR in ${context}: ${error?.message || error}`;
    this.write(SECURITY_LOG_FILE, JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'ERROR',
      context,
      message: error?.message || String(error),
      stack: error?.stack
    }));
    console.error(`❌ [ERROR] ${msg}`);
  }
}

export const logger = new Logger();
