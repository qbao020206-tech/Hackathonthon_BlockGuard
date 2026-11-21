import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  Cpu, 
  Lock, 
  Layers, 
  Activity,
  FileSearch
} from 'lucide-react';

interface ProcessingStateProps {
  onComplete: () => void;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  icon: any;
}

const STEPS: Step[] = [
  { id: 1, label: 'Parsing AST & Signatures', detail: 'Generating tokenized AST without executing untrusted code', icon: FileSearch },
  { id: 2, label: 'Auditing Reentrancy Patterns', detail: 'Checking state variables vs. low-level .call invocations', icon: Cpu },
  { id: 3, label: 'Access Control Verification', detail: 'Inspecting onlyOwner, auth modifiers on sensitive methods', icon: Lock },
  { id: 4, label: 'Low-Level Call Safety', detail: 'Evaluating return values and error reverts on external transfers', icon: ShieldAlert },
  { id: 5, label: 'Arithmetic & State Precision', detail: 'Validating division ordering and potential zero truncation', icon: Activity },
  { id: 6, label: 'Cryptographic Proof & Hashes', detail: 'Computing canonical Keccak256 sourceHash and reportHash', icon: Layers },
];

export const ProcessingState: React.FC<ProcessingStateProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Honest realistic timing (approx 450ms per step)
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 350);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-16 px-6 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 text-brand-accent animate-pulse-slow">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Executing Static Security Audit
        </h2>
        <p className="text-xs text-slate-400">
          Running 5-rule vulnerability matrix with zero-execution safety guarantee.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Pipeline Progress</span>
          <span className="text-brand-accent font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-bg-surface h-2 rounded-full overflow-hidden border border-bg-border">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 6-Step Pipeline List */}
      <div className="space-y-3 bg-bg-surface p-6 rounded-2xl border border-bg-border">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-bg-elevated border border-brand-primary/40'
                  : isDone
                  ? 'bg-bg-surface/30 opacity-80'
                  : 'opacity-40'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-security-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                    {step.id}
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <p className={`text-xs font-semibold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
