import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { Finding, AuditReport } from '../../types';

interface DiffViewerProps {
  finding: Finding | null;
  report: AuditReport | null;
  onApplyFix: (newSourceCode: string) => void;
  onBack: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  finding,
  report,
  onApplyFix,
  onBack
}) => {
  const [copied, setCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!finding || !report) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4 max-w-xl mx-auto">
        <GitCompare className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-semibold text-white">No Finding Selected for Remediation</h3>
        <p className="text-xs">Select a vulnerability finding from the audit report to inspect the AI remediation diff.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-bg-elevated border border-bg-border hover:border-brand-primary text-xs text-white"
        >
          Return to Report
        </button>
      </div>
    );
  }

  // Build the remediated full contract code by substituting the snippet
  const fullRemediatedCode = report.sourceCode.replace(finding.snippet, finding.suggestedFix);

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApplyFix(fullRemediatedCode);
      setIsApplying(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.suggestedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Top Navigation & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bg-border pb-6">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Audit Findings
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-primary/20 text-brand-accent border border-brand-primary/30">
              {finding.ruleId}
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI Remediation: {finding.name}
            </h1>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={isApplying}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-security-success hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-security-success/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isApplying ? 'Applying Fix...' : 'Apply Fix & Re-Audit'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Reasoning Section */}
      <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border space-y-3">
        <div className="flex items-center gap-2 text-brand-accent text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Why This Remediated Code Is Safer</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {finding.recommendation}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-bg-elevated border border-bg-border space-y-1">
            <span className="font-semibold text-security-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> State Isolation
            </span>
            <p className="text-[11px] text-slate-400">Enforces Checks-Effects-Interactions before external control handoff.</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-elevated border border-bg-border space-y-1">
            <span className="font-semibold text-security-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Phishing Vector
            </span>
            <p className="text-[11px] text-slate-400">Eliminates origin tampering by requiring immediate msg.sender checks.</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-elevated border border-bg-border space-y-1">
            <span className="font-semibold text-security-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Math
            </span>
            <p className="text-[11px] text-slate-400">Orders multiplication prior to division to prevent zero-truncation.</p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Diff Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Vulnerable Code */}
        <div className="rounded-2xl border border-security-critical/30 bg-bg-surface overflow-hidden">
          <div className="bg-security-critical/10 px-4 py-2.5 border-b border-security-critical/20 flex items-center justify-between text-xs font-mono">
            <span className="text-security-critical font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Original Vulnerable Code
            </span>
            <span className="text-slate-400 text-[11px]">Lines {finding.lineStart} - {finding.lineEnd}</span>
          </div>
          <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed bg-bg-main/60 min-h-[220px]">
            {finding.snippet}
          </pre>
        </div>

        {/* Remediated Secure Code */}
        <div className="rounded-2xl border border-security-success/30 bg-bg-surface overflow-hidden">
          <div className="bg-security-success/10 px-4 py-2.5 border-b border-security-success/20 flex items-center justify-between text-xs font-mono">
            <span className="text-security-success font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Remediated Secure Code
            </span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-security-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed bg-bg-main/60 min-h-[220px]">
            {finding.suggestedFix}
          </pre>
        </div>
      </div>
    </div>
  );
};
