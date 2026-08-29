'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CalculationResult } from '@/lib/engine/calculator';
import { formatNumber } from '@/lib/engine/format';
import {
  SupportedCurrency,
  convertFromUsd,
  formatCurrency,
  DEFAULT_FX_RATE_SET,
  CURRENCY_METADATA,
  getFxPublicationStatus,
} from '@/lib/currency';
import { AnimatedNumber } from './AnimatedNumber';

export interface CostBreakdownProps {
  result: CalculationResult;
  modelName: string;
  currencyCode?: SupportedCurrency;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  result,
  modelName,
  currencyCode = 'USD',
}) => {
  const [pulse, setPulse] = useState(false);
  const prevMonthlyCostRef = useRef<number>(result.monthlyCost);

  useEffect(() => {
    if (prevMonthlyCostRef.current !== result.monthlyCost) {
      setPulse(true);
      prevMonthlyCostRef.current = result.monthlyCost;
      const timer = setTimeout(() => setPulse(false), 350);
      return () => clearTimeout(timer);
    }
  }, [result.monthlyCost]);

  const getFmt = (usdVal: number) => {
    const { convertedAmount } = convertFromUsd(usdVal, currencyCode);
    return formatCurrency(convertedAmount, currencyCode);
  };

  const getUsdFmt = (usdVal: number) => {
    return formatCurrency(usdVal, 'USD');
  };

  const fxStatus = getFxPublicationStatus(DEFAULT_FX_RATE_SET);
  const statusLabelMap = {
    latest_published: 'Latest published',
    latest_available: 'Latest available',
    delayed: 'Publication delayed (showing latest available)',
    unavailable: 'Reference rate unavailable',
  };

  // Compute input vs output cost ratios for visual progress bars
  const totalCostReq = result.inputCost + result.outputCost;
  const inputRatio = totalCostReq > 0 ? (result.inputCost / totalCostReq) * 100 : 50;
  const outputRatio = totalCostReq > 0 ? (result.outputCost / totalCostReq) * 100 : 50;

  return (
    <div className="space-y-6">
      {/* Monthly Cost Hero Centerpiece Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-violet-950/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          pulse ? 'animate-single-pulse border-blue-500/50 shadow-blue-500/20' : ''
        }`}
      >
        {/* Subtle Halo Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                Estimated Monthly Cost ({modelName})
              </span>
              {currencyCode !== 'USD' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currencyCode} ({CURRENCY_METADATA[currencyCode]?.symbol})
                </span>
              )}
            </div>
            <div className="mt-1 font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              <AnimatedNumber
                value={result.monthlyCost}
                formatFn={(val) => getFmt(val)}
              />
            </div>
            {currencyCode !== 'USD' && (
              <div className="mt-1 text-xs font-semibold text-slate-400">
                ≈ {getUsdFmt(result.monthlyCost)} USD
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Based on {formatNumber(result.totalTokensMonthly)} total tokens across all requests.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3.5 text-right backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cost / Request
            </span>
            <div className="mt-0.5 font-mono text-xl font-bold text-white">
              <AnimatedNumber
                value={result.costPerRequest}
                formatFn={(val) => getFmt(val)}
              />
            </div>
            {currencyCode !== 'USD' && (
              <div className="text-[10px] font-medium text-slate-400">
                ≈ {getUsdFmt(result.costPerRequest)} USD
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid for Periodic Costs with Staggered Entrance */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Daily Cost', val: result.dailyCost, delay: '60ms' },
          { label: 'Weekly Cost', val: result.weeklyCost, delay: '90ms' },
          { label: 'Monthly Cost', val: result.monthlyCost, delay: '120ms' },
          { label: 'Annual Cost', val: result.annualCost, delay: '150ms' },
        ].map((item, i) => (
          <div
            key={i}
            className="group rounded-xl border border-white/5 bg-slate-900/60 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-slate-900/80 hover:shadow-lg"
          >
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
            <div className="mt-1 font-mono text-base font-bold text-white group-hover:text-blue-400 transition-colors">
              <AnimatedNumber value={item.val} formatFn={(v) => getFmt(v)} />
            </div>
            {currencyCode !== 'USD' && (
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">≈ {getUsdFmt(item.val)} USD</div>
            )}
          </div>
        ))}
      </div>

      {/* Input vs Output Visual Breakdown Progress Bars */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Input vs Output Cost Split</span>
          <span className="font-mono text-slate-300">{getFmt(totalCostReq)} / Request</span>
        </div>

        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-white/5">
          <div
            className="h-full rounded-l-full bg-blue-500 transition-all duration-500"
            style={{ width: `${inputRatio}%` }}
            title={`Input Spend: ${inputRatio.toFixed(1)}%`}
          ></div>
          <div
            className="h-full rounded-r-full bg-violet-500 transition-all duration-500"
            style={{ width: `${outputRatio}%` }}
            title={`Output Spend: ${outputRatio.toFixed(1)}%`}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Input ({inputRatio.toFixed(0)}%):</span>
            <span className="font-mono text-white">{getFmt(result.inputCost)}</span>
          </div>
          <div className="flex items-center gap-2 text-violet-400">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500"></span>
            <span>Output ({outputRatio.toFixed(0)}%):</span>
            <span className="font-mono text-white">{getFmt(result.outputCost)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Per-Request & Unit Metrics */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Unit Pricing Metrics
        </h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-xs">
          <div>
            <span className="text-slate-400">Input Cost</span>
            <div className="font-mono font-bold text-white mt-0.5">
              {getFmt(result.inputCost)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Output Cost</span>
            <div className="font-mono font-bold text-white mt-0.5">
              {getFmt(result.outputCost)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Total / Request</span>
            <div className="font-mono font-bold text-white mt-0.5">
              {getFmt(result.costPerRequest)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Cost / 1K Tokens</span>
            <div className="font-mono font-bold text-white mt-0.5">
              {getFmt(result.costPer1K)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Cost / 1M Tokens</span>
            <div className="font-mono font-bold text-white mt-0.5">
              {getFmt(result.costPer1M)}
            </div>
          </div>
        </div>
      </div>

      {/* Indicative FX Reference Disclosure */}
      {currencyCode !== 'USD' && (
        <div className="rounded-xl bg-slate-900/40 p-3.5 border border-white/5 text-[11px] text-slate-400 space-y-1.5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 font-medium">
            <span>
              Indicative FX reference rate: <strong className="text-white font-mono">{DEFAULT_FX_RATE_SET.rateDate}</strong>
            </span>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
              Status: {statusLabelMap[fxStatus]}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <span>Converted deterministically from canonical provider USD rates.</span>
            <span>
              Source:{' '}
              <a
                href={DEFAULT_FX_RATE_SET.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-300"
              >
                {DEFAULT_FX_RATE_SET.sourceName}
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
