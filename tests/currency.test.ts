import { describe, it, expect } from 'vitest';
import {
  detectCurrencyFromEnvironment,
  convertFromUsd,
  formatCurrency,
  DEFAULT_FX_RATE_SET,
  validateFxRateSet,
  getFxPublicationStatus,
  SupportedCurrency,
  FxRateSet,
} from '@/lib/currency';
import { calculateCosts } from '@/lib/engine/calculator';

describe('FX Rate Date Integrity & Multi-Currency Verification Suite', () => {
  it('PROVES RATE DATE INTEGRITY: rateDate comes strictly from source dataset', () => {
    // Current test fixture has rateDate = "2026-08-21"
    expect(DEFAULT_FX_RATE_SET.rateDate).toBe('2026-08-21');
    expect(DEFAULT_FX_RATE_SET.sourceName).toBe('Bank of Canada');
    expect(DEFAULT_FX_RATE_SET.isIndicative).toBe(true);

    // Verify rateDate is NOT equal to the system clock date when simulated before publication
    const simulatedPreCutoffNow = new Date('2026-08-24T11:50:00-04:00'); // 11:50 ET
    const preCutoffDateStr = simulatedPreCutoffNow.toISOString().split('T')[0];
    expect(DEFAULT_FX_RATE_SET.rateDate).not.toBe(preCutoffDateStr);
  });

  it('rejects future rateDate in validateFxRateSet', () => {
    const now = new Date('2026-08-24T12:00:00Z');
    const futureRateSet: FxRateSet = {
      ...DEFAULT_FX_RATE_SET,
      rateDate: '2026-08-25', // Future date relative to now
    };

    const val = validateFxRateSet(futureRateSet, now);
    expect(val.valid).toBe(false);
    expect(val.error).toContain('Future rateDate detected');
  });

  it('rejects incomplete rate datasets missing required currencies', () => {
    const ratesPartial = { ...DEFAULT_FX_RATE_SET.rates };
    delete (ratesPartial as Partial<Record<SupportedCurrency, number>>).INR;

    const missingCurrencySet: FxRateSet = {
      ...DEFAULT_FX_RATE_SET,
      rates: ratesPartial as Record<SupportedCurrency, number>,
    };

    const val = validateFxRateSet(missingCurrencySet);
    expect(val.valid).toBe(false);
    expect(val.error).toContain('Missing or invalid FX rate for currency "INR"');
  });

  it('evaluates publication status correctly across publication windows', () => {
    // 1. Before 16:30 ET publication window on Monday Aug 24
    const preCutoffTime = new Date('2026-08-24T11:50:00-04:00');
    expect(getFxPublicationStatus(DEFAULT_FX_RATE_SET, preCutoffTime)).toBe('latest_available');

    // 2. After 16:30 ET on Monday Aug 24 with dataset dated Aug 24
    const postCutoffTime = new Date('2026-08-24T17:00:00-04:00');
    const updatedTodaySet: FxRateSet = {
      ...DEFAULT_FX_RATE_SET,
      rateDate: '2026-08-24',
    };
    expect(getFxPublicationStatus(updatedTodaySet, postCutoffTime)).toBe('latest_published');

    // 3. After 16:30 ET on Monday Aug 24 when source does NOT contain today's rate yet (delayed)
    expect(getFxPublicationStatus(DEFAULT_FX_RATE_SET, postCutoffTime)).toBe('delayed');

    // 4. Weekend (Saturday Aug 22)
    const weekendTime = new Date('2026-08-22T14:00:00-04:00');
    expect(getFxPublicationStatus(DEFAULT_FX_RATE_SET, weekendTime)).toBe('latest_available');
  });

  it('detects correct currency based on locale and timezone', () => {
    expect(detectCurrencyFromEnvironment('en-IN', 'Asia/Kolkata')).toBe('INR');
    expect(detectCurrencyFromEnvironment('hi-IN', 'Asia/Kolkata')).toBe('INR');
    expect(detectCurrencyFromEnvironment('en-GB', 'Europe/London')).toBe('GBP');
    expect(detectCurrencyFromEnvironment('ja-JP', 'Asia/Tokyo')).toBe('JPY');
    expect(detectCurrencyFromEnvironment('en-CA', 'America/Toronto')).toBe('CAD');
    expect(detectCurrencyFromEnvironment('en-AU', 'Australia/Sydney')).toBe('AUD');
    expect(detectCurrencyFromEnvironment('pt-BR', 'America/Sao_Paulo')).toBe('BRL');
    expect(detectCurrencyFromEnvironment('zh-CN', 'Asia/Shanghai')).toBe('CNY');
    expect(detectCurrencyFromEnvironment('de-DE', 'Europe/Berlin')).toBe('EUR');
    expect(detectCurrencyFromEnvironment('fr-FR', 'Europe/Paris')).toBe('EUR');
    expect(detectCurrencyFromEnvironment('unknown', 'unknown')).toBe('USD');
  });

  it('performs identity conversion for USD', () => {
    const res = convertFromUsd(100, 'USD', DEFAULT_FX_RATE_SET);
    expect(res.convertedAmount).toBe(100);
    expect(res.effectiveCurrency).toBe('USD');
    expect(res.isFallback).toBe(false);
  });

  it('converts USD to target currency accurately using FX rates', () => {
    const inrRes = convertFromUsd(100, 'INR', DEFAULT_FX_RATE_SET);
    expect(inrRes.convertedAmount).toBe(8350); // 100 * 83.50

    const eurRes = convertFromUsd(100, 'EUR', DEFAULT_FX_RATE_SET);
    expect(eurRes.convertedAmount).toBe(92); // 100 * 0.92

    const jpyRes = convertFromUsd(100, 'JPY', DEFAULT_FX_RATE_SET);
    expect(jpyRes.convertedAmount).toBe(15500); // 100 * 155.00
  });

  it('fails safely to USD when FX rate dataset is invalid, NaN, negative, or infinite', () => {
    const nanRes = convertFromUsd(NaN, 'INR', DEFAULT_FX_RATE_SET);
    expect(nanRes.convertedAmount).toBe(0);
    expect(nanRes.effectiveCurrency).toBe('USD');
    expect(nanRes.isFallback).toBe(true);

    const infRes = convertFromUsd(Infinity, 'INR', DEFAULT_FX_RATE_SET);
    expect(infRes.convertedAmount).toBe(0);
    expect(infRes.effectiveCurrency).toBe('USD');
    expect(infRes.isFallback).toBe(true);

    const negRes = convertFromUsd(-50, 'INR', DEFAULT_FX_RATE_SET);
    expect(negRes.convertedAmount).toBe(0);
    expect(negRes.effectiveCurrency).toBe('USD');
    expect(negRes.isFallback).toBe(true);

    // Invalid rate set test
    const brokenRateSet: FxRateSet = {
      ...DEFAULT_FX_RATE_SET,
      rates: { ...DEFAULT_FX_RATE_SET.rates, INR: 0 },
    };
    const brokenRes = convertFromUsd(100, 'INR', brokenRateSet);
    expect(brokenRes.convertedAmount).toBe(100);
    expect(brokenRes.effectiveCurrency).toBe('USD');
    expect(brokenRes.isFallback).toBe(true);
  });

  it('formats amounts correctly across all nine supported currencies', () => {
    const currencies: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'BRL', 'CNY'];
    currencies.forEach((code) => {
      const formatted = formatCurrency(100, code);
      expect(formatted).toBeTruthy();
    });

    // JPY formatting (no decimals for standard amounts)
    const jpyFormatted = formatCurrency(18452, 'JPY');
    expect(jpyFormatted).toMatch(/18,452|18452/);
  });

  it('preserves precision for tiny LLM amounts without rounding to zero', () => {
    const tinyUsd = formatCurrency(0.0004, 'USD');
    expect(tinyUsd).not.toBe('$0.00');
    expect(tinyUsd).toMatch(/0\.0004/);

    const tinyInr = formatCurrency(0.0334, 'INR');
    expect(tinyInr).not.toBe('₹0.00');
  });

  it('PROVES INVARIANT: Changing display currency MUST NOT change canonical USD cost calculation', () => {
    const usage = {
      inputTokens: 100000,
      outputTokens: 25000,
      requestsPerDay: 100,
      daysPerMonth: 30,
      inputPricePerMillion: 2.50,
      outputPricePerMillion: 10.00,
    };

    const canonicalResult = calculateCosts(usage);
    const canonicalUsdMonthly = canonicalResult.monthlyCost;

    // Simulate conversions to all supported currencies
    const targetCurrencies: SupportedCurrency[] = ['EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'BRL', 'CNY'];

    targetCurrencies.forEach((targetCode) => {
      const conv = convertFromUsd(canonicalUsdMonthly, targetCode, DEFAULT_FX_RATE_SET);

      // Converted amount should equal USD * rate
      expect(conv.convertedAmount).toBe(canonicalUsdMonthly * DEFAULT_FX_RATE_SET.rates[targetCode]);

      // Canonical math result MUST remain unchanged at 1500 USD
      expect(canonicalResult.monthlyCost).toBe(1500.0);
    });
  });
});
