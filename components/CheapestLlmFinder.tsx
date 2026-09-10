'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';
import { formatCurrency } from '@/lib/engine/format';

export const CheapestLlmFinder: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(300);
  const [requestsPerDay, setRequestsPerDay] = useState(100);
  const [reqVision, setReqVision] = useState(false);
  const [reqReasoning, setReqReasoning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  const filteredAndSortedModels = useMemo(() => {
    return activeModels
      .filter((m) => {
        if (selectedProvider !== 'all' && m.provider.toLowerCase() !== selectedProvider.toLowerCase()) return false;
        if (reqVision && !m.capabilities?.vision) return false;
        if (reqReasoning && !m.capabilities?.reasoning) return false;
        return true;
      })
      .map((m) => {
        const costRes = calculateCosts({
          inputTokens,
          outputTokens,
          requestsPerDay,
          daysPerMonth: 30,
          inputPricePerMillion: m.inputPricePerMillion,
          outputPricePerMillion: m.outputPricePerMillion,
        });
        return {
          model: m,
          monthlyCost: costRes.monthlyCost,
          costPerRequest: costRes.costPerRequest,
        };
      })
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [activeModels, inputTokens, outputTokens, requestsPerDay, reqVision, reqReasoning, selectedProvider]);

  const cheapest = filteredAndSortedModels[0];

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter Controls */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#060914]/80 p-5">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Workload & Filter Criteria</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="deepseek">DeepSeek</option>
              <option value="meta">Meta</option>
              <option value="mistral">Mistral</option>
              <option value="cohere">Cohere</option>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Requests</label>
            <input
              type="number"
              value={requestsPerDay}
              onChange={(e) => setRequestsPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={reqVision}
                onChange={(e) => setReqVision(e.target.checked)}
                className="rounded accent-blue-500"
              />
              Requires Vision Capability
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={reqReasoning}
                onChange={(e) => setReqReasoning(e.target.checked)}
                className="rounded accent-blue-500"
              />
              Requires Advanced Reasoning
            </label>
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          {cheapest && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 flex items-center justify-between">
              <div>
                <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 mb-1">
                  Cheapest Eligible Model
                </span>
                <h4 className="text-xl font-black text-white">{cheapest.model.provider} {cheapest.model.modelName}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  ${cheapest.model.inputPricePerMillion}/M input · ${cheapest.model.outputPricePerMillion}/M output
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">{formatCurrency(cheapest.monthlyCost)}/mo</div>
                <div className="text-xs text-slate-400">{formatCurrency(cheapest.costPerRequest)}/req</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligible Models Ranked by Price</h4>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredAndSortedModels.map((item, idx) => (
                <div
                  key={item.model.id}
                  className="rounded-xl border border-white/5 bg-[#060914]/60 p-3 flex items-center justify-between hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-500 w-5">#{idx + 1}</span>
                    <div>
                      <span className="font-bold text-xs text-slate-200">{item.model.provider} {item.model.modelName}</span>
                      <div className="text-[11px] text-slate-400">
                        ${item.model.inputPricePerMillion}/M in · ${item.model.outputPricePerMillion}/M out
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-100">{formatCurrency(item.monthlyCost)}/mo</span>
                    {cheapest && idx > 0 && (
                      <div className="text-[10px] text-rose-400">
                        +{formatCurrency(item.monthlyCost - cheapest.monthlyCost)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
