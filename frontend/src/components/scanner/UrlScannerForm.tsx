import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, Loader2, Clipboard } from 'lucide-react';

interface UrlScannerFormProps {
  onScan: (url: string) => Promise<void>;
  loading: boolean;
}

export const UrlScannerForm: React.FC<UrlScannerFormProps> = ({ onScan, loading }) => {
  const [url, setUrl] = useState('');

  const sampleUrls = [
    { label: 'Legitimate Authority', url: 'https://www.cisa.gov/cybersecurity-advisories' },
    { label: 'Brand Phishing (.top)', url: 'http://paypal-security-update-verification.com.top/login' },
    { label: 'Suspicious IP Host', url: 'http://185.220.101.4/secure-chase-online/auth.html' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    onScan(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch (_) {}
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>Real-Time URL Threat Analyzer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Analyzes domain structure, Shannon entropy, homoglyphs, and Random Forest feature vectors without visiting the server.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-cyan-500/70" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. https://secure-account-verification.xyz/login"
            className="w-full pl-11 pr-24 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            required
          />

          <div className="absolute inset-y-0 right-1.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePaste}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Test Samples:</span>
          </span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(s.url)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800/80 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
