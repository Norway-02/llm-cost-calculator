import { Suspense } from 'react';
import { Metadata } from 'next';
import { CheapestLlmFinder } from '@/components/CheapestLlmFinder';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'Cheapest LLM Model Finder | Find Lowest API Token Rates',
  description:
    'Search and rank verified AI models by price for your custom token workload, vision requirement, or reasoning needs.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/cheapest-llm',
  },
};

const faqs = [
  {
    question: 'Which provider currently offers the cheapest LLM API rates?',
    answer:
      'Lightweight models like DeepSeek V4 Flash ($0.10/M input), Gemini 3.7 Flash ($0.075/M input), and GPT-4o mini ($0.15/M input) offer the lowest per-token API prices as of 2026.',
  },
  {
    question: 'Are open-weight hosted models cheaper than proprietary models?',
    answer:
      'Yes, open-weight models hosted on APIs (such as Llama 3.3 70B or DeepSeek V3/V4) generally offer significantly lower token prices compared to top-tier proprietary models.',
  },
];

export default function CheapestLlmPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Cheapest LLM Model Finder
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Rank all active AI models strictly by cost for your exact request volume, input/output token ratio, and feature capabilities.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading finder...</div>}>
        <CheapestLlmFinder />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/cheapest-llm" />
      </div>
    </div>
  );
}
