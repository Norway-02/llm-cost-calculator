import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Budget Calculator | Plan Monthly & Annual LLM API Spending',
  description:
    'Forecast engineering AI budgets, team API usage limits, and annual infrastructure spending across multiple LLM providers.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/ai-budget-calculator',
  },
};

const faqs = [
  {
    question: 'How do I forecast AI API costs for my startup seed round?',
    answer:
      'Estimate your expected monthly active users (MAU), average queries per user per day, and average prompt length in tokens. Input these values into the budget calculator to get your annual runway requirement.',
  },
];

export default function AiBudgetCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Infrastructure Budget Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Plan quarterly and annual AI engineering API budgets for startups, research projects, and enterprise teams.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-budget-calculator" />
      </div>
    </div>
  );
}
