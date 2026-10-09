import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShieldAlert,
  History,
  Newspaper,
  Users,
  BarChart3,
  Bot,
  GraduationCap,
  Bookmark,
  Bell,
  User,
  ShieldCheck,
  Flame,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Threat Scanner', to: '/scanner', icon: ShieldAlert, badge: 'Live ML' },
    { label: 'Scan History', to: '/history', icon: History },
    { label: 'Threat Intelligence', to: '/threat-news', icon: Newspaper, badge: 'Feeds' },
    { label: 'Community Reports', to: '/community', icon: Users },
    { label: 'Fraud Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'AI Safety Assistant', to: '/assistant', icon: Bot, badge: 'AI' },
    { label: 'Awareness Lab', to: '/learn', icon: GraduationCap },
    { label: 'Bookmarks', to: '/bookmarks', icon: Bookmark },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl
        flex flex-col justify-between py-4 px-3 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="px-3 pb-2 pt-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Defense Platform
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Admin section */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-2 border-t border-slate-800/60">
              <div className="px-3 pb-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-500">
                Administration
              </div>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold' 
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Moderation Panel</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Profile card */}
        <div className="pt-3 border-t border-slate-800/80">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center font-bold text-xs uppercase">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Cyber Agent'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Guest Mode'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};
