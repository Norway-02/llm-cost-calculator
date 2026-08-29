'use client';

import React from 'react';
import { ModelPricing, getEffectiveFreshnessStatus } from '@/lib/pricing/schema';
import { getModelById } from '@/lib/pricing';
import { PricingFreshnessBadge } from './PricingFreshnessBadge';
import { Badge } from './ui/Badge';

export interface PricingSourceProps {
  model: ModelPricing;
}

export const PricingSource: React.FC<PricingSourceProps> = ({ model }) => {
  const status = getEffectiveFreshnessStatus(model);
  const replacementModel = model.replacementModelId ? getModelById(model.replacementModelId) : undefined;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-4 text-xs text-slate-400 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">
            Verified Source & Trust:
          </span>
          <PricingFreshnessBadge model={model} />
          {model.lifecycle === 'shutdown' && (
            <Badge variant="unverified">🛑 SHUTDOWN</Badge>
          )}
          {model.lifecycle === 'deprecated' && (
            <Badge variant="stale">⚠️ DEPRECATED</Badge>
          )}
          {model.lifecycle === 'legacy' && (
            <Badge variant="neutral">LEGACY</Badge>
          )}
          {model.lifecycle === 'preview' && (
            <Badge variant="info">PREVIEW</Badge>
          )}
        </div>
        <a
          href={model.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
        >
          Official {model.provider} Documentation ↗
        </a>
      </div>

      {model.lifecycle === 'shutdown' && (
        <div className="mt-3 rounded-xl bg-rose-950/60 p-3 text-rose-200 border border-rose-500/30">
          🛑 <strong>Model Unavailable:</strong> This model was shut down by {model.provider}
          {model.shutdownDate ? ` on ${model.shutdownDate}` : ''}. It is unavailable for active API deployments. Consider switching to{' '}
          {replacementModel ? (
            <strong className="underline text-white">{replacementModel.modelName}</strong>
          ) : (
            'Gemini 3.7 Flash or another active model'
          )}
          .
        </div>
      )}

      {model.lifecycle === 'deprecated' && (
        <div className="mt-3 rounded-xl bg-amber-950/60 p-3 text-amber-200 border border-amber-500/30">
          ⚠️ <strong>Deprecated Model Notice:</strong> {model.modelName} has been deprecated by {model.provider}. Upgrade to{' '}
          {replacementModel ? <strong className="underline text-white">{replacementModel.modelName}</strong> : 'the recommended current tier'} for optimal billing and speed.
        </div>
      )}

      {status === 'stale' && model.lifecycle !== 'shutdown' && (
        <div className="mt-3 rounded-xl bg-amber-950/40 p-2.5 text-amber-300 border border-amber-500/20">
          ⚠️ <strong>Pricing Notice:</strong> Rates were last verified on {model.lastVerifiedDate}. Verify directly with {model.provider} before purchasing enterprise credits.
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-400 border-t border-white/5 pt-2">
        <span>Effective: <strong className="text-slate-200">{model.effectiveDate}</strong></span>
        <span>Input: <strong className="text-slate-200">${model.inputPricePerMillion} / 1M</strong></span>
        <span>Output: <strong className="text-slate-200">${model.outputPricePerMillion} / 1M</strong></span>
        {model.pricingTiers?.cachedInput !== undefined && (
          <span>Cached Input: <strong className="text-slate-200">${model.pricingTiers.cachedInput} / 1M</strong></span>
        )}
      </div>
    </div>
  );
};
