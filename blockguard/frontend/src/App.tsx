import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { NewAuditForm } from './components/audit/NewAuditForm';
import { ProcessingState } from './components/audit/ProcessingState';
import { AuditReportView } from './components/audit/AuditReport';
import { FindingDetailModal } from './components/audit/FindingDetailModal';
import { DiffViewer } from './components/audit/DiffViewer';
import { OnChainRegisterModal } from './components/blockchain/OnChainRegisterModal';
import { VerifyReportPage } from './components/verify/VerifyReportPage';
import { AuditReport, Finding, ViewState } from './types';
import { VULNERABLE_VAULT_CODE } from './utils/sampleData';
import { connectMetaMask } from './utils/web3';
import { getApiUrl } from './utils/api';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [audits, setAudits] = useState<AuditReport[]>([]);
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
  const [modalFinding, setModalFinding] = useState<Finding | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(43113);
  const [pendingSource, setPendingSource] = useState<{ code: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize strictly with real backend API
  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch(getApiUrl('/api/audits'));
        if (res.ok) {
          const list: AuditReport[] = await res.json();
          if (list.length > 0) {
            setAudits(list);
            setActiveReport(list[0]);
            return;
          }
        }

        // Seed initial audit via real backend API
        const seedRes = await fetch(getApiUrl('/api/audits'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCode: VULNERABLE_VAULT_CODE,
            contractName: 'VulnerableVault.sol'
          })
        });

        if (seedRes.ok) {
          const initialReport: AuditReport = await seedRes.json();
          setAudits([initialReport]);
          setActiveReport(initialReport);
        }
      } catch (err: any) {
        console.error('Failed to connect to BlockGuard Backend API:', err);
        setErrorMessage('Could not connect to BlockGuard Backend API. Please ensure backend is running on port 3001.');
      }
    }

    initDashboard();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const { address, chainId } = await connectMetaMask();
      setWalletAddress(address);
      setChainId(chainId);
    } catch (err: any) {
      alert(err.message || 'Could not connect MetaMask.');
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
  };

  const handleStartAudit = (sourceCode: string, contractName: string) => {
    setPendingSource({ code: sourceCode, name: contractName });
    setCurrentView('processing');
  };

  const handleProcessingComplete = async () => {
    if (!pendingSource) return;

    try {
      const res = await fetch(getApiUrl('/api/audits'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: pendingSource.code,
          contractName: pendingSource.name
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Scan request failed' }));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const report: AuditReport = await res.json();
      setAudits(prev => [report, ...prev]);
      setActiveReport(report);
      setCurrentView('report');
    } catch (err: any) {
      console.error('Audit failed:', err);
      alert(`Audit scan error from backend: ${err.message}`);
      setCurrentView('new-audit');
    }
  };

  const handleApplyFix = async (newSourceCode: string) => {
    if (!activeReport) return;

    try {
      const res = await fetch(getApiUrl(`/api/audits/${activeReport.id}/reanalyze`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: newSourceCode })
      });

      if (!res.ok) {
        throw new Error(`Reanalysis failed with status ${res.status}`);
      }

      const updatedReport: AuditReport = await res.json();
      setActiveReport(updatedReport);
      setAudits(prev => prev.map(a => a.id === updatedReport.id ? updatedReport : a));
      setCurrentView('report');
    } catch (err: any) {
      alert(`Re-analysis error: ${err.message}`);
    }
  };

  const handleRegisterOnChainSuccess = async (txHash: string, auditor: string) => {
    if (!activeReport) return;

    try {
      // Sync on-chain status to backend
      await fetch(getApiUrl(`/api/audits/${activeReport.id}/onchain`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash, auditor })
      });
    } catch (e) {
      console.warn('Failed to record on-chain status to backend:', e);
    }

    const updated: AuditReport = {
      ...activeReport,
      onChainStatus: {
        isRegistered: true,
        txHash,
        registeredAt: Date.now(),
        auditor
      }
    };
    setActiveReport(updated);
    setAudits(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-slate-100">
      <Navbar
        walletAddress={walletAddress}
        chainId={chainId}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />

      {errorMessage && (
        <div className="bg-security-critical/10 border-b border-security-critical/30 px-6 py-2 text-xs font-mono text-security-critical text-center">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="flex-1 flex">
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          auditCount={audits.length}
        />

        <main className="flex-1 overflow-y-auto">
          {currentView === 'landing' && (
            <LandingPage
              onStartAudit={() => setCurrentView('new-audit')}
              onExploreDemo={() => {
                setActiveReport(audits[0] || null);
                setCurrentView('report');
              }}
            />
          )}

          {currentView === 'dashboard' && (
            <Dashboard
              audits={audits}
              onSelectAudit={(audit) => {
                setActiveReport(audit);
                setCurrentView('report');
              }}
              onNewAudit={() => setCurrentView('new-audit')}
            />
          )}

          {currentView === 'new-audit' && (
            <NewAuditForm
              onStartAudit={handleStartAudit}
              isLoading={false}
            />
          )}

          {currentView === 'processing' && (
            <ProcessingState onComplete={handleProcessingComplete} />
          )}

          {currentView === 'report' && activeReport && (
            <AuditReportView
              report={activeReport}
              onOpenDiff={(finding) => {
                setActiveFinding(finding);
                setCurrentView('diff');
              }}
              onReanalyze={() => {
                setPendingSource({ code: activeReport.sourceCode, name: activeReport.contractName });
                setCurrentView('processing');
              }}
              onRegisterOnChain={() => setIsRegisterModalOpen(true)}
              onSelectFinding={(finding) => setModalFinding(finding)}
            />
          )}

          {currentView === 'diff' && (
            <DiffViewer
              finding={activeFinding || activeReport?.findings[0] || null}
              report={activeReport}
              onApplyFix={handleApplyFix}
              onBack={() => setCurrentView('report')}
            />
          )}

          {currentView === 'verify' && (
            <VerifyReportPage />
          )}
        </main>
      </div>

      {/* Modal Dialogs */}
      {modalFinding && (
        <FindingDetailModal
          finding={modalFinding}
          onClose={() => setModalFinding(null)}
          onOpenDiff={(f) => {
            setActiveFinding(f);
            setCurrentView('diff');
          }}
        />
      )}

      {isRegisterModalOpen && activeReport && (
        <OnChainRegisterModal
          report={activeReport}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegistrationSuccess={handleRegisterOnChainSuccess}
        />
      )}
    </div>
  );
}
