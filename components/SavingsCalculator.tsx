'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels, getModelById } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';
import { formatCurrency } from '@/lib/engine/format';

export const SavingsCalculator: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [modelAId, setModelAId] = useState<string>('gpt-4o');
  const [modelBId, setModelBId] = useState<string>('gpt-4o-mini');
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(1000);

  const modelA = useMemo(() => getModelById(modelAId) || activeModels[0], [modelAId, activeModels]);
  const modelB = useMemo(() => getModelById(modelBId) || activeModels[1], [modelBId, activeModels]);

  const costA = useMemo(() => {
    if (!modelA) return null;
    return calculateCosts({
      inputTokens,
      outputTokens,
      requestsPerDay,
      daysPerMonth: 30,
      inputPricePerMillion: modelA.inputPricePerMillion,
      outputPricePerMillion: modelA.outputPricePerMillion,
    });
  }, [modelA, inputTokens, outputTokens, requestsPerDay]);

  const costB = useMemo(() => {
    if (!modelB) return null;
    return calculateCosts({
      inputTokens,
      outputTokens,
      requestsPerDay,
      daysPerMonth: 30,
      inputPricePerMillion: modelB.inputPricePerMillion,
      outputPricePerMillion: modelB.outputPricePerMillion,
    });
  }, [modelB, inputTokens, outputTokens, requestsPerDay]);

  if (!modelA || !modelB || !costA || !costB) return null;

  const monthlySavings = costA.monthlyCost - costB.monthlyCost;
  const annualSavings = monthlySavings * 12;
  const percentageSavings = costA.monthlyCost > 0 ? (monthlySavings / costA.monthlyCost) * 100 : 0;

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Selections & Workload */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">1</span>
            Compare Deployment Models
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Baseline Model (A)</label>
              <select
                value={modelAId}
                onChange={(e) => setModelAId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                {activeModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.provider} - {m.modelName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Model (B)</label>
              <select
                value={modelBId}
                onChange={(e) => setModelBId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                {activeModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.provider} - {m.modelName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Input Tokens</label>
              <input
                type="number"
                value={inputTokens}
                onChange={(e) => setInputTokens(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Output Tokens</label>
              <input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Daily Requests</label>
              <input
                type="number"
                value={requestsPerDay}
                onChange={(e) => setRequestsPerDay(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Savings Results */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">2</span>
              Calculated Savings & ROI
            </h3>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 mb-4">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Projected Monthly Savings</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{formatCurrency(monthlySavings)}</div>
              <p className="text-xs text-slate-300 mt-1">
                {percentageSavings >= 0 ? `${percentageSavings.toFixed(1)}% cost reduction by switching from ${modelA.modelName} to ${modelB.modelName}.` : `Cost increases by ${Math.abs(percentageSavings).toFixed(1)}%.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{modelA.modelName} Spend</span>
                <div className="text-lg font-bold text-slate-200 mt-1">{formatCurrency(costA.monthlyCost)}/mo</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{modelB.modelName} Spend</span>
                <div className="text-lg font-bold text-slate-200 mt-1">{formatCurrency(costB.monthlyCost)}/mo</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3 text-center">
            <span className="text-xs text-purple-300 font-bold">Annual Savings Potential: {formatCurrency(annualSavings)} / year</span>
          </div>
        </div>
      </div>
    </div>
  );
};
