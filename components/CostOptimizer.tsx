'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels, getModelById } from '@/lib/pricing';
import { calculateWorkloadCosts } from '@/lib/engine/calculator';
import { formatCurrency } from '@/lib/engine/format';

export const CostOptimizer: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [selectedModelId, setSelectedModelId] = useState<string>('gpt-4o');
  const [mau, setMau] = useState(1000);
  const [requestsPerUserDay, setRequestsPerUserDay] = useState(10);
  const [inputTokens, setInputTokens] = useState(2500);
  const [outputTokens, setOutputTokens] = useState(500);

  const selectedModel = useMemo(() => {
    return getModelById(selectedModelId) || activeModels[0];
  }, [selectedModelId, activeModels]);

  const unoptimized = useMemo(() => {
    if (!selectedModel) return null;
    return calculateWorkloadCosts({
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
      requestsPerUserPerDay: requestsPerUserDay,
      monthlyActiveUsers: mau,
      inputPricePerMillion: selectedModel.inputPricePerMillion,
      outputPricePerMillion: selectedModel.outputPricePerMillion,
      cacheHitRate: 0,
      batchRate: 0,
    });
  }, [selectedModel, inputTokens, outputTokens, requestsPerUserDay, mau]);

  // Recommendations calculated deterministically:
  // Option 1: 50% Prompt Caching
  const withCaching = useMemo(() => {
    if (!selectedModel) return null;
    return calculateWorkloadCosts({
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
      requestsPerUserPerDay: requestsPerUserDay,
      monthlyActiveUsers: mau,
      inputPricePerMillion: selectedModel.inputPricePerMillion,
      outputPricePerMillion: selectedModel.outputPricePerMillion,
      cacheHitRate: 0.5,
      cachedInputPricePerMillion: selectedModel.pricingTiers?.cachedInput || selectedModel.inputPricePerMillion * 0.5,
    });
  }, [selectedModel, inputTokens, outputTokens, requestsPerUserDay, mau]);

  // Option 2: Model Routing to lightweight model (e.g. GPT-4o mini or Gemini 3.7 Flash)
  const lighterModel = useMemo(() => {
    return activeModels.find((m) => m.id === 'gpt-4o-mini') || activeModels.find((m) => m.id.includes('flash')) || activeModels[1];
  }, [activeModels]);

  const withLighterModel = useMemo(() => {
    if (!lighterModel) return null;
    return calculateWorkloadCosts({
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
      requestsPerUserPerDay: requestsPerUserDay,
      monthlyActiveUsers: mau,
      inputPricePerMillion: lighterModel.inputPricePerMillion,
      outputPricePerMillion: lighterModel.outputPricePerMillion,
    });
  }, [lighterModel, inputTokens, outputTokens, requestsPerUserDay, mau]);

  if (!selectedModel || !unoptimized || !withCaching || !withLighterModel || !lighterModel) return null;

  const cachingSavings = unoptimized.monthlyCost - withCaching.monthlyCost;
  const lighterSavings = unoptimized.monthlyCost - withLighterModel.monthlyCost;

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Inputs */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#060914]/80 p-5">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Unoptimized Workload</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {activeModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.provider} - {m.modelName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">MAU</label>
              <input
                type="number"
                value={mau}
                onChange={(e) => setMau(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Req / User / Day</label>
              <input
                type="number"
                value={requestsPerUserDay}
                onChange={(e) => setRequestsPerUserDay(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Input Tokens</label>
              <input
                type="number"
                value={inputTokens}
                onChange={(e) => setInputTokens(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Output Tokens</label>
              <input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Unoptimized Monthly Spend</span>
            <div className="text-2xl font-black text-white mt-1">{formatCurrency(unoptimized.monthlyCost)}</div>
          </div>
        </div>

        {/* Deterministic Optimization Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Deterministic Cost Reduction Opportunities</h3>

          {/* Recommendation 1 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Strategy 1: Prompt Caching
                </span>
                <span className="text-xs font-bold text-slate-200">50% Cache Hit Rate</span>
              </div>
              <div className="text-lg font-black text-emerald-400">Save {formatCurrency(cachingSavings)}/mo</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              By structuring system prompts for prefix caching, 50% of input tokens receive prompt caching discounts.
            </p>
            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-white/10 pt-2">
              <span>Optimized Spend: <strong className="text-white">{formatCurrency(withCaching.monthlyCost)}/mo</strong></span>
              <span>Annual Savings: <strong className="text-emerald-400">{formatCurrency(cachingSavings * 12)}</strong></span>
            </div>
          </div>

          {/* Recommendation 2 */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                  Strategy 2: Model Routing
                </span>
                <span className="text-xs font-bold text-slate-200">Switch to {lighterModel.modelName}</span>
              </div>
              <div className="text-lg font-black text-blue-400">Save {formatCurrency(lighterSavings)}/mo</div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Route routine conversational or extraction queries to lightweight model ({lighterModel.provider} {lighterModel.modelName}).
            </p>
            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-white/10 pt-2">
              <span>Optimized Spend: <strong className="text-white">{formatCurrency(withLighterModel.monthlyCost)}/mo</strong></span>
              <span>Annual Savings: <strong className="text-blue-400">{formatCurrency(lighterSavings * 12)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
