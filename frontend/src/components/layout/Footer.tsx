import React from 'react';
import { Shield, Lock, Terminal, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-6 px-4 sm:px-8 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>CyberSentry AI Platform</span>
          </div>
          <span>•</span>
          <span className="font-mono text-slate-400">Random Forest v1.2</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Threat Guard Active
          </span>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-[11px] text-slate-500">
            Automated assessments are heuristic & machine-learning driven. Always verify official root domains.
          </p>
        </div>
      </div>
    </footer>
  );
};
