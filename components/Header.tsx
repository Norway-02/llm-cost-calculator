'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Calculator' },
    { href: '/llm-price-comparison', label: 'Compare' },
    { href: '/token-counter', label: 'Token Counter' },
    { href: '/ai-cost-calculator', label: 'All Tools' },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
      <div
        className={`mx-auto max-w-6xl rounded-2xl border transition-all duration-300 ${
          isScrolled
            ? 'border-white/10 bg-[#060914]/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#060914]/90'
            : 'border-white/5 bg-[#060914]/70 backdrop-blur-md dark:border-white/5 dark:bg-[#060914]/70'
        }`}
      >
        <div className="flex h-12 items-center justify-between px-4 sm:px-6">
          {/* Logo Mark */}
          <Link href="/" className="group flex items-center gap-2.5 transition-transform">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/40 shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:rotate-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-400"
              >
                <rect x="3" y="4" width="12" height="3.5" rx="1.5" fill="currentColor" fillOpacity="0.9" />
                <rect x="3" y="10.25" width="15" height="3.5" rx="1.5" fill="currentColor" fillOpacity="0.75" />
                <rect x="3" y="16.5" width="10" height="3.5" rx="1.5" fill="currentColor" fillOpacity="0.6" />
                <path
                  d="M17 12L20.5 8.5M20.5 8.5L17 5M20.5 8.5H13"
                  stroke="#60A5FA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-sm tracking-tight text-white">Token</span>
              <span className="font-semibold text-sm tracking-tight text-blue-400">Cost</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Badge */}
          <div className="hidden md:flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              2026 Live Rates
            </span>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/5 p-3 md:hidden">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
