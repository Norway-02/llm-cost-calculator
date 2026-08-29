'use client';

import React from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export interface RequestCalculatorProps {
  requestsPerDay: number;
  daysPerMonth: number;
  onRequestChange: (val: number) => void;
  onDaysChange: (val: number) => void;
  onApplyPreset: (input: number, output: number, requests: number, days: number) => void;
}

export const RequestCalculator: React.FC<RequestCalculatorProps> = ({
  requestsPerDay,
  daysPerMonth,
  onRequestChange,
  onDaysChange,
  onApplyPreset,
}) => {
  const presets = [
    { label: '💬 Chatbot', input: 800, output: 250, requests: 500, days: 30 },
    { label: '🔍 RAG Agent', input: 4000, output: 600, requests: 200, days: 30 },
    { label: '📊 Batch Extraction', input: 15000, output: 1200, requests: 50, days: 30 },
    { label: '✍️ Content Generator', input: 500, output: 1500, requests: 100, days: 30 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Requests / Day"
          type="number"
          min="0"
          value={requestsPerDay === 0 ? '' : requestsPerDay}
          onChange={(e) => onRequestChange(parseInt(e.target.value, 10) || 0)}
          placeholder="e.g. 100"
          helperText="Average API calls per 24-hour period"
        />
        <Input
          label="Days / Month"
          type="number"
          min="1"
          max="31"
          value={daysPerMonth === 0 ? '' : daysPerMonth}
          onChange={(e) => onDaysChange(parseInt(e.target.value, 10) || 0)}
          placeholder="30"
          helperText="Active billing days per month"
        />
      </div>

      <div className="space-y-1.5">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Quick Usage Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              type="button"
              onClick={() => onApplyPreset(preset.input, preset.output, preset.requests, preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
