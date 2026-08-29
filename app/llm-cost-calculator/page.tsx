import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'LLM Cost Calculator | Estimate Large Language Model Billing',
  description:
    'Calculate LLM API pricing for commercial and open-weights models. Real-time cost breakdown for daily, monthly, and yearly usage.',
  alternates: {
    canonical: 'https://llmcalc.com/llm-cost-calculator',
  },
};

const faqs = [
  {
    question: 'Which LLM is cheapest for production deployment?',
    answer:
      'DeepSeek-V4-Flash ($0.14/1M input), GPT-4o mini ($0.15/1M input), and Gemini 3.7 Flash ($0.75/1M input) are currently among the most cost-effective production models.',
  },
];

export default function LlmCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          LLM Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate Large Language Model API billing with instant side-by-side model pricing updates.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/llm-cost-calculator" />
      </div>
    </div>
  );
}
