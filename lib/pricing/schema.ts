import { z } from 'zod';

export const ModelLifecycleSchema = z.enum([
  'current',
  'legacy',
  'deprecated',
  'shutdown',
  'preview',
]);

export const ModelAvailabilitySchema = z.enum([
  'available',
  'deprecated',
  'shutdown',
  'unknown',
]);

export const ModelRecommendationSchema = z.enum([
  'recommended',
  'supported',
  'legacy',
  'none',
]);

export type ModelLifecycle = z.infer<typeof ModelLifecycleSchema>;
export type ModelAvailability = z.infer<typeof ModelAvailabilitySchema>;
export type ModelRecommendation = z.infer<typeof ModelRecommendationSchema>;

export const PricingTiersSchema = z.object({
  standard: z.object({ input: z.number(), output: z.number() }).optional(),
  batch: z.object({ input: z.number(), output: z.number() }).optional(),
  cachedInput: z.number().optional(),
  cacheWrite: z.number().optional(),
  cacheRead: z.number().optional(),
  longContext: z.object({ input: z.number(), output: z.number() }).optional(),
  priority: z.object({ input: z.number(), output: z.number() }).optional(),
  flex: z.object({ input: z.number(), output: z.number() }).optional(),
  regional: z.record(z.string(), z.object({ input: z.number(), output: z.number() })).optional(),
});

export const ScheduledPricingSchema = z.object({
  effectiveFrom: z.string(),
  inputPricePerMillion: z.number().min(0),
  outputPricePerMillion: z.number().min(0),
  notes: z.string().optional(),
});

export const ModelPricingSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  modelName: z.string().min(1),
  currency: z.literal('USD'),
  inputPricePerMillion: z.number().min(0),
  outputPricePerMillion: z.number().min(0),
  effectiveDate: z.string().min(1),
  sourceUrl: z.string().url(),
  lastVerifiedDate: z.string().min(1),
  recommendationSourceUrl: z.string().url().optional(),
  recommendationVerifiedDate: z.string().optional(),
  status: z.enum(['verified', 'stale', 'scheduled', 'unverified']),
  lifecycle: ModelLifecycleSchema,
  availability: ModelAvailabilitySchema.default('available'),
  recommendation: ModelRecommendationSchema.default('supported'),
  replacementModelId: z.string().optional(),
  shutdownDate: z.string().optional(),
  deprecationDate: z.string().optional(),
  notes: z.string().optional(),
  capabilities: z.object({
    vision: z.boolean().optional(),
    audio: z.boolean().optional(),
    reasoning: z.boolean().optional(),
  }).optional(),
  pricingTiers: PricingTiersSchema.optional(),
  pricingSchedule: z.array(ScheduledPricingSchema).optional(),
});

export type ModelPricing = z.infer<typeof ModelPricingSchema>;
export type ScheduledPricing = z.infer<typeof ScheduledPricingSchema>;

export const ModelsDatasetSchema = z.array(ModelPricingSchema);

export function isPricingStale(lastVerifiedDate: string, maxDays = 90): boolean {
  try {
    const verified = new Date(lastVerifiedDate).getTime();
    if (isNaN(verified)) return true;
    const now = new Date().getTime();
    const diffDays = (now - verified) / (1000 * 60 * 60 * 24);
    return diffDays > maxDays;
  } catch {
    return true;
  }
}

export function getEffectiveFreshnessStatus(model: ModelPricing): ModelPricing['status'] {
  if (model.status === 'unverified' || model.status === 'scheduled') {
    return model.status;
  }
  if (isPricingStale(model.lastVerifiedDate)) {
    return 'stale';
  }
  return model.status;
}

/**
 * Evaluates active input and output rates for a model based on calculation date and pricingSchedule.
 */
export function getActivePricesForDate(model: ModelPricing, date: Date = new Date()): { inputPrice: number; outputPrice: number } {
  if (!model.pricingSchedule || model.pricingSchedule.length === 0) {
    return {
      inputPrice: model.inputPricePerMillion,
      outputPrice: model.outputPricePerMillion,
    };
  }

  const timestamp = date.getTime();
  // Sort schedules descending by effectiveFrom
  const sorted = [...model.pricingSchedule]
    .map((s) => ({ ...s, time: new Date(s.effectiveFrom).getTime() }))
    .filter((s) => !isNaN(s.time))
    .sort((a, b) => b.time - a.time);

  const active = sorted.find((s) => s.time <= timestamp);
  if (active) {
    return {
      inputPrice: active.inputPricePerMillion,
      outputPrice: active.outputPricePerMillion,
    };
  }

  return {
    inputPrice: model.inputPricePerMillion,
    outputPrice: model.outputPricePerMillion,
  };
}
