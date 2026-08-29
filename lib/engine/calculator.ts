export interface CalculationInput {
  inputTokens: number;
  outputTokens: number;
  requestsPerDay: number;
  daysPerMonth: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
}

export interface CalculationResult {
  inputCost: number;
  outputCost: number;
  costPerRequest: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  annualCost: number;
  costPer1K: number;
  costPer1M: number;
  totalTokensPerRequest: number;
  totalTokensMonthly: number;
}

function sanitizeNumber(val: number): number {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val) || val < 0) {
    return 0;
  }
  return val;
}

export function calculateCosts(input: CalculationInput): CalculationResult {
  const inputTokens = sanitizeNumber(input.inputTokens);
  const outputTokens = sanitizeNumber(input.outputTokens);
  const requestsPerDay = sanitizeNumber(input.requestsPerDay);
  const daysPerMonth = sanitizeNumber(input.daysPerMonth);
  const inputPricePerMillion = sanitizeNumber(input.inputPricePerMillion);
  const outputPricePerMillion = sanitizeNumber(input.outputPricePerMillion);

  const inputCost = (inputTokens / 1_000_000) * inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * outputPricePerMillion;
  const costPerRequest = inputCost + outputCost;

  const dailyCost = costPerRequest * requestsPerDay;
  const weeklyCost = dailyCost * 7;
  const monthlyCost = dailyCost * daysPerMonth;
  const annualCost = monthlyCost * 12;

  const totalTokensPerRequest = inputTokens + outputTokens;
  const totalTokensMonthly = totalTokensPerRequest * requestsPerDay * daysPerMonth;

  let costPer1K = 0;
  let costPer1M = 0;

  if (totalTokensPerRequest > 0) {
    costPer1K = (costPerRequest / totalTokensPerRequest) * 1_000;
    costPer1M = (costPerRequest / totalTokensPerRequest) * 1_000_000;
  }

  return {
    inputCost: sanitizeNumber(inputCost),
    outputCost: sanitizeNumber(outputCost),
    costPerRequest: sanitizeNumber(costPerRequest),
    dailyCost: sanitizeNumber(dailyCost),
    weeklyCost: sanitizeNumber(weeklyCost),
    monthlyCost: sanitizeNumber(monthlyCost),
    annualCost: sanitizeNumber(annualCost),
    costPer1K: sanitizeNumber(costPer1K),
    costPer1M: sanitizeNumber(costPer1M),
    totalTokensPerRequest,
    totalTokensMonthly,
  };
}
