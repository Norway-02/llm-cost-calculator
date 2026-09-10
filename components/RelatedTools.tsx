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
    title: 'AI Workload Calculator',
    description: 'Simulate production request volumes, caching hit rates, and monthly growth.',
    href: '/ai-workload-calculator',
    badge: 'New',
  },
  {
    title: 'AI Cost Per User',
    description: 'Calculate average monthly LLM API costs as active user count scales.',
    href: '/ai-cost-per-user',
  },
  {
    title: 'AI SaaS Cost Calculator',
    description: 'Model gross margins, break-even subscribers, and merchant fees for AI apps.',
    href: '/ai-saas-cost-calculator',
  },
  {
    title: 'Cheapest LLM Finder',
    description: 'Rank verified AI models by price for your custom token workload.',
    href: '/cheapest-llm',
  },
  {
    title: 'Model Replacement Finder',
    description: 'Find lower cost alternative models to replace expensive LLM deployments.',
    href: '/model-replacement-finder',
  },
  {
    title: 'AI Cost Optimizer',
    description: 'Calculate rule-based savings from prompt caching, batching, and routing.',
    href: '/ai-cost-optimizer',
    badge: 'Flagship',
  },
  {
    title: 'Prompt Cost Estimator',
    description: 'Paste text or prompts to estimate token counts and calculate execution costs.',
    href: '/prompt-cost-analyzer',
  },
  {
    title: 'CSV Log Usage Analyzer',
    description: 'Parse API usage logs in CSV format to calculate token volume and spend.',
    href: '/usage-analyzer',
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
    title: 'DeepSeek Cost Calculator',
    description: 'Calculate verified DeepSeek V4 Flash, V3, and R1 API rates.',
    href: '/deepseek-cost-calculator',
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
