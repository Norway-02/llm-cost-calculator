import modelsData from '@/data/models.json';
import { ModelPricing, ModelsDatasetSchema } from './schema';

let cachedModels: ModelPricing[] | null = null;

export interface ProviderDefaultConfigEntry {
  provider: string;
  modelId: string;
  recommendationVerifiedDate: string;
  recommendationSourceUrl: string;
}

/**
 * Verified provider recommendation configurations with source attribution.
 */
export const providerDefaultConfigs: ProviderDefaultConfigEntry[] = [
  {
    provider: 'OpenAI',
    modelId: 'gpt-4o',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://platform.openai.com/docs/models',
  },
  {
    provider: 'Anthropic',
    modelId: 'claude-sonnet-5',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
  },
  {
    provider: 'Google',
    modelId: 'gemini-3.7-flash',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
  },
  {
    provider: 'DeepSeek',
    modelId: 'deepseek-v4-flash',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://www.deepseek.com/pricing',
  },
  {
    provider: 'Meta',
    modelId: 'llama-3-3-70b',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://www.llama.com/docs/models',
  },
  {
    provider: 'Mistral',
    modelId: 'mistral-large-2',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://docs.mistral.ai/models',
  },
  {
    provider: 'Cohere',
    modelId: 'command-a-plus-05-2026',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://docs.cohere.com/docs/models',
  },
];

/**
 * Derived map of verified provider defaults.
 */
export const providerDefaults: Record<string, string> = Object.fromEntries(
  providerDefaultConfigs.map((c) => [c.provider.toLowerCase(), c.modelId])
);

export function getAllModels(): ModelPricing[] {
  if (!cachedModels) {
    const parseResult = ModelsDatasetSchema.safeParse(modelsData);
    if (!parseResult.success) {
      console.error('Failed to parse pricing dataset:', parseResult.error);
      throw new Error('Invalid pricing dataset schema');
    }
    cachedModels = parseResult.data;
  }
  return cachedModels;
}

export function getActiveModels(): ModelPricing[] {
  const currentDateStr = new Date().toISOString().split('T')[0];
  return getAllModels().filter((m) => {
    if (m.lifecycle === 'shutdown' || m.availability === 'shutdown') return false;
    if (m.shutdownDate && m.shutdownDate <= currentDateStr) return false;
    return true;
  });
}

export function getModelById(id: string): ModelPricing | undefined {
  return getAllModels().find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): ModelPricing[] {
  return getAllModels().filter((m) => m.provider.toLowerCase() === provider.toLowerCase());
}

/**
 * Safely resolves the currently recommended active model for a provider.
 * Enforces API availability, current lifecycle, and recommended recommendation status.
 */
export function getCurrentDefaultModel(providerKey: string): ModelPricing | null {
  const currentDateStr = new Date().toISOString().split('T')[0];
  const providerModels = getModelsByProvider(providerKey);

  const availableCurrentModels = providerModels.filter((m) => {
    if (m.lifecycle !== 'current') return false;
    if (m.availability !== 'available') return false;
    if (m.shutdownDate && m.shutdownDate <= currentDateStr) return false;
    if (m.status !== 'verified' && m.status !== 'scheduled') return false;
    return true;
  });

  const configuredId = providerDefaults[providerKey.toLowerCase()];
  if (configuredId) {
    const matched = availableCurrentModels.find(
      (m) => m.id === configuredId && (m.recommendation === 'recommended' || m.recommendation === 'supported')
    );
    if (matched) return matched;
  }

  // Fallback to recommended model if configured ID isn't matched
  const recommended = availableCurrentModels.find((m) => m.recommendation === 'recommended');
  if (recommended) return recommended;

  if (availableCurrentModels.length > 0) {
    return availableCurrentModels[0];
  }

  return null;
}

export function getDefaultModelForProvider(providerKey: string): ModelPricing {
  const model = getCurrentDefaultModel(providerKey);
  if (model) return model;

  const fallback = getDefaultModel();
  return fallback;
}

export function getDefaultModel(): ModelPricing {
  const gpt4o = getModelById('gpt-4o');
  if (gpt4o && gpt4o.lifecycle === 'current' && gpt4o.availability === 'available') return gpt4o;

  const activeModels = getActiveModels();
  if (activeModels.length > 0) return activeModels[0];

  throw new Error('No valid current models found in registry');
}

/**
 * Computes dynamic lifecycle counts directly from the validated dataset.
 */
export function getLifecycleCounts() {
  const models = getAllModels();
  const currentDateStr = new Date().toISOString().split('T')[0];

  const counts = {
    current: 0,
    legacy: 0,
    deprecated: 0,
    shutdown: 0,
    preview: 0,
    unverified: 0,
  };

  models.forEach((m) => {
    if (m.status === 'unverified') {
      counts.unverified++;
    }

    if (m.lifecycle === 'shutdown' || (m.shutdownDate && m.shutdownDate <= currentDateStr)) {
      counts.shutdown++;
    } else {
      counts[m.lifecycle]++;
    }
  });

  return counts;
}
