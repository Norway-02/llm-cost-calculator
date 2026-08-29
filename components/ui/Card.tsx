import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020]/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/15 dark:border-white/10 dark:bg-[#0B1020]/90 ${className}`}
    >
      {(title || headerAction) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3.5">
          <div>
            {title && (
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 dark:text-slate-100">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
