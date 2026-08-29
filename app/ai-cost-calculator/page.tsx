import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI Cost Calculator | Estimate Generative AI API Expenses',
  description:
    'Calculate monthly and annual AI API costs across OpenAI, Anthropic, Google, and open-source hosted models.',
  alternates: {
    canonical: 'https://llmcalc.com/ai-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What is the average cost of running an AI application in production?',
    answer:
      'Production AI application costs range from $50/month for small chatbots using GPT-4o mini to $10,000+/month for heavy enterprise RAG pipelines using Claude Sonnet 5 or GPT-4o.',
  },
  {
    question: 'How can I optimize my AI infrastructure spend?',
    answer:
      'You can reduce costs by implementing prompt caching, using smaller models for initial triage, batching non-latency-sensitive workloads, and trimming unnecessary system prompt tokens.',
  },
];

export default function AiCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          AI API Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Estimate production API expenses for generative AI models, vector search RAG, and AI agent workloads.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/ai-cost-calculator" />
      </div>
    </div>
  );
}
