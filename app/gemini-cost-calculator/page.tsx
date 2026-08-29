import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { providerDefaults } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Gemini Cost Calculator | Google Gemini 3.7 Flash Pricing',
  description:
    'Calculate Google AI Studio / Vertex AI Gemini API costs for Gemini 3.7 Flash ($0.75/1M input, $3.75/1M output). Real-time token and budget estimator.',
  alternates: {
    canonical: 'https://llmcalc.com/gemini-cost-calculator',
  },
};

const faqs = [
  {
    question: 'What is the current recommended Google Gemini model for production?',
    answer:
      'Gemini 3.7 Flash is Google\'s current production model ($0.75/1M input and $3.75/1M output), supporting multimodal vision, audio, and hybrid reasoning.',
  },
  {
    question: 'What happened to Gemini 1.5 Pro, 1.5 Flash, and 2.0 Flash?',
    answer:
      'Gemini 1.5 Pro and 1.5 Flash were shut down on September 29, 2025, and Gemini 2.0 Flash was shut down on June 1, 2026. All are superseded by Gemini 3.7 Flash for current production workloads.',
  },
  {
    question: 'Does Gemini 3.7 Flash have a scheduled price update?',
    answer:
      'Yes, Gemini 3.7 Flash introductory rates are $0.75/1M input and $3.75/1M output through December 31, 2026, and $1.50/1M input and $7.50/1M output starting January 1, 2027.',
  },
];

export default function GeminiCostCalculatorPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Gemini API Cost Calculator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Calculate Google Vertex AI and AI Studio API expenses for Gemini 3.7 Flash and current Google AI models.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading calculator...</div>}>
        <MainCalculator initialModelId={providerDefaults.google} />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/gemini-cost-calculator" />
      </div>
    </div>
  );
}
