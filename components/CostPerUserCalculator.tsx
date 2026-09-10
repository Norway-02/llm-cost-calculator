'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels } from '@/lib/pricing';
import { calculateWorkloadCosts } from '@/lib/engine/calculator';
import { formatCurrency, formatNumber } from '@/lib/engine/format';

export const CostPerUserCalculator: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [selectedModelId, setSelectedModelId] = useState(activeModels[0]?.id || 'gpt-4o');
  const [mau, setMau] = useState(1000);
  const [requestsPerUserDay, setRequestsPerUserDay] = useState(10);
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(250);

  const selectedModel = useMemo(() => {
    return activeModels.find((m) => m.id === selectedModelId) || activeModels[0];
  }, [activeModels, selectedModelId]);

  const results = useMemo(() => {
    if (!selectedModel) return null;
    return calculateWorkloadCosts({
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
      requestsPerUserPerDay: requestsPerUserDay,
      monthlyActiveUsers: mau,
      inputPricePerMillion: selectedModel.inputPricePerMillion,
      outputPricePerMillion: selectedModel.outputPricePerMillion,
    });
  }, [selectedModel, inputTokens, outputTokens, requestsPerUserDay, mau]);

  if (!selectedModel || !results) return null;

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">1</span>
            User & Usage Profile
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                {activeModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.provider} - {m.modelName} (${m.inputPricePerMillion}/M in, ${m.outputPricePerMillion}/M out)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Active Users (MAU)</label>
              <input
                type="number"
                min="1"
                value={mau}
                onChange={(e) => setMau(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Requests / User / Day</label>
              <input
                type="number"
                min="1"
                value={requestsPerUserDay}
                onChange={(e) => setRequestsPerUserDay(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avg Input Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avg Output Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">2</span>
              Unit Economics Per User
            </h3>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-5 mb-4">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Cost Per Active User / Month</span>
              <div className="text-3xl font-black text-white mt-1">{formatCurrency(results.costPerUserMonthly)}</div>
              <p className="text-xs text-slate-400 mt-1">
                Based on {requestsPerUserDay * 30} monthly requests ({formatNumber(inputTokens + outputTokens)} total tokens/req).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">100 Users Cost</span>
                <div className="text-lg font-bold text-slate-100 mt-1">{formatCurrency(results.costForUsers[100])}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">1,000 Users Cost</span>
                <div className="text-lg font-bold text-slate-100 mt-1">{formatCurrency(results.costForUsers[1000])}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">10,000 Users Cost</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(results.costForUsers[10000])}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">100,000 Users Cost</span>
                <div className="text-lg font-bold text-purple-400 mt-1">{formatCurrency(results.costForUsers[100000])}</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-white/10 pt-3 flex items-center justify-between">
            <span>Model: {selectedModel.modelName} ({selectedModel.provider})</span>
            <span>Source: Verified {selectedModel.lastVerifiedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
