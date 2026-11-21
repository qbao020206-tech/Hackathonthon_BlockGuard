import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Terminal, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { ViewState } from '../../types';

interface LandingPageProps {
  onStartAudit: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAudit, onExploreDemo }) => {
  return (
    <div className="space-y-20 py-8 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Hero Manifesto */}
      <section className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-accent text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cloudflare-Inspired Static Security Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Smart Contract Security,{' '}
          <span className="bg-gradient-to-r from-brand-primary via-brand-accent to-security-success bg-clip-text text-transparent">
            Demystified & Verified
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          BlockGuard combines pattern-based static code auditing with AI-assisted remediation and immutable integrity proofs on <strong>Avalanche Fuji Testnet</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartAudit}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white font-medium text-sm shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Security Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-surface hover:bg-bg-elevated border border-bg-border hover:border-brand-accent/40 text-slate-200 font-medium text-sm transition-all cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-brand-accent" />
            <span>Load Sample Exploit Contract</span>
          </button>
        </div>
      </section>

      {/* 4-Step Workflow */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Continuous Security Workflow</h2>
          <p className="text-sm text-slate-400">Four disciplined steps to secure Solidity smart contracts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Submit Code',
              desc: 'Paste Solidity source or upload .sol files. Zero execution ensures safe handling of untrusted code.',
              icon: FileCheck2,
            },
            {
              step: '02',
              title: 'Analyze Patterns',
              desc: 'Static AST inspection scans for Reentrancy, Access Control, tx.origin, and unchecked calls.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Fix & Re-Analyze',
              desc: 'Receive AI-assisted remediation and side-by-side split diffs with instant re-audit verification.',
              icon: Lock,
            },
            {
              step: '04',
              title: 'On-Chain Verify',
              desc: 'Anchor report integrity hash onto Avalanche Fuji. Anyone can verify report authenticity.',
              icon: Layers,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-bg-surface border border-bg-border hover:border-brand-primary/40 transition-all space-y-3 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-brand-primary/30 group-hover:text-brand-accent transition-colors">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-lg bg-bg-elevated text-brand-accent border border-bg-border">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-base">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Why BlockGuard?</h2>
          <p className="text-sm text-slate-400">Comparing manual audits, basic linters, and BlockGuard</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-bg-border bg-bg-surface">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-bg-elevated text-xs uppercase font-mono text-slate-400 border-b border-bg-border">
              <tr>
                <th className="px-6 py-4">Capability</th>
                <th className="px-6 py-4">Traditional Audits</th>
                <th className="px-6 py-4">Basic CLI Linters</th>
                <th className="px-6 py-4 text-brand-accent">BlockGuard AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border text-xs">
              <tr className="hover:bg-bg-elevated/40">
                <td className="px-6 py-4 font-medium text-white">Speed to Feedback</td>
                <td className="px-6 py-4 text-slate-400">2 - 6 Weeks</td>
                <td className="px-6 py-4 text-slate-400">&lt; 10 Seconds</td>
                <td className="px-6 py-4 text-brand-accent font-semibold">&lt; 3 Seconds (Instant)</td>
              </tr>
              <tr className="hover:bg-bg-elevated/40">
                <td className="px-6 py-4 font-medium text-white">Actionable Remediation</td>
                <td className="px-6 py-4 text-slate-400">PDF Recommendations</td>
                <td className="px-6 py-4 text-slate-400">Terminal Warnings</td>
                <td className="px-6 py-4 text-brand-accent font-semibold">Side-by-Side Diff + AI Explanations</td>
              </tr>
              <tr className="hover:bg-bg-elevated/40">
                <td className="px-6 py-4 font-medium text-white">On-Chain Tamper Proof</td>
                <td className="px-6 py-4 text-slate-400">None</td>
                <td className="px-6 py-4 text-slate-400">None</td>
                <td className="px-6 py-4 text-security-success font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Avalanche Fuji Registry
                </td>
              </tr>
              <tr className="hover:bg-bg-elevated/40">
                <td className="px-6 py-4 font-medium text-white">Cost & Accessibility</td>
                <td className="px-6 py-4 text-security-critical">$5,000 - $50,000+</td>
                <td className="px-6 py-4 text-slate-400">Free / Technical setup</td>
                <td className="px-6 py-4 text-security-success font-semibold">Free & Accessible Web UI</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimer Box */}
      <section className="p-5 rounded-2xl bg-bg-surface border border-security-medium/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-security-medium flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-200">Security Notice & Limitation</p>
          <p className="text-slate-400 leading-relaxed">
            BlockGuard is a developer security assistant designed to spot high-impact patterns and guide remediation. Passing an automated scan does not replace a comprehensive multi-auditor manual engagement before deploying millions in TVL to production mainnets.
          </p>
        </div>
      </section>
    </div>
  );
};
