import { describe, it, expect } from 'vitest';
import {
  getRecommendedModelForProvider,
  getActiveModelsForProvider,
  getProviderPricingSummary,
  getRegistryDrivenFaqItems,
} from '@/lib/pricing/content';
import { providerDefaultConfigs, getCurrentDefaultModel, getAllModels } from '@/lib/pricing';

describe('Content & Data Consistency Verification Suite', () => {
  it('ensures current provider content never recommends shutdown models', () => {
    const providers = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta', 'Mistral', 'Cohere'];

    providers.forEach((providerKey) => {
      const rec = getRecommendedModelForProvider(providerKey);
      expect(rec, `Recommended model for ${providerKey} must exist`).not.toBeNull();
      expect(rec?.lifecycle, `Recommended model ${rec?.id} for ${providerKey} must not be shutdown`).not.toBe('shutdown');
      expect(rec?.availability, `Recommended model ${rec?.id} for ${providerKey} must be available`).toBe('available');
    });
  });

  it('ensures active models for provider contains zero shutdown models', () => {
    const providers = ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Meta', 'Mistral', 'Cohere'];

    providers.forEach((providerKey) => {
      const activeList = getActiveModelsForProvider(providerKey);
      expect(activeList.length).toBeGreaterThan(0);
      activeList.forEach((m) => {
        expect(m.lifecycle).not.toBe('shutdown');
        expect(m.availability).toBe('available');
      });
    });
  });

  it('proves provider default in registry equals helper recommended model and calculator default', () => {
    providerDefaultConfigs.forEach((cfg) => {
      const helperRec = getRecommendedModelForProvider(cfg.provider);
      const calcDefault = getCurrentDefaultModel(cfg.provider);

      expect(helperRec?.id).toBe(cfg.modelId);
      expect(calcDefault?.id).toBe(cfg.modelId);
      expect(helperRec?.recommendation).toBe('recommended');
    });
  });

  it('verifies dynamic provider summaries match validated registry defaults', () => {
    const googleSummary = getProviderPricingSummary('Google');
    expect(googleSummary).toContain('Gemini 3.7 Flash');
    expect(googleSummary).not.toContain('Gemini 2.0 Flash');
    expect(googleSummary).not.toContain('Gemini 1.5 Pro');

    const anthropicSummary = getProviderPricingSummary('Anthropic');
    expect(anthropicSummary).toContain('Claude Sonnet 5');
  });

  it('verifies registry driven FAQ items do not reference shutdown models as active recommendations', () => {
    const faqs = getRegistryDrivenFaqItems();
    expect(faqs.length).toBeGreaterThan(0);
    faqs.forEach((item) => {
      expect(item.answer).not.toContain('Gemini 2.0 Flash offers the lowest entry price');
      expect(item.answer).not.toContain('is currently recommended');
    });
  });

  it('audits entire model dataset to confirm all shutdown models carry explicit shutdown metadata', () => {
    const allModels = getAllModels();
    const shutdownModels = allModels.filter((m) => m.lifecycle === 'shutdown');

    expect(shutdownModels.length).toBe(3); // gemini-1-5-pro, gemini-1-5-flash, gemini-2-0-flash
    shutdownModels.forEach((m) => {
      expect(m.shutdownDate).toBeTruthy();
      expect(m.replacementModelId).toBe('gemini-3.7-flash');
    });
  });
});
