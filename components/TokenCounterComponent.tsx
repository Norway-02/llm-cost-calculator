'use client';

import React, { useState } from 'react';
import { estimateTokens } from '@/lib/tokenization';
import { formatNumber } from '@/lib/engine/format';
import { Button } from './ui/Button';

export const TokenCounterComponent: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const stats = estimateTokens(text);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls & Compact Estimation Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            ● Estimated token count
          </span>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Why is this estimated?
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!text}
            className={copied ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : ''}
          >
            {copied ? '✓ Text Copied' : '📋 Copy Text'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText('')}
            disabled={!text}
            className="text-slate-400 hover:text-red-400"
          >
            Clear Text
          </Button>
        </div>
      </div>

      {/* Explanation Popover Banner */}
      {showExplanation && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4 text-xs text-slate-300 backdrop-blur-md transition-all animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <p className="leading-relaxed">
              Token counts displayed are client-side estimates based on standard English & code heuristics (~4 characters per token). Exact tokenization varies slightly based on provider-specific BPE vocabulary schemas (e.g. OpenAI Tiktoken, Claude BPE, Llama BPE).
            </p>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-slate-400 hover:text-white font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Editor-Inspired Textarea */}
      <div className="relative rounded-2xl border border-white/10 bg-[#05070C] p-4 shadow-2xl transition-colors focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your prompt, system instructions, document, or code snippet here..."
          rows={10}
          className="w-full bg-transparent font-mono text-xs sm:text-sm leading-relaxed text-[#E2E8F0] placeholder-slate-600 focus:outline-none resize-y"
        />
        <div className="mt-2 border-t border-white/5 pt-2 text-right text-[10px] font-mono text-slate-500">
          Format: Plain Text / Code / Markdown
        </div>
      </div>

      {/* Monospace Metrics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Characters</div>
          <div className="mt-1 font-mono text-xl font-bold text-white">
            {formatNumber(stats.characters)}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Words</div>
          <div className="mt-1 font-mono text-xl font-bold text-white">
            {formatNumber(stats.words)}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Tokens ≈</div>
          <div className="mt-1 font-mono text-2xl font-extrabold text-blue-300">
            {formatNumber(stats.estimatedTokens)}
          </div>
        </div>
      </div>
    </div>
  );
};
