'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ModelPricing } from '@/lib/pricing/schema';
import { getAllModels, getDefaultModel, getActiveModels } from '@/lib/pricing';
import { calculateCosts } from '@/lib/engine/calculator';
import { parseCalculatorStateFromUrl, serializeCalculatorStateToUrl } from '@/lib/state/url';
import { saveHistoryEntry, HistoryItem } from '@/lib/state/history';
import { trackEvent } from '@/lib/analytics';
import { SupportedCurrency, SupportedCurrencySchema, resolveDisplayCurrency, saveCurrencyPreference } from '@/lib/currency';

import { ModelSelector } from './ModelSelector';
import { TokenInput } from './TokenInput';
import { RequestCalculator } from './RequestCalculator';
import { CostBreakdown } from './CostBreakdown';
import { PricingSource } from './PricingSource';
import { ComparisonTable } from './ComparisonTable';
import { CalculatorHistory } from './CalculatorHistory';
import { ShareButton } from './ShareButton';
import { CopyResults } from './CopyResults';
import { CurrencySelector } from './CurrencySelector';
import { SavingsInsightCard } from './SavingsInsightCard';
import { AdSlot } from './AdSlot';
import { Card } from './ui/Card';

export interface MainCalculatorProps {
  initialModelId?: string;
}

const emptySubscribe = () => () => {};

function getClientCurrencySnapshot(urlCur?: string | null): SupportedCurrency {
  if (typeof window === 'undefined') return 'USD';
  if (urlCur && SupportedCurrencySchema.safeParse(urlCur.toUpperCase()).success) {
    return urlCur.toUpperCase() as SupportedCurrency;
  }
  return resolveDisplayCurrency(null).currencyCode;
}

function getServerCurrencySnapshot(urlCur?: string | null): SupportedCurrency {
  if (urlCur && SupportedCurrencySchema.safeParse(urlCur.toUpperCase()).success) {
    return urlCur.toUpperCase() as SupportedCurrency;
  }
  return 'USD';
}

