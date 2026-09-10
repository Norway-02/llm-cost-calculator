'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels } from '@/lib/pricing';
import { calculateSaasEconomics } from '@/lib/engine/calculator';
import { formatCurrency, formatNumber } from '@/lib/engine/format';

export const SaasEconomicsCalculator: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [selectedModelId, setSelectedModelId] = useState(activeModels[0]?.id || 'gpt-4o');
  const [mau, setMau] = useState(2000);
  const [conversionRate, setConversionRate] = useState(4); // 4% paid conversion
  const [subPrice, setSubPrice] = useState(29); // $29/mo
  const [requestsPerUserDay, setRequestsPerUserDay] = useState(8);
  const [inputTokens, setInputTokens] = useState(1200);
  const [outputTokens, setOutputTokens] = useState(300);
  const [infraCost, setInfraCost] = useState(150); // $150/mo server/db

  const selectedModel = useMemo(() => {
    return activeModels.find((m) => m.id === selectedModelId) || activeModels[0];
  }, [activeModels, selectedModelId]);

  const results = useMemo(() => {
    if (!selectedModel) return null;
    return calculateSaasEconomics({
      monthlyActiveUsers: mau,
      paidConversionRatePercent: conversionRate,
      subscriptionPriceMonthly: subPrice,
      requestsPerUserPerDay: requestsPerUserDay,
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
      inputPricePerMillion: selectedModel.inputPricePerMillion,
      outputPricePerMillion: selectedModel.outputPricePerMillion,
      infrastructureCostMonthly: infraCost,
      paymentFeePercent: 2.9,
    });
  }, [selectedModel, mau, conversionRate, subPrice, requestsPerUserDay, inputTokens, outputTokens, infraCost]);

  if (!selectedModel || !results) return null;

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">1</span>
            SaaS Financial Inputs
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

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paid Conv Rate (%)</label>
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.5"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sub Price ($/mo)</label>
                <input
                  type="number"
                  min="1"
                  value={subPrice}
                  onChange={(e) => setSubPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Infra Cost ($/mo)</label>
                <input
                  type="number"
                  min="0"
                  value={infraCost}
                  onChange={(e) => setInfraCost(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3.5 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Req/User/Day</label>
                <input
                  type="number"
                  min="1"
                  value={requestsPerUserDay}
                  onChange={(e) => setRequestsPerUserDay(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Input Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Output Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/10 bg-[#060914] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
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
              Profitability & Gross Margins
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Paid Subscribers</span>
                <div className="text-xl font-extrabold text-white mt-1">{formatNumber(results.paidUsers)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
                <div className="text-xl font-extrabold text-emerald-400 mt-1">{formatCurrency(results.monthlyRevenue)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly AI Cost</span>
                <div className="text-xl font-extrabold text-rose-400 mt-1">{formatCurrency(results.aiCostMonthly)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gross Margin %</span>
                <div className={`text-xl font-extrabold mt-1 ${results.grossMarginPercent >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {results.grossMarginPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#060914]/60 p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Monthly Gross Profit:</span>
                <span className={`font-bold ${results.grossProfitMonthly >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(results.grossProfitMonthly)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Break-even Paid Users:</span>
                <span className="font-bold text-slate-200">
                  {results.breakEvenPaidUsers > 0 ? formatNumber(results.breakEvenPaidUsers) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-white/10 pt-3">
            Note: Estimates are for architectural guidance only and do not constitute formal financial advice.
          </div>
        </div>
      </div>
    </div>
  );
};
