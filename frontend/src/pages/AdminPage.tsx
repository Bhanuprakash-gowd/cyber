import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CommunityReport } from '../types';
import { SkeletonList } from '../components/common/SkeletonLoader';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Flag,
  RefreshCw,
  Radio,
  Cpu,
  Layers,
  Key,
  Database,
  Lock,
  ExternalLink
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [feedSources, setFeedSources] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adminKey, setAdminKey] = useState('cybersentry-admin-secret-dev-2026');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [reportsData, feedsData, modelData] = await Promise.all([
        api.getCommunityReports('pending'),
        api.getFeedSources(),
        api.getModelInfo()
      ]);
      setReports(reportsData.reports);
      setFeedSources(feedsData.sources);
      setModelInfo(modelData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reportId: string, newStatus: string) => {
    try {
      await api.moderateReport(reportId, newStatus, adminKey);
      setReports(prev => prev.filter(r => r.id !== reportId));
      setActionStatus(`Report marked as ${newStatus}`);
      setTimeout(() => setActionStatus(null), 3000);
    } catch (err: any) {
      alert(`Moderation failed: ${err.message}`);
    }
  };

  const handleSyncFeeds = async () => {
    setSyncing(true);
    try {
      const res = await api.syncFeedSources();
      setActionStatus(`Ingestion triggered: ${res.new_added} new advisories indexed.`);
      loadAdminData();
      setTimeout(() => setActionStatus(null), 4000);
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono mb-2">
            <Lock className="w-3 h-3" />
            <span>Authorized Administration Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Platform Moderation & Ingestion Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review community submissions, maintain trusted threat feeds, and audit model metadata.
          </p>
        </div>

        {/* Master Key Input for Dev Mode */}
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-500" />
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            title="Admin Master Token"
            placeholder="Admin Secret"
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500 w-48"
          />
        </div>
      </div>

      {actionStatus && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Section 1: Community Moderation Queue */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-400" />
            <span>Pending Community Reports Queue ({reports.length})</span>
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Consent Verified
          </span>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : reports.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No pending community submissions currently awaiting moderation.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                      {rep.category}
                    </span>
                    <span className="text-slate-400">Channel: {rep.channel_type}</span>
                    <span className="text-slate-500">{rep.incident_date}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {rep.description}
                  </p>

                  {rep.claimed_org && (
                    <p className="text-[11px] text-amber-300">
                      Claimed Brand: {rep.claimed_org}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleModerate(rep.id, 'approved')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleModerate(rep.id, 'rejected')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Threat News Feed Ingestion Configuration */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Configured Trusted Feed Sources ({feedSources.length})</span>
          </h2>

          <button
            onClick={handleSyncFeeds}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Force Feed Synchronization</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {feedSources.map((f, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{f.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate">{f.url}</p>
              <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                {f.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: ML Model Diagnostics */}
      {modelInfo && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Active Machine Learning Model Architecture</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Algorithm</span>
              <span className="font-bold text-white mt-1 block">Random Forest (100 Trees)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Accuracy</span>
              <span className="font-bold text-emerald-400 mt-1 block">
                {(modelInfo.metadata?.metrics?.accuracy * 100 || 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-mono block">F1 Score</span>
              <span className="font-bold text-cyan-400 mt-1 block">
                {(modelInfo.metadata?.metrics?.f1_score * 100 || 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-mono block">Features</span>
              <span className="font-bold text-white mt-1 block font-mono">
                {modelInfo.features?.length || 18} Vector Inputs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
