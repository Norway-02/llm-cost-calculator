import { describe, it, expect, beforeEach } from 'vitest';
import { parseCalculatorStateFromUrl, serializeCalculatorStateToUrl } from '@/lib/state/url';
import {
  getHistoryEntries,
  saveHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
} from '@/lib/state/history';

describe('URL State Serialization & Parsing Resiliency', () => {
  it('parses valid search parameters correctly', () => {
    const params = new URLSearchParams('model=claude-3-7-sonnet&input=5000&output=1000&requests=500&days=20');
    const state = parseCalculatorStateFromUrl(params, 'gpt-4o');
    expect(state.modelId).toBe('claude-3-7-sonnet');
    expect(state.inputTokens).toBe(5000);
    expect(state.outputTokens).toBe(1000);
    expect(state.requestsPerDay).toBe(500);
    expect(state.daysPerMonth).toBe(20);
  });

  it('sanitizes negative, invalid, or malformed URL query values safely', () => {
    const params = new URLSearchParams('model=invalid-model-name&input=-500&output=abc&requests=NaN&days=-10');
    const state = parseCalculatorStateFromUrl(params, 'gpt-4o');
    expect(state.modelId).toBe('invalid-model-name');
    expect(state.inputTokens).toBe(1000); // Fallback
    expect(state.outputTokens).toBe(500);  // Fallback
    expect(state.requestsPerDay).toBe(100); // Fallback
    expect(state.daysPerMonth).toBe(30);   // Fallback
  });

  it('serializes state to query string correctly', () => {
    const query = serializeCalculatorStateToUrl({
      modelId: 'gpt-4o',
      inputTokens: 2000,
      outputTokens: 800,
      requestsPerDay: 50,
      daysPerMonth: 30,
      inputPricePerMillion: 2.5,
      outputPricePerMillion: 10.0,
    });
    expect(query).toContain('model=gpt-4o');
    expect(query).toContain('input=2000');
    expect(query).toContain('output=800');
    expect(query).toContain('requests=50');
    expect(query).toContain('days=30');
  });
});

describe('LocalStorage History Module Resiliency', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('returns empty array when history is empty or invalid JSON', () => {
    expect(getHistoryEntries()).toEqual([]);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('llm_calculator_history_v1', '{ invalid json ...');
      expect(getHistoryEntries()).toEqual([]);
    }
  });

  it('saves, retrieves, and deletes history items successfully', () => {
    const saved = saveHistoryEntry({
      modelId: 'gpt-4o',
      modelName: 'GPT-4o',
      provider: 'OpenAI',
      inputTokens: 1000,
      outputTokens: 500,
      requestsPerDay: 100,
      daysPerMonth: 30,
      monthlyCost: 13.5,
      costPerRequest: 0.0045,
    });

    expect(saved.length).toBe(1);
    expect(saved[0].modelId).toBe('gpt-4o');

    const id = saved[0].id;
    const afterDelete = deleteHistoryEntry(id);
    expect(afterDelete.length).toBe(0);
  });

  it('clears all history entries', () => {
    saveHistoryEntry({
      modelId: 'gpt-4o',
      modelName: 'GPT-4o',
      provider: 'OpenAI',
      inputTokens: 1000,
      outputTokens: 500,
      requestsPerDay: 100,
      daysPerMonth: 30,
      monthlyCost: 13.5,
      costPerRequest: 0.0045,
    });

    clearHistory();
    expect(getHistoryEntries()).toEqual([]);
  });
});
