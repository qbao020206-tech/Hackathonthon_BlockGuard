import { Router, Request, Response } from 'express';
import { analyzeContract } from '../scanner/engine';
import { generateRemediation } from '../services/remediation';
import { verifyAuditOnChain } from '../services/fuji';
import { AuditDatabase } from '../db/database';
import { logger } from '../services/logger';

const router = Router();

// Strict Regex validation to prevent URL Parameter Injection & Path Traversal
const AUDIT_ID_REGEX = /^audit-[a-zA-Z0-9_-]{4,64}$/;
const FINDING_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * POST /api/audits
 * Submit Solidity source code for static analysis and persist into SQLite
 */
router.post('/audits', (req: Request, res: Response): void => {
  try {
    const { sourceCode, contractName } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    if (!sourceCode || typeof sourceCode !== 'string' || sourceCode.trim() === '') {
      res.status(400).json({ error: 'Source code is required and must not be empty.' });
      return;
    }

    // Run pure static AST analysis
    const report = analyzeContract(sourceCode, contractName || 'SmartContract.sol');
    
    // Save permanently to SQLite database
    AuditDatabase.saveAudit(report);

    // Record security log
    logger.logSecurity({
      type: 'AUDIT_SCAN',
      ip: clientIp,
      contractName: report.contractName,
      auditId: report.id,
      sourceHash: report.sourceHash,
      reportHash: report.reportHash,
      securityScore: report.securityScore,
      criticalCount: report.summary.critical
    });

    res.status(201).json(report);
  } catch (error: any) {
    logger.error('POST /api/audits', error);
    res.status(500).json({ error: 'Internal scanner error: ' + error.message });
  }
});

/**
 * GET /api/audits
 * Retrieve all persistent audits from SQLite
 */
router.get('/audits', (_req: Request, res: Response): void => {
  try {
    const audits = AuditDatabase.getAllAudits();
    res.json(audits);
  } catch (error: any) {
    logger.error('GET /api/audits', error);
    res.status(500).json({ error: 'Database read error: ' + error.message });
  }
});

/**
 * GET /api/audits/:id
 * Retrieve specific audit from SQLite
 */
router.get('/audits/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    if (!AUDIT_ID_REGEX.test(id)) {
      res.status(400).json({ error: 'Security alert: Invalid audit identifier format in URL parameter.' });
      return;
    }

    const audit = AuditDatabase.getAuditById(id);

    if (!audit) {
      res.status(404).json({ error: `Audit '${id}' not found in database.` });
      return;
    }

    res.json(audit);
  } catch (error: any) {
    logger.error(`GET /api/audits/${req.params.id}`, error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

/**
 * POST /api/audits/:id/reanalyze
 * Re-analyze patched code and update record in SQLite
 */
router.post('/audits/:id/reanalyze', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { sourceCode } = req.body;
    const clientIp = req.ip || 'unknown';

    if (!AUDIT_ID_REGEX.test(id)) {
      res.status(400).json({ error: 'Security alert: Invalid audit identifier in URL.' });
      return;
    }

    const existingAudit = AuditDatabase.getAuditById(id);
    if (!existingAudit) {
      res.status(404).json({ error: `Audit '${id}' not found in database.` });
      return;
    }

    if (!sourceCode || typeof sourceCode !== 'string') {
      res.status(400).json({ error: 'Updated source code is required.' });
      return;
    }

    const newReport = analyzeContract(sourceCode, existingAudit.contractName);
    newReport.id = id; // Preserve audit ID
    AuditDatabase.saveAudit(newReport);

    logger.logSecurity({
      type: 'REANALYZE',
      ip: clientIp,
      contractName: newReport.contractName,
      auditId: id,
      sourceHash: newReport.sourceHash,
      reportHash: newReport.reportHash,
      securityScore: newReport.securityScore,
      criticalCount: newReport.summary.critical
    });

    res.json(newReport);
  } catch (error: any) {
    logger.error(`POST /api/audits/${req.params.id}/reanalyze`, error);
    res.status(500).json({ error: 'Reanalysis error: ' + error.message });
  }
});

/**
 * POST /api/audits/:id/findings/:findingId/fix
 * Generate AI-assisted remediation diff
 */
router.post('/audits/:id/findings/:findingId/fix', (req: Request, res: Response): void => {
  try {
    const { id, findingId } = req.params;

    if (!AUDIT_ID_REGEX.test(id) || !FINDING_ID_REGEX.test(findingId)) {
      res.status(400).json({ error: 'Security alert: Invalid parameters in URL request.' });
      return;
    }

    const audit = AuditDatabase.getAuditById(id);

    if (!audit) {
      res.status(404).json({ error: `Audit '${id}' not found.` });
      return;
    }

    const finding = audit.findings.find(f => f.id === findingId);
    if (!finding) {
      res.status(404).json({ error: `Finding '${findingId}' not found in audit.` });
      return;
    }

    const remediation = generateRemediation(finding);
    res.json(remediation);
  } catch (error: any) {
    logger.error(`POST fix finding ${req.params.findingId}`, error);
    res.status(500).json({ error: 'Remediation error: ' + error.message });
  }
});

/**
 * POST /api/audits/:id/onchain
 * Record on-chain registration status into SQLite
 */
router.post('/audits/:id/onchain', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { txHash, auditor } = req.body;
    const clientIp = req.ip || 'unknown';

    if (!AUDIT_ID_REGEX.test(id)) {
      res.status(400).json({ error: 'Security alert: Invalid audit identifier in URL.' });
      return;
    }

    const success = AuditDatabase.updateOnChainStatus(id, txHash, auditor);
    if (!success) {
      res.status(404).json({ error: `Audit '${id}' not found.` });
      return;
    }

    logger.logSecurity({
      type: 'ONCHAIN_REGISTER',
      ip: clientIp,
      auditId: id,
      details: { txHash, auditor }
    });

    const updated = AuditDatabase.getAuditById(id);
    res.json(updated);
  } catch (error: any) {
    logger.error(`POST /api/audits/${req.params.id}/onchain`, error);
    res.status(500).json({ error: 'Database update error: ' + error.message });
  }
});

/**
 * POST /api/verify
 * Cross-examine audit report with on-chain Avalanche Fuji hash or persistent database
 */
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { auditId, reportHash } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    if (!auditId) {
      res.status(400).json({ error: 'auditId is required for verification.' });
      return;
    }

    const audit = AuditDatabase.getAuditById(auditId);
    const targetHash = reportHash || (audit ? audit.reportHash : '');

    // Strict on-chain verification
    const result = await verifyAuditOnChain(auditId, targetHash);

    // Persist verification audit log into SQLite
    AuditDatabase.logVerification(auditId, targetHash, result.status, clientIp);

    logger.logSecurity({
      type: 'VERIFY_CHECK',
      ip: clientIp,
      auditId,
      reportHash: targetHash,
      details: { status: result.status, message: result.message }
    });

    res.json(result);
  } catch (error: any) {
    logger.error('POST /api/verify', error);
    res.status(500).json({ error: 'Verification failed: ' + error.message });
  }
});

export default router;
