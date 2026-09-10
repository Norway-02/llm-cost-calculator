# LLMSpends 2.0 — Architecture Snapshot & Codebase Audit

**Document Date**: September 10, 2026  
**Target Domain**: `https://llmspends.dpdns.org`  
**Repository**: `Norway-02/llm-cost-calculator`

---

## 1. Executive Architecture Snapshot

LLMSpends is a high-craft, privacy-first AI Cost Intelligence Platform built with Next.js 16 (App Router), TypeScript 5, React 19, Tailwind CSS 4, Zod schema validation, Vitest unit testing, and Cloudflare Workers Static Assets deployment.

```text
                             Client Browser
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     Calculator Engine      Currency Engine      URL/History State
      (lib/engine/)          (lib/currency/)      (lib/state/)
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
                         Centralized Registry
                          (data/models.json)
                         (lib/pricing/schema.ts)
```

---

## 2. Existing Production Routes Inventory

| Route | Type | Purpose | Indexable | Canonical Host |
| :--- | :--- | :--- | :---: | :--- |
| `/` | Static (App) | Flagship LLM Cost Calculator & Scenario Preview | Yes | `https://llmspends.dpdns.org/` |
| `/ai-cost-calculator` | Static (App) | General AI API Cost Calculator | Yes | `https://llmspends.dpdns.org/ai-cost-calculator` |
| `/token-calculator` | Static (App) | Per-1K / Per-1M Token Rate Calculator | Yes | `https://llmspends.dpdns.org/token-calculator` |
| `/llm-cost-calculator` | Static (App) | Commercial & Open-Weights Pricing Tool | Yes | `https://llmspends.dpdns.org/llm-cost-calculator` |
| `/llm-price-comparison` | Static (App) | Multi-Model Comparison Table | Yes | `https://llmspends.dpdns.org/llm-price-comparison` |
| `/openai-cost-calculator` | Static (App) | OpenAI GPT-4o, o1, o3-mini Cost Tool | Yes | `https://llmspends.dpdns.org/openai-cost-calculator` |
| `/claude-cost-calculator` | Static (App) | Anthropic Claude 3.7 / Haiku Cost Tool | Yes | `https://llmspends.dpdns.org/claude-cost-calculator` |
| `/gemini-cost-calculator` | Static (App) | Google Gemini 3.7 Flash/Pro Cost Tool | Yes | `https://llmspends.dpdns.org/gemini-cost-calculator` |
| `/ai-budget-calculator` | Static (App) | Annual & Monthly Engineering Budget Planner | Yes | `https://llmspends.dpdns.org/ai-budget-calculator` |
| `/token-counter` | Static (App) | Client-side Text Character/Word/Token Counter | Yes | `https://llmspends.dpdns.org/token-counter` |
| `/sitemap.xml` | Static (Route) | Production Sitemap | Yes | `https://llmspends.dpdns.org/sitemap.xml` |
| `/robots.txt` | Static (Route) | Crawler Rules & Sitemap Directive | Yes | `https://llmspends.dpdns.org/robots.txt` |

---

## 3. Data & Pricing Architecture

### Centralized Schema (`lib/pricing/schema.ts`)
* **Registry File**: `data/models.json`
* **Validation Layer**: `lib/pricing/validator.ts` backed by Zod schemas (`ModelPricingSchema`).
* **Fields Tracked**:
  * `id`, `provider`, `modelName`, `currency`
  * `inputPricePerMillion`, `outputPricePerMillion`
  * `effectiveDate`, `sourceUrl`, `lastVerifiedDate`
  * `status`: `verified` | `unverified` | `stale`
  * `lifecycle`: `current` | `deprecated` | `shutdown`
  * `availability`: `available` | `preview` | `unavailable`
  * `pricingTiers`: `cachedInput`, `batch` (`input`, `output`)
  * `replacementModelId`: Safe fallback chain for shutdown models.

---

## 4. Calculation & Currency Engine

### Pure Deterministic Engine (`lib/engine/calculator.ts`)
* **Formulas**:
  * $\text{Daily Cost} = \frac{\text{Input Tokens} \times \text{Input Price} + \text{Output Tokens} \times \text{Output Price}}{1,000,000} \times \text{Requests / Day}$
  * $\text{Monthly Cost} = \text{Daily Cost} \times \text{Days}$
  * $\text{Annual Cost} = \text{Monthly Cost} \times 12$
  * $\text{Cost Per Request} = \frac{\text{Daily Cost}}{\text{Requests / Day}}$
* **Currency Triangulation (`lib/currency/rates.ts`)**:
  * Bank of Canada indicative daily average exchange rates dataset.
  * Base currency: `USD`. Supported: `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `INR`, `JPY`, `SGD`.

---

## 5. SEO & Canonical Strategy

* **Metadata Base**: `https://llmspends.dpdns.org` configured in `app/layout.tsx`.
* **Canonical Policy**: Every page contains a self-referencing canonical link.
* **Sitemap Generation**: `app/sitemap.ts` prerenders all 10 canonical URLs without fake build timestamps.
* **Robots.txt**: `app/robots.ts` allows indexing and declares `Sitemap: https://llmspends.dpdns.org/sitemap.xml`.

---

## 6. Baseline Verification Results

```text
npm run validate:pricing : PASSED (0 errors)
npm test                : PASSED (54/54 unit tests across 7 suites)
npm run typecheck       : PASSED (0 TypeScript errors)
npm run lint            : PASSED (0 ESLint errors)
npm run build           : PASSED (15/15 static pages compiled cleanly)
```
