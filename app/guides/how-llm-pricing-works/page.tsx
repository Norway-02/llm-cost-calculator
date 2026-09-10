import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'How LLM API Pricing Works (2026 Guide) | Per-Million Token Billing',
  description:
    'Comprehensive technical guide explaining LLM API pricing models, input vs output token rates, prompt caching discounts, and batch inference.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/guides/how-llm-pricing-works',
  },
};

const faqs = [
  {
    question: 'Why are LLM APIs priced per 1,000,000 tokens?',
    answer:
      'As AI hardware efficiency improved, pricing shifted from per-1K tokens to per-1M tokens to accommodate large-scale context windows and high-volume agent execution.',
  },
  {
    question: 'How does prompt caching reduce API expenses?',
    answer:
      'Prompt caching allows providers to reuse pre-computed transformer KV attention states for identical system prompt prefixes, reducing compute time and granting 50%–90% price discounts.',
  },
];

export default function HowLlmPricingWorksGuidePage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-3">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          Developer Guide · 2026 Edition
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          How LLM API Pricing Works
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          An authoritative guide for software architects, engineering leaders, and developers building generative AI applications.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">1. The Per-Million Token Standard</h2>
          <p>
            Large Language Model APIs charge based on token volume processed during execution. A token represents roughly 4 characters or 0.75 words of English text. Modern LLM API providers (OpenAI, Anthropic, Google, DeepSeek) bill separately for two distinct execution phases:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Input Tokens (Prompt Prefill):</strong> Text sent in the user prompt, system instructions, and RAG context documents.</li>
            <li><strong>Output Tokens (Generation):</strong> Text synthesized auto-regressively by the model response.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">2. Why Output Tokens Cost 3x–4x More</h2>
          <p>
            Input prefill is heavily parallelized across GPU tensor cores because all input tokens are known upfront. Output generation, however, is sequential and memory-bandwidth bound: each generated token requires reading the entire model weight parameter set from High Bandwidth Memory (HBM).
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Calculate Your Custom Workload Spend</h3>
            <p className="text-xs text-slate-400 mt-1">Estimate exact monthly billing across 20+ verified models using our deterministic calculator engine.</p>
          </div>
          <Link
            href="/ai-cost-calculator"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md"
          >
            Open Calculator →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/guides/how-llm-pricing-works" />
      </div>
    </div>
  );
}
