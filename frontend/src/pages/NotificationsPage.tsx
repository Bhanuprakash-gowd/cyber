import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AppNotification } from '../types';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Bell, CheckCheck, ExternalLink, ShieldAlert, Info, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            <span>Security Alerts & Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time advisory broadcasts, scan alerts, and community moderation updates.
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All Caught Up"
          description="You have no unread security notifications or platform alerts at this time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                  : 'bg-slate-900/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {n.link && (
                  <Link
                    to={n.link}
                    className="p-1.5 rounded-lg text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="View related item"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
