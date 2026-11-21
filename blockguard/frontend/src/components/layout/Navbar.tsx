import React from 'react';
import { Shield, Wallet, ExternalLink, Activity } from 'lucide-react';
import { truncateAddress, truncateHash, SNOWTRACE_URL } from '../../utils/web3';

interface NavbarProps {
  walletAddress: string | null;
  chainId: number | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onSearchAudit?: (auditId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletAddress,
  chainId,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  const isFuji = chainId === 43113;

  return (
    <header className="h-16 border-b border-bg-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent p-0.5 shadow-lg shadow-brand-primary/20 flex items-center justify-center">
          <div className="w-full h-full bg-bg-surface rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-accent" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-accent bg-clip-text text-transparent">
              BlockGuard
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-accent border border-brand-primary/30 uppercase font-semibold">
              v1.0 AI
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Smart Contract Security Assistant</p>
        </div>
      </div>

      {/* Right controls: Avalanche Fuji network badge & MetaMask Wallet */}
      <div className="flex items-center gap-3">
        {/* Avalanche Fuji Network indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-bg-border text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${isFuji ? 'bg-security-success animate-pulse' : 'bg-security-high'}`} />
          <span className="text-slate-300">Avalanche Fuji</span>
          <span className="text-slate-500 text-[10px]">(43113)</span>
          <a
            href={SNOWTRACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="View Snowtrace Explorer"
            className="text-slate-400 hover:text-brand-accent ml-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Web3 Connect Wallet Button */}
        {walletAddress ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-brand-primary/40 text-xs font-mono text-slate-200">
              <span className="w-2 h-2 rounded-full bg-security-success" />
              <span>{truncateAddress(walletAddress)}</span>
            </div>
            <button
              onClick={onDisconnectWallet}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-security-critical hover:bg-bg-elevated rounded-lg transition-colors border border-transparent hover:border-security-critical/30"
              title="Disconnect"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white text-xs font-medium transition-all shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/40 cursor-pointer active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
};
