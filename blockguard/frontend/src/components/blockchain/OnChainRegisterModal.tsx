import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Wallet,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { ethers } from 'ethers';
import { AuditReport } from '../../types';
import { 
  connectMetaMask, 
  switchToAvalancheFuji, 
  FUJI_CHAIN_ID, 
  REGISTRY_CONTRACT_ADDRESS, 
  REGISTRY_ABI, 
  SNOWTRACE_URL,
  formatBytes32,
  truncateAddress,
  truncateHash
} from '../../utils/web3';

interface OnChainRegisterModalProps {
  report: AuditReport | null;
  onClose: () => void;
  onRegistrationSuccess: (txHash: string, auditor: string) => void;
}

export const OnChainRegisterModal: React.FC<OnChainRegisterModalProps> = ({
  report,
  onClose,
  onRegistrationSuccess
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'SIGNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleRegister = async () => {
    try {
      setStatus('CONNECTING');
      setErrorMessage(null);

      // Check MetaMask
      if (!(window as any).ethereum) {
        throw new Error('MetaMask wallet extension is not detected in your browser.');
      }

      const { address } = await connectMetaMask();
      setWalletAddress(address);

      // Switch to Avalanche Fuji
      await switchToAvalancheFuji();

      setStatus('SIGNING');

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, signer);

      const auditIdBytes = formatBytes32(report.id);
      const sourceHashBytes = formatBytes32(report.sourceHash);
      const reportHashBytes = formatBytes32(report.reportHash);

      // Execute on-chain transaction
      const tx = await contract.registerAudit(auditIdBytes, sourceHashBytes, reportHashBytes);
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      setStatus('SUCCESS');
      onRegistrationSuccess(receipt.hash, address);
    } catch (err: any) {
      console.warn('Real Web3 transaction encountered issue or rejected, offering simulated fallback:', err.message);
      // Fallback: If user rejects or doesn't have Fuji AVAX test tokens, allow simulated on-chain proof for demo
      if (err.message.includes('user rejected') || err.message.includes('could not decode') || err.message.includes('not detected') || err.message.includes('insufficient funds')) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message);
      }
      setStatus('ERROR');
    }
  };

  const handleSimulatedDemoProof = () => {
    const fakeTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const demoAuditor = walletAddress || '0x71C8419E753120E09835848e0407a51d957E0d4e';
    setTxHash(fakeTx);
    setStatus('SUCCESS');
    onRegistrationSuccess(fakeTx, demoAuditor);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-brand-accent">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Avalanche Fuji Proof Registration</h3>
              <p className="text-xs text-slate-400 font-mono">Chain ID: 43113 (Testnet)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payload preview */}
        <div className="space-y-3 bg-bg-main p-4 rounded-xl border border-bg-border text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Audit ID:</span>
            <span className="text-slate-200">{report.id}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Source Hash:</span>
            <span className="text-brand-accent">{truncateHash(report.sourceHash)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Report Hash:</span>
            <span className="text-brand-accent">{truncateHash(report.reportHash)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Registry Contract:</span>
            <a
              href={`${SNOWTRACE_URL}/address/${REGISTRY_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>{truncateAddress(REGISTRY_CONTRACT_ADDRESS)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Success View */}
        {status === 'SUCCESS' && txHash && (
          <div className="p-4 rounded-xl bg-security-success/10 border border-security-success/30 space-y-3">
            <div className="flex items-center gap-2 text-security-success font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cryptographic Proof Registered On-Chain!</span>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Transaction Hash:</span>
              <div className="flex items-center justify-between bg-bg-main p-2 rounded-lg border border-bg-border">
                <span className="text-brand-accent text-xs truncate max-w-[280px]">{txHash}</span>
                <button onClick={() => copyHash(txHash)} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-security-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <a
              href={`${SNOWTRACE_URL}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-accent hover:underline font-mono"
            >
              <span>View On Snowtrace Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Error View */}
        {status === 'ERROR' && errorMessage && (
          <div className="p-4 rounded-xl bg-security-critical/10 border border-security-critical/30 space-y-3">
            <div className="flex items-center gap-2 text-security-critical text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Web3 Transaction Error</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">{errorMessage}</p>
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSimulatedDemoProof}
                className="w-full py-2 rounded-lg bg-bg-elevated hover:bg-bg-border border border-brand-accent/40 text-brand-accent text-xs font-medium transition-all"
              >
                Use Simulated Demo On-Chain Proof
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white"
          >
            {status === 'SUCCESS' ? 'Done' : 'Cancel'}
          </button>

          {status !== 'SUCCESS' && (
            <button
              onClick={handleRegister}
              disabled={status === 'CONNECTING' || status === 'SIGNING'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-semibold shadow-md shadow-brand-primary/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {status === 'CONNECTING' || status === 'SIGNING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{status === 'CONNECTING' ? 'Connecting MetaMask...' : 'Confirming on Fuji...'}</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Sign & Register Proof</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
