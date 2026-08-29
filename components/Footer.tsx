import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#060914] py-12 text-xs text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-base tracking-tight text-white">Token</span>
              <span className="font-semibold text-base tracking-tight text-blue-400">Cost</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Fast, privacy-first, trustworthy developer utility for calculating, comparing, and forecasting LLM API billing and token budgets.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Calculators
            </h4>
            <ul className="space-y-2">
              <li><Link href="/ai-cost-calculator" className="hover:text-blue-400 transition-colors">AI LLM Cost Calculator</Link></li>
              <li><Link href="/token-calculator" className="hover:text-blue-400 transition-colors">Token Cost Calculator</Link></li>
              <li><Link href="/llm-cost-calculator" className="hover:text-blue-400 transition-colors">LLM Cost Calculator</Link></li>
              <li><Link href="/llm-price-comparison" className="hover:text-blue-400 transition-colors">LLM Price Comparison</Link></li>
              <li><Link href="/ai-budget-calculator" className="hover:text-blue-400 transition-colors">AI Budget Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Provider Pricing
            </h4>
            <ul className="space-y-2">
              <li><Link href="/openai-cost-calculator" className="hover:text-blue-400 transition-colors">OpenAI Pricing Calculator</Link></li>
              <li><Link href="/claude-cost-calculator" className="hover:text-blue-400 transition-colors">Claude Pricing Calculator</Link></li>
              <li><Link href="/gemini-cost-calculator" className="hover:text-blue-400 transition-colors">Gemini Pricing Calculator</Link></li>
              <li><Link href="/token-counter" className="hover:text-blue-400 transition-colors">Free Token Counter Estimator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Privacy & Trust
            </h4>
            <p className="text-slate-400 leading-relaxed mb-2">
              Zero backend tracking of prompt text. All calculations occur client-side in pure JS.
            </p>
            <div className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} TokenCost. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
