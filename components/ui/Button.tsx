import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  const variantStyles = {
    primary:
      'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/30 border border-blue-500/30',
    secondary:
      'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline:
      'border border-white/10 bg-transparent text-slate-200 hover:bg-white/5 hover:text-white dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5',
    ghost:
      'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200',
    danger:
      'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 dark:bg-red-950/40 dark:text-red-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
