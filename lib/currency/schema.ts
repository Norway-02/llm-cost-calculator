import { z } from 'zod';

export const SupportedCurrencySchema = z.enum([
  'USD',
  'EUR',
  'GBP',
  'INR',
  'JPY',
  'CAD',
  'AUD',
  'BRL',
  'CNY',
]);

export type SupportedCurrency = z.infer<typeof SupportedCurrencySchema>;

export const FxRateSetSchema = z.object({
  baseCurrency: z.literal('USD'),
  rates: z.record(SupportedCurrencySchema, z.number().positive()),
  rateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO date string YYYY-MM-DD required'),
  fetchedAt: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  isIndicative: z.literal(true),
});

export type FxRateSet = z.infer<typeof FxRateSetSchema>;

export const CurrencyPreferenceSchema = z.object({
  currencyMode: z.enum(['auto', 'manual']),
  currencyCode: SupportedCurrencySchema,
});

export type CurrencyPreference = z.infer<typeof CurrencyPreferenceSchema>;

export type FxPublicationStatus =
  | 'latest_published'
  | 'latest_available'
  | 'delayed'
  | 'unavailable';

export interface CurrencyDisplayResult {
  currencyCode: SupportedCurrency;
  symbol: string;
  usdAmount: number;
  convertedAmount: number;
  formattedAmount: string;
  rateDate: string;
  status: FxPublicationStatus;
}
