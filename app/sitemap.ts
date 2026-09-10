import { MetadataRoute } from 'next';
import { getAllModels } from '@/lib/pricing';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://llmspends.dpdns.org';

  const staticRoutes = [
    '',
    '/ai-cost-calculator',
    '/token-calculator',
    '/llm-cost-calculator',
    '/llm-price-comparison',
    '/openai-cost-calculator',
    '/claude-cost-calculator',
    '/gemini-cost-calculator',
    '/deepseek-cost-calculator',
    '/llama-cost-calculator',
    '/ai-budget-calculator',
    '/token-counter',
    '/token-usage-calculator',
    '/ai-workload-calculator',
    '/ai-cost-per-user',
    '/ai-saas-cost-calculator',
    '/cheapest-llm',
    '/model-replacement-finder',
    '/ai-cost-optimizer',
    '/ai-cost-savings',
    '/prompt-cost-analyzer',
    '/usage-analyzer',
    '/providers',
    '/models',
    '/guides/how-llm-pricing-works',
    '/guides/input-vs-output-tokens',
    '/guides/llm-cost-comparison-guide',
    '/guides/api-pricing-explained',
  ];

  const models = getAllModels();
  const providerKeys = Array.from(new Set(models.map((m) => m.provider.toLowerCase())));

  const providerRoutes = providerKeys.map((p) => `/providers/${p}`);
  const modelRoutes = models.map((m) => `/models/${m.id}`);
  const comparisonRoutes = [
    '/compare/openai-vs-claude',
    '/compare/openai-vs-gemini',
    '/compare/claude-vs-gemini',
    '/compare/openai-vs-deepseek',
  ];

  const allRoutes = [...staticRoutes, ...providerRoutes, ...modelRoutes, ...comparisonRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/guides') || route.startsWith('/models') ? 0.7 : 0.8,
  }));
}
