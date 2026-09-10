import { Suspense } from 'react';
import { Metadata } from 'next';
import { ModelReplacementFinder } from '@/components/ModelReplacementFinder';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Model Replacement Finder | Compare Cost Reduction Alternatives',
  description:
    'Find lower cost alternative AI models to replace expensive LLM APIs while preserving required prompt and context performance.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/model-replacement-finder',
  },
};

const faqs = [
  {
    question: 'How do I evaluate if a cheaper model can replace my current LLM?',
    answer:
      'Run an evaluation benchmark on 50–100 real application prompts. Test accuracy, formatting compliance, and latency before swapping production models.',
  },
  {
    question: 'Can I combine multiple models to lower API spend?',
    answer:
      'Yes! Model routing architectures send low-complexity prompts to cheaper models (e.g. GPT-4o mini) and route complex reasoning tasks to frontier models (e.g. Claude Sonnet 5 or GPT-4o).',
  },
];

export default function ModelReplacementFinderPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI Model Replacement Finder
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Discover cheaper verified alternative models to replace your current LLM deployment and calculate monthly API savings.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading replacement finder...</div>}>
        <ModelReplacementFinder />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/model-replacement-finder" />
      </div>
    </div>
  );
}
