import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UrlScannerForm } from '../components/scanner/UrlScannerForm';
import { EmailScannerForm } from '../components/scanner/EmailScannerForm';
import { Globe, Mail, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'url' | 'email'>('url');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUrlScan = async (url: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.analyzeUrl(url, user?.id);
      navigate(`/results/${res.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailScan = async (text: string, channel: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.analyzeEmail(text, channel, user?.id);
      navigate(`/results/${res.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze message content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>Zero-Trust Inspection Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Unified Cyber Threat & Scam Scanner
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Evaluate hyperlinks, phishing lures, and deceptive communication without visiting unsafe servers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>URL Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'email'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & SMS Text</span>
          </button>
        </div>
      </div>

      {/* Error message banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Form */}
      {activeTab === 'url' ? (
        <UrlScannerForm onScan={handleUrlScan} loading={loading} />
      ) : (
        <EmailScannerForm onScan={handleEmailScan} loading={loading} />
      )}

      {/* Safety guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">No Outbound Requests</span>
            <span className="text-slate-400 text-[11px]">We never visit target URLs, preventing drive-by exploits.</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">ML Random Forest</span>
            <span className="text-slate-400 text-[11px]">18 structural features analyzed in under 20 milliseconds.</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">Zero Sensitive Storage</span>
            <span className="text-slate-400 text-[11px]">Credentials and OTPs are redacted prior to analysis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
