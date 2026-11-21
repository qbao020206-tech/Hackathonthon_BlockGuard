import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Download, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AuditReport, Finding } from '../../types';
import { truncateHash, SNOWTRACE_URL } from '../../utils/web3';

interface AuditReportProps {
  report: AuditReport;
  onOpenDiff: (finding: Finding) => void;
  onReanalyze: () => void;
  onRegisterOnChain: () => void;
  onSelectFinding: (finding: Finding) => void;
}

export const AuditReportView: React.FC<AuditReportProps> = ({
  report,
  onOpenDiff,
  onReanalyze,
  onRegisterOnChain,
  onSelectFinding
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.contractName}-audit-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredFindings = report.findings.filter(f => {
    if (filterSeverity === 'ALL') return true;
    return f.severity === filterSeverity;
  });

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-security-critical/20 text-security-critical border-security-critical/40';
      case 'HIGH': return 'bg-security-high/20 text-security-high border-security-high/40';
      case 'MEDIUM': return 'bg-security-medium/20 text-security-medium border-security-medium/40';
      case 'LOW': return 'bg-security-low/20 text-security-low border-security-low/40';
      default: return 'bg-security-info/20 text-security-info border-security-info/40';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-bg-surface border border-bg-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-bg-elevated text-slate-300 border border-bg-border">
              {report.id}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
            {report.contractName}
          </h1>
          <p className="text-xs text-slate-400">
            Static AST security inspection completed. {report.findings.length} vulnerabilities detected.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onReanalyze}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-bg-border text-slate-300 text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-bg-border text-slate-300 text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onRegisterOnChain}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md ${
              report.onChainStatus?.isRegistered
                ? 'bg-security-success/20 text-security-success border border-security-success/40'
                : 'bg-brand-primary hover:bg-brand-primaryHover text-white shadow-brand-primary/25'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{report.onChainStatus?.isRegistered ? 'Verified on Fuji' : 'Register on Avalanche Fuji'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Security Score Gauge */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center flex-shrink-0 relative font-mono font-bold text-2xl"
               style={{
                 borderColor: report.securityScore >= 80 ? '#22C55E' : report.securityScore >= 60 ? '#F59E0B' : '#EF4444'
               }}>
            <span className={report.securityScore >= 80 ? 'text-security-success' : report.securityScore >= 60 ? 'text-security-medium' : 'text-security-critical'}>
              {report.securityScore}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Security Health Score</p>
            <p className="text-sm font-medium text-white">
              {report.securityScore >= 90 ? 'High Security Rating' : report.securityScore >= 70 ? 'Moderate Risk Detected' : 'Critical Action Required'}
            </p>
            <p className="text-[11px] text-slate-500">Based on weighted flaw deductions</p>
          </div>
        </div>

        {/* Source Hash */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Source Code Hash</span>
            <button
              onClick={() => copyToClipboard(report.sourceHash, 'source')}
              className="text-slate-400 hover:text-white"
            >
              {copiedField === 'source' ? <Check className="w-3.5 h-3.5 text-security-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs font-mono text-brand-accent break-all bg-bg-elevated p-2 rounded-lg border border-bg-border">
            {report.sourceHash}
          </p>
          <p className="text-[10px] text-slate-500">Keccak256 normalized representation</p>
        </div>

        {/* Report Hash */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Report Proof Hash</span>
            <button
              onClick={() => copyToClipboard(report.reportHash, 'report')}
              className="text-slate-400 hover:text-white"
            >
              {copiedField === 'report' ? <Check className="w-3.5 h-3.5 text-security-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs font-mono text-brand-accent break-all bg-bg-elevated p-2 rounded-lg border border-bg-border">
            {report.reportHash}
          </p>
          <p className="text-[10px] text-slate-500">Registered immutable on Avalanche Fuji</p>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bg-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterSeverity === sev
                  ? 'bg-bg-elevated text-white border-brand-primary'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {sev} ({sev === 'ALL' ? report.findings.length : report.findings.filter(f => f.severity === sev).length})
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-bg-border bg-bg-surface space-y-2">
            <ShieldCheck className="w-10 h-10 text-security-success mx-auto" />
            <h3 className="text-base font-semibold text-white">No Findings In This Category</h3>
            <p className="text-xs text-slate-400">Zero matching vulnerabilities detected for selected severity filter.</p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-2xl bg-bg-surface border border-bg-border hover:border-brand-primary/40 transition-all space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`cyber-badge border ${getSeverityBadgeClass(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold">{finding.ruleId}</span>
                  <h3 className="font-semibold text-white text-sm">{finding.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectFinding(finding)}
                    className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-bg-elevated hover:bg-bg-border rounded-lg transition-colors border border-bg-border"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onOpenDiff(finding)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover rounded-lg transition-all shadow-sm shadow-brand-primary/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fix with AI Diff</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>

              {/* Code Evidence snippet with highlight */}
              <div className="rounded-xl bg-bg-main border border-bg-border overflow-hidden">
                <div className="bg-bg-elevated px-3 py-1.5 border-b border-bg-border text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Lines {finding.lineStart} - {finding.lineEnd}</span>
                  <span className="text-security-critical">Vulnerable Code Region</span>
                </div>
                <pre className="p-3 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed border-l-2 border-security-critical">
                  {finding.snippet}
                </pre>
              </div>

              {/* Attack Scenario preview */}
              <div className="p-3 rounded-xl bg-bg-elevated/60 border border-bg-border/60 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-200">Attack Scenario: </span>
                <span>{finding.attackScenario}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
