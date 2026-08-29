import React from 'react';

export interface AdSlotProps {
  slotId?: string;
  category?: 'infrastructure' | 'observability' | 'gpus' | 'hosting';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = 'default-dev-slot',
  category = 'infrastructure',
  className = '',
}) => {
  // Feature flag check / clean non-intrusive container
  const isEnabled = true;

  if (!isEnabled) return null;

  const sponsors = {
    infrastructure: {
      title: '⚡ DeepInfra Fast Inference',
      description: 'Run Llama 3.3 70B & DeepSeek R1 on serverless GPUs at lowest market pricing.',
      cta: 'Explore Serverless GPUs ↗',
      url: 'https://together.ai',
    },
    observability: {
      title: '🔍 LangSmith & Helicone AI Observability',
      description: 'Track token costs, trace prompts, and optimize LLM latency in production.',
      cta: 'Start Free Tracing ↗',
      url: 'https://helicone.ai',
    },
    gpus: {
      title: '🚀 RunPod / Lambda GPU Cloud',
      description: 'On-demand H100s, A100s, and RTX 4090s for custom fine-tuning and inference.',
      cta: 'Deploy GPUs ↗',
      url: 'https://runpod.io',
    },
    hosting: {
      title: '🌐 Vercel Edge AI SDK',
      description: 'Build fast streaming AI applications with Next.js & Edge functions.',
      cta: 'Try AI SDK ↗',
      url: 'https://vercel.com/ai',
    },
  };

  const ad = sponsors[category];

  return (
    <div
      data-ad-slot={slotId}
      className={`rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-colors dark:border-slate-800/80 dark:bg-slate-900/40 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">{ad.title}</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Sponsored
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">{ad.description}</p>
        </div>
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white transition-hover hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {ad.cta}
        </a>
      </div>
    </div>
  );
};
