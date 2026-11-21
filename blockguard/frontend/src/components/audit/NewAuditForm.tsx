import React, { useState } from 'react';
import { 
  FileCode, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { VULNERABLE_VAULT_CODE, SECURE_VAULT_CODE } from '../../utils/sampleData';

interface NewAuditFormProps {
  onStartAudit: (sourceCode: string, contractName: string) => void;
  isLoading: boolean;
}

export const NewAuditForm: React.FC<NewAuditFormProps> = ({ onStartAudit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'sample'>('sample');
  const [contractName, setContractName] = useState('VulnerableVault.sol');
  const [sourceCode, setSourceCode] = useState(VULNERABLE_VAULT_CODE);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSample = (type: 'vulnerable' | 'secure') => {
    if (type === 'vulnerable') {
      setContractName('VulnerableVault.sol');
      setSourceCode(VULNERABLE_VAULT_CODE);
    } else {
      setContractName('SecureVault.sol');
      setSourceCode(SECURE_VAULT_CODE);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.sol')) {
      setError('Please upload a valid Solidity file ending with .sol');
      return;
    }
    setError(null);
    setContractName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSourceCode(content);
      setActiveTab('paste');
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) {
      setError('Source code cannot be empty.');
      return;
    }
    setError(null);
    onStartAudit(sourceCode, contractName.trim() || 'Contract.sol');
  };

  // Generate line numbers
  const lines = sourceCode.split('\n');

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCode className="w-6 h-6 text-brand-primary" />
          <span>New Contract Security Audit</span>
        </h1>
        <p className="text-xs text-slate-400">
          Analyze Solidity source code using static AST patterns and receive immediate AI remediation suggestions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bg-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('sample')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sample'
              ? 'border-brand-primary text-brand-accent bg-brand-primary/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample Contract</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'paste'
              ? 'border-brand-primary text-brand-accent bg-brand-primary/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Paste Code</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'border-brand-primary text-brand-accent bg-brand-primary/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload .sol File</span>
        </button>
      </div>

      {/* Sample Picker Panel */}
      {activeTab === 'sample' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSelectSample('vulnerable')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
              contractName === 'VulnerableVault.sol'
                ? 'border-security-critical/50 bg-security-critical/10 shadow-lg shadow-security-critical/10'
                : 'border-bg-border bg-bg-surface hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-security-critical" />
                VulnerableVault.sol
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-security-critical/20 text-security-critical font-bold">
                5 Flaws Inside
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Contains classic reentrancy, unprotected fee setter, tx.origin authentication, unhandled return call, and division-before-multiplication.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('secure')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
              contractName === 'SecureVault.sol'
                ? 'border-security-success/50 bg-security-success/10 shadow-lg shadow-security-success/10'
                : 'border-bg-border bg-bg-surface hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-security-success" />
                SecureVault.sol
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-security-success/20 text-security-success font-bold">
                Clean (100 Score)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hardened with nonReentrant mutex, Checks-Effects-Interactions, onlyOwner access control, msg.sender, and safe integer operations.
            </p>
          </button>
        </div>
      )}

      {/* File Upload Zone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`p-10 border-2 border-dashed rounded-2xl text-center space-y-3 transition-all ${
            dragActive ? 'border-brand-accent bg-brand-accent/5' : 'border-bg-border bg-bg-surface/50'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-300">
            Drag and drop your <strong>.sol</strong> file here, or{' '}
            <label className="text-brand-accent hover:underline cursor-pointer">
              browse files
              <input
                type="file"
                accept=".sol"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </label>
          </p>
          <p className="text-[10px] text-slate-500">Supports single Solidity files up to 1MB</p>
        </div>
      )}

      {/* Contract Name & Code Editor Container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Contract File Name</label>
          <input
            type="text"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 rounded-lg bg-bg-surface border border-bg-border focus:border-brand-primary outline-none text-xs font-mono text-white transition-colors"
            placeholder="MyContract.sol"
            required
          />
        </div>

        {/* Code Editor with Line Numbers */}
        <div className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
          <div className="bg-bg-elevated px-4 py-2 border-b border-bg-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Solidity Source Editor</span>
            <span>{lines.length} lines</span>
          </div>

          <div className="flex font-mono text-xs max-h-[460px] overflow-auto">
            {/* Line numbers gutter */}
            <div className="bg-bg-surface py-3 px-3 text-right text-slate-600 select-none border-r border-bg-border">
              {lines.map((_, i) => (
                <div key={i} className="leading-5">{i + 1}</div>
              ))}
            </div>

            {/* Code text area */}
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent p-3 text-slate-200 outline-none resize-none leading-5 font-mono whitespace-pre overflow-x-auto min-h-[380px]"
              placeholder="// Paste Solidity contract code here..."
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-security-critical/10 border border-security-critical/30 text-security-critical text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !sourceCode.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white text-xs font-semibold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Run Security Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
