import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllModels, getModelById, getPricingHistory } from '@/lib/pricing';
import { formatCurrency } from '@/lib/engine/format';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

interface ModelPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const models = getAllModels();
  return models.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getModelById(slug);
  if (!model) return {};

  return {
    title: `${model.provider} ${model.modelName} API Pricing & Calculator`,
    description: `Official verified ${model.provider} ${model.modelName} API rates: $${model.inputPricePerMillion}/M input, $${model.outputPricePerMillion}/M output. Verified source link, caching tiers, and spend calculator.`,
    alternates: {
      canonical: `https://llmspends.dpdns.org/models/${slug}`,
    },
  };
}

export default async function ModelDetailPage({ params }: ModelPageProps) {
  const { slug } = await params;
  const model = getModelById(slug);

  if (!model) {
    notFound();
  }

  const pricingHistory = getPricingHistory(slug);

  const faqs = [
    {
      question: `What is the current input and output price for ${model.modelName}?`,
      answer: `${model.provider} ${model.modelName} is priced at $${model.inputPricePerMillion} per 1M input tokens and $${model.outputPricePerMillion} per 1M output tokens.`,
    },
    {
      question: `Does ${model.modelName} support prompt caching discounts?`,
      answer: model.pricingTiers?.cachedInput
        ? `Yes. ${model.modelName} supports prompt caching at $${model.pricingTiers.cachedInput} per 1M input tokens.`
        : `${model.modelName} standard rates apply without explicit prompt caching tiers.`,
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-3 text-center">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          {model.provider} · {model.lifecycle}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          {model.provider} {model.modelName} Pricing & Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Source-verified API token pricing, prompt caching tiers, lifecycle status, and interactive spend calculator for {model.modelName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-4">
          <div className="text-xs text-slate-400 uppercase font-bold">Standard Input</div>
          <div className="text-2xl font-black text-white mt-1">{formatCurrency(model.inputPricePerMillion)} / M</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-4">
          <div className="text-xs text-slate-400 uppercase font-bold">Standard Output</div>
          <div className="text-2xl font-black text-white mt-1">{formatCurrency(model.outputPricePerMillion)} / M</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-4">
          <div className="text-xs text-slate-400 uppercase font-bold">Cached Input</div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {model.pricingTiers?.cachedInput ? `${formatCurrency(model.pricingTiers.cachedInput)} / M` : 'N/A'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-4">
          <div className="text-xs text-slate-400 uppercase font-bold">Last Verified</div>
          <div className="text-sm font-bold text-slate-200 mt-2">{model.lastVerifiedDate}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Interactive {model.modelName} Calculator</h2>
        <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
          <MainCalculator initialModelId={model.id} />
        </Suspense>
      </div>

      {pricingHistory.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6">
          <h3 className="text-base font-bold text-white">Verified Pricing Schedule & History</h3>
          <div className="divide-y divide-white/5">
            {pricingHistory.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300">Effective: {item.effectiveFrom}</span>
                  {item.notes && <span className="text-slate-400">({item.notes})</span>}
                </div>
                <div className="font-bold text-slate-100">
                  ${item.inputPricePerMillion}/M in · ${item.outputPricePerMillion}/M out
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath={`/models/${slug}`} />
      </div>
    </div>
  );
}
