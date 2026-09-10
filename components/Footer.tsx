import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#060914] py-12 text-xs text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-3 md:col-span-1">
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
              <li><Link href="/llm-price-comparison" className="hover:text-blue-400 transition-colors">LLM Price Comparison</Link></li>
              <li><Link href="/ai-workload-calculator" className="hover:text-blue-400 transition-colors">Workload Calculator</Link></li>
              <li><Link href="/ai-cost-per-user" className="hover:text-blue-400 transition-colors">Cost Per User</Link></li>
              <li><Link href="/ai-saas-cost-calculator" className="hover:text-blue-400 transition-colors">AI SaaS Economics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Optimization & Tools
            </h4>
            <ul className="space-y-2">
              <li><Link href="/cheapest-llm" className="hover:text-blue-400 transition-colors">Cheapest LLM Finder</Link></li>
              <li><Link href="/model-replacement-finder" className="hover:text-blue-400 transition-colors">Model Replacement Finder</Link></li>
              <li><Link href="/ai-cost-optimizer" className="hover:text-blue-400 transition-colors">AI Cost Optimizer</Link></li>
              <li><Link href="/ai-cost-savings" className="hover:text-blue-400 transition-colors">Savings Calculator</Link></li>
              <li><Link href="/prompt-cost-analyzer" className="hover:text-blue-400 transition-colors">Prompt Cost Estimator</Link></li>
              <li><Link href="/usage-analyzer" className="hover:text-blue-400 transition-colors">CSV Log Analyzer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Providers & Directory
            </h4>
            <ul className="space-y-2">
              <li><Link href="/providers" className="hover:text-blue-400 transition-colors">Provider Directory</Link></li>
              <li><Link href="/models" className="hover:text-blue-400 transition-colors">Model Directory</Link></li>
              <li><Link href="/providers/openai" className="hover:text-blue-400 transition-colors">OpenAI Pricing</Link></li>
              <li><Link href="/providers/anthropic" className="hover:text-blue-400 transition-colors">Anthropic Pricing</Link></li>
              <li><Link href="/providers/google" className="hover:text-blue-400 transition-colors">Google Pricing</Link></li>
              <li><Link href="/providers/deepseek" className="hover:text-blue-400 transition-colors">DeepSeek Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">
              Guides & Privacy
            </h4>
            <ul className="space-y-2 mb-4">
              <li><Link href="/guides/how-llm-pricing-works" className="hover:text-blue-400 transition-colors">How LLM Pricing Works</Link></li>
              <li><Link href="/guides/input-vs-output-tokens" className="hover:text-blue-400 transition-colors">Input vs Output Tokens</Link></li>
              <li><Link href="/guides/llm-cost-comparison-guide" className="hover:text-blue-400 transition-colors">Cost Benchmark Guide</Link></li>
              <li><Link href="/guides/api-pricing-explained" className="hover:text-blue-400 transition-colors">Caching & Batch Guide</Link></li>
            </ul>
            <p className="text-slate-400 leading-relaxed mb-2 text-[11px]">
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
