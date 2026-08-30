import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'Token Cost Calculator | Convert LLM Tokens to USD Cost',
  description:
    'Convert prompt and completion token counts into exact dollar costs per request, per thousand (1K), and per million (1M) tokens.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/token-calculator',
  },
};

const faqs = [
  {
    question: 'How much is 1 million tokens in US Dollars?',
    answer:
      'Cost per 1 million input tokens ranges from $0.14 (DeepSeek-V4-Flash) and $0.75 (Gemini 3.7 Flash) to $15.00 (o1 / Claude 3 Opus legacy). Output tokens range from $0.28 to $60.00+ per million.',
  },
  {
    question: 'How many words is 1,000 tokens?',
    answer:
      '1,000 tokens is approximately 750 words in standard English text.',
  },
];

export default function TokenCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Token Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Convert input and output token counts into dollar amounts per 1K, per 1M, and per request.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/token-calculator" />
      </div>
    </div>
  );
}
