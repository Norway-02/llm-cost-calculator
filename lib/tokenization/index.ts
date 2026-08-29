export interface TokenEstimation {
  characters: number;
  words: number;
  estimatedTokens: number;
}

/**
 * Client-side token estimation based on character and word heuristics.
 * Standard heuristic: ~4 characters per token in English / code text.
 */
export function estimateTokens(text: string): TokenEstimation {
  if (!text) {
    return { characters: 0, words: 0, estimatedTokens: 0 };
  }

  const characters = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  
  // Rule of thumb: ~4 characters per token for typical English text & JSON/code.
  const estimatedTokens = Math.ceil(characters / 4);

  return {
    characters,
    words,
    estimatedTokens,
  };
}
