import { describe, it, expect } from 'vitest';
import {
  getAllModels,
  getModelById,
  getModelsByProvider,
  getDefaultModel,
  getCurrentDefaultModel,
  providerDefaults,
  providerDefaultConfigs,
} from '@/lib/pricing';
import {
  isPricingStale,
  getEffectiveFreshnessStatus,
  getActivePricesForDate,
} from '@/lib/pricing/schema';
import { validatePricingRegistry } from '@/lib/pricing/validator';

describe('Pricing Layer & Model Lifecycle Validation', () => {
  it('loads all pricing models without schema validation error', () => {
    const models = getAllModels();
    expect(models.length).toBeGreaterThan(0);
    models.forEach((m) => {
      expect(m.id).toBeTruthy();
      expect(m.provider).toBeTruthy();
      expect(m.inputPricePerMillion).toBeGreaterThanOrEqual(0);
      expect(m.outputPricePerMillion).toBeGreaterThanOrEqual(0);
      expect(m.sourceUrl).toMatch(/^https?:\/\//);
      expect(['verified', 'stale', 'scheduled', 'unverified']).toContain(m.status);
      expect(['current', 'legacy', 'deprecated', 'shutdown', 'preview']).toContain(m.lifecycle);
    });
  });

  it('verifies Cohere provider default is command-a-plus-05-2026 and is recommended', () => {
    const cohereDefault = getCurrentDefaultModel('cohere');
    expect(cohereDefault).toBeDefined();
    expect(cohereDefault?.id).toBe('command-a-plus-05-2026');
    expect(cohereDefault?.recommendation).toBe('recommended');

    const oldDefault = getModelById('command-r-plus');
    expect(oldDefault?.recommendation).toBe('legacy');
    expect(oldDefault?.replacementModelId).toBe('command-a-plus-05-2026');
  });

  it('verifies DeepSeek provider default is current verified V4 model and is recommended', () => {
    const deepseekDefault = getCurrentDefaultModel('deepseek');
    expect(deepseekDefault).toBeDefined();
    expect(deepseekDefault?.id).toBe('deepseek-v4-flash');
    expect(deepseekDefault?.recommendation).toBe('recommended');

    // Cache hit pricing check
    expect(deepseekDefault?.pricingTiers?.cachedInput).toBe(0.0028);

    const oldDefault = getModelById('deepseek-v3');
    expect(oldDefault?.recommendation).toBe('legacy');
    expect(oldDefault?.replacementModelId).toBe('deepseek-v4-flash');
  });

  it('verifies every provider default config has explicit recommendation source and verification date', () => {
    providerDefaultConfigs.forEach((cfg) => {
      expect(cfg.recommendationSourceUrl, `Config for ${cfg.provider} must have recommendationSourceUrl`).toMatch(/^https?:\/\//);
      expect(cfg.recommendationVerifiedDate, `Config for ${cfg.provider} must have recommendationVerifiedDate`).toBeTruthy();

      const model = getModelById(cfg.modelId);
      expect(model, `Default model ${cfg.modelId} for ${cfg.provider} must exist`).toBeDefined();
      expect(model?.recommendation, `Default model ${cfg.modelId} must be recommended`).toBe('recommended');
      expect(model?.recommendationSourceUrl).toBe(cfg.recommendationSourceUrl);
      expect(model?.recommendationVerifiedDate).toBe(cfg.recommendationVerifiedDate);
    });
  });

  it('verifies Claude Sonnet 5 availability, recommendation status, and introductory/standard pricing schedule', () => {
    const sonnet5 = getModelById('claude-sonnet-5');
    expect(sonnet5).toBeDefined();
    expect(sonnet5?.availability).toBe('available');
    expect(sonnet5?.recommendation).toBe('recommended');
    expect(sonnet5?.lifecycle).toBe('current');

    // Provider default check
    const anthropicDefault = getCurrentDefaultModel('anthropic');
    expect(anthropicDefault?.id).toBe('claude-sonnet-5');

    // Intro pricing on 2026-08-24 ($2 / $10)
    const currentRates = getActivePricesForDate(sonnet5!, new Date('2026-08-24'));
    expect(currentRates.inputPrice).toBe(2.0);
    expect(currentRates.outputPrice).toBe(10.0);

    // Standard rate starting 2026-09-01 ($3 / $15)
    const futureRates = getActivePricesForDate(sonnet5!, new Date('2026-09-01'));
    expect(futureRates.inputPrice).toBe(3.0);
    expect(futureRates.outputPrice).toBe(15.0);
  });

  it('ensures default model exists and is NOT a shutdown model', () => {
    const defaultModel = getDefaultModel();
    expect(defaultModel).toBeDefined();
    expect(defaultModel.lifecycle).toBe('current');
    expect(defaultModel.recommendation).toBe('recommended');
  });

  it('validates provider default model IDs in registry and confirms non-shutdown status', () => {
    Object.entries(providerDefaults).forEach(([provider, modelId]) => {
      const model = getCurrentDefaultModel(provider);
      expect(model, `Provider default model ${modelId} for ${provider} must exist and be current`).not.toBeNull();
      expect(model?.lifecycle).toBe('current');
      expect(model?.availability).toBe('available');
      expect(model?.shutdownDate).toBeUndefined();
    });
  });

  it('never selects a shutdown Google model as default', () => {
    const googleDefault = getCurrentDefaultModel('google');
    expect(googleDefault).not.toBeNull();
    expect(googleDefault?.lifecycle).toBe('current');
    expect(googleDefault?.id).toBe('gemini-3.7-flash');

    // Confirm gemini-1-5-flash is marked as shutdown
    const flash15 = getModelById('gemini-1-5-flash');
    expect(flash15?.lifecycle).toBe('shutdown');
    expect(flash15?.shutdownDate).toBe('2025-09-29');

    // Confirm gemini-1-5-pro is marked as shutdown
    const pro15 = getModelById('gemini-1-5-pro');
    expect(pro15?.lifecycle).toBe('shutdown');
    expect(pro15?.shutdownDate).toBe('2025-09-29');

    // Confirm gemini-2-0-flash is marked as shutdown
    const flash20 = getModelById('gemini-2-0-flash');
    expect(flash20?.lifecycle).toBe('shutdown');
    expect(flash20?.shutdownDate).toBe('2026-06-01');
  });

  it('rejects shutdown models marked current', () => {
    const models = getAllModels();
    const currentDateStr = new Date().toISOString().split('T')[0];
    const invalidCurrent = models.filter(
      (m) => m.lifecycle === 'current' && m.shutdownDate && m.shutdownDate <= currentDateStr
    );
    expect(invalidCurrent).toHaveLength(0);
  });

  it('rejects past shutdown dates for current models', () => {
    const currentDateStr = new Date().toISOString().split('T')[0];
    getAllModels()
      .filter((m) => m.lifecycle === 'current')
      .forEach((m) => {
        if (m.shutdownDate) {
          expect(m.shutdownDate > currentDateStr).toBe(true);
        }
      });
  });

  it('rejects current defaults pointing to shutdown models', () => {
    Object.keys(providerDefaults).forEach((provider) => {
      const defaultModel = getCurrentDefaultModel(provider);
      expect(defaultModel).not.toBeNull();
      expect(defaultModel?.lifecycle).toBe('current');
      expect(defaultModel?.availability).toBe('available');
    });
  });

  it('rejects replacement chains ending in shutdown models', () => {
    const models = getAllModels();
    models.forEach((m) => {
      if (m.replacementModelId) {
        const replacement = getModelById(m.replacementModelId);
        expect(replacement, `Replacement model ${m.replacementModelId} must exist`).toBeDefined();
        expect(replacement?.lifecycle, `Replacement model ${replacement?.id} must not be shutdown`).not.toBe('shutdown');
      }
    });
  });

  it('requires shutdownDate for shutdown models', () => {
    const models = getAllModels();
    const shutdownModels = models.filter((m) => m.lifecycle === 'shutdown');
    expect(shutdownModels.length).toBeGreaterThan(0);
    shutdownModels.forEach((m) => {
      expect(m.shutdownDate, `Shutdown model ${m.id} must specify shutdownDate`).toBeDefined();
    });
  });

  it('passes full pricing validator suite (no invalid defaults or recursive chain breaks)', () => {
    const result = validatePricingRegistry();
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.type === 'error')).toHaveLength(0);
  });

  it('evaluates scheduled future pricing correctly based on calculation date', () => {
    const mockModel = {
      id: 'mock-scheduled',
      provider: 'TestProvider',
      modelName: 'Mock Model',
      currency: 'USD' as const,
      inputPricePerMillion: 1.0,
      outputPricePerMillion: 4.0,
      effectiveDate: '2025-01-01',
      sourceUrl: 'https://example.com',
      lastVerifiedDate: '2026-08-24',
      status: 'verified' as const,
      lifecycle: 'current' as const,
      availability: 'available' as const,
      recommendation: 'supported' as const,
      pricingSchedule: [
        {
          effectiveFrom: '2027-01-01',
          inputPricePerMillion: 0.5,
          outputPricePerMillion: 2.0,
          notes: 'Scheduled price reduction',
        },
      ],
    };

    // Before 2027-01-01: uses base rate
    const currentRates = getActivePricesForDate(mockModel, new Date('2026-08-24'));
    expect(currentRates.inputPrice).toBe(1.0);
    expect(currentRates.outputPrice).toBe(4.0);

    // On or after 2027-01-01: uses scheduled rate
    const futureRates = getActivePricesForDate(mockModel, new Date('2027-01-02'));
    expect(futureRates.inputPrice).toBe(0.5);
    expect(futureRates.outputPrice).toBe(2.0);
  });

  it('filters models by provider', () => {
    const anthropicModels = getModelsByProvider('Anthropic');
    expect(anthropicModels.length).toBeGreaterThan(0);
    anthropicModels.forEach((m) => expect(m.provider.toLowerCase()).toBe('anthropic'));
  });

  it('correctly calculates staleness based on verification date', () => {
    const recentDate = new Date().toISOString().split('T')[0];
    expect(isPricingStale(recentDate)).toBe(false);
    expect(isPricingStale('2020-01-01')).toBe(true);
  });

  it('returns appropriate effective freshness status', () => {
    const gpt4o = getModelById('gpt-4o')!;
    const status = getEffectiveFreshnessStatus(gpt4o);
    expect(['verified', 'stale', 'scheduled', 'unverified']).toContain(status);
  });
});
