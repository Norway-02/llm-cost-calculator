import { Suspense } from 'react';
import { Metadata } from 'next';
import { WorkloadCalculator } from '@/components/WorkloadCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Workload & Capacity Calculator | LLM API Spend Planner',
  description:
    'Simulate production LLM workload expenses, monthly growth projections, prompt caching discounts, and cost per request.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/ai-workload-calculator',
  },
};

const faqs = [
  {
    question: 'How does prompt caching impact overall workload costs?',
    answer:
      'Prompt caching can reduce input token prices by 50% to 90% depending on the provider (e.g. Anthropic, OpenAI, DeepSeek). High cache hit rates dramatically lower per-request costs in RAG and system-prompt heavy workloads.',
  },
  {
    question: 'How are monthly growth projections calculated?',
    answer:
      'Monthly projections apply a compounding growth percentage over Month 1 through Month 12 to model expanding user bases and scaling API token volume.',
  },
];

export default function AiWorkloadCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Workload & Capacity Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Simulate production API costs across prompt token sizes, request volumes, prompt caching hit rates, and monthly user growth.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <WorkloadCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-workload-calculator" />
      </div>
    </div>
  );
}
