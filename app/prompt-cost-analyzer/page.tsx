import { Suspense } from 'react';
import { Metadata } from 'next';
import { PromptCostAnalyzer } from '@/components/PromptCostAnalyzer';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'Prompt Cost & Token Estimator | Client-Side Privacy Tool',
  description:
    'Paste text or system prompts to estimate token counts and calculate exact API cost across verified AI models without transmitting data to servers.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/prompt-cost-analyzer',
  },
};

const faqs = [
  {
    question: 'Is my prompt text sent to any server or third-party service?',
    answer:
      'No. The Prompt Cost Analyzer executes 100% in your local browser JavaScript runtime. Zero prompt text or private inputs leave your machine.',
  },
  {
    question: 'How accurate is character-to-token ratio estimation?',
    answer:
      'For standard English text, 1 token averages ~4 characters or ~0.75 words. For code, JSON, and non-English scripts, token density increases slightly.',
  },
];

export default function PromptCostAnalyzerPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Prompt Cost & Token Estimator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Paste system prompts, instructions, or RAG contexts to estimate token counts and evaluate per-request costs across LLMs.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading analyzer...</div>}>
        <PromptCostAnalyzer />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/prompt-cost-analyzer" />
      </div>
    </div>
  );
}
