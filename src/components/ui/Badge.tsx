import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    blue: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-xs',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-xs',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-xs',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-xs',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/50 shadow-xs',
    slate: 'bg-[#0E172E] text-slate-200 border-cyan-500/30',
    gray: 'bg-[#0E172E] text-slate-300 border-slate-700',
  }[variant];

  const dotColors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-500',
    gray: 'bg-gray-500',
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      {children}
    </span>
  );
};
