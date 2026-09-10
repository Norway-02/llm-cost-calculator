import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'LLM API Pricing Explained: Caching & Batch Discounts | LLM Guide',
  description:
    'Learn how Batch API 50% discounts, prompt prefix caching, and long-context pricing tiers impact your AI infrastructure bill.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/guides/api-pricing-explained',
  },
};

const faqs = [
  {
    question: 'How much do you save with Batch API endpoints?',
    answer:
      'Batch API endpoints (offered by OpenAI, Anthropic, and Google) provide a 50% discount on both input and output tokens for requests executed asynchronously within a 24-hour SLA window.',
  },
  {
    question: 'Does prompt caching require manual setup?',
    answer:
      'Some providers (like Anthropic) require explicit cache control headers in API calls, while others (like OpenAI and DeepSeek) automatically detect and apply prefix prompt caching when prompts match.',
  },
];

export default function ApiPricingExplainedGuidePage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-3">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          Optimization Guide
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          LLM API Pricing Explained: Caching, Batch & Context Tiers
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          How to leverage prompt caching discounts, Batch APIs, and tier structures to optimize AI spending.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Three High-Impact Cost Reduction Features</h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Prompt Prefix Caching:</strong> Save 50%–90% on input tokens when reusing static system instructions or RAG background documents across multiple requests.
            </li>
            <li>
              <strong>Batch Asynchronous API:</strong> Save 50% on all tokens by submitting non-real-time jobs (evaluations, document processing, data classification) to 24-hour batch queues.
            </li>
            <li>
              <strong>Long-Context Window Tiers:</strong> Some models (such as Google Gemini) apply tiered rates based on whether request context is under or over 128,000 tokens.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Optimize Your AI Infrastructure</h3>
            <p className="text-xs text-slate-400 mt-1">Use our AI Cost Optimizer to calculate exact prompt caching and batch savings.</p>
          </div>
          <Link
            href="/ai-cost-optimizer"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md"
          >
            Cost Optimizer →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/guides/api-pricing-explained" />
      </div>
    </div>
  );
}
