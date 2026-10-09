import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'cyan' | 'rose' | 'amber' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'cyan'
}) => {
  const accentStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bgGlow: 'from-cyan-500/10 via-transparent to-transparent',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      badge: 'text-cyan-400'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bgGlow: 'from-rose-500/10 via-transparent to-transparent',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      badge: 'text-rose-400'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bgGlow: 'from-amber-500/10 via-transparent to-transparent',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badge: 'text-amber-400'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgGlow: 'from-emerald-500/10 via-transparent to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'text-emerald-400'
    }
  }[accentColor];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-xl border ${accentStyles.border} p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group`}>
      <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br ${accentStyles.bgGlow} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`} />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${accentStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </h3>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
