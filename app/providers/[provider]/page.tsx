import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllModels, getModelsByProvider, getCurrentDefaultModel } from '@/lib/pricing';
import { formatCurrency } from '@/lib/engine/format';
import { RelatedTools } from '@/components/RelatedTools';

interface ProviderPageProps {
  params: Promise<{ provider: string }>;
}

export async function generateStaticParams() {
  const models = getAllModels();
  const providerKeys = Array.from(new Set(models.map((m) => m.provider.toLowerCase())));
  return providerKeys.map((p) => ({ provider: p }));
}

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { provider } = await params;
  const models = getModelsByProvider(provider);
  if (!models || models.length === 0) return {};

  const providerName = models[0].provider;

  return {
    title: `${providerName} API Pricing & Cost Calculator (2026 Verified)`,
    description: `Official verified ${providerName} API pricing rates, prompt caching discounts, model lifecycle statuses, and calculator for ${providerName} models.`,
    alternates: {
      canonical: `https://llmspends.dpdns.org/providers/${provider.toLowerCase()}`,
    },
  };
}

export default async function ProviderDetailPage({ params }: ProviderPageProps) {
  const { provider } = await params;
  const models = getModelsByProvider(provider);

  if (!models || models.length === 0) {
    notFound();
  }

  const providerName = models[0].provider;
  const defaultModel = getCurrentDefaultModel(provider);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-3 text-center">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          Verified Provider Pricing
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          {providerName} API Pricing & Models
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Official verified per-million token pricing rates, caching tiers, and lifecycle statuses for all {providerName} models.
        </p>
      </div>

      {defaultModel && (
        <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Recommended Model</span>
            <h3 className="text-2xl font-black text-white mt-1">{defaultModel.modelName}</h3>
            <p className="text-xs text-slate-300 mt-1">
              ${defaultModel.inputPricePerMillion}/M input · ${defaultModel.outputPricePerMillion}/M output
            </p>
          </div>
          <Link
            href={`/models/${defaultModel.id}`}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shrink-0"
          >
            Calculate {defaultModel.modelName} Spend →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">All {providerName} Verified Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-5 space-y-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <Link href={`/models/${m.id}`} className="font-bold text-slate-100 text-base hover:text-blue-400 transition-colors">
                  {m.modelName}
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  m.lifecycle === 'current' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {m.lifecycle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white/5 p-2 text-center">
                  <div className="text-[10px] text-slate-400">Input / 1M</div>
                  <div className="font-extrabold text-white">{formatCurrency(m.inputPricePerMillion)}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2 text-center">
                  <div className="text-[10px] text-slate-400">Output / 1M</div>
                  <div className="font-extrabold text-white">{formatCurrency(m.outputPricePerMillion)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <a href={m.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                  Official Source
                </a>
                <span>Verified: {m.lastVerifiedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <RelatedTools currentPath={`/providers/${provider.toLowerCase()}`} />
      </div>
    </div>
  );
}
