import { Metadata } from 'next';
import Link from 'next/link';
import { getAllModels } from '@/lib/pricing';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI LLM Providers Directory | Verified API Pricing',
  description:
    'Directory of top AI API providers including OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral, and Cohere with source-backed pricing data.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/providers',
  },
};

export default function ProvidersDirectoryPage() {
  const models = getAllModels();
  const providerMap = new Map<string, { name: string; count: number; minInput: number; maxInput: number }>();

  models.forEach((m) => {
    const key = m.provider.toLowerCase();
    const existing = providerMap.get(key);
    if (existing) {
      existing.count++;
      existing.minInput = Math.min(existing.minInput, m.inputPricePerMillion);
      existing.maxInput = Math.max(existing.maxInput, m.inputPricePerMillion);
    } else {
      providerMap.set(key, {
        name: m.provider,
        count: 1,
        minInput: m.inputPricePerMillion,
        maxInput: m.inputPricePerMillion,
      });
    }
  });

  const providers = Array.from(providerMap.values());

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Provider Directory
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Source-verified API token rates, pricing schedules, and model offerings across leading artificial intelligence companies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => (
          <Link
            key={p.name}
            href={`/providers/${p.name.toLowerCase()}`}
            className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-5 space-y-3 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{p.name}</h2>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold text-blue-300 border border-blue-500/30">
                {p.count} models
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Input Rates: ${p.minInput}/M to ${p.maxInput}/M tokens
            </p>
            <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
              View Provider Pricing →
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-6">
        <RelatedTools currentPath="/providers" />
      </div>
    </div>
  );
}
