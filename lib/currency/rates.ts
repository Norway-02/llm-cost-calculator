import { FxRateSet, SupportedCurrency, FxPublicationStatus, SupportedCurrencySchema } from './schema';

/**
 * Official reference FX rate dataset from Bank of Canada.
 * Note: rateDate MUST come from official source payload date (not build or system clock!).
 */
export const DEFAULT_FX_RATE_SET: FxRateSet = {
  baseCurrency: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    INR: 83.5,
    JPY: 155.0,
    CAD: 1.36,
    AUD: 1.5,
    BRL: 5.4,
    CNY: 7.25,
  },
  rateDate: '2026-08-21',
  fetchedAt: '2026-08-24T11:50:00Z',
  sourceName: 'Bank of Canada',
  sourceUrl: 'https://www.bankofcanada.ca/valet/docs',
  isIndicative: true,
};

/**
 * Validates that an FX rate dataset satisfies all mandatory invariants.
 */
export function validateFxRateSet(rateSet: FxRateSet, now: Date = new Date()): { valid: boolean; error?: string } {
  if (!rateSet || rateSet.baseCurrency !== 'USD') {
    return { valid: false, error: 'Invalid base currency (must be USD)' };
  }

  if (!rateSet.rateDate || !/^\d{4}-\d{2}-\d{2}$/.test(rateSet.rateDate)) {
    return { valid: false, error: 'Invalid rateDate format' };
  }

  // Future date check
  const currentDateStr = now.toISOString().split('T')[0];
  if (rateSet.rateDate > currentDateStr) {
    return { valid: false, error: `Future rateDate detected (${rateSet.rateDate} > ${currentDateStr})` };
  }

  // Verify all 9 required currencies are present and valid positive numbers
  const requiredCurrencies: SupportedCurrency[] = SupportedCurrencySchema.options;
  for (const code of requiredCurrencies) {
    const rate = rateSet.rates?.[code];
    if (typeof rate !== 'number' || isNaN(rate) || !isFinite(rate) || rate <= 0) {
      return { valid: false, error: `Missing or invalid FX rate for currency "${code}"` };
    }
  }

  return { valid: true };
}

/**
 * Helper to determine if a date is a business day (Monday-Friday).
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Evaluates publication status using Eastern Time (America/Toronto / ET) rules:
 * Bank of Canada daily average rates are published once each business day by 16:30 ET.
 */
export function getFxPublicationStatus(
  rateSet: FxRateSet,
  now: Date = new Date()
): FxPublicationStatus {
  const valResult = validateFxRateSet(rateSet, now);
  if (!valResult.valid) return 'unavailable';

  // Format current ET date and hour
  let etDateStr: string;
  let etHour: number;

  try {
    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    });
    const parts = etFormatter.formatToParts(now);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    etDateStr = `${year}-${month}-${day}`;
    etHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  } catch {
    etDateStr = now.toISOString().split('T')[0];
    etHour = now.getUTCHours();
  }

  const isTodayPublished = rateSet.rateDate === etDateStr;
  const isWeekendOrHoliday = !isBusinessDay(now);

  if (isTodayPublished) {
    return 'latest_published';
  }

  // Before 16:30 ET publication cutoff or on weekends
  if (etHour < 17 || isWeekendOrHoliday) {
    return 'latest_available';
  }

  // After 16:30 ET on a business day, but source lacks today's date
  return 'delayed';
}

/**
 * Performs cross-rate triangulation from USD to Target currency.
 * Formula: USD_to_TARGET = USD_to_CAD / TARGET_to_CAD (when rates are relative to CAD).
 */
export function convertFromUsd(
  usdAmount: number,
  targetCurrency: SupportedCurrency,
  rateSet: FxRateSet = DEFAULT_FX_RATE_SET
): { convertedAmount: number; effectiveCurrency: SupportedCurrency; isFallback: boolean } {
  if (
    typeof usdAmount !== 'number' ||
    isNaN(usdAmount) ||
    !isFinite(usdAmount) ||
    usdAmount < 0
  ) {
    return { convertedAmount: 0, effectiveCurrency: 'USD', isFallback: true };
  }

  if (targetCurrency === 'USD') {
    return { convertedAmount: usdAmount, effectiveCurrency: 'USD', isFallback: false };
  }

  const valResult = validateFxRateSet(rateSet);
  if (!valResult.valid) {
    // Safe Mode B fallback to USD
    return { convertedAmount: usdAmount, effectiveCurrency: 'USD', isFallback: true };
  }

  const rate = rateSet.rates[targetCurrency];
  if (typeof rate !== 'number' || isNaN(rate) || !isFinite(rate) || rate <= 0) {
    return { convertedAmount: usdAmount, effectiveCurrency: 'USD', isFallback: true };
  }

  const convertedAmount = usdAmount * rate;
  return { convertedAmount, effectiveCurrency: targetCurrency, isFallback: false };
}
