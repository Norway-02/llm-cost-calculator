# System Architecture Document

## Overview

The AI LLM Token & Cost Calculator is a serverless, zero-backend, privacy-first web application built with Next.js App Router, React 19, TypeScript (strict mode), and Tailwind CSS.

## Architecture Highlights

1. **Client-Side Deterministic Engine**: All calculation math is computed purely in the browser. Canonical pricing data and engine calculations are strictly in USD. Zero API keys, zero backend database requests, and zero network calls during calculation.
2. **Multi-Currency Presentation Transform Layer**: FX conversion is applied cleanly to the output layer (`USD Result → FX Rate → Display Currency`). Supports USD, EUR, GBP, INR, JPY, CAD, AUD, BRL, and CNY. Multi-model ranking remains strictly on canonical USD numeric values.
3. **Location & Locale Auto-Detection**: Browser locale (`navigator.language`) and timezone (`Intl.DateTimeFormat`) are mapped deterministically to default local currencies, with manual user overrides persisted in `localStorage` and shared via `?currency=XYZ` URL parameters.
4. **Centralized Data Layer**: Model pricing is stored in `data/models.json` and guarded by a Zod schema (`lib/pricing/schema.ts`).
5. **URL State Synchronization**: State is bi-directionally bound to URL query parameters (`URLSearchParams`), enabling instant shareability without backend storage.
6. **Resilient Local Storage**: User calculation history and currency preferences are persisted to `localStorage` with fail-safe error boundaries for SSR and private browsing modes.
7. **Privacy Telemetry Layer**: Analytics calls use a decoupled interface in `lib/analytics/index.ts` that strips all user text and sensitive values.

## Key Component Graph

```text
App Router Page (`app/*/page.tsx`)
 └── MainCalculator (`components/MainCalculator.tsx`)
      ├── ModelSelector (`components/ModelSelector.tsx`)
      ├── TokenInput (`components/TokenInput.tsx`)
      ├── RequestCalculator (`components/RequestCalculator.tsx`)
      ├── CostBreakdown (`components/CostBreakdown.tsx`)
      ├── PricingSource (`components/PricingSource.tsx`)
      ├── ComparisonTable (`components/ComparisonTable.tsx`)
      ├── CurrencySelector (`components/CurrencySelector.tsx`)
      └── CalculatorHistory (`components/CalculatorHistory.tsx`)
```
