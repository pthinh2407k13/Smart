import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30',
      border: 'hover:border-cyan-400',
    },
    purple: {
      bg: 'bg-purple-950/60 text-purple-400 border border-purple-500/30',
      border: 'hover:border-purple-400',
    },
    emerald: {
      bg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
      border: 'hover:border-emerald-400',
    },
    amber: {
      bg: 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
      border: 'hover:border-amber-400',
    },
    rose: {
      bg: 'bg-rose-950/60 text-rose-400 border border-rose-500/30',
      border: 'hover:border-rose-400',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-[#0D152A] rounded-2xl border border-cyan-500/30 p-5 shadow-md shadow-cyan-950/40 transition-all duration-200 ${
        colorMap.border
      } ${onClick ? 'cursor-pointer hover:shadow-cyan-900/50 hover:shadow-lg hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300/80">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMap.bg} transition-transform group-hover:scale-110 shadow-xs`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-300">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
