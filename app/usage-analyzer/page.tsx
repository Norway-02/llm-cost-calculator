import { Suspense } from 'react';
import { Metadata } from 'next';
import { CsvUsageAnalyzer } from '@/components/CsvUsageAnalyzer';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'CSV LLM Usage & Cost Analyzer | Privacy-First Token Auditor',
  description:
    'Paste or parse LLM API usage logs in CSV format to calculate total token volume, model spend, and average request costs locally.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/usage-analyzer',
  },
};

const faqs = [
  {
    question: 'Is CSV log content uploaded or stored anywhere?',
    answer:
      'No. The CSV Usage Analyzer runs entirely in your web browser. No log lines, token metrics, or private API records leave your machine.',
  },
  {
    question: 'What CSV column headers are supported?',
    answer:
      'The parser looks for input_tokens, output_tokens, model, requests, and date. Additional custom columns are safely ignored.',
  },
];

export default function UsageAnalyzerPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          CSV LLM Usage & Cost Analyzer
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400">
          Upload or paste API usage records to analyze historical token volume, cost distribution by model, and per-request economics.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-sm">Loading usage analyzer...</div>}>
        <CsvUsageAnalyzer />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/usage-analyzer" />
      </div>
    </div>
  );
}
