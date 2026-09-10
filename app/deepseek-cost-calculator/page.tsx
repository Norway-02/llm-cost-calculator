import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'DeepSeek Cost Calculator | DeepSeek V3, V4 & R1 API Rates',
  description:
    'Calculate current verified DeepSeek V4 Flash, DeepSeek V3, and R1 API pricing ($0.14/1M input, $0.28/1M output).',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/deepseek-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What are the official DeepSeek API pricing rates?',
    answer:
      'DeepSeek V4 Flash rates are verified at $0.14 per 1M input tokens ($0.0028/1M cached input) and $0.28 per 1M output tokens.',
  },
  {
    question: 'How much cheaper is DeepSeek compared to GPT-4o?',
    answer:
      'DeepSeek V4 Flash is approximately 18x cheaper for input tokens and 35x cheaper for output tokens compared to GPT-4o standard rates.',
  },
];

export default function DeepSeekCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          DeepSeek Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate monthly and per-request API costs for verified DeepSeek V4 Flash, V3, and reasoning models.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator initialModelId="deepseek-v4-flash" />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/deepseek-cost-calculator" />
      </div>
    </div>
  );
}
