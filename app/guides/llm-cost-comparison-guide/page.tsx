import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: '2026 LLM Cost Comparison Guide | OpenAI vs Claude vs Gemini vs DeepSeek',
  description:
    'Comprehensive price-to-performance benchmark comparison across OpenAI GPT-4o, Anthropic Claude Sonnet 5, Google Gemini 3.7 Flash, and DeepSeek V4.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/guides/llm-cost-comparison-guide',
  },
};

const faqs = [
  {
    question: 'Which AI model offers the best balance of cost and capability?',
    answer:
      'Lightweight frontier models like DeepSeek V4 Flash and Gemini 3.7 Flash offer exceptional intelligence at under $0.15 per 1M input tokens, making them ideal for high-volume production.',
  },
  {
    question: 'Are open-weight models always cheaper than OpenAI or Anthropic?',
    answer:
      'When hosted on cloud endpoints (e.g. Llama 3.3 70B), open-weight models are highly competitive, but managed optimization features like prompt caching can narrow the gap.',
  },
];

export default function LlmCostComparisonGuidePage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-3">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          Benchmark Guide
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          2026 LLM Cost & Price Benchmark Guide
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Comparing token pricing, context windows, and cost efficiency across major frontier AI providers.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Tiered Provider Landscape</h2>
          <p>
            AI model pricing falls into three distinct pricing tiers in 2026:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Frontier Reasoning Models (GPT-4o, Claude Sonnet 5, o3-mini):</strong> Priced between $2.00/M and $3.00/M input tokens for complex reasoning.</li>
            <li><strong>High-Speed Flash Models (Gemini 3.7 Flash, GPT-4o mini, DeepSeek V4 Flash):</strong> Priced between $0.075/M and $0.15/M input tokens for ultra-fast, low-latency execution.</li>
            <li><strong>Hosted Open-Weight Models (Llama 3.3 70B, Mistral Large 2):</strong> Priced around $0.50/M input tokens.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Compare All Models Side-by-Side</h3>
            <p className="text-xs text-slate-400 mt-1">Select up to 5 models in our interactive price comparison tool.</p>
          </div>
          <Link
            href="/llm-price-comparison"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md"
          >
            Compare Models →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/guides/llm-cost-comparison-guide" />
      </div>
    </div>
  );
}
