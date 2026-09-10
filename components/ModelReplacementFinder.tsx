'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels, getModelById } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';
import { formatCurrency } from '@/lib/engine/format';

export const ModelReplacementFinder: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [currentModelId, setCurrentModelId] = useState<string>('gpt-4o');
  const [inputTokens, setInputTokens] = useState(2000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(500);

  const currentModel = useMemo(() => {
    return getModelById(currentModelId) || activeModels[0];
  }, [currentModelId, activeModels]);

  const currentCostRes = useMemo(() => {
    if (!currentModel) return null;
    return calculateCosts({
      inputTokens,
      outputTokens,
      requestsPerDay,
      daysPerMonth: 30,
      inputPricePerMillion: currentModel.inputPricePerMillion,
      outputPricePerMillion: currentModel.outputPricePerMillion,
    });
  }, [currentModel, inputTokens, outputTokens, requestsPerDay]);

  const alternatives = useMemo(() => {
    if (!currentModel || !currentCostRes) return [];
    return activeModels
      .filter((m) => m.id !== currentModel.id)
      .map((m) => {
        const altCostRes = calculateCosts({
          inputTokens,
          outputTokens,
          requestsPerDay,
          daysPerMonth: 30,
          inputPricePerMillion: m.inputPricePerMillion,
          outputPricePerMillion: m.outputPricePerMillion,
        });
        const monthlySavings = currentCostRes.monthlyCost - altCostRes.monthlyCost;
        const percentageSavings = currentCostRes.monthlyCost > 0 ? (monthlySavings / currentCostRes.monthlyCost) * 100 : 0;
        return {
          model: m,
          monthlyCost: altCostRes.monthlyCost,
          monthlySavings,
          percentageSavings,
        };
      })
      .sort((a, b) => b.monthlySavings - a.monthlySavings);
  }, [activeModels, currentModel, currentCostRes, inputTokens, outputTokens, requestsPerDay]);

  if (!currentModel || !currentCostRes) return null;

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection & Workload */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#060914]/80 p-5">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Current Model & Usage</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Model</label>
            <select
              value={currentModelId}
              onChange={(e) => setCurrentModelId(e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Requests / Day</label>
            <input
              type="number"
              value={requestsPerDay}
              onChange={(e) => setRequestsPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
            <div className="text-xs text-slate-400">Current Monthly Spend:</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{formatCurrency(currentCostRes.monthlyCost)}</div>
          </div>
        </div>

        {/* Alternatives List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Alternative Replacement Models</h4>
            <span className="text-[11px] text-slate-400">Note: Verify capability compatibility before switching</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {alternatives.map((alt) => (
              <div
                key={alt.model.id}
                className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4 flex items-center justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{alt.model.provider} {alt.model.modelName}</span>
                    {alt.monthlySavings > 0 && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        Save {alt.percentageSavings.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ${alt.model.inputPricePerMillion}/M in · ${alt.model.outputPricePerMillion}/M out
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-200">{formatCurrency(alt.monthlyCost)}/mo</div>
                  <div className={`text-xs font-extrabold ${alt.monthlySavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {alt.monthlySavings >= 0 ? `-${formatCurrency(alt.monthlySavings)}/mo` : `+${formatCurrency(-alt.monthlySavings)}/mo`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
