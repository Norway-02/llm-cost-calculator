export interface HistoryItem {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  requestsPerDay: number;
  daysPerMonth: number;
  monthlyCost: number;
  costPerRequest: number;
}

const STORAGE_KEY = 'llm_calculator_history_v1';
const MAX_HISTORY_ITEMS = 20;

export function getHistoryEntries(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Failed to read calculator history from localStorage:', err);
    return [];
  }
}

export function saveHistoryEntry(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getHistoryEntries();
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    // Avoid duplicate adjacent identical calculations
    if (existing.length > 0 && existing[0].modelId === item.modelId && 
        existing[0].inputTokens === item.inputTokens && 
        existing[0].outputTokens === item.outputTokens &&
        existing[0].requestsPerDay === item.requestsPerDay) {
      return existing;
    }

    const updated = [newItem, ...existing].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save calculator history to localStorage:', err);
    return [];
  }
}

export function deleteHistoryEntry(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getHistoryEntries();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete history item:', err);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}
