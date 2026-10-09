import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThreatArticle } from '../types';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import {
  Newspaper,
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Clock,
  Shield,
  Radio
} from 'lucide-react';

export const ThreatNewsPage: React.FC = () => {
  const { bookmarks, toggleBookmark } = useAuth();
  const [articles, setArticles] = useState<ThreatArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Phishing Campaigns',
    'Banking & UPI Scams',
    'Fake Jobs & Recruitment',
    'Parcel & Delivery Scams',
    'Malware & Ransomware',
    'Zero-Day Advisories'
  ];

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await api.getThreatNews(selectedCategory, search);
      setArticles(res.articles);
    } catch (err) {
      console.error('Failed to load threat news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFeeds = async () => {
    setSyncing(true);
    try {
      await api.syncFeedSources();
      await loadNews();
    } catch (err) {
      console.error('Failed to sync feeds:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono mb-2">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>CISA, HackerNews & BleepingComputer Feeds</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-cyan-400" />
            <span>Threat Intelligence Wire</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated advisories, active smishing campaigns, zero-day CVEs, and enterprise cyber alerts.
          </p>
        </div>

        <button
          onClick={handleSyncFeeds}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Feeds...' : 'Refresh Ingestion'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords (e.g. ransomware, UPI, DHL)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Categories scrollable pill row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="No Threat Advisories Found"
          description="Try adjusting your keyword search or category filter."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((item) => {
            const isSaved = bookmarks.includes(item.id);
            const isCritical = item.severity === 'Critical';

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all hover:shadow-xl group"
              >
                <div>
                  {/* Category & Severity header */}
                  <div className="flex items-center justify-between text-[11px] mb-3">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                      {item.category}
                    </span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                      isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-300'
                    }`}>
                      {item.severity}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-slate-300 font-medium">{item.source_name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => toggleBookmark(item.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isSaved
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark advisory'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      <span>Read Original Advisory</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
