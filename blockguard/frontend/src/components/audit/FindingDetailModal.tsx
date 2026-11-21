import React from 'react';
import { X, ShieldAlert, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Finding } from '../../types';

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  onOpenDiff: (finding: Finding) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  onOpenDiff
}) => {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-security-critical/20 text-security-critical border border-security-critical/30">
                {finding.severity}
              </span>
              <span className="text-xs font-mono text-slate-400">{finding.ruleId}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{finding.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Vulnerability Overview</h4>
            <p className="text-slate-300 leading-relaxed">{finding.description}</p>
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-security-critical/10 border border-security-critical/30">
            <h4 className="font-semibold text-security-critical uppercase tracking-wider text-[11px]">Exploit / Attack Scenario</h4>
            <p className="text-slate-200 leading-relaxed">{finding.attackScenario}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Security Impact</h4>
            <p className="text-slate-300 leading-relaxed">{finding.impact}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Code Evidence (Lines {finding.lineStart} - {finding.lineEnd})</h4>
            <pre className="p-3 bg-bg-main rounded-xl border border-bg-border font-mono text-slate-200 overflow-x-auto whitespace-pre">
              {finding.snippet}
            </pre>
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-security-success/10 border border-security-success/30">
            <h4 className="font-semibold text-security-success uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Remediation Recommendation
            </h4>
            <p className="text-slate-200 leading-relaxed">{finding.recommendation}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-bg-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenDiff(finding);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-semibold shadow-md shadow-brand-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open AI Diff Viewer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
