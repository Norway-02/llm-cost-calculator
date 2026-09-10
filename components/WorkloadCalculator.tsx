'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels } from '@/lib/pricing';
import { calculateWorkloadCosts } from '@/lib/engine/calculator';
import { formatCurrency } from '@/lib/engine/format';

export const WorkloadCalculator: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [selectedModelId, setSelectedModelId] = useState(activeModels[0]?.id || 'gpt-4o');
  const [inputTokens, setInputTokens] = useState(1500);
  const [outputTokens, setOutputTokens] = useState(400);
  const [requestsPerUserDay, setRequestsPerUserDay] = useState(5);
  const [mau, setMau] = useState(500);
  const [cacheHitRate, setCacheHitRate] = useState(0.2); // 20%
  const [growthRate, setGrowthRate] = useState(0.05); // 5%

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
      cacheHitRate: cacheHitRate,
      cachedInputPricePerMillion: selectedModel.pricingTiers?.cachedInput || selectedModel.inputPricePerMillion,
      growthRateMonthly: growthRate,
    });
  }, [selectedModel, inputTokens, outputTokens, requestsPerUserDay, mau, cacheHitRate, growthRate]);

  if (!selectedModel || !results) return null;

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">1</span>
            Workload Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target AI Model</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Input Tokens / Req</label>
                <input
                  type="number"
                  min="1"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Output Tokens / Req</label>
                <input
                  type="number"
                  min="1"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Prompt Cache Rate ({Math.round(cacheHitRate * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.05"
                  value={cacheHitRate}
                  onChange={(e) => setCacheHitRate(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monthly Growth Rate ({Math.round(growthRate * 100)}%)</label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results & Projections */}
        <div className="space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">2</span>
              Cost Estimates & Scale Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cost Per Request</span>
                <div className="text-xl font-extrabold text-white mt-1">{formatCurrency(results.costPerRequest)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cost Per User / Mo</span>
                <div className="text-xl font-extrabold text-blue-400 mt-1">{formatCurrency(results.costPerUserMonthly)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Monthly Cost</span>
                <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(results.monthlyCost)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Annual Run-Rate</span>
                <div className="text-xl font-extrabold text-purple-400 mt-1">{formatCurrency(results.annualCost)}</div>
              </div>
            </div>

            {/* Growth Scenario Projections */}
            <div className="rounded-2xl border border-white/10 bg-[#060914]/60 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-200">12-Month Projected Growth Spend</span>
              <div className="grid grid-cols-5 gap-2 text-center pt-2">
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-slate-400">M1</div>
                  <div className="text-xs font-bold text-slate-200">{formatCurrency(results.projections.month1)}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-slate-400">M2</div>
                  <div className="text-xs font-bold text-slate-200">{formatCurrency(results.projections.month2)}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-slate-400">M3</div>
                  <div className="text-xs font-bold text-slate-200">{formatCurrency(results.projections.month3)}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-slate-400">M6</div>
                  <div className="text-xs font-bold text-blue-300">{formatCurrency(results.projections.month6)}</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-[10px] text-slate-400">M12</div>
                  <div className="text-xs font-bold text-emerald-400">{formatCurrency(results.projections.month12)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 border-t border-white/10 pt-3 flex items-center justify-between">
            <span>Verified Source: <a href={selectedModel.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{selectedModel.provider} Official Pricing</a></span>
            <span>Last checked: {selectedModel.lastVerifiedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
