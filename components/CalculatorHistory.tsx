'use client';

import React, { useState, useSyncExternalStore, useEffect } from 'react';
import {
  HistoryItem,
  getHistoryEntries,
  deleteHistoryEntry,
  clearHistory,
} from '@/lib/state/history';
import { formatCurrency, formatNumber } from '@/lib/engine/format';
import { Button } from './ui/Button';

export interface CalculatorHistoryProps {
  onRestore: (item: HistoryItem) => void;
}

const SERVER_SNAPSHOT: HistoryItem[] = [];
const emptySubscribe = () => () => {};

let historyCache: { raw: string | null; entries: HistoryItem[] } = {
  raw: null,
  entries: [],
};

function invalidateHistoryCache() {
  historyCache = { raw: null, entries: [] };
}

function getClientHistorySnapshot(): HistoryItem[] {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  try {
    const raw = localStorage.getItem('llmcalc_history');
    if (raw === historyCache.raw) {
      return historyCache.entries;
    }
    const entries = getHistoryEntries();
    historyCache = { raw, entries };
    return entries;
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function getServerHistorySnapshot(): HistoryItem[] {
  return SERVER_SNAPSHOT;
}

export const CalculatorHistory: React.FC<CalculatorHistoryProps> = ({ onRestore }) => {
  const historyEntries = useSyncExternalStore(
    emptySubscribe,
    getClientHistorySnapshot,
    getServerHistorySnapshot
  );

  const [historyOverride, setHistoryOverride] = useState<HistoryItem[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const history = historyOverride !== null ? historyOverride : historyEntries;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const refreshHistory = () => {
    invalidateHistoryCache();
    setHistoryOverride(getHistoryEntries());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryEntry(id);
    invalidateHistoryCache();
    setHistoryOverride(updated);
  };

  const handleClear = () => {
    clearHistory();
    invalidateHistoryCache();
    setHistoryOverride([]);
  };

  if (history.length === 0) return null;

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => {
          refreshHistory();
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-3.5 text-xs font-bold text-slate-300 transition-colors hover:border-white/20 hover:bg-slate-900/90"
      >
        <span className="flex items-center gap-2">
          <span>📜</span>
          <span>Calculation History ({history.length})</span>
        </span>
        <span className="text-[10px] text-blue-400">{isOpen ? '▲ Close Drawer' : '▼ View Saved'}</span>
      </button>

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-250 animate-fadeIn"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-[#0B1020] p-6 shadow-2xl transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white uppercase tracking-wider">
            <span>📜 Saved Calculations ({history.length})</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onRestore(item);
                setIsOpen(false);
              }}
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/80 p-3.5 transition-all hover:border-blue-500/40 hover:bg-slate-800 cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white group-hover:text-blue-400">
                  {item.provider} - {item.modelName}
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  {formatNumber(item.inputTokens)} in / {formatNumber(item.outputTokens)} out
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs font-bold text-emerald-400">
                  {formatCurrency(item.monthlyCost)}/mo
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1 text-slate-500 hover:text-red-400"
                  aria-label="Delete history item"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-400 hover:text-red-300 text-xs">
            Clear All History
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
