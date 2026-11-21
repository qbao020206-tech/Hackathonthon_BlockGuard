import React from 'react';
import { 
  LayoutDashboard, 
  FileCode2, 
  ShieldCheck, 
  GitCompare, 
  CheckCircle2, 
  Home, 
  Layers
} from 'lucide-react';
import { ViewState } from '../../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  auditCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, auditCount }) => {
  const navItems = [
    { id: 'landing' as ViewState, label: 'Overview & Manifesto', icon: Home },
    { id: 'dashboard' as ViewState, label: 'Security Dashboard', icon: LayoutDashboard },
    { id: 'new-audit' as ViewState, label: 'New Contract Audit', icon: FileCode2, badge: 'Scanner' },
    { id: 'report' as ViewState, label: 'Audit Findings', icon: ShieldCheck, count: auditCount },
    { id: 'diff' as ViewState, label: 'AI Remediation Diff', icon: GitCompare, badge: 'AI' },
    { id: 'verify' as ViewState, label: 'Verify On-Chain', icon: CheckCircle2 },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-bg-border bg-bg-surface/60 backdrop-blur-sm p-4 flex flex-col justify-between hidden md:flex sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-4">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-primary/25 to-brand-accent/10 text-white border border-brand-primary/40 shadow-sm shadow-brand-primary/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-bg-elevated'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-accent' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap tracking-tight">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-accent border border-brand-primary/30 flex-shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-bg-elevated text-slate-300 border border-bg-border flex-shrink-0 ml-1">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Network Info Footer */}
      <div className="pt-4 border-t border-bg-border mt-auto">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-2 py-1.5 rounded-lg bg-bg-elevated/50 border border-bg-border/60">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-brand-primary" /> Avalanche Fuji
          </span>
          <span className="flex items-center gap-1 text-security-success font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-security-success animate-pulse" /> Active
          </span>
        </div>
      </div>
    </aside>
  );
};
