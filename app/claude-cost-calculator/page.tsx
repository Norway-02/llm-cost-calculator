import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { providerDefaults } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Claude Cost Calculator | Anthropic Claude Sonnet 5 Pricing',
  description:
    'Calculate Anthropic Claude API billing for Claude Sonnet 5 ($2/1M input, $10/1M output intro rate), Claude 3.5 Haiku, and Opus models.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/claude-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What is the current recommended Anthropic Claude model for production?',
    answer:
      'Claude Sonnet 5 is Anthropic\'s recommended production model. It features an introductory pricing rate of $2.00/1M input and $10.00/1M output through August 31, 2026.',
  },
  {
    question: 'Does Claude Sonnet 5 have a scheduled pricing change?',
    answer:
      'Yes, starting September 1, 2026, Claude Sonnet 5 standard rates will transition to $3.00/1M input and $15.00/1M output.',
  },
  {
    question: 'Is Prompt Caching supported on Claude Sonnet 5?',
    answer:
      'Yes, Claude Sonnet 5 supports prompt caching at $0.20/1M cached input tokens during the introductory window ($0.30/1M standard).',
  },
];

export default function ClaudeCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Claude API Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate Anthropic Claude API expenses for Claude Sonnet 5, Claude 3.5 Haiku, and legacy models.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator initialModelId={providerDefaults.anthropic} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/claude-cost-calculator" />
      </div>
    </div>
  );
}
