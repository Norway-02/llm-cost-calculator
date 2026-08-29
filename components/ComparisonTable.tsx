'use client';

import React from 'react';
import { ModelPricing } from '@/lib/pricing/schema';
import { calculateCosts, CalculationInput } from '@/lib/engine/calculator';
import { Button } from './ui/Button';
import { PricingFreshnessBadge } from './PricingFreshnessBadge';
import { Badge } from './ui/Badge';
import {
  SupportedCurrency,
  convertFromUsd,
  formatCurrency,
} from '@/lib/currency';

export interface ComparisonTableProps {
  allModels: ModelPricing[];
  selectedModelIds: string[];
  usageInput: Omit<CalculationInput, 'inputPricePerMillion' | 'outputPricePerMillion'>;
  currencyCode?: SupportedCurrency;
  onAddModel: (modelId: string) => void;
  onRemoveModel: (modelId: string) => void;
  onChangeModel: (index: number, newModelId: string) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  allModels,
  selectedModelIds,
  usageInput,
  currencyCode = 'USD',
  onAddModel,
  onRemoveModel,
  onChangeModel,
}) => {
  const comparisonData = selectedModelIds.map((id) => {
    const model = allModels.find((m) => m.id === id) || allModels[0];
    const calc = calculateCosts({
      ...usageInput,
      inputPricePerMillion: model.inputPricePerMillion,
      outputPricePerMillion: model.outputPricePerMillion,
    });
    return { model, calc };
  });

  const getFmt = (usdVal: number) => {
    const { convertedAmount } = convertFromUsd(usdVal, currencyCode);
    return formatCurrency(convertedAmount, currencyCode);
  };

  const hasShutdownInComparison = comparisonData.some((d) => d.model.lifecycle === 'shutdown');
  const hasDeprecatedInComparison = comparisonData.some((d) => d.model.lifecycle === 'deprecated');

  // Calculate cheapest & most expensive monthly cost using canonical USD numeric values
  const activeMonthlyCosts = comparisonData
    .filter((d) => d.model.lifecycle !== 'shutdown')
    .map((d) => d.calc.monthlyCost);
  const minMonthly = activeMonthlyCosts.length > 0 ? Math.min(...activeMonthlyCosts) : Infinity;
  const maxMonthly = activeMonthlyCosts.length > 0 ? Math.max(...activeMonthlyCosts) : -Infinity;
  const hasDifference = activeMonthlyCosts.length > 1 && minMonthly !== maxMonthly;

  const availableModelsToAdd = allModels.filter((m) => !selectedModelIds.includes(m.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Side-by-Side Model Comparison ({selectedModelIds.length} / 5 Models)
        </h3>
        {selectedModelIds.length < 5 && availableModelsToAdd.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              onChange={(e) => {
                if (e.target.value) {
                  onAddModel(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                + Compare Another Model...
              </option>
              {availableModelsToAdd.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1"
                >
                  {m.provider} - {m.modelName} {m.lifecycle === 'shutdown' ? '(Shutdown)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {(hasShutdownInComparison || hasDeprecatedInComparison) && (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
          ⚠️ <strong>Comparison Warning:</strong> One or more models in this table are shut down or deprecated. They are included for historical benchmarking only and cannot be deployed in new production apps.
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            <tr>
              <th className="p-3.5 font-bold">Provider & Model</th>
              <th className="p-3.5 font-bold">Lifecycle</th>
              <th className="p-3.5 font-bold">Input / 1M (USD)</th>
              <th className="p-3.5 font-bold">Output / 1M (USD)</th>
              <th className="p-3.5 font-bold">Cost / Request</th>
              <th className="p-3.5 font-bold">Monthly Cost</th>
              <th className="p-3.5 font-bold">Annual Cost</th>
              <th className="p-3.5 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {comparisonData.map(({ model, calc }, idx) => {
              const isCheapest = hasDifference && model.lifecycle !== 'shutdown' && calc.monthlyCost === minMonthly;
              const isExpensive = hasDifference && model.lifecycle !== 'shutdown' && calc.monthlyCost === maxMonthly;

              return (
                <tr
                  key={`${model.id}-${idx}`}
                  className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${
                    model.lifecycle === 'shutdown'
                      ? 'bg-rose-50/30 dark:bg-rose-950/20 opacity-80'
                      : isCheapest
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                      : ''
                  }`}
                >
                  <td className="p-3.5">
                    <div className="space-y-1">
                      <select
                        value={model.id}
                        onChange={(e) => onChangeModel(idx, e.target.value)}
                        className="rounded border border-slate-200 bg-white py-1 px-1.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {allModels.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1"
                          >
                            {m.provider} - {m.modelName} {m.lifecycle === 'shutdown' ? '(Shutdown)' : ''}
                          </option>
                        ))}
                      </select>
                      <div>
                        <PricingFreshnessBadge model={model} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {model.lifecycle === 'current' && <Badge variant="verified">Active</Badge>}
                    {model.lifecycle === 'shutdown' && <Badge variant="unverified">Shutdown</Badge>}
                    {model.lifecycle === 'deprecated' && <Badge variant="stale">Deprecated</Badge>}
                    {model.lifecycle === 'legacy' && <Badge variant="neutral">Legacy</Badge>}
                    {model.lifecycle === 'preview' && <Badge variant="info">Preview</Badge>}
                  </td>
                  <td className="p-3.5 font-medium">${model.inputPricePerMillion}</td>
                  <td className="p-3.5 font-medium">${model.outputPricePerMillion}</td>
                  <td className="p-3.5 font-medium">{getFmt(calc.costPerRequest)}</td>
                  <td className="p-3.5 font-bold">
                    <div className="flex items-center gap-1.5">
                      <span>{getFmt(calc.monthlyCost)}</span>
                      {isCheapest && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                          🏆 Lowest
                        </span>
                      )}
                      {isExpensive && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                          ⚠️ Highest
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-medium">{getFmt(calc.annualCost)}</td>
                  <td className="p-3.5 text-center">
                    {selectedModelIds.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveModel(model.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="block md:hidden space-y-3">
        {comparisonData.map(({ model, calc }, idx) => {
          const isCheapest = hasDifference && model.lifecycle !== 'shutdown' && calc.monthlyCost === minMonthly;
          const isExpensive = hasDifference && model.lifecycle !== 'shutdown' && calc.monthlyCost === maxMonthly;

          return (
            <div
              key={`${model.id}-mobile-${idx}`}
              className={`rounded-xl border p-4 shadow-sm transition-all dark:bg-slate-900 ${
                model.lifecycle === 'shutdown'
                  ? 'border-rose-300 bg-rose-50/20 dark:border-rose-900'
                  : isCheapest
                  ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <select
                  value={model.id}
                  onChange={(e) => onChangeModel(idx, e.target.value)}
                  className="rounded border border-slate-200 bg-white py-1 px-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {allModels.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1"
                    >
                      {m.provider} - {m.modelName} {m.lifecycle === 'shutdown' ? '(Shutdown)' : ''}
                    </option>
                  ))}
                </select>
                {selectedModelIds.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveModel(model.id)}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Lifecycle:</span>{' '}
                  <strong>{model.lifecycle.toUpperCase()}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Input / 1M:</span>{' '}
                  <strong>${model.inputPricePerMillion}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Cost / Request:</span>{' '}
                  <strong>{getFmt(calc.costPerRequest)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Cost:</span>{' '}
                  <strong>{getFmt(calc.monthlyCost)}</strong>
                </div>
              </div>

              {isCheapest && (
                <div className="mt-2 rounded bg-emerald-100 p-1.5 text-center text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  🏆 Lowest Active Cost
                </div>
              )}
              {isExpensive && (
                <div className="mt-2 rounded bg-rose-100 p-1.5 text-center text-xs font-bold text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                  ⚠️ Highest Active Cost
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
