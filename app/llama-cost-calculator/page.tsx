import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'Meta Llama Cost Calculator | Llama 3.3 70B & 405B API Rates',
  description:
    'Calculate monthly API expenses for Meta Llama 3.3 70B and 405B hosted open-weight LLMs.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/llama-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What are the hosted API rates for Meta Llama 3.3 70B?',
    answer:
      'Meta Llama 3.3 70B hosted rates average $0.50 per 1M input tokens and $0.75 per 1M output tokens across major cloud API providers.',
  },
  {
    question: 'Why calculate open-weight LLM API pricing?',
    answer:
      'Although Llama models are open-weights, running them on managed cloud APIs incur per-token charges that must be calculated alongside proprietary models.',
  },
];

export default function LlamaCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Meta Llama Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate monthly and annual API costs for Meta Llama 3.3 70B open-weight model endpoints.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator initialModelId="llama-3-3-70b" />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/llama-cost-calculator" />
      </div>
    </div>
  );
}
