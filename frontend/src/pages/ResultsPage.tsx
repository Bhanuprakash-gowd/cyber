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
  Fingerprint,
  HelpCircle
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
  const isUnverified = scan.risk_level === 'unverified';

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
          : isUnverified
          ? 'bg-sky-950/20 border-sky-500/30'
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
                  isHighRisk ? 'bg-rose-500 shadow-[0_0_8px_#f87171]' : isSuspicious ? 'bg-amber-500' : isUnverified ? 'bg-sky-500 shadow-[0_0_8px_#38bdf8]' : 'bg-emerald-500'
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

      {/* Zero-Trust Security Advisory for Unverified Links */}
      {isUnverified && (
        <div className="rounded-2xl border border-sky-500/40 bg-sky-950/30 backdrop-blur-xl p-5 shadow-xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Zero-Trust Security Advisory: Unverified Destination</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Why isn't this marked safe?</strong> An attacker can easily register a fresh, arbitrary domain, configure free HTTPS, and send it directly to you. Because the domain is newly created or lacks authoritative institutional history, global blocklists have zero prior incident reports on it. <strong>Absence of threat reports does NOT mean the link is safe.</strong> Do NOT enter credentials, OTPs, or payment details.
            </p>
          </div>
        </div>
      )}

      {/* Domain Architecture & Public Suffix (eTLD+1) Card */}
      {scan.domain_details && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>Domain Architecture & Public Suffix (eTLD+1) Breakdown</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Registered Apex Domain</span>
              <span className="font-mono font-bold text-cyan-300 break-all">{scan.domain_details.registered_domain || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">SLD Label</span>
              <span className="font-mono text-white">{scan.domain_details.sld || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Public Suffix / TLD</span>
              <span className="font-mono text-white">.{scan.domain_details.tld || 'N/A'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Subdomains</span>
              <span className="font-mono text-slate-300 break-all">{scan.domain_details.subdomains || '(none / apex)'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Risk Indicators Evidence & Feature Vector Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identified Indicators (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Identified Risk Indicators & Forensic Evidence ({scan.indicators.length})</span>
          </h3>

          {scan.indicators.length === 0 ? (
            isUnverified ? (
              <div className="p-6 rounded-xl bg-sky-950/30 border border-sky-800/40 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-sky-400 mx-auto" />
                <p className="text-xs text-sky-200 font-medium">Unverified Domain Signature</p>
                <p className="text-[11px] text-slate-400">
                  No public blacklist records exist yet, but the domain lacks verified organizational provenance. Zero threat reports does NOT equal safe.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Clean Signature Profile</p>
                <p className="text-[11px] text-slate-500">
                  No unauthorized brand squatting, homoglyphs, high-risk TLDs, IP hosts, or sensitive keyword traps detected.
                </p>
              </div>
            )
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

      {/* Multi-Layer Security Checks Audit & Transparency Card */}
      {scan.evidence_audit && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>Multi-Layer Security Checks Audit Trail</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Evidence-Based Verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completed Checks */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Completed Detection Layers
              </h4>
              <div className="space-y-2">
                {scan.evidence_audit.completed_checks?.map((chk, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{chk.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        chk.status === 'flagged' ? 'bg-rose-500/20 text-rose-400' :
                        chk.status === 'completed' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {chk.status.toUpperCase()}
                      </span>
                    </div>
                    {chk.details && <p className="text-[11px] text-slate-400">{chk.details}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Unavailable / Safety-Disabled Checks */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Unavailable / Disabled Checks (Safe Mode)
              </h4>
              <div className="space-y-2">
                {scan.evidence_audit.unavailable_checks?.map((chk, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-400">{chk.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {chk.status === 'disabled_for_safety' ? 'DISABLED (SAFETY)' : 'UNAVAILABLE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{chk.reason}</p>
                  </div>
                ))}

                {/* Machine Learning Model Limitations Banner */}
                {scan.evidence_audit.ml_limitations && (
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs space-y-1.5 mt-2">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
                      Machine Learning Safety & Known Limitations
                    </span>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                      {scan.evidence_audit.ml_limitations.known_limitations?.map((lim, idx) => (
                        <li key={idx} className="leading-relaxed">{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