export const MainCalculator: React.FC<MainCalculatorProps> = ({
  initialModelId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const allModels = getAllModels();
  const activeModels = getActiveModels();

  // Resolve initial model safely avoiding shutdown models as defaults
  const resolveInitialModel = (): ModelPricing => {
    if (initialModelId) {
      const found = allModels.find((m) => m.id === initialModelId);
      if (found && found.lifecycle !== 'shutdown') return found;
    }
    return getDefaultModel();
  };

  const defaultModel = resolveInitialModel();
  const urlCurrency = searchParams?.get('currency');

  // Hydration-safe initial currency resolution via useSyncExternalStore
  const detectedClientCurrency = useSyncExternalStore(
    emptySubscribe,
    () => getClientCurrencySnapshot(urlCurrency),
    () => getServerCurrencySnapshot(urlCurrency)
  );

  const [currencyOverride, setCurrencyOverride] = useState<SupportedCurrency | null>(null);
  const currencyCode = currencyOverride !== null ? currencyOverride : detectedClientCurrency;

  // Lazy state initializers from searchParams if present
  const [selectedModel, setSelectedModel] = useState<ModelPricing>(() => {
    if (searchParams && searchParams.has('model')) {
      const urlState = parseCalculatorStateFromUrl(searchParams, defaultModel.id);
      const urlModel = allModels.find((m) => m.id === urlState.modelId);
      if (urlModel) return urlModel;
    }
    return defaultModel;
  });

  const [inputTokens, setInputTokens] = useState<number>(() => {
    if (searchParams && searchParams.has('input')) {
      return parseCalculatorStateFromUrl(searchParams, defaultModel.id).inputTokens;
    }
    return 1000;
  });

  const [outputTokens, setOutputTokens] = useState<number>(() => {
    if (searchParams && searchParams.has('output')) {
      return parseCalculatorStateFromUrl(searchParams, defaultModel.id).outputTokens;
    }
    return 500;
  });

  const [requestsPerDay, setRequestsPerDay] = useState<number>(() => {
    if (searchParams && searchParams.has('requests')) {
      return parseCalculatorStateFromUrl(searchParams, defaultModel.id).requestsPerDay;
    }
    return 100;
  });

  const [daysPerMonth, setDaysPerMonth] = useState<number>(() => {
    if (searchParams && searchParams.has('days')) {
      return parseCalculatorStateFromUrl(searchParams, defaultModel.id).daysPerMonth;
    }
    return 30;
  });

  // Comparison models (defaulting strictly to active non-shutdown models)
  const [comparisonModelIds, setComparisonModelIds] = useState<string[]>(() => {
    const defaults = [
      defaultModel.id,
      activeModels.find((m) => m.provider === 'Anthropic')?.id || 'claude-sonnet-5',
      activeModels.find((m) => m.provider === 'Google')?.id || 'gemini-3.7-flash',
    ];
    return Array.from(new Set(defaults.filter(Boolean)));
  });

  // Sync URL shallowly when state changes
  useEffect(() => {
    const baseQuery = serializeCalculatorStateToUrl({
      modelId: selectedModel.id,
      inputTokens,
      outputTokens,
      requestsPerDay,
      daysPerMonth,
      inputPricePerMillion: selectedModel.inputPricePerMillion,
      outputPricePerMillion: selectedModel.outputPricePerMillion,
    });
    const finalQuery = `${baseQuery}&currency=${currencyCode}`;
    router.replace(`${pathname}?${finalQuery}`, { scroll: false });
  }, [selectedModel.id, selectedModel.inputPricePerMillion, selectedModel.outputPricePerMillion, inputTokens, outputTokens, requestsPerDay, daysPerMonth, currencyCode, pathname, router]);

  const handleCurrencyChange = (code: SupportedCurrency, mode: 'auto' | 'manual') => {
    setCurrencyOverride(code);
    saveCurrencyPreference({ currencyMode: mode, currencyCode: code });
    trackEvent({
      eventName: mode === 'auto' ? 'currency_auto_detected' : 'currency_selected',
      metadata: { currency: code },
    });
  };

  // Compute live calculations (Canonical USD Math)
  const result = calculateCosts({
    inputTokens,
    outputTokens,
    requestsPerDay,
    daysPerMonth,
    inputPricePerMillion: selectedModel.inputPricePerMillion,
    outputPricePerMillion: selectedModel.outputPricePerMillion,
  });

  // Track analytics & save history on interaction
  const modelId = selectedModel.id;
  const provider = selectedModel.provider;
  const monthlyCost = result.monthlyCost;
  const costPerRequest = result.costPerRequest;
  const modelName = selectedModel.modelName;

  useEffect(() => {
    trackEvent({
      eventName: 'calculator_used',
      modelId,
      provider,
    });

    if (inputTokens > 0 || outputTokens > 0) {
      saveHistoryEntry({
        modelId,
        modelName,
        provider,
        inputTokens,
        outputTokens,
        requestsPerDay,
        daysPerMonth,
        monthlyCost,
        costPerRequest,
      });
    }
  }, [modelId, provider, modelName, inputTokens, outputTokens, requestsPerDay, daysPerMonth, monthlyCost, costPerRequest]);

  const handleApplyPreset = (inTok: number, outTok: number, reqs: number, days: number) => {
    setInputTokens(inTok);
    setOutputTokens(outTok);
    setRequestsPerDay(reqs);
    setDaysPerMonth(days);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    const targetModel = allModels.find((m) => m.id === item.modelId);
    if (targetModel) setSelectedModel(targetModel);
    setInputTokens(item.inputTokens);
    setOutputTokens(item.outputTokens);
    setRequestsPerDay(item.requestsPerDay);
    setDaysPerMonth(item.daysPerMonth);
  };

  const handleAddComparisonModel = (idToAdd: string) => {
    if (!comparisonModelIds.includes(idToAdd) && comparisonModelIds.length < 5) {
      setComparisonModelIds([...comparisonModelIds, idToAdd]);
      trackEvent({ eventName: 'comparison_created', metadata: { count: comparisonModelIds.length + 1 } });
    }
  };

  const handleRemoveComparisonModel = (idToRemove: string) => {
    if (comparisonModelIds.length > 2) {
      setComparisonModelIds(comparisonModelIds.filter((id) => id !== idToRemove));
    }
  };

  const handleChangeComparisonModel = (idx: number, newModelId: string) => {
    const next = [...comparisonModelIds];
    next[idx] = newModelId;
    setComparisonModelIds(next);
  };

  const currentShareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div id="calculator-section" className="space-y-8 scroll-mt-20">
      {/* Top Currency Preference Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1020]/80 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span>🌐</span>
          <span>Display Currency Preference:</span>
        </div>
        <CurrencySelector
          currentCurrency={currencyCode}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

      {/* Main Grid: Controls (Left 7 Cols) vs Live Results (Right 5 Cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Input Panel */}
        <div className="space-y-6 lg:col-span-7">
          <Card title="1. Select LLM & Configure Input Usage">
            <div className="space-y-6">
              <ModelSelector
                models={allModels}
                selectedModelId={selectedModel.id}
                onSelectModel={(m) => {
                  setSelectedModel(m);
                  trackEvent({ eventName: 'model_selected', modelId: m.id, provider: m.provider });
                }}
              />

              <TokenInput
                inputTokens={inputTokens}
                outputTokens={outputTokens}
                onInputChange={setInputTokens}
                onOutputChange={setOutputTokens}
              />

              <RequestCalculator
                requestsPerDay={requestsPerDay}
                daysPerMonth={daysPerMonth}
                onRequestChange={setRequestsPerDay}
                onDaysChange={setDaysPerMonth}
                onApplyPreset={handleApplyPreset}
              />
            </div>
          </Card>

          {/* Pricing Source & Trust Attributions */}
          <PricingSource model={selectedModel} />
        </div>

        {/* Right Cost Summary Panel */}
        <div className="space-y-6 lg:col-span-5">
          <Card
            title="2. Cost Estimation Results"
            headerAction={
              <div className="flex gap-2">
                <CopyResults
                  result={result}
                  modelName={selectedModel.modelName}
                  provider={selectedModel.provider}
                  inputTokens={inputTokens}
                  outputTokens={outputTokens}
                  requestsPerDay={requestsPerDay}
                />
                <ShareButton shareUrl={currentShareUrl} modelName={selectedModel.modelName} />
              </div>
            }
          >
            <CostBreakdown
              result={result}
              modelName={selectedModel.modelName}
              currencyCode={currencyCode}
            />
          </Card>

          {/* Dynamic Savings Insight Recommendation Card */}
          <SavingsInsightCard
            currentModel={selectedModel}
            allModels={allModels}
            usageInput={{
              inputTokens,
              outputTokens,
              requestsPerDay,
              daysPerMonth,
            }}
            currencyCode={currencyCode}
          />

          {/* Sponsored Infrastructure Tool Slot */}
          <AdSlot category="infrastructure" />

          {/* History Drawer */}
          <CalculatorHistory onRestore={handleRestoreHistory} />
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <Card title="3. Side-by-Side LLM Pricing Comparison">
        <ComparisonTable
          allModels={allModels}
          selectedModelIds={comparisonModelIds}
          usageInput={{
            inputTokens,
            outputTokens,
            requestsPerDay,
            daysPerMonth,
          }}
          currencyCode={currencyCode}
          onAddModel={handleAddComparisonModel}
          onRemoveModel={handleRemoveComparisonModel}
          onChangeModel={handleChangeComparisonModel}
        />
      </Card>
    </div>
  );
};
