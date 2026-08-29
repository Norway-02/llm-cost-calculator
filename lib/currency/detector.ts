import { SupportedCurrency, SupportedCurrencySchema, CurrencyPreference } from './schema';

const STORAGE_KEY = 'llmcalc_currency_preference';

/**
 * Deterministically maps browser locale and timezone to a supported currency.
 */
export function detectCurrencyFromEnvironment(
  locale?: string,
  timezone?: string
): SupportedCurrency {
  const normLocale = (locale || (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase();
  const normTz = (timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '')).toLowerCase();

  // India
  if (normLocale.includes('-in') || normTz.includes('kolkata') || normTz.includes('calcutta')) {
    return 'INR';
  }

  // UK
  if (normLocale.includes('-gb') || normTz.includes('london')) {
    return 'GBP';
  }

  // Japan
  if (normLocale.includes('-jp') || normTz.includes('tokyo')) {
    return 'JPY';
  }

  // Canada
  if (normLocale.includes('-ca') || normTz.includes('toronto') || normTz.includes('vancouver')) {
    return 'CAD';
  }

  // Australia
  if (normLocale.includes('-au') || normTz.includes('sydney') || normTz.includes('melbourne') || normTz.includes('brisbane')) {
    return 'AUD';
  }

  // Brazil
  if (normLocale.includes('-br') || normTz.includes('sao_paulo')) {
    return 'BRL';
  }

  // China
  if (normLocale.includes('-cn') || normTz.includes('shanghai') || normTz.includes('chongqing') || normTz.includes('harbin')) {
    return 'CNY';
  }

  // Eurozone
  if (
    normLocale.includes('-de') ||
    normLocale.includes('-fr') ||
    normLocale.includes('-es') ||
    normLocale.includes('-it') ||
    normLocale.includes('-nl') ||
    normTz.includes('europe/berlin') ||
    normTz.includes('europe/paris') ||
    normTz.includes('europe/madrid') ||
    normTz.includes('europe/rome') ||
    normTz.includes('europe/amsterdam') ||
    normTz.includes('europe/brussels')
  ) {
    return 'EUR';
  }

  // Default fallback
  return 'USD';
}

export function getSavedCurrencyPreference(): CurrencyPreference | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      (parsed.currencyMode === 'auto' || parsed.currencyMode === 'manual') &&
      SupportedCurrencySchema.safeParse(parsed.currencyCode).success
    ) {
      return parsed as CurrencyPreference;
    }
  } catch (err) {
    console.warn('Failed to read currency preference from localStorage:', err);
  }
  return null;
}

export function saveCurrencyPreference(pref: CurrencyPreference): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch (err) {
    console.warn('Failed to save currency preference to localStorage:', err);
  }
}

/**
 * Resolves active display currency based on explicit priority:
 * 1. Valid URL parameter (?currency=INR)
 * 2. Saved manual preference in localStorage
 * 3. Saved auto preference (re-evaluated with current locale)
 * 4. Browser auto-detection
 * 5. USD fallback
 */
export function resolveDisplayCurrency(urlCurrencyParam?: string | null): {
  currencyCode: SupportedCurrency;
  mode: 'auto' | 'manual';
} {
  // 1. Valid URL Parameter
  if (urlCurrencyParam) {
    const upper = urlCurrencyParam.toUpperCase();
    const parsed = SupportedCurrencySchema.safeParse(upper);
    if (parsed.success) {
      return { currencyCode: parsed.data, mode: 'manual' };
    }
  }

  // 2. Saved Preference
  const saved = getSavedCurrencyPreference();
  if (saved) {
    if (saved.currencyMode === 'manual') {
      return { currencyCode: saved.currencyCode, mode: 'manual' };
    }
    // Auto mode saved: detect fresh
    const detected = detectCurrencyFromEnvironment();
    return { currencyCode: detected, mode: 'auto' };
  }

  // 3. Environment Auto Detection
  const autoDetected = detectCurrencyFromEnvironment();
  return { currencyCode: autoDetected, mode: 'auto' };
}
