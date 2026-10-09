import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ThreatArticle } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { Bookmark, ExternalLink, Trash2, Newspaper } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { bookmarks, toggleBookmark } = useAuth();
  const [savedArticles, setSavedArticles] = useState<ThreatArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarkedItems() {
      try {
        const res = await api.getThreatNews();
        const matched = res.articles.filter(a => bookmarks.includes(a.id));
        setSavedArticles(matched);
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarkedItems();
  }, [bookmarks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-cyan-400" />
          <span>Saved Articles & Intelligence</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quickly access your bookmarked security advisories and fraud reports.
        </p>
      </div>

      {savedArticles.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Bookmarks Saved Yet"
          description="Browse our real-world threat news and save advisories for offline or future review."
          actionText="Browse Threat Intelligence"
          actionLink="/threat-news"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedArticles.map((art) => (
            <div
              key={art.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(art.published_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleBookmark(art.id)}
                  className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                <a
                  href={art.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
