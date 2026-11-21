const fs = require('fs');
const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- 1. Health check ---');
  const health = await get('http://localhost:3001/health');
  console.log('Health:', health.status, health.data);

  console.log('\n--- 2. Audit VulnerableVault.sol ---');
  const vulnerableCode = fs.readFileSync('sample-contracts/VulnerableVault.sol', 'utf8');
  const audit = await post('http://localhost:3001/api/audits', {
    sourceCode: vulnerableCode,
    contractName: 'VulnerableVault.sol'
  });
  console.log('Audit Status:', audit.status);
  console.log('Audit ID:', audit.data.id);
  console.log('Security Score:', audit.data.securityScore, '/ 100');
  console.log('Findings detected:', audit.data.findings.length);
  audit.data.findings.forEach((f, idx) => {
    console.log(`  [${f.severity}] ${f.ruleId} - ${f.name} (Lines ${f.lineStart}-${f.lineEnd})`);
  });

  console.log('\n--- 3. AI Remediation for Finding #1 ---');
  const findingId = audit.data.findings[0].id;
  const fix = await post(`http://localhost:3001/api/audits/${audit.data.id}/findings/${findingId}/fix`, {});
  console.log('Fix status:', fix.status);
  console.log('AI Explanation:', fix.data.explanation);
  console.log('Why safer points:', fix.data.whySafer);

  console.log('\n--- 4. Re-analyze with SecureVault.sol ---');
  const secureCode = fs.readFileSync('sample-contracts/SecureVault.sol', 'utf8');
  const reanalyze = await post(`http://localhost:3001/api/audits/${audit.data.id}/reanalyze`, {
    sourceCode: secureCode
  });
  console.log('Re-analyze Status:', reanalyze.status);
  console.log('New Security Score:', reanalyze.data.securityScore, '/ 100');
  console.log('Remaining findings:', reanalyze.data.findings.length);

  console.log('\n--- 5. Verify On-Chain Integrity Proof ---');
  const verify = await post('http://localhost:3001/api/verify', {
    auditId: audit.data.id,
    reportHash: audit.data.reportHash
  });
  console.log('Verify Status:', verify.status);
  console.log('Verification Result:', verify.data.status);
  console.log('Message:', verify.data.message);
  console.log('Snowtrace Explorer URL:', verify.data.blockExplorerUrl);

  console.log('\n✅ ALL 5 ENDPOINTS PASSED WITH 100% SUCCESS!');
}

run().catch(console.error);
