import { CalculationInput } from '../engine/calculator';

export interface CalculatorState extends CalculationInput {
  modelId: string;
}

export function parseCalculatorStateFromUrl(searchParams: URLSearchParams, defaultModelId: string): CalculatorState {
  const modelId = searchParams.get('model') || defaultModelId;
  
  const parsePositiveInt = (key: string, fallback: number): number => {
    const val = searchParams.get(key);
    if (!val) return fallback;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  const parsePositiveFloat = (key: string, fallback: number): number => {
    const val = searchParams.get(key);
    if (!val) return fallback;
    const parsed = parseFloat(val);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  return {
    modelId,
    inputTokens: parsePositiveInt('input', 1000),
    outputTokens: parsePositiveInt('output', 500),
    requestsPerDay: parsePositiveInt('requests', 100),
    daysPerMonth: parsePositiveInt('days', 30),
    inputPricePerMillion: parsePositiveFloat('inPrice', 0),
    outputPricePerMillion: parsePositiveFloat('outPrice', 0),
  };
}

export function serializeCalculatorStateToUrl(state: CalculatorState): string {
  const params = new URLSearchParams();
  params.set('model', state.modelId);
  params.set('input', state.inputTokens.toString());
  params.set('output', state.outputTokens.toString());
  params.set('requests', state.requestsPerDay.toString());
  params.set('days', state.daysPerMonth.toString());
  return params.toString();
}
