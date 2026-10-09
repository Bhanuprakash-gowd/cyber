import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScanResult, RiskLevel } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Globe, 
  Mail, 
  Filter, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(user?.id);
      setScans(res.scans);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this scan from your history?')) return;
    try {
      await api.deleteScan(id, user?.id);
      setScans(scans.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  const filteredScans = scans.filter(s => {
    const matchesSearch = (s.target || s.input_target || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || s.scan_type === typeFilter;
    const matchesRisk = riskFilter === 'all' || s.risk_level === riskFilter;
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Threat Evaluation History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review past telemetry, forensic risk scores, and exported vulnerability audits.
          </p>
        </div>

        <a
          href={api.getExportCsvUrl(user?.id)}
          download
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export History (CSV)</span>
        </a>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search analyzed targets..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Artifact Types</option>
            <option value="url">URLs Only</option>
            <option value="email">Emails / Text Only</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="suspicious">Suspicious</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Scan History List */}
      {loading ? (
        <SkeletonList count={5} />
      ) : filteredScans.length === 0 ? (
        <EmptyState
          title="No Matching Scans Found"
          description="You haven't scanned any artifacts matching this criteria yet, or your search query returned zero results."
          actionText="Run a Threat Scan"
          actionLink="/scanner"
        />
      ) : (
        <div className="space-y-2.5">
          {filteredScans.map((scan) => (
            <Link
              key={scan.id}
              to={`/results/${scan.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all gap-4 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {scan.scan_type === 'url' ? <Globe className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {scan.scan_type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-mono font-semibold text-white group-hover:text-cyan-300 truncate mt-1">
                    {scan.target || scan.input_target}
                  </h4>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                <RiskBadge level={scan.risk_level} size="sm" />
                <span className="text-xs font-mono text-slate-400">
                  {scan.risk_score}/100
                </span>
                
                <button
                  onClick={(e) => handleDelete(e, scan.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors hidden sm:block" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
