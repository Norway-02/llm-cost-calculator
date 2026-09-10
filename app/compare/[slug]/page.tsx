import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentDefaultModel } from '@/lib/pricing';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

interface ComparisonPageProps {
  params: Promise<{ slug: string }>;
}

const COMPARISONS: Record<string, { p1: string; p2: string; title: string; desc: string }> = {
  'openai-vs-claude': {
    p1: 'OpenAI',
    p2: 'Anthropic',
    title: 'OpenAI vs Claude LLM API Price Comparison (2026)',
    desc: 'Compare OpenAI GPT-4o and o3-mini token pricing against Anthropic Claude Sonnet 5 and Haiku.',
  },
  'openai-vs-gemini': {
    p1: 'OpenAI',
    p2: 'Google',
    title: 'OpenAI vs Gemini LLM API Price Comparison (2026)',
    desc: 'Compare OpenAI GPT-4o API rates against Google Gemini 3.7 Flash and Gemini 3 Pro pricing.',
  },
  'claude-vs-gemini': {
    p1: 'Anthropic',
    p2: 'Google',
    title: 'Claude vs Gemini LLM API Price Comparison (2026)',
    desc: 'Compare Anthropic Claude Sonnet 5 API rates against Google Gemini 3.7 Flash pricing.',
  },
  'openai-vs-deepseek': {
    p1: 'OpenAI',
    p2: 'DeepSeek',
    title: 'OpenAI vs DeepSeek LLM API Price Comparison (2026)',
    desc: 'Compare OpenAI GPT-4o API costs against DeepSeek V4 Flash ($0.14/M input) pricing.',
  },
};

export async function generateStaticParams() {
  return Object.keys(COMPARISONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = COMPARISONS[slug];
  if (!comp) return {};

  return {
    title: comp.title,
    description: comp.desc,
    alternates: {
      canonical: `https://llmspends.dpdns.org/compare/${slug}`,
    },
  };
}

export default async function ComparisonDetailPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const comp = COMPARISONS[slug];

  if (!comp) {
    notFound();
  }

  const model1 = getCurrentDefaultModel(comp.p1);

  const faqs = [
    {
      question: `How do ${comp.p1} and ${comp.p2} API prices compare?`,
      answer: model1
        ? `${comp.p1} (${model1.modelName}) input rate is $${model1.inputPricePerMillion}/M.`
        : `Check the interactive table below for side-by-side token rates.`,
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-3 text-center">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          Head-to-Head Comparison
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          {comp.p1} vs {comp.p2} API Pricing Comparison
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          {comp.desc}
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading comparison engine...</div>}>
        <MainCalculator initialModelId={model1?.id} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath={`/compare/${slug}`} />
      </div>
    </div>
  );
}
