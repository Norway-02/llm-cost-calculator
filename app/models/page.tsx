import { Metadata } from 'next';
import Link from 'next/link';
import { getAllModels } from '@/lib/pricing';
import { formatCurrency } from '@/lib/engine/format';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Model Directory | Verified LLM Token Rates & Specs',
  description:
    'Complete directory of verified AI models across OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral, and Cohere.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/models',
  },
};

export default function ModelsDirectoryPage() {
  const models = getAllModels();

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Model Directory
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Source-backed pricing rates, prompt caching discounts, and lifecycle statuses for all verified AI models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/models/${m.id}`}
            className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-5 space-y-3 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">{m.provider}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                m.lifecycle === 'current' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {m.lifecycle}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white">{m.modelName}</h2>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="rounded-xl bg-white/5 p-2 text-center">
                <div className="text-[10px] text-slate-400">Input / 1M</div>
                <div className="font-extrabold text-white">{formatCurrency(m.inputPricePerMillion)}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-2 text-center">
                <div className="text-[10px] text-slate-400">Output / 1M</div>
                <div className="font-extrabold text-white">{formatCurrency(m.outputPricePerMillion)}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-right font-medium">
              Verified {m.lastVerifiedDate} →
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-6">
        <RelatedTools currentPath="/models" />
      </div>
    </div>
  );
}
