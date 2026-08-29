import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { providerDefaults } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'OpenAI Cost Calculator | GPT-4o, GPT-4o mini, o1 & o3-mini API Billing',
  description:
    'Calculate OpenAI API costs for GPT-4o, GPT-4o mini, o1, and o3-mini. Includes prompt caching and batch discount rates.',
  alternates: {
    canonical: 'https://llmcalc.com/openai-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What are current OpenAI API prices?',
    answer:
      'GPT-4o is $2.50/1M input and $10.00/1M output. GPT-4o mini is $0.15/1M input and $0.60/1M output. o1 reasoning model is $15.00/1M input and $60.00/1M output.',
  },
  {
    question: 'How does OpenAI Prompt Caching discount work?',
    answer:
      'OpenAI offers a 50% discount on input tokens that hit the prompt cache (minimum 1,024 cached tokens).',
  },
];

export default function OpenAiCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          OpenAI API Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate official OpenAI API costs for GPT-4o, GPT-4o mini, o1, and o3-mini models.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator initialModelId={providerDefaults.openai} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/openai-cost-calculator" />
      </div>
    </div>
  );
}
