import { describe, it, expect } from 'vitest';
import { estimateTokens } from '@/lib/tokenization';

describe('Token Estimator Module Audit', () => {
  it('handles empty string and whitespace-only text gracefully', () => {
    const empty = estimateTokens('');
    expect(empty.characters).toBe(0);
    expect(empty.words).toBe(0);
    expect(empty.estimatedTokens).toBe(0);

    const spaceOnly = estimateTokens('    \n\t  ');
    expect(spaceOnly.characters).toBe(8);
    expect(spaceOnly.words).toBe(0);
    expect(spaceOnly.estimatedTokens).toBe(2);
  });

  it('estimates token count for standard English text', () => {
    const sample = 'Hello world, this is a test prompt to calculate tokens.';
    const res = estimateTokens(sample);
    expect(res.characters).toBe(sample.length);
    expect(res.words).toBe(10);
    expect(res.estimatedTokens).toBe(Math.ceil(sample.length / 4));
  });

  it('handles Unicode characters and emojis safely', () => {
    const unicodeText = '🚀 AI LLM Cost Calculator ⚡ 🤖';
    const res = estimateTokens(unicodeText);
    expect(res.characters).toBe(unicodeText.length);
    expect(res.words).toBe(7);
    expect(res.estimatedTokens).toBeGreaterThan(0);
  });

  it('handles code snippets and technical punctuation', () => {
    const codeSnippet = `
      function calculateTotal(input: number, rate: number): number {
        return (input / 1000000) * rate;
      }
    `;
    const res = estimateTokens(codeSnippet);
    expect(res.characters).toBe(codeSnippet.length);
    expect(res.words).toBeGreaterThan(5);
    expect(res.estimatedTokens).toBe(Math.ceil(codeSnippet.length / 4));
  });

  it('handles multilingual text (Spanish, German, Japanese)', () => {
    const multiLang = 'Calculadora de costos LLM. Kostenrechner für KI. AIコスト計算ツール。';
    const res = estimateTokens(multiLang);
    expect(res.characters).toBe(multiLang.length);
    expect(res.estimatedTokens).toBeGreaterThan(0);
  });

  it('handles large documents without performance degradation', () => {
    const longText = 'The quick brown fox jumps over the lazy dog. '.repeat(1000);
    const start = performance.now();
    const res = estimateTokens(longText);
    const duration = performance.now() - start;

    expect(res.characters).toBe(longText.length);
    expect(res.words).toBe(9000);
    expect(res.estimatedTokens).toBe(Math.ceil(longText.length / 4));
    expect(duration).toBeLessThan(50); // Execution under 50ms
  });
});
