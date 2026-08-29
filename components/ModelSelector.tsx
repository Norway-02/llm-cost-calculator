'use client';

import React from 'react';
import { ModelPricing } from '@/lib/pricing/schema';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';

export interface ModelSelectorProps {
  models: ModelPricing[];
  selectedModelId: string;
  onSelectModel: (model: ModelPricing) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
}) => {
  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  const getLifecycleSuffix = (m: ModelPricing) => {
    switch (m.lifecycle) {
      case 'shutdown':
        return ' [🛑 Shutdown]';
      case 'deprecated':
        return ' [⚠️ Deprecated]';
      case 'legacy':
        return ' [Legacy]';
      case 'preview':
        return ' [Preview]';
      case 'current':
      default:
        return ' [Active]';
    }
  };

  const options = models.map((m) => ({
    value: m.id,
    label: `${m.provider} - ${m.modelName}${getLifecycleSuffix(m)} ($${m.inputPricePerMillion}/$${m.outputPricePerMillion} per 1M)`,
    group: m.provider,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = models.find((m) => m.id === e.target.value);
    if (target) {
      onSelectModel(target);
    }
  };

  return (
    <div className="space-y-3">
      <Select
        label="Select LLM Model"
        value={selectedModelId}
        onChange={handleChange}
        options={options}
      />
      {currentModel && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Status & Capabilities:</span>
          {currentModel.lifecycle === 'current' && <Badge variant="verified">Current Active</Badge>}
          {currentModel.lifecycle === 'preview' && <Badge variant="info">Preview</Badge>}
          {currentModel.lifecycle === 'legacy' && <Badge variant="neutral">Legacy</Badge>}
          {currentModel.lifecycle === 'deprecated' && <Badge variant="stale">Deprecated</Badge>}
          {currentModel.lifecycle === 'shutdown' && <Badge variant="unverified">Shutdown Model</Badge>}

          {currentModel.capabilities?.vision && <Badge variant="info">Vision</Badge>}
          {currentModel.capabilities?.audio && <Badge variant="info">Audio</Badge>}
          {currentModel.capabilities?.reasoning && <Badge variant="info">Reasoning</Badge>}
        </div>
      )}
    </div>
  );
};
