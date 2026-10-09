import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 animate-pulse space-y-4">
      <div className="h-6 w-1/3 bg-slate-800/80 rounded-lg"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-800/50 rounded" style={{ width: `${85 - i * 15}%` }}></div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-slate-900/50 border border-slate-800/60 p-4 animate-pulse flex items-center justify-between">
          <div className="h-5 w-1/2 bg-slate-800/80 rounded"></div>
          <div className="h-5 w-20 bg-slate-800/60 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};
