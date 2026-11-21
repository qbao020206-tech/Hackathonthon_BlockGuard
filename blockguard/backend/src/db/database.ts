import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { AuditReport, Finding } from '../types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'blockguard.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency & reliability with fallback
try {
  db.pragma('journal_mode = WAL');
} catch (err) {
  console.warn('Notice: WAL mode could not be enabled, fallback to DELETE mode:', err);
}

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    contract_name TEXT NOT NULL,
    source_code TEXT NOT NULL,
    source_hash TEXT NOT NULL,
    report_hash TEXT NOT NULL,
    security_score INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    summary_total INTEGER NOT NULL,
    summary_critical INTEGER NOT NULL,
    summary_high INTEGER NOT NULL,
    summary_medium INTEGER NOT NULL,
    summary_low INTEGER NOT NULL,
    summary_info INTEGER NOT NULL,
    is_registered INTEGER NOT NULL DEFAULT 0,
    tx_hash TEXT,
    registered_at INTEGER,
    auditor TEXT
  );

  CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    audit_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    name TEXT NOT NULL,
    severity TEXT NOT NULL,
    line_start INTEGER NOT NULL,
    line_end INTEGER NOT NULL,
    snippet TEXT NOT NULL,
    description TEXT NOT NULL,
    attack_scenario TEXT NOT NULL,
    impact TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    FOREIGN KEY(audit_id) REFERENCES audits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS verification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT NOT NULL,
    report_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    client_ip TEXT,
    verified_at TEXT NOT NULL
  );
`);

export class AuditDatabase {
  public static saveAudit(report: AuditReport): void {
    const insertAudit = db.prepare(`
      INSERT OR REPLACE INTO audits (
        id, contract_name, source_code, source_hash, report_hash,
        security_score, created_at, summary_total, summary_critical,
        summary_high, summary_medium, summary_low, summary_info,
        is_registered, tx_hash, registered_at, auditor
      ) VALUES (
        @id, @contract_name, @source_code, @source_hash, @report_hash,
        @security_score, @created_at, @summary_total, @summary_critical,
        @summary_high, @summary_medium, @summary_low, @summary_info,
        @is_registered, @tx_hash, @registered_at, @auditor
      )
    `);

    const deleteOldFindings = db.prepare(`DELETE FROM findings WHERE audit_id = ?`);
    const insertFinding = db.prepare(`
      INSERT OR REPLACE INTO findings (
        id, audit_id, rule_id, name, severity,
        line_start, line_end, snippet, description,
        attack_scenario, impact, recommendation, suggested_fix
      ) VALUES (
        @id, @audit_id, @rule_id, @name, @severity,
        @line_start, @line_end, @snippet, @description,
        @attack_scenario, @impact, @recommendation, @suggested_fix
      )
    `);

    const tx = db.transaction(() => {
      insertAudit.run({
        id: report.id,
        contract_name: report.contractName,
        source_code: report.sourceCode,
        source_hash: report.sourceHash,
        report_hash: report.reportHash,
        security_score: report.securityScore,
        created_at: report.createdAt,
        summary_total: report.summary.total,
        summary_critical: report.summary.critical,
        summary_high: report.summary.high,
        summary_medium: report.summary.medium,
        summary_low: report.summary.low,
        summary_info: report.summary.informational,
        is_registered: report.onChainStatus?.isRegistered ? 1 : 0,
        tx_hash: report.onChainStatus?.txHash || null,
        registered_at: report.onChainStatus?.registeredAt || null,
        auditor: report.onChainStatus?.auditor || null
      });

      deleteOldFindings.run(report.id);

      for (const f of report.findings) {
        insertFinding.run({
          id: f.id,
          audit_id: report.id,
          rule_id: f.ruleId,
          name: f.name,
          severity: f.severity,
          line_start: f.lineStart,
          line_end: f.lineEnd,
          snippet: f.snippet,
          description: f.description,
          attack_scenario: f.attackScenario,
          impact: f.impact,
          recommendation: f.recommendation,
          suggested_fix: f.suggestedFix
        });
      }
    });

    tx();
  }

  public static getAuditById(id: string): AuditReport | null {
    const row = db.prepare(`SELECT * FROM audits WHERE id = ?`).get(id) as any;
    if (!row) return null;

    const findingsRows = db.prepare(`SELECT * FROM findings WHERE audit_id = ?`).all(id) as any[];

    return {
      id: row.id,
      contractName: row.contract_name,
      sourceCode: row.source_code,
      sourceHash: row.source_hash,
      reportHash: row.report_hash,
      securityScore: row.security_score,
      createdAt: row.created_at,
      findings: findingsRows.map(f => ({
        id: f.id,
        ruleId: f.rule_id,
        name: f.name,
        severity: f.severity,
        lineStart: f.line_start,
        lineEnd: f.line_end,
        snippet: f.snippet,
        description: f.description,
        attackScenario: f.attack_scenario,
        impact: f.impact,
        recommendation: f.recommendation,
        suggestedFix: f.suggested_fix
      })),
      summary: {
        total: row.summary_total,
        critical: row.summary_critical,
        high: row.summary_high,
        medium: row.summary_medium,
        low: row.summary_low,
        informational: row.summary_info
      },
      onChainStatus: {
        isRegistered: row.is_registered === 1,
        txHash: row.tx_hash,
        registeredAt: row.registered_at,
        auditor: row.auditor
      }
    };
  }

  public static getAllAudits(): AuditReport[] {
    const rows = db.prepare(`SELECT * FROM audits ORDER BY datetime(created_at) DESC`).all() as any[];
    return rows.map(r => this.getAuditById(r.id)!);
  }

  public static updateOnChainStatus(id: string, txHash: string, auditor: string): boolean {
    const info = db.prepare(`
      UPDATE audits 
      SET is_registered = 1, tx_hash = ?, registered_at = ?, auditor = ?
      WHERE id = ?
    `).run(txHash, Date.now(), auditor, id);

    return info.changes > 0;
  }

  public static logVerification(auditId: string, reportHash: string, status: string, clientIp: string): void {
    db.prepare(`
      INSERT INTO verification_logs (audit_id, report_hash, status, client_ip, verified_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(auditId, reportHash, status, clientIp, new Date().toISOString());
  }
}
