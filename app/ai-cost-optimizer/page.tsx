import { Suspense } from 'react';
import { Metadata } from 'next';
import { CostOptimizer } from '@/components/CostOptimizer';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Cost Optimizer | Deterministic LLM API Spend Reduction',
  description:
    'Audit your LLM API workload and calculate exact monthly savings from prompt caching, model routing, and batch inference.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/ai-cost-optimizer',
  },
};

const faqs = [
  {
    question: 'How are savings calculated in the AI Cost Optimizer?',
    answer:
      'All savings are calculated deterministically using pure mathematical formulas applied directly to verified 2026 API pricing registries. No AI numerical hallucination is involved.',
  },
  {
    question: 'What is the fastest way to reduce production LLM spending?',
    answer:
      'Implementing system prompt prefix caching for RAG pipelines and switching non-reasoning queries to smaller fast models (such as GPT-4o mini or Gemini 3.7 Flash) yields immediate 50%–80% cost reductions.',
  },
];

export default function AiCostOptimizerPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Cost Optimizer
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Identify actionable, rule-based strategies to cut your monthly AI token bills without degrading user experience.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading optimizer...</div>}>
        <CostOptimizer />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-cost-optimizer" />
      </div>
    </div>
  );
}
