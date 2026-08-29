import { describe, it, expect } from 'vitest';
import { getAllModels } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';

describe('Model Comparison Module', () => {
  it('correctly calculates costs across multiple models', () => {
    const models = getAllModels();
    expect(models.length).toBeGreaterThanOrEqual(5);

    const sampleUsage = {
      inputTokens: 1000,
      outputTokens: 500,
      requestsPerDay: 100,
      daysPerMonth: 30,
    };

    const gpt4o = models.find((m) => m.id === 'gpt-4o')!;
    const geminiFlash = models.find((m) => m.id === 'gemini-2-0-flash')!;

    const resGpt = calculateCosts({
      ...sampleUsage,
      inputPricePerMillion: gpt4o.inputPricePerMillion,
      outputPricePerMillion: gpt4o.outputPricePerMillion,
    });

    const resGemini = calculateCosts({
      ...sampleUsage,
      inputPricePerMillion: geminiFlash.inputPricePerMillion,
      outputPricePerMillion: geminiFlash.outputPricePerMillion,
    });

    expect(resGemini.monthlyCost).toBeLessThan(resGpt.monthlyCost);
  });
});
