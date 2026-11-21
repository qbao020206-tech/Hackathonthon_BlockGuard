import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Upload, 
  ExternalLink, 
  ShieldCheck,
  FileCheck,
  Loader2
} from 'lucide-react';
import { VerificationResult } from '../../types';
import { SNOWTRACE_URL, truncateAddress, truncateHash } from '../../utils/web3';
import { getApiUrl } from '../../utils/api';

export const VerifyReportPage: React.FC = () => {
  const [auditId, setAuditId] = useState('');
  const [reportHashInput, setReportHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditId.trim()) return;

    setIsVerifying(true);
    setResult(null);

    try {
      const response = await fetch(getApiUrl('/api/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: auditId.trim(),
          reportHash: reportHashInput.trim() || undefined,
        })
      });

      if (response.ok) {
        const data: VerificationResult = await response.json();
        setResult(data);
      } else {
        const errData = await response.json().catch(() => ({ error: 'Verification failed' }));
        setResult({
          status: 'NOT_REGISTERED',
          auditId: auditId.trim(),
          expectedReportHash: reportHashInput || undefined,
          message: errData.error || 'The audit record could not be found or verified on Avalanche Fuji.'
        });
      }
    } catch (err: any) {
      setResult({
        status: 'NOT_REGISTERED',
        auditId: auditId.trim(),
        expectedReportHash: reportHashInput || undefined,
        message: `Network error connecting to verification service: ${err.message}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJsonUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        setUploadedFile(file.name);
        if (content.id) setAuditId(content.id);
        if (content.reportHash) setReportHashInput(content.reportHash);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-accent" />
          <span>Verify On-Chain Audit Integrity</span>
        </h1>
        <p className="text-xs text-slate-400">
          Strict verification against cryptographic hashes permanently recorded on the Avalanche Fuji network.
        </p>
      </div>

      {/* Verification Input Form */}
      <div className="p-6 rounded-2xl bg-bg-surface border border-bg-border space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Audit Identifier (UUID or Hash)
              </label>
              <input
                type="text"
                value={auditId}
                onChange={(e) => setAuditId(e.target.value)}
                placeholder="e.g. audit-0ca14f3513ca744d"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-bg-border focus:border-brand-primary outline-none text-xs font-mono text-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Report Hash (Optional for exact matching)
              </label>
              <input
                type="text"
                value={reportHashInput}
                onChange={(e) => setReportHashInput(e.target.value)}
                placeholder="0x..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-bg-border focus:border-brand-primary outline-none text-xs font-mono text-white transition-colors"
              />
            </div>
          </div>

          {/* Quick upload JSON */}
          <div className="flex items-center gap-3 pt-1">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-bg-border hover:border-slate-500 text-xs font-medium text-slate-300 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-brand-accent" />
              <span>{uploadedFile ? uploadedFile : 'Or upload report JSON'}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleJsonUpload(e.target.files[0]);
                }}
              />
            </label>
            {uploadedFile && (
              <span className="text-[11px] text-security-success font-mono flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> Loaded
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || !auditId.trim()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-semibold shadow-md shadow-brand-primary/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Querying Avalanche Fuji...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify Against Blockchain</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Status Banner */}
      {result && (
        <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
          result.status === 'VALID'
            ? 'bg-security-success/10 border-security-success/30'
            : result.status === 'MISMATCH'
            ? 'bg-security-critical/10 border-security-critical/30'
            : 'bg-bg-surface border-bg-border'
        }`}>
          <div className="flex items-center gap-3">
            {result.status === 'VALID' ? (
              <CheckCircle2 className="w-6 h-6 text-security-success flex-shrink-0" />
            ) : result.status === 'MISMATCH' ? (
              <XCircle className="w-6 h-6 text-security-critical flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-security-medium flex-shrink-0" />
            )}
            <div>
              <h3 className={`font-bold text-sm ${
                result.status === 'VALID'
                  ? 'text-security-success'
                  : result.status === 'MISMATCH'
                  ? 'text-security-critical'
                  : 'text-security-medium'
              }`}>
                {result.status === 'VALID' && 'Status: Authentic & Tamper-Free'}
                {result.status === 'MISMATCH' && 'Status: Cryptographic Hash Mismatch!'}
                {result.status === 'NOT_REGISTERED' && 'Status: Audit Not Registered on Fuji'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{result.message}</p>
            </div>
          </div>

          {result.status === 'VALID' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono bg-bg-main/60 p-4 rounded-xl border border-bg-border/60">
              <div>
                <span className="text-slate-400">Auditor Address:</span>
                <p className="text-white mt-0.5 font-medium">{truncateAddress(result.auditor || '')}</p>
              </div>
              <div>
                <span className="text-slate-400">Registration Timestamp:</span>
                <p className="text-white mt-0.5">
                  {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Recorded'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">On-Chain Verified Hash:</span>
                <p className="text-brand-accent mt-0.5 break-all">{result.onChainReportHash}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
