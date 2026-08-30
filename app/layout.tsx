import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AI LLM Token & Cost Calculator | Compare OpenAI, Anthropic, Gemini Prices',
  description:
    'Free, fast, trustworthy developer utility to calculate and compare LLM API billing costs. Compare OpenAI GPT-4o, Claude 3.7, Gemini 2.0, DeepSeek R1, and Llama 3.3.',
  metadataBase: new URL('https://llmspends.dpdns.org'),
  openGraph: {
    title: 'AI LLM Token & Cost Calculator',
    description: 'Calculate and compare LLM API pricing across OpenAI, Anthropic, Google Gemini, and DeepSeek.',
    type: 'website',
    url: 'https://llmspends.dpdns.org',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI LLM Token & Cost Calculator',
    description: 'Calculate and compare LLM API pricing across major AI providers.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
