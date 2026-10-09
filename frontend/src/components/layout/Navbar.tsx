import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { 
  Shield, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  Cpu,
  Search,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(2);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [systemHealthy, setSystemHealthy] = useState(true);

  useEffect(() => {
    api.getHealth()
      .then(res => setSystemHealthy(res.status === 'healthy'))
      .catch(() => setSystemHealthy(false));

    api.getNotifications()
      .then(res => {
        const unread = res.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                CyberSentry
              </span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-md font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
          </Link>

          {/* Engine Status Tag */}
          <div className="hidden md:flex items-center gap-2 ml-6 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${systemHealthy ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400'} animate-pulse`} />
            <span className="text-slate-400">ML Engine:</span>
            <span className="text-cyan-400 font-medium">Random Forest v1.2</span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Scanner Shortcut */}
          <Link
            to="/scanner"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/50 rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Launch Scanner</span>
          </Link>

          {/* Notifications Link */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black shadow-[0_0_8px_#06b6d4]">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
          </button>

          {/* Profile / Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {user.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <span className="hidden md:inline-block text-xs font-medium text-slate-200 truncate max-w-[100px]">
                  {user.full_name || user.email}
                </span>
              </button>

              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {user.role}
                    </span>
                  </div>

                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>My Profile & Settings</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition-colors">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>Admin Moderation</span>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
