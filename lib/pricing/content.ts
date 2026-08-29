import { getCurrentDefaultModel, getModelsByProvider } from './index';
import { ModelPricing } from './schema';

/**
 * Returns the recommended model for a provider from the verified registry.
 */
export function getRecommendedModelForProvider(providerKey: string): ModelPricing | null {
  return getCurrentDefaultModel(providerKey);
}

/**
 * Returns active non-shutdown models for a provider.
 */
export function getActiveModelsForProvider(providerKey: string): ModelPricing[] {
  return getModelsByProvider(providerKey).filter(
    (m) => m.lifecycle !== 'shutdown' && m.availability === 'available'
  );
}

/**
 * Generates a dynamic, registry-backed summary sentence for a provider's current models.
 */
export function getProviderPricingSummary(providerKey: string): string {
  const recommended = getRecommendedModelForProvider(providerKey);
  const activeModels = getActiveModelsForProvider(providerKey);

  if (!recommended || activeModels.length === 0) {
    return `Calculate current verified ${providerKey} API costs.`;
  }

  const modelNames = activeModels.map((m) => m.modelName).join(', ');
  return `Calculate current verified ${providerKey} API costs for ${recommended.modelName} and active models (${modelNames}).`;
}

/**
 * Generates dynamic FAQ items grounded in the verified registry.
 */
export function getRegistryDrivenFaqItems() {
  const openaiRec = getRecommendedModelForProvider('OpenAI');
  const anthropicRec = getRecommendedModelForProvider('Anthropic');
  const googleRec = getRecommendedModelForProvider('Google');
  const deepseekRec = getRecommendedModelForProvider('DeepSeek');

  return [
    {
      question: 'Which AI model is currently the most cost-effective?',
      answer: `Model pricing varies by performance tier. Currently, ${googleRec?.modelName || 'Gemini 3.7 Flash'} ($${googleRec?.inputPricePerMillion || 0.75}/1M input) and ${deepseekRec?.modelName || 'DeepSeek-V4-Flash'} ($${deepseekRec?.inputPricePerMillion || 0.14}/1M input) offer low-cost entry points, while ${openaiRec?.modelName || 'GPT-4o'} ($${openaiRec?.inputPricePerMillion || 2.5}/1M input) and ${anthropicRec?.modelName || 'Claude Sonnet 5'} ($${anthropicRec?.inputPricePerMillion || 2.0}/1M input intro rate) power flagship performance.`,
    },
    {
      question: 'How often is model pricing updated?',
      answer: 'Pricing is continuously verified against official provider documentation. Every entry in our registry carries an explicit verification date, pricing source URL, and provider recommendation status.',
    },
    {
      question: 'What happens to shut down or legacy models?',
      answer: 'Models that have reached end-of-life (such as Gemini 1.5 Pro, Gemini 1.5 Flash, and Gemini 2.0 Flash) are explicitly labeled as shutdown and preserved for historical benchmarking only. They are never recommended for active production workloads.',
    },
  ];
}
