import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://llmspends.dpdns.org';

  const routes = [
    '',
    '/ai-cost-calculator',
    '/token-calculator',
    '/llm-cost-calculator',
    '/llm-price-comparison',
    '/openai-cost-calculator',
    '/claude-cost-calculator',
    '/gemini-cost-calculator',
    '/ai-budget-calculator',
    '/token-counter',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
