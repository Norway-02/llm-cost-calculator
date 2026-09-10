import { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'Input vs Output Tokens: Why Generation Costs 4x More | LLM Guide',
  description:
    'Technical breakdown explaining the architectural differences between parallel prompt prefill and auto-regressive output token generation.',
  alternates: {
    canonical: 'https://llmspends.dpdns.org/guides/input-vs-output-tokens',
  },
};

const faqs = [
  {
    question: 'What is the average ratio of input to output tokens in RAG applications?',
    answer:
      'Retrieval-Augmented Generation (RAG) applications typically feature a 10:1 to 5:1 ratio of input tokens (context documents) to output tokens (final answer).',
  },
  {
    question: 'How can developers minimize expensive output token generation?',
    answer:
      'Instruct the model in system prompts to return concise structured JSON responses or enforce max token generation limits.',
  },
];

export default function InputVsOutputTokensGuidePage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="space-y-3">
        <div className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
          Architecture Guide
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Input vs Output Tokens: Architectural Pricing Differences
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Why LLM API providers charge significantly higher rates for output generation than for input processing.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
        <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Parallel Prefill vs Sequential Generation</h2>
          <p>
            When an API receives a request, all input tokens are processed simultaneously in a single forward pass through the transformer model (parallel prefill). This maximizes GPU matrix multiplication efficiency.
          </p>
          <p>
            Conversely, generating output tokens requires sequential auto-regression: token N must be generated before token N+1 can be calculated. Every single output token requires loading gigabytes of model weights from GPU memory, making token generation memory-bandwidth bound.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Calculate Token Breakdown Costs</h3>
            <p className="text-xs text-slate-400 mt-1">Compare exact input vs output token expenses for your application workload.</p>
          </div>
          <Link
            href="/token-calculator"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md"
          >
            Token Calculator →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/guides/input-vs-output-tokens" />
      </div>
    </div>
  );
}
