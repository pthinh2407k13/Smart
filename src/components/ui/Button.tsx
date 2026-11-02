import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
  }[size];

  const variantClasses = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/50 shadow-md shadow-cyan-950/50 focus:ring-cyan-400 font-bold',
    secondary: 'bg-[#0F1A34] hover:bg-[#15254A] text-slate-200 border border-cyan-500/30 focus:ring-cyan-400',
    outline: 'border border-cyan-500/60 bg-[#0A1224] hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 focus:ring-cyan-400 shadow-xs',
    danger: 'bg-red-600 hover:bg-red-500 text-white border border-red-400/60 shadow-md shadow-red-950/50 focus:ring-red-400 font-bold', // Màu đỏ cho xóa
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/60 shadow-md shadow-emerald-950/50 focus:ring-emerald-400 font-bold', // Màu xanh cho lưu
    ghost: 'hover:bg-cyan-950/30 text-slate-300 hover:text-white focus:ring-cyan-400',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
