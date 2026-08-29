import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { getRegistryDrivenFaqItems } from '@/lib/pricing/content';

export const metadata: Metadata = {
  title: 'LLM Price Comparison | Side-by-Side OpenAI vs Claude vs Gemini vs DeepSeek',
  description:
    'Compare LLM API rates side-by-side. See verified cost differences between GPT-4o, Claude Sonnet 5, Gemini 3.7 Flash, DeepSeek-V4-Flash, and Llama 3.3.',
  alternates: {
    canonical: 'https://llmcalc.com/llm-price-comparison',
  },
};

const faqs = [
  ...getRegistryDrivenFaqItems(),
  {
    question: 'How do OpenAI prices compare to Anthropic Claude and Google Gemini?',
    answer:
      'Google Gemini 3.7 Flash ($0.75/1M in) and DeepSeek-V4-Flash ($0.14/1M in) offer low-cost entry points, while OpenAI GPT-4o ($2.50/1M in) and Anthropic Claude Sonnet 5 ($2.00/1M intro) power flagship reasoning workloads.',
  },
  {
    question: 'Are DeepSeek API prices cheaper than OpenAI?',
    answer:
      'Yes, DeepSeek-V4-Flash ($0.14/1M in, $0.28/1M out) offers significantly lower rates than standard flagship models like GPT-4o ($2.50/1M in), making it highly cost-effective for high-volume pipelines.',
  },
];

export default function LlmPriceComparisonPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          LLM Price Comparison Tool
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Compare 2 to 5 AI models side-by-side with verified rates and automatic lowest-cost highlighting.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading comparison engine...</div>}>
        <MainCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/llm-price-comparison" />
      </div>
    </div>
  );
}
