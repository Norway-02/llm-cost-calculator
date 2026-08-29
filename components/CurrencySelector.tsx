'use client';

import React, { useState, useSyncExternalStore } from 'react';
import {
  SupportedCurrency,
  CURRENCY_METADATA,
  getSavedCurrencyPreference,
  saveCurrencyPreference,
  detectCurrencyFromEnvironment,
} from '@/lib/currency';

export interface CurrencySelectorProps {
  currentCurrency: SupportedCurrency;
  onCurrencyChange: (code: SupportedCurrency, mode: 'auto' | 'manual') => void;
  className?: string;
}

const emptySubscribe = () => () => {};

function getClientDetectedCurrency(): SupportedCurrency {
  if (typeof window === 'undefined') return 'USD';
  return detectCurrencyFromEnvironment();
}

function getServerDetectedCurrency(): SupportedCurrency {
  return 'USD';
}

function getClientInitialMode(): 'auto' | 'manual' {
  if (typeof window === 'undefined') return 'auto';
  const saved = getSavedCurrencyPreference();
  return saved ? saved.currencyMode : 'auto';
}

function getServerInitialMode(): 'auto' | 'manual' {
  return 'auto';
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  onCurrencyChange,
  className = '',
}) => {
  const detectedCurrency = useSyncExternalStore(
    emptySubscribe,
    getClientDetectedCurrency,
    getServerDetectedCurrency
  );

  const initialMode = useSyncExternalStore(
    emptySubscribe,
    getClientInitialMode,
    getServerInitialMode
  );

  const [modeOverride, setModeOverride] = useState<'auto' | 'manual' | null>(null);
  const mode = modeOverride !== null ? modeOverride : initialMode;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'AUTO') {
      const autoCode = detectCurrencyFromEnvironment();
      setModeOverride('auto');
      saveCurrencyPreference({ currencyMode: 'auto', currencyCode: autoCode });
      onCurrencyChange(autoCode, 'auto');
    } else {
      const code = val as SupportedCurrency;
      setModeOverride('manual');
      saveCurrencyPreference({ currencyMode: 'manual', currencyCode: code });
      onCurrencyChange(code, 'manual');
    }
  };

  const autoLabel = `Auto — ${detectedCurrency} (${CURRENCY_METADATA[detectedCurrency]?.symbol || ''} Detected)`;

  return (
    <div className={`inline-flex items-center space-x-1.5 ${className}`}>
      <label htmlFor="currency-select" className="sr-only">
        Select Display Currency
      </label>
      <select
        id="currency-select"
        value={mode === 'auto' ? 'AUTO' : currentCurrency}
        onChange={handleChange}
        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        aria-label="Select Display Currency"
      >
        <option value="AUTO" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">{autoLabel}</option>
        <option value="USD" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">USD — US Dollar ($)</option>
        <option value="EUR" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">EUR — Euro (€)</option>
        <option value="GBP" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">GBP — British Pound (£)</option>
        <option value="INR" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">INR — Indian Rupee (₹)</option>
        <option value="JPY" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">JPY — Japanese Yen (¥)</option>
        <option value="CAD" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">CAD — Canadian Dollar (CA$)</option>
        <option value="AUD" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">AUD — Australian Dollar (A$)</option>
        <option value="BRL" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">BRL — Brazilian Real (R$)</option>
        <option value="CNY" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1">CNY — Chinese Yuan (¥)</option>
      </select>
    </div>
  );
};
