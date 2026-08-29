import { Suspense } from 'react';
import { Metadata } from 'next';
import { HeroSection } from '@/components/HeroSection';
import { MainCalculator } from '@/components/MainCalculator';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';

export const metadata: Metadata = {
  title: 'AI LLM Token & Cost Calculator | Fast & Trustworthy LLM Pricing Tool',
  description:
    'Free developer utility to calculate, compare, and forecast LLM API billing costs for OpenAI, Anthropic Claude, Google Gemini, DeepSeek, and Meta Llama.',
  alternates: {
    canonical: 'https://llmcalc.com/',
  },
};

const homepageFaqs = [
  {
    question: 'How are LLM API costs calculated?',
    answer:
      'LLM API costs are billed based on token usage. Input tokens (your prompt and context) and output tokens (the generated response) are charged at different rates per 1,000,000 tokens specified by each provider.',
  },
  {
    question: 'Why are output tokens more expensive than input tokens?',
    answer:
      'Output tokens require sequential autoregressive generation by neural networks on GPUs, whereas input tokens can be processed in parallel during the prefill phase.',
  },
  {
    question: 'Are my prompts sent to any external server?',
    answer:
      'No. LLMCalc operates 100% client-side in your browser. No prompts, text, or API keys are ever transmitted anywhere.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* 1. Hero Landing Section */}
      <HeroSection />

      {/* 2. Main Interactive Calculator Section */}
      <Suspense fallback={<div className="p-8 text-center text-sm font-mono text-slate-400">Loading interactive calculator engine...</div>}>
        <MainCalculator />
      </Suspense>

      {/* 3. FAQ & Related Tools Footer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
        <FAQ items={homepageFaqs} />
        <RelatedTools currentPath="/" />
      </div>
    </div>
  );
};
