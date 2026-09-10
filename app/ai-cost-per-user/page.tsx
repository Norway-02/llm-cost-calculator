import { Suspense } from 'react';
import { Metadata } from 'next';
import { CostPerUserCalculator } from '@/components/CostPerUserCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Cost Per User Calculator | Unit Economics Estimator',
  description:
    'Calculate average AI API cost per active user across 100, 1,000, 10,000, and 100,000 users for LLM-powered applications.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/ai-cost-per-user',
  },
};

const faqs = [
  {
    question: 'Why is calculating AI cost per user critical for SaaS pricing?',
    answer:
      'If your AI token cost per user exceeds your customer acquisition margin or subscription price, scaling your user base will increase losses instead of revenue.',
  },
  {
    question: 'How do prompt caching and smaller fallback models reduce cost per user?',
    answer:
      'By routing simple user queries to lightweight models (e.g. GPT-4o mini or Gemini 3.7 Flash) and caching repeated system prompts, you can lower average cost per user by up to 70%.',
  },
];

export default function AiCostPerUserPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Cost Per User Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Determine your LLM unit economics. Estimate per-user monthly API expenses as your active user base scales.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <CostPerUserCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-cost-per-user" />
      </div>
    </div>
  );
}
