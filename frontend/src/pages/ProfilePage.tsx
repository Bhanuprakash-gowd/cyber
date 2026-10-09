import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Shield,
  Key,
  Bell,
  Sun,
  Moon,
  CheckCircle,
  Database,
  Lock,
  LogOut
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, isConfigured } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [emailAlerts, setEmailAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          <span>Account & Security Preferences</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your analyst identity, role privileges, and alert dispatch parameters.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Identity Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Security Profile</span>
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white uppercase shadow-lg">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{user?.full_name || 'Guest Analyst'}</h3>
            <p className="text-xs text-slate-400 font-mono">{user?.email || 'unregistered-session'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Role: {user?.role || 'Guest'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Persistence: {isConfigured ? 'Supabase PostgreSQL' : 'Local Sandbox Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSavePreferences} className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>Alert Dispatch Preferences</span>
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Email Threat Bulletins</span>
              <span className="text-[11px] text-slate-400">Receive high-severity zero-day warnings (Requires email provider setup).</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Weekly Intelligence Digest</span>
              <span className="text-[11px] text-slate-400">Condensed overview of community scam reports and newly cataloged TLDs.</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
            />
          </label>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-white block">Interface Color Theme</span>
              <span className="text-[11px] text-slate-400">Current mode: {theme === 'dark' ? 'Dark Matrix' : 'Light Mode'}</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-medium"
            >
              Toggle Mode
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
