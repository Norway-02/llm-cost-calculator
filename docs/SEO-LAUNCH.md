# Technical SEO & Launch Strategy

## 1. Landing Page Hierarchy
The application serves 10 specialized functional routes:
- `/` - General LLM Cost Calculator
- `/ai-cost-calculator` - Generative AI API Cost Calculator
- `/token-calculator` - Token to USD Cost Converter
- `/llm-cost-calculator` - Large Language Model Pricing
- `/llm-price-comparison` - Side-by-Side Model Comparison
- `/openai-cost-calculator` - OpenAI (GPT-4o, o1, o3-mini) Pricing
- `/claude-cost-calculator` - Anthropic Claude 3.7 / 3.5 Pricing
- `/gemini-cost-calculator` - Google Gemini 2.0 Flash / 1.5 Pro Pricing
- `/ai-budget-calculator` - Startup & Enterprise AI Budget Planner
- `/token-counter` - Free Prompt Token & Character Estimator

## 2. Technical Features
- **Dynamic Sitemap**: Auto-generated via `app/sitemap.ts`.
- **Robots.txt**: Managed via `app/robots.ts`.
- **Canonical URLs**: Set on every page to prevent duplicate content flags.
- **Open Graph / Twitter Cards**: Configured in layout and metadata objects.
