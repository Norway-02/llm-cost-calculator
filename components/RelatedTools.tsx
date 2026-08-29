import React from 'react';
import Link from 'next/link';

export interface ToolLink {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export interface RelatedToolsProps {
  currentPath?: string;
}

const ALL_TOOLS: ToolLink[] = [
  {
    title: 'AI LLM Cost Calculator',
    description: 'Calculate monthly and annual cost for any LLM API based on usage tokens.',
    href: '/ai-cost-calculator',
  },
  {
    title: 'LLM Price Comparison',
    description: 'Compare OpenAI, Anthropic, Gemini, DeepSeek, and Meta side-by-side.',
    href: '/llm-price-comparison',
    badge: 'Popular',
  },
  {
    title: 'OpenAI Cost Calculator',
    description: 'Calculate current verified OpenAI GPT-4o, o1, and o3-mini API usage expenses.',
    href: '/openai-cost-calculator',
  },
  {
    title: 'Claude Cost Calculator',
    description: 'Calculate current verified Anthropic Claude Sonnet 5 and Haiku API costs.',
    href: '/claude-cost-calculator',
  },
  {
    title: 'Gemini Cost Calculator',
    description: 'Calculate current verified Google Gemini 3.7 Flash API billing.',
    href: '/gemini-cost-calculator',
  },
  {
    title: 'AI Budget Calculator',
    description: 'Plan quarterly and annual AI engineering API budgets.',
    href: '/ai-budget-calculator',
  },
  {
    title: 'Token Counter Estimator',
    description: 'Client-side prompt character, word, and token count estimator.',
    href: '/token-counter',
  },
  {
    title: 'Token Calculator',
    description: 'Convert token usage into exact USD cost per request or batch.',
    href: '/token-calculator',
  },
];

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentPath }) => {
  const filteredTools = ALL_TOOLS.filter((tool) => tool.href !== currentPath).slice(0, 4);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-200">
        Related Developer AI Tools
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filteredTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-2xl border border-white/10 bg-[#0B1020]/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-slate-900/90 shadow-lg backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                {tool.title}
              </span>
              {tool.badge && (
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-extrabold text-blue-300 border border-blue-500/30">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
