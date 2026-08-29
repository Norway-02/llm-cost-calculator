'use client';

import React from 'react';
import { ModelPricing } from '@/lib/pricing/schema';
import { calculateCosts, CalculationInput } from '@/lib/engine/calculator';
import { convertFromUsd, formatCurrency, SupportedCurrency } from '@/lib/currency';

export interface SavingsInsightCardProps {
  currentModel: ModelPricing;
  allModels: ModelPricing[];
  usageInput: Omit<CalculationInput, 'inputPricePerMillion' | 'outputPricePerMillion'>;
  currencyCode?: SupportedCurrency;
}

export const SavingsInsightCard: React.FC<SavingsInsightCardProps> = ({
  currentModel,
  allModels,
  usageInput,
  currencyCode = 'USD',
}) => {
  // If current model is shutdown, don't calculate savings against it
  if (currentModel.lifecycle === 'shutdown') return null;

  const currentCalc = calculateCosts({
    ...usageInput,
    inputPricePerMillion: currentModel.inputPricePerMillion,
    outputPricePerMillion: currentModel.outputPricePerMillion,
  });

  // Find active non-shutdown alternative models that cost less
  const alternatives = allModels
    .filter((m) => m.id !== currentModel.id && m.lifecycle === 'current')
    .map((m) => {
      const calc = calculateCosts({
        ...usageInput,
        inputPricePerMillion: m.inputPricePerMillion,
        outputPricePerMillion: m.outputPricePerMillion,
      });
      const savingsUsd = currentCalc.monthlyCost - calc.monthlyCost;
      const savingsPercent =
        currentCalc.monthlyCost > 0 ? (savingsUsd / currentCalc.monthlyCost) * 100 : 0;
      return { model: m, calc, savingsUsd, savingsPercent };
    })
    .filter((alt) => alt.savingsUsd > 0.05 && alt.savingsPercent > 5)
    .sort((a, b) => b.savingsPercent - a.savingsPercent);

  if (alternatives.length === 0) return null;

  const topAlt = alternatives[0];
  const { convertedAmount: savedAmount } = convertFromUsd(topAlt.savingsUsd, currencyCode);
  const formattedSavings = formatCurrency(savedAmount, currencyCode);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-emerald-950/20 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Potential Estimated Savings Insight
          </div>
          <p className="text-xs sm:text-sm text-slate-200">
            Using <strong className="text-white font-bold">{topAlt.model.provider} {topAlt.model.modelName}</strong> instead of{' '}
            <span className="text-slate-400">{currentModel.modelName}</span> could reduce estimated monthly API spend by up to{' '}
            <strong className="text-emerald-400 font-mono font-extrabold">{topAlt.savingsPercent.toFixed(1)}%</strong> ({formattedSavings}/mo) for this workload.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300">
            Save ~{topAlt.savingsPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
