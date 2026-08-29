import { Metadata } from 'next';
import { TokenCounterComponent } from '@/components/TokenCounterComponent';
import { FAQ } from '@/components/FAQ';
import { RelatedTools } from '@/components/RelatedTools';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Free Token Counter & Character Estimator | OpenAI & LLM Tokenizer',
  description:
    'Paste prompt text to estimate token count, word count, and character length instantly in your browser.',
  alternates: {
    canonical: 'https://llmcalc.com/token-counter',
  },
};

const faqs = [
  {
    question: 'How does token estimation work?',
    answer:
      'Tokens are sub-word units processed by LLM neural networks. In English, 1 token is approximately 4 characters or 0.75 words.',
  },
  {
    question: 'Is my text uploaded to a server when I use this token counter?',
    answer:
      'No. The token counter runs 100% locally in your browser JavaScript environment. Your text never leaves your device.',
  },
];

export default function TokenCounterPage() {
  return (
    <div className="space-y-12 py-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/30 px-3.5 py-1 text-xs font-semibold text-blue-400">
          PROMPT ANALYSIS ENGINE
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Free Prompt Token Counter & Estimator
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-400">
          Paste system prompts, RAG documents, or LLM context to calculate character count, word count, and token size.
        </p>
      </div>

      <Card title="Token Estimator Workstation">
        <TokenCounterComponent />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
        <FAQ items={faqs} />
        <RelatedTools currentPath="/token-counter" />
      </div>
    </div>
  );
}
