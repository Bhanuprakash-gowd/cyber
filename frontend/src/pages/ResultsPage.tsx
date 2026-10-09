import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { FeatureRadar } from '../components/scanner/FeatureRadar';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2,
  FileText,
  Bot,
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Cpu,
  Fingerprint
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getReport(id)
      .then(res => setScan(res))
      .catch(err => console.error('Failed to load scan report:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConsultAI = () => {
    if (!scan) return;
    // Pass scan context into assistant page
    navigate('/assistant', { state: { scanContext: scan } });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonCard rows={5} />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Scan Record Not Found</h2>
        <p className="text-sm text-slate-400">The requested scan ID does not exist or has expired.</p>
        <Link to="/scanner" className="inline-block px-4 py-2 bg-cyan-500 text-black text-xs font-semibold rounded-xl">
          Return to Threat Scanner
        </Link>
      </div>
    );
  }

  const isHighRisk = scan.risk_level === 'high';
  const isSuspicious = scan.risk_level === 'suspicious';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button and quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/scanner"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Threat Scan</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Ask AI Assistant */}
          <button
            onClick={handleConsultAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 text-xs font-medium transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Consult AI Safety Agent</span>
          </button>

          {/* Download PDF Audit Report */}
          <a
            href={api.getExportPdfUrl(scan.id)}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </a>
        </div>
      </div>

      {/* Main Verdict Card */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all ${
        isHighRisk
          ? 'bg-rose-950/20 border-rose-500/30'
          : isSuspicious
          ? 'bg-amber-950/20 border-amber-500/30'
          : 'bg-emerald-950/20 border-emerald-500/30'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RiskBadge level={scan.risk_level} size="lg" />
              <span className="text-xs font-mono text-slate-400">
                Score: <strong className="text-white font-bold">{scan.risk_score}</strong>/100
              </span>
              <span className="text-xs font-mono text-slate-400">
                Confidence: <strong className="text-white font-bold">{scan.confidence}%</strong>
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Target Artifact ({scan.scan_type.toUpperCase()})
              </span>
              <p className="text-lg sm:text-xl font-mono font-bold text-white break-all mt-0.5">
                {scan.target || scan.input_target}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {scan.summary}
            </p>
          </div>

          {/* Risk Score Dial Meter */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {scan.risk_score}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
              Threat Score
            </div>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighRisk ? 'bg-rose-500 shadow-[0_0_8px_#f87171]' : isSuspicious ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, scan.risk_score)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scan Metadata Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan ID: {scan.id}</span>
            <button onClick={handleCopyId} className="hover:text-cyan-400">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span>Model: Random Forest v{scan.model_version}</span>
            <span>Evaluated: {new Date(scan.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Grid: Risk Indicators Evidence & Feature Vector Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identified Indicators (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Identified Risk Indicators & Forensic Evidence ({scan.indicators.length})</span>
          </h3>

          {scan.indicators.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Clean Signature Profile</p>
              <p className="text-[11px] text-slate-500">
                No known homoglyphs, high-risk TLDs, IP hosts, or sensitive keyword traps detected.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scan.indicators.map((ind, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{ind.type}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      ind.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      ind.severity === 'High' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                      ind.severity === 'Medium' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {ind.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {ind.evidence}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Radar Visualization */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Structural Anomaly Profile</h3>
            <p className="text-[11px] text-slate-400 mb-2">Multivariate vector evaluation</p>
          </div>
          <FeatureRadar features={scan.feature_breakdown} />
        </div>
      </div>

      {/* Recommended Safe Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Recommended Defensive Countermeasures</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scan.recommended_actions.map((act, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
