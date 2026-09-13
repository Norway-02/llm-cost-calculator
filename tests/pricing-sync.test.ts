import { describe, it, expect } from 'vitest';
import { ModelPricingSchema, SyncMetadataSchema, formatDateUTC } from '@/lib/pricing/schema';
import { getSyncFreshnessInfo, SyncMetadata } from '@/lib/pricing';

function isPriceAnomaly(oldPrice: number, newPrice: number): boolean {
  if (oldPrice <= 0 || newPrice <= 0) {
    if (oldPrice > 0 && newPrice === 0) return true;
    return false;
  }
  const ratio = newPrice / oldPrice;
  if (ratio > 10 || ratio < 0.1) {
    return true;
  }
  return false;
}

describe('Automated Daily Pricing Synchronization Safeguards', () => {
  it('detects extreme price spike anomalies (> 10x / 1000% jump)', () => {
    const oldPrice = 2.50; // $2.50/M
    const spikePrice = 30.00; // $30.00/M (12x jump)

    expect(isPriceAnomaly(oldPrice, spikePrice)).toBe(true);
  });

  it('detects extreme price drop anomalies (> 10x / 90% collapse)', () => {
    const oldPrice = 10.00; // $10.00/M
    const dropPrice = 0.50; // $0.50/M (20x drop)

    expect(isPriceAnomaly(oldPrice, dropPrice)).toBe(true);
  });

  it('flags unexpected zero pricing as an anomaly for paid models', () => {
    const oldPrice = 2.50;
    const zeroPrice = 0;

    expect(isPriceAnomaly(oldPrice, zeroPrice)).toBe(true);
  });

  it('allows legitimate reasonable price adjustments (e.g. 20% drop or 50% increase)', () => {
    const oldPrice = 2.50;
    const reasonableDrop = 2.00; // 20% drop
    const reasonableIncrease = 3.75; // 50% increase

    expect(isPriceAnomaly(oldPrice, reasonableDrop)).toBe(false);
    expect(isPriceAnomaly(oldPrice, reasonableIncrease)).toBe(false);
  });

  it('rejects malformed model payloads missing required fields', () => {
    const malformedModel = {
      id: 'bad-model',
      provider: 'TestProvider',
      inputPricePerMillion: -5, // Invalid negative price
      outputPricePerMillion: 10,
    };

    const result = ModelPricingSchema.safeParse(malformedModel);
    expect(result.success).toBe(false);
  });

  it('validates SyncMetadataSchema correctly', () => {
    const validMetadata: SyncMetadata = {
      lastAttemptAt: '2026-09-13T11:40:00.000Z',
      lastSuccessfulSyncAt: '2026-09-13T11:40:00.000Z',
      status: 'success',
      modelsChecked: 436,
      modelsUpdated: 0,
      lastError: null,
    };

    expect(SyncMetadataSchema.safeParse(validMetadata).success).toBe(true);
  });

  it('calculates dynamic freshness badge labels correctly for recent sync', () => {
    const now = new Date('2026-09-13T12:00:00Z');
    const mockMetadata: SyncMetadata = {
      lastAttemptAt: '2026-09-13T06:00:00Z',
      lastSuccessfulSyncAt: '2026-09-13T06:00:00Z',
      status: 'success',
      modelsChecked: 436,
      modelsUpdated: 0,
    };

    const freshness = getSyncFreshnessInfo(mockMetadata, now);
    expect(freshness.badgeLabel).toBe('● Synced today');
    expect(freshness.formattedLastSuccessDate).toBe('Sep 13, 2026');
  });

  it('reports warning badge when sync attempt fails', () => {
    const now = new Date('2026-09-13T12:00:00Z');
    const mockFailedMetadata: SyncMetadata = {
      lastAttemptAt: '2026-09-13T12:00:00Z',
      lastSuccessfulSyncAt: '2026-09-12T06:00:00Z', // Previous successful run
      status: 'failed',
      modelsChecked: 0,
      modelsUpdated: 0,
      lastError: 'HTTP 500 Provider Outage',
    };

    const freshness = getSyncFreshnessInfo(mockFailedMetadata, now);
    expect(freshness.status).toBe('failed');
    expect(freshness.badgeLabel).toBe('⚠️ Sync attempt failed');
    // Successful date remains previous day
    expect(freshness.formattedLastSuccessDate).toBe('Sep 12, 2026');
  });

  it('formats dates deterministically with UTC handling', () => {
    const formatted = formatDateUTC('2026-08-01');
    expect(formatted).toBe('Aug 1, 2026');
  });
});
