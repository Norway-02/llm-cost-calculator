import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'Token Usage Calculator | Estimate Monthly LLM API Tokens',
  description:
    'Calculate monthly token usage and API costs across OpenAI, Anthropic, Google, and open-weight models.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/token-usage-calculator',
  },
};

const faqs = [
  {
    question: 'How do you calculate monthly token usage?',
    answer:
      'Monthly token usage equals (Input Tokens + Output Tokens per Request) × Requests per Day × Days per Month.',
  },
  {
    question: 'What is the ratio between prompt input tokens and generated output tokens?',
    answer:
      'In RAG and code applications, input tokens typically account for 75%–85% of total volume, while output tokens account for 15%–25%.',
  },
];

export default function TokenUsageCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Token Usage Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate monthly LLM token volume and estimate API billing across top generative AI providers.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/token-usage-calculator" />
      </div>
    </div>
  );
}
