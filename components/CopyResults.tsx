'use client';

import React, { useState } from 'react';
import { CalculationResult } from '@/lib/engine/calculator';
import { formatCurrency, formatNumber } from '@/lib/engine/format';
import { Button } from './ui/Button';

export interface CopyResultsProps {
  result: CalculationResult;
  modelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  requestsPerDay: number;
}

export const CopyResults: React.FC<CopyResultsProps> = ({
  result,
  modelName,
  provider,
  inputTokens,
  outputTokens,
  requestsPerDay,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const summaryText = `LLM Cost Calculation Summary (${provider} - ${modelName})
Input Usage: ${formatNumber(inputTokens)} tokens
Output Usage: ${formatNumber(outputTokens)} tokens
Requests: ${formatNumber(requestsPerDay)} / day

Monthly Spend: ${formatCurrency(result.monthlyCost)} USD
Cost / Request: ${formatCurrency(result.costPerRequest)} USD
Annual Spend: ${formatCurrency(result.annualCost)} USD

Calculated via LLMCalc.com`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`transition-all duration-200 ${
        copied ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400' : ''
      }`}
    >
      <span className="flex items-center gap-1.5">
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-bounce">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </span>
    </Button>
  );
};
