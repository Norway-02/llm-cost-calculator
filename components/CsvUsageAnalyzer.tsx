'use client';

import React, { useState, useMemo } from 'react';
import { getActiveModels, getModelById } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';
import { formatCurrency, formatNumber } from '@/lib/engine/format';

interface CsvRow {
  date?: string;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  requests?: number;
}

export const CsvUsageAnalyzer: React.FC = () => {
  const activeModels = useMemo(() => getActiveModels(), []);
  const [csvText, setCsvText] = useState<string>(
    `date,model,input_tokens,output_tokens,requests
2026-08-01,gpt-4o,250000,45000,120
2026-08-02,gpt-4o,310000,52000,140
2026-08-03,claude-sonnet-5,180000,35000,90
2026-08-04,gemini-3.7-flash,500000,90000,250
2026-08-05,gpt-4o-mini,800000,120000,400`
  );

  const parsedData = useMemo(() => {
    if (!csvText.trim()) return null;
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const inputIdx = headers.indexOf('input_tokens');
    const outputIdx = headers.indexOf('output_tokens');
    const modelIdx = headers.indexOf('model');
    const reqIdx = headers.indexOf('requests');

    if (inputIdx === -1 || outputIdx === -1) return null;

    let totalInput = 0;
    let totalOutput = 0;
    let totalRequests = 0;
    let totalCost = 0;

    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length <= Math.max(inputIdx, outputIdx)) continue;

      const inp = Math.max(0, Number(parts[inputIdx]) || 0);
      const out = Math.max(0, Number(parts[outputIdx]) || 0);
      const req = reqIdx !== -1 ? Math.max(1, Number(parts[reqIdx]) || 1) : 1;
      const modelSlug = modelIdx !== -1 ? parts[modelIdx] : 'gpt-4o';

      totalInput += inp;
      totalOutput += out;
      totalRequests += req;

      const matchedModel = getModelById(modelSlug) || getModelById('gpt-4o') || activeModels[0];

      const costRes = calculateCosts({
        inputTokens: inp,
        outputTokens: out,
        requestsPerDay: 1,
        daysPerMonth: 1,
        inputPricePerMillion: matchedModel.inputPricePerMillion,
        outputPricePerMillion: matchedModel.outputPricePerMillion,
      });

      totalCost += costRes.costPerRequest;
      rows.push({
        date: parts[0] || `Row ${i}`,
        model: matchedModel.modelName,
        input_tokens: inp,
        output_tokens: out,
        requests: req,
      });
    }

    return {
      totalInput,
      totalOutput,
      totalRequests,
      totalCost,
      totalTokens: totalInput + totalOutput,
      rowsCount: rows.length,
    };
  }, [csvText, activeModels]);

  return (
    <div className="min-h-[500px] space-y-6 rounded-3xl border border-white/10 bg-[#0B1020]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSV Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">1</span>
              CSV Usage Data
            </h3>
            <span className="text-[11px] font-semibold text-emerald-400">100% Local Browser Execution</span>
          </div>

          <textarea
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV with columns: date,model,input_tokens,output_tokens,requests"
            className="w-full rounded-2xl border border-white/10 bg-[#060914] p-4 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
          />

          <p className="text-[11px] text-slate-400">
            Expected headers: <code className="text-blue-400 font-mono">date, model, input_tokens, output_tokens, requests</code>
          </p>
        </div>

        {/* Parsed Aggregated Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-400 font-extrabold">2</span>
            Aggregated Spend Analysis
          </h3>

          {parsedData ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Total Evaluated API Spend</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">{formatCurrency(parsedData.totalCost)}</div>
                <p className="text-xs text-slate-300 mt-1">
                  Across {formatNumber(parsedData.rowsCount)} log entries ({formatNumber(parsedData.totalRequests)} total requests).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Input Tokens</span>
                  <div className="text-lg font-bold text-slate-100 mt-1">{formatNumber(parsedData.totalInput)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Output Tokens</span>
                  <div className="text-lg font-bold text-slate-100 mt-1">{formatNumber(parsedData.totalOutput)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Volume</span>
                  <div className="text-lg font-bold text-blue-400 mt-1">{formatNumber(parsedData.totalTokens)} tokens</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#060914]/80 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Avg Cost / Req</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">
                    {parsedData.totalRequests > 0 ? formatCurrency(parsedData.totalCost / parsedData.totalRequests) : '$0'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#060914]/40 p-8 text-center text-xs text-slate-400">
              Paste valid CSV content on the left to calculate total token volume and cost.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
