import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const normalized = (level || 'unverified').toLowerCase() as RiskLevel;

  const config = {
    low: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      label: 'Low Risk',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
    },
    unverified: {
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      icon: HelpCircle,
      label: 'Unverified',
      dot: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]'
    },
    suspicious: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      label: 'Suspicious',
      dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
    },
    high: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: ShieldAlert,
      label: 'High Risk',
      dot: 'bg-rose-400 shadow-[0_0_8px_#f87171]'
    }
  }[normalized] || {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: HelpCircle,
    label: 'Unverified',
    dot: 'bg-slate-400'
  };

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-200 ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
