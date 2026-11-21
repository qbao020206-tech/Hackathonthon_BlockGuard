import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { AuditReport, ViewState } from '../../types';
import { truncateHash } from '../../utils/web3';

interface DashboardProps {
  audits: AuditReport[];
  onSelectAudit: (audit: AuditReport) => void;
  onNewAudit: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ audits, onSelectAudit, onNewAudit }) => {
  const latestAudit = audits.length > 0 ? audits[0] : null;

  // Aggregate stats
  const totalFindings = audits.reduce((acc, a) => acc + a.summary.total, 0);
  const totalCritical = audits.reduce((acc, a) => acc + a.summary.critical, 0);
  const totalHigh = audits.reduce((acc, a) => acc + a.summary.high, 0);
  const totalMedium = audits.reduce((acc, a) => acc + a.summary.medium, 0);

  const avgScore = audits.length > 0
    ? Math.round(audits.reduce((acc, a) => acc + a.securityScore, 0) / audits.length)
    : 100;

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bg-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Intelligence Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring smart contract security, automated vulnerability triage, and on-chain registries.
          </p>
        </div>
        <button
          onClick={onNewAudit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-medium shadow-md shadow-brand-primary/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Security Audit</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Security Score Prototype Gauge */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Security Score</span>
            <Sparkles className="w-4 h-4 text-brand-accent" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-bold ${
              avgScore >= 80 ? 'text-security-success' : avgScore >= 60 ? 'text-security-medium' : 'text-security-critical'
            }`}>
              {avgScore}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-bg-elevated h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                avgScore >= 80 ? 'bg-security-success' : avgScore >= 60 ? 'bg-security-medium' : 'bg-security-critical'
              }`}
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical Flaws</span>
            <ShieldAlert className="w-4 h-4 text-security-critical" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-security-critical">{totalCritical}</span>
            <span className="text-xs text-slate-400">Reentrancy / Drains</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Immediate risk to contract funds</p>
        </div>

        {/* High & Medium Issues */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High / Med Warnings</span>
            <AlertTriangle className="w-4 h-4 text-security-medium" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-security-medium">{totalHigh + totalMedium}</span>
            <span className="text-xs text-slate-400">Access & Logic</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Access control & external calls</p>
        </div>

        {/* Fuji Proofs Registered */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-bg-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">On-Chain Proofs</span>
            <Layers className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-brand-accent">
              {audits.filter(a => a.onChainStatus?.isRegistered).length}
            </span>
            <span className="text-xs text-slate-400">/ {audits.length} Audits</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Registered on Avalanche Fuji</p>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Audit Reports</h2>
          <span className="text-xs text-slate-400 font-mono">{audits.length} recorded</span>
        </div>

        {audits.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-bg-border bg-bg-surface/50 space-y-4">
            <FileCode className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">No Audits Run Yet</p>
              <p className="text-xs text-slate-500">Scan your first Solidity contract to inspect vulnerabilities and test on-chain proofs.</p>
            </div>
            <button
              onClick={onNewAudit}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-medium hover:bg-brand-primaryHover transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Start First Audit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-bg-border bg-bg-surface">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-bg-elevated font-mono text-[11px] uppercase text-slate-400 border-b border-bg-border">
                <tr>
                  <th className="px-5 py-3.5">Contract</th>
                  <th className="px-5 py-3.5">Security Score</th>
                  <th className="px-5 py-3.5">Vulnerabilities</th>
                  <th className="px-5 py-3.5">Report Hash</th>
                  <th className="px-5 py-3.5">Avalanche Proof</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-bg-elevated/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-brand-primary" />
                      <span>{audit.contractName}</span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        audit.securityScore >= 80
                          ? 'bg-security-success/10 text-security-success border border-security-success/30'
                          : audit.securityScore >= 60
                          ? 'bg-security-medium/10 text-security-medium border border-security-medium/30'
                          : 'bg-security-critical/10 text-security-critical border border-security-critical/30'
                      }`}>
                        {audit.securityScore} / 100
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {audit.summary.critical > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-security-critical/20 text-security-critical border border-security-critical/30">
                            {audit.summary.critical} Crit
                          </span>
                        )}
                        {audit.summary.high > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-security-high/20 text-security-high border border-security-high/30">
                            {audit.summary.high} High
                          </span>
                        )}
                        {audit.summary.medium > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-security-medium/20 text-security-medium border border-security-medium/30">
                            {audit.summary.medium} Med
                          </span>
                        )}
                        {audit.summary.total === 0 && (
                          <span className="text-security-success flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Clean
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {truncateHash(audit.reportHash)}
                    </td>
                    <td className="px-5 py-4">
                      {audit.onChainStatus?.isRegistered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-security-success/10 text-security-success text-[11px] font-mono border border-security-success/30">
                          <CheckCircle className="w-3 h-3" /> Registered (Fuji)
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">Not Registered</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onSelectAudit(audit)}
                        className="inline-flex items-center gap-1 text-brand-accent hover:text-white font-medium transition-colors"
                      >
                        <span>View Report</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
