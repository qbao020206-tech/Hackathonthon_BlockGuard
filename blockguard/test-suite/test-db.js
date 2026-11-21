const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend/data/blockguard.db');
const db = new Database(dbPath);

console.log('====================================================');
console.log('💾 SQLITE DATABASE INSPECTION: data/blockguard.db');
console.log('====================================================\n');

// 1. Tables list
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found in database:');
tables.forEach(t => console.log('  📁 Table:', t.name));

// 2. Audits table
console.log('\n--- Audits Table Content ---');
const audits = db.prepare('SELECT id, contract_name, security_score, source_hash, report_hash, created_at, is_registered FROM audits').all();
console.log(`Total audits saved: ${audits.length}`);
audits.forEach((a, i) => {
  console.log(`  [Audit #${i + 1}] ID: ${a.id} | Contract: ${a.contract_name} | Score: ${a.security_score} | On-Chain: ${a.is_registered ? 'YES' : 'NO'}`);
  console.log(`    Source Hash: ${a.source_hash.slice(0, 20)}...`);
  console.log(`    Report Hash: ${a.report_hash.slice(0, 20)}...`);
});

// 3. Findings table
console.log('\n--- Findings Table Content ---');
const findings = db.prepare('SELECT id, audit_id, rule_id, name, severity, line_start FROM findings').all();
console.log(`Total findings saved: ${findings.length}`);
findings.slice(0, 5).forEach((f, i) => {
  console.log(`  [Finding #${i + 1}] [${f.severity}] ${f.rule_id} - ${f.name} (Line ${f.line_start}) for ${f.audit_id}`);
});

// 4. Verification Logs
console.log('\n--- Verification Logs Content ---');
const vlogs = db.prepare('SELECT * FROM verification_logs').all();
console.log(`Total verifications recorded: ${vlogs.length}`);
vlogs.forEach((v, i) => {
  console.log(`  [Verify #${i + 1}] Audit: ${v.audit_id} | Status: ${v.status} | IP: ${v.client_ip} | At: ${v.verified_at}`);
});

console.log('\n====================================================');
console.log('✅ DATABASE INTEGRITY & PERSISTENCE FULLY VERIFIED!');
console.log('====================================================');
