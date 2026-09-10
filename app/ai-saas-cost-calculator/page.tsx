import { Suspense } from 'react';
import { Metadata } from 'next';
import { SaasEconomicsCalculator } from '@/components/SaasEconomicsCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI SaaS Cost & Profit Calculator | Gross Margin Estimator',
  description:
    'Calculate gross profit margins, break-even subscribers, monthly revenue, and LLM API cost ratios for AI SaaS startups.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/ai-saas-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What is a healthy gross margin for an AI SaaS startup?',
    answer:
      'While traditional software SaaS targets 75%+ gross margins, AI SaaS applications using frontier models like GPT-4o or Claude Sonnet 5 typically operate between 50% and 70% gross margins due to direct token inference costs.',
  },
  {
    question: 'How do you calculate break-even paid subscribers for an AI app?',
    answer:
      'Break-even paid subscribers equals fixed monthly costs (servers, databases, fixed software) divided by the net contribution margin per subscriber (subscription price minus payment processor fees minus variable token cost per user).',
  },
];

export default function AiSaasCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI SaaS Cost & Profit Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Model gross profit margins, revenue per subscriber, merchant fees, infrastructure overhead, and break-even points for AI software products.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <SaasEconomicsCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-saas-cost-calculator" />
      </div>
    </div>
  );
}
