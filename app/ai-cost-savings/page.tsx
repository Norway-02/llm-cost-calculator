import { Suspense } from 'react';
import { Metadata } from 'next';
import { SavingsCalculator } from '@/components/SavingsCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Cost Savings Calculator | Calculate LLM Migration ROI',
  description:
    'Calculate exact monthly and annual dollar savings when migrating API workloads between AI models.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/ai-cost-savings',
  },
};

const faqs = [
  {
    question: 'How much money can you save by switching to lightweight models?',
    answer:
      'Switching from frontier models like GPT-4o or Claude Sonnet 5 to lightweight models like GPT-4o mini, DeepSeek V4 Flash, or Gemini 3.7 Flash typically saves 80% to 95% on API bills.',
  },
  {
    question: 'Are there hidden costs when migrating LLM API providers?',
    answer:
      'API migration requires developer time to rewrite prompts, adjust system instructions, and re-evaluate output formatting, but token savings often pay back migration costs within weeks.',
  },
];

export default function AiCostSavingsPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Cost Savings Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Compare two deployment models side-by-side to calculate monthly percentage reductions and annual dollar savings.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading savings calculator...</div>}>
        <SavingsCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-cost-savings" />
      </div>
    </div>
  );
}
