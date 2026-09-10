import { describe, it, expect } from 'vitest';
import { calculateCosts, calculateWorkloadCosts, calculateSaasEconomics } from '@/lib/engine/calculator';
import { formatCurrency, formatNumber } from '@/lib/engine/format';

describe('Calculation Engine', () => {
  it('handles standard input calculations correctly', () => {
    const res = calculateCosts({
      inputTokens: 1_000_000, // 1M input
      outputTokens: 200_000,   // 200k output
      requestsPerDay: 50,
      daysPerMonth: 30,
      inputPricePerMillion: 2.50, // $2.50
      outputPricePerMillion: 10.00, // $10.00
    });

    // 1M input * $2.50/M = $2.50
    // 0.2M output * $10.00/M = $2.00
    // Cost per request = $4.50
    expect(res.inputCost).toBeCloseTo(2.50);
    expect(res.outputCost).toBeCloseTo(2.00);
    expect(res.costPerRequest).toBeCloseTo(4.50);
    expect(res.dailyCost).toBeCloseTo(4.50 * 50); // $225.00
    expect(res.weeklyCost).toBeCloseTo(225.00 * 7); // $1575.00
    expect(res.monthlyCost).toBeCloseTo(225.00 * 30); // $6750.00
    expect(res.annualCost).toBeCloseTo(6750.00 * 12); // $81000.00
  });

  it('handles 0 tokens and 0 requests safely without NaN or Infinity', () => {
    const res = calculateCosts({
      inputTokens: 0,
      outputTokens: 0,
      requestsPerDay: 0,
      daysPerMonth: 30,
      inputPricePerMillion: 2.50,
      outputPricePerMillion: 10.00,
    });

    expect(res.inputCost).toBe(0);
    expect(res.outputCost).toBe(0);
    expect(res.costPerRequest).toBe(0);
    expect(res.dailyCost).toBe(0);
    expect(res.monthlyCost).toBe(0);
    expect(res.annualCost).toBe(0);
    expect(res.costPer1K).toBe(0);
    expect(res.costPer1M).toBe(0);
    expect(isNaN(res.costPerRequest)).toBe(false);
  });

  it('handles negative or invalid inputs gracefully', () => {
    const res = calculateCosts({
      inputTokens: -100,
      outputTokens: NaN,
      requestsPerDay: -5,
      daysPerMonth: 30,
      inputPricePerMillion: 2.50,
      outputPricePerMillion: 10.00,
    });

    expect(res.inputCost).toBe(0);
    expect(res.outputCost).toBe(0);
    expect(res.costPerRequest).toBe(0);
  });

  it('handles huge token counts and decimal pricing', () => {
    const res = calculateCosts({
      inputTokens: 100_000_000,
      outputTokens: 50_000_000,
      requestsPerDay: 1000,
      daysPerMonth: 31,
      inputPricePerMillion: 0.15,
      outputPricePerMillion: 0.60,
    });

    expect(res.inputCost).toBeCloseTo(15.00);
    expect(res.outputCost).toBeCloseTo(30.00);
    expect(res.costPerRequest).toBeCloseTo(45.00);
    expect(res.dailyCost).toBeCloseTo(45000);
    expect(res.monthlyCost).toBeCloseTo(45000 * 31);
    expect(isFinite(res.annualCost)).toBe(true);
  });
});

describe('Formatting Utilities', () => {
  it('formats currency with intelligent precision', () => {
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(0.0004)).toBe('$0.0004');
    expect(formatCurrency(0.014)).toBe('$0.014');
    expect(formatCurrency(1.25)).toBe('$1.25');
    expect(formatCurrency(125.40)).toBe('$125.40');
    expect(formatCurrency(1250.50)).toBe('$1,250.50');
  });

  it('formats numbers with locale separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('Workload Calculation Engine', () => {
  it('calculates workload costs with caching and batching options accurately', () => {
    const res = calculateWorkloadCosts({
      inputTokensPerRequest: 2000,
      outputTokensPerRequest: 500,
      requestsPerUserPerDay: 10,
      monthlyActiveUsers: 100,
      inputPricePerMillion: 2.50,
      outputPricePerMillion: 10.00,
      cacheHitRate: 0.5,
      cachedInputPricePerMillion: 1.25,
      growthRateMonthly: 0.10,
    });

    expect(res.costPerRequest).toBeGreaterThan(0);
    expect(res.costPerUserMonthly).toBeGreaterThan(0);
    expect(res.monthlyCost).toBeGreaterThan(0);
    expect(res.costForUsers[100]).toBeCloseTo(res.monthlyCost);
    expect(res.projections.month2).toBeGreaterThan(res.projections.month1);
    expect(res.projections.month12).toBeGreaterThan(res.projections.month6);
  });

  it('safely handles zero and invalid values in workload calculations', () => {
    const res = calculateWorkloadCosts({
      inputTokensPerRequest: 0,
      outputTokensPerRequest: 0,
      requestsPerUserPerDay: 0,
      monthlyActiveUsers: 0,
      inputPricePerMillion: 2.50,
      outputPricePerMillion: 10.00,
    });

    expect(res.costPerRequest).toBe(0);
    expect(res.monthlyCost).toBe(0);
    expect(res.costForUsers[1000]).toBe(0);
    expect(res.projections.month12).toBe(0);
  });
});

describe('SaaS Economics Engine', () => {
  it('calculates paid users, revenue, gross margin and break-even points', () => {
    const res = calculateSaasEconomics({
      monthlyActiveUsers: 1000,
      paidConversionRatePercent: 5, // 50 paid users
      subscriptionPriceMonthly: 20, // $1,000 monthly revenue
      requestsPerUserPerDay: 5,
      inputTokensPerRequest: 1000,
      outputTokensPerRequest: 200,
      inputPricePerMillion: 2.50,
      outputPricePerMillion: 10.00,
      infrastructureCostMonthly: 100,
      paymentFeePercent: 2.9,
    });

    expect(res.paidUsers).toBe(50);
    expect(res.monthlyRevenue).toBe(1000);
    expect(res.aiCostMonthly).toBeGreaterThan(0);
    expect(res.paymentFeesMonthly).toBeCloseTo(29);
    expect(res.grossProfitMonthly).toBeDefined();
    expect(res.grossMarginPercent).toBeLessThanOrEqual(100);
  });
});

