import { ModelPricing } from './schema';

export interface PricingSource {
  id: string;
  provider: string;
  name: string;
  url: string;
  fetchFrequencyDays: number;
}

export interface PricingDiff {
  modelId: string;
  field: 'inputPricePerMillion' | 'outputPricePerMillion' | 'cachedInput' | 'batchInput';
  oldValue: number;
  newValue: number;
  percentageChange: number;
  detectedAt: string;
  effectiveFrom: string;
}

export interface PricingNormalizerResult {
  model: Partial<ModelPricing>;
  rawPayload: Record<string, unknown>;
  warnings: string[];
}

export interface PricingFetcher {
  fetchSource(source: PricingSource): Promise<Record<string, unknown>>;
}

export interface PricingNormalizer {
  normalize(raw: Record<string, unknown>, provider: string): PricingNormalizerResult[];
}

export interface PricingValidatorEngine {
  validateDiff(diff: PricingDiff): { valid: boolean; reason?: string };
}
