'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';
import { formatCurrency, formatNumber } from '@/lib/engine/format';

export const PromptCostAnalyzer: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [promptText, setPromptText] = useState<string>(
    'You are a helpful software engineering assistant. Please analyze the provided source code, identify potential security vulnerabilities such as SQL injection, XSS, and broken authentication, and suggest refactored production code following clean architecture patterns.'
  );
  const [expectedOutputTokens, setExpectedOutputTokens] = useState<number>(300);
  const [expectedRequests, setExpectedRequests] = useState<number>(100);

  const textMetrics = useMemo(() => {
    const chars = promptText.length;
    const words = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
    // Heuristic token estimation: ~4 characters per token for English text
    const estimatedTokens = Math.max(1, Math.ceil(chars / 4));
    return { chars, words, estimatedTokens };
  }, [promptText]);

  const modelCosts = useMemo(() => {
    return activeModels
      .map((m) => {
        const costRes = calculateCosts({
          inputTokens: textMetrics.estimatedTokens,
          outputTokens: expectedOutputTokens,
          requestsPerDay: expectedRequests,
          daysPerMonth: 30,
          inputPricePerMillion: m.inputPricePerMillion,
          outputPricePerMillion: m.outputPricePerMillion,
        });
        return {
          model: m,
          costPerRequest: costRes.costPerRequest,
          monthlyCost: costRes.monthlyCost,
        };
      })
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [activeModels, textMetrics.estimatedTokens, expectedOutputTokens, expectedRequests]);

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Text Prompt */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">1</span>
              Paste System or User Prompt
            </h3>
            <span className="text-[11px] font-semibold text-emerald-400">100% Client-Side Privacy</span>
          </div>

          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Paste your system prompt, RAG context, or user instructions here..."
            className="w-full rounded-2xl border border-white/10 bg-[#060914] p-4 text-xs text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
          />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-[#060914]/80 p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">Characters</div>
              <div className="text-sm font-black text-slate-100 mt-0.5">{formatNumber(textMetrics.chars)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#060914]/80 p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">Words</div>
              <div className="text-sm font-black text-slate-100 mt-0.5">{formatNumber(textMetrics.words)}</div>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-3">
              <div className="text-[10px] uppercase font-bold text-blue-300">Est. Tokens</div>
              <div className="text-sm font-black text-blue-400 mt-0.5">{formatNumber(textMetrics.estimatedTokens)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Output Tokens</label>
              <input
                type="number"
                value={expectedOutputTokens}
                onChange={(e) => setExpectedOutputTokens(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Executions</label>
              <input
                type="number"
                value={expectedRequests}
                onChange={(e) => setExpectedRequests(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Calculated Model Costs */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">2</span>
            Cost Per Execution Across Models
          </h3>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {modelCosts.map((item) => (
              <div
                key={item.model.id}
                className="rounded-2xl border border-white/10 bg-[#060914]/80 p-3.5 flex items-center justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <span className="font-bold text-xs text-slate-100">{item.model.provider} {item.model.modelName}</span>
                  <div className="text-[11px] text-slate-400">
                    ${item.model.inputPricePerMillion}/M in · ${item.model.outputPricePerMillion}/M out
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-white">{formatCurrency(item.costPerRequest)} / req</div>
                  <div className="text-[11px] font-semibold text-emerald-400">{formatCurrency(item.monthlyCost)} / mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
