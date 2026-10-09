import React from 'react';
import { LucideIcon, ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = ShieldOff,
  title,
  description,
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 backdrop-blur-md">
      <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      
      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          {actionText}
        </Link>
      )}

      {onAction && actionText && !actionLink && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
