import { SupportedCurrency } from './schema';

export const CURRENCY_METADATA: Record<
  SupportedCurrency,
  { name: string; symbol: string; locale: string }
> = {
  USD: { name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { name: 'Euro', symbol: '€', locale: 'de-DE' },
  GBP: { name: 'British Pound', symbol: '£', locale: 'en-GB' },
  INR: { name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  JPY: { name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$', locale: 'en-CA' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
};

/**
 * Formats monetary amounts in a target currency with intelligent precision handling for tiny LLM costs.
 */
export function formatCurrency(amount: number, currencyCode: SupportedCurrency): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return `${CURRENCY_METADATA[currencyCode]?.symbol || '$'}0.00`;
  }

  const isZero = Math.abs(amount) < 0.0000001;
  if (isZero) {
    if (currencyCode === 'JPY') {
      return '¥0';
    }
    return `${CURRENCY_METADATA[currencyCode].symbol}0.00`;
  }

  // Tiny value precision handling: prevent $0.0004 or ₹0.033 from rounding down to zero
  const absAmount = Math.abs(amount);
  let minimumFractionDigits = currencyCode === 'JPY' ? 0 : 2;
  let maximumFractionDigits = currencyCode === 'JPY' ? 0 : 2;

  if (absAmount < 0.01 && absAmount > 0) {
    minimumFractionDigits = 4;
    maximumFractionDigits = 6;
  } else if (absAmount < 1 && currencyCode === 'JPY') {
    minimumFractionDigits = 2;
    maximumFractionDigits = 2;
  }

  try {
    const formatter = new Intl.NumberFormat(CURRENCY_METADATA[currencyCode].locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return formatter.format(amount);
  } catch {
    // Fallback if Intl fails
    const meta = CURRENCY_METADATA[currencyCode] || CURRENCY_METADATA.USD;
    return `${meta.symbol}${amount.toFixed(maximumFractionDigits)}`;
  }
}
