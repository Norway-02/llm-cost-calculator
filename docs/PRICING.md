# Pricing Data Architecture & Verification Protocol

## 1. Centralized Data Layer

All pricing data lives in `data/models.json` and is strictly validated against the `ModelPricingSchema` in `lib/pricing/schema.ts`.

---

## 2. Three Distinct Freshness Responsibilities

1. **Pricing Freshness**: "What does this model cost?" (Input, output, cached input, batch rates verified against `sourceUrl`).
2. **Recommendation Freshness**: "Which model is the provider's current recommended default for new workloads?" (Verified against `recommendationSourceUrl`).
3. **Lifecycle Freshness**: "Is this model currently available, legacy, deprecated, or shut down?" (Verified against official deprecation/lifecycle notices and `shutdownDate`).

---

## 3. FX Rate Date Integrity & Presentation Architecture

1. **Provider Pricing Canonical**: LLM API pricing is stored and computed in canonical USD.
2. **Presentation-Only FX Transform**: FX conversion is applied at presentation time (`USD Result × Rate`).
3. **Source-Derived Rate Date**: `rateDate` comes strictly from official published FX datasets (Bank of Canada). It is NEVER derived from the system clock, build timestamp, or client browser time.
4. **Three Date Separation**:
   - `rateDate`: Official publication date from dataset payload (e.g. `"2026-08-21"`).
   - `fetchedAt`: Actual retrieval ISO timestamp.
   - `displayedAt`: Client rendering time.
5. **Publication Cutoff Semantics**: Bank of Canada daily average rates are published once each business day by 16:30 Eastern Time (`America/Toronto`).
6. **Publication Status Labels**:
   - `latest_published`: Current business day rate published after 16:30 ET.
   - `latest_available`: Weekend, holiday, or pre-publication window; displaying latest published business-day rate.
   - `delayed`: Post 16:30 ET on a business day, but today's rate is not in source payload yet.
   - `unavailable`: Safe fallback to USD identity.

---

## 4. Mandatory Update Workflow

```text
Pricing verification (sourceUrl)
       ↓
Recommendation verification (recommendationSourceUrl)
       ↓
Model lifecycle verification (lifecycle, availability, shutdownDate)
       ↓
Registry update (data/models.json)
       ↓
Automated validation (npm run validate:pricing)
       ↓
Unit tests (npm test)
       ↓
Build (npm run build)
```

---

## 5. UI Trust & Warning Rules

- **Recommended Active Models**: Highlighting current production choices with `recommendation = "recommended"`.
- **Stale Pricing Warning**: Models with `lastVerifiedDate > 90 days` display an amber alert banner advising users to confirm rates with provider.
- **Shutdown / Historical Models**: Shutdown models are clearly marked with `🛑 Shutdown` and excluded from current provider default selections.
- **Indicative FX Attribution**: Non-USD cost cards display explicit attribution: `Indicative FX reference rate: YYYY-MM-DD · Status: [Status] · Source: Bank of Canada`.
