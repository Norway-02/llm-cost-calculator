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

export interface WorkloadDefinition {
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  requestsPerUserPerDay: number;
  monthlyActiveUsers: number;
  daysPerMonth?: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cacheHitRate?: number;
  cachedInputPricePerMillion?: number;
  batchRate?: number;
  batchInputPricePerMillion?: number;
  batchOutputPricePerMillion?: number;
  growthRateMonthly?: number;
}

export interface WorkloadCalculationResult {
  costPerRequest: number;
  costPerUserMonthly: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  annualCost: number;
  totalMonthlyRequests: number;
  totalMonthlyTokens: number;
  costForUsers: {
    100: number;
    1000: number;
    10000: number;
    100000: number;
  };
  projections: {
    month1: number;
    month2: number;
    month3: number;
    month6: number;
    month12: number;
  };
}

export function calculateWorkloadCosts(input: WorkloadDefinition): WorkloadCalculationResult {
  const inputTokens = sanitizeNumber(input.inputTokensPerRequest);
  const outputTokens = sanitizeNumber(input.outputTokensPerRequest);
  const requestsPerUserDay = sanitizeNumber(input.requestsPerUserPerDay);
  const users = sanitizeNumber(input.monthlyActiveUsers);
  const days = input.daysPerMonth && input.daysPerMonth > 0 ? sanitizeNumber(input.daysPerMonth) : 30;
  const inputPrice = sanitizeNumber(input.inputPricePerMillion);
  const outputPrice = sanitizeNumber(input.outputPricePerMillion);

  const cacheHitRate = Math.min(1, Math.max(0, sanitizeNumber(input.cacheHitRate || 0)));
  const cachedInputPrice = input.cachedInputPricePerMillion !== undefined ? sanitizeNumber(input.cachedInputPricePerMillion) : inputPrice;

  const batchRate = Math.min(1, Math.max(0, sanitizeNumber(input.batchRate || 0)));
  const batchInputPrice = input.batchInputPricePerMillion !== undefined ? sanitizeNumber(input.batchInputPricePerMillion) : inputPrice;
  const batchOutputPrice = input.batchOutputPricePerMillion !== undefined ? sanitizeNumber(input.batchOutputPricePerMillion) : outputPrice;

  // Effective per-request cost calculation with caching & batching
  const standardInputRatio = (1 - cacheHitRate) * (1 - batchRate);
  const cachedInputRatio = cacheHitRate * (1 - batchRate);
  const batchInputRatio = batchRate;

  const effectiveInputCostPerRequest =
    (inputTokens / 1_000_000) *
    (standardInputRatio * inputPrice + cachedInputRatio * cachedInputPrice + batchInputRatio * batchInputPrice);

  const effectiveOutputCostPerRequest =
    (outputTokens / 1_000_000) * ((1 - batchRate) * outputPrice + batchRate * batchOutputPrice);

  const costPerRequest = effectiveInputCostPerRequest + effectiveOutputCostPerRequest;
  const monthlyRequestsPerUser = requestsPerUserDay * days;
  const costPerUserMonthly = costPerRequest * monthlyRequestsPerUser;

  const totalDailyRequests = requestsPerUserDay * users;
  const dailyCost = costPerRequest * totalDailyRequests;
  const weeklyCost = dailyCost * 7;
  const monthlyCost = dailyCost * days;
  const annualCost = monthlyCost * 12;

  const totalMonthlyRequests = totalDailyRequests * days;
  const totalMonthlyTokens = (inputTokens + outputTokens) * totalMonthlyRequests;

  const growth = Math.max(-0.9, sanitizeNumber(input.growthRateMonthly || 0));

  const projectMonth = (m: number) => {
    return monthlyCost * Math.pow(1 + growth, m - 1);
  };

  return {
    costPerRequest: sanitizeNumber(costPerRequest),
    costPerUserMonthly: sanitizeNumber(costPerUserMonthly),
    dailyCost: sanitizeNumber(dailyCost),
    weeklyCost: sanitizeNumber(weeklyCost),
    monthlyCost: sanitizeNumber(monthlyCost),
    annualCost: sanitizeNumber(annualCost),
    totalMonthlyRequests,
    totalMonthlyTokens,
    costForUsers: {
      100: sanitizeNumber(costPerUserMonthly * 100),
      1000: sanitizeNumber(costPerUserMonthly * 1000),
      10000: sanitizeNumber(costPerUserMonthly * 10000),
      100000: sanitizeNumber(costPerUserMonthly * 100000),
    },
    projections: {
      month1: sanitizeNumber(projectMonth(1)),
      month2: sanitizeNumber(projectMonth(2)),
      month3: sanitizeNumber(projectMonth(3)),
      month6: sanitizeNumber(projectMonth(6)),
      month12: sanitizeNumber(projectMonth(12)),
    },
  };
}

export interface SaasEconomicsInput {
  monthlyActiveUsers: number;
  paidConversionRatePercent: number;
  subscriptionPriceMonthly: number;
  requestsPerUserPerDay: number;
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  infrastructureCostMonthly?: number;
  paymentFeePercent?: number;
  otherFixedCostsMonthly?: number;
}

export interface SaasEconomicsResult {
  paidUsers: number;
  monthlyRevenue: number;
  totalMonthlyRequests: number;
  aiCostMonthly: number;
  infrastructureCostMonthly: number;
  paymentFeesMonthly: number;
  totalCostMonthly: number;
  grossProfitMonthly: number;
  grossMarginPercent: number;
  breakEvenPaidUsers: number;
  costPerPaidUserMonthly: number;
}

export function calculateSaasEconomics(input: SaasEconomicsInput): SaasEconomicsResult {
  const mau = sanitizeNumber(input.monthlyActiveUsers);
  const convRate = Math.min(100, Math.max(0, sanitizeNumber(input.paidConversionRatePercent))) / 100;
  const subPrice = sanitizeNumber(input.subscriptionPriceMonthly);
  const infraCost = sanitizeNumber(input.infrastructureCostMonthly || 0);
  const feePercent = Math.min(100, Math.max(0, sanitizeNumber(input.paymentFeePercent || 2.9))) / 100;
  const fixedCosts = sanitizeNumber(input.otherFixedCostsMonthly || 0);

  const paidUsers = Math.round(mau * convRate);
  const monthlyRevenue = paidUsers * subPrice;

  const workloadRes = calculateWorkloadCosts({
    inputTokensPerRequest: input.inputTokensPerRequest,
    outputTokensPerRequest: input.outputTokensPerRequest,
    requestsPerUserPerDay: input.requestsPerUserPerDay,
    monthlyActiveUsers: mau,
    inputPricePerMillion: input.inputPricePerMillion,
    outputPricePerMillion: input.outputPricePerMillion,
  });

  const aiCostMonthly = workloadRes.monthlyCost;
  const paymentFeesMonthly = monthlyRevenue * feePercent;
  const totalCostMonthly = aiCostMonthly + infraCost + paymentFeesMonthly + fixedCosts;

  const grossProfitMonthly = monthlyRevenue - totalCostMonthly;
  const grossMarginPercent = monthlyRevenue > 0 ? (grossProfitMonthly / monthlyRevenue) * 100 : 0;

  const costPerPaidUser = paidUsers > 0 ? totalCostMonthly / paidUsers : 0;
  const netRevenuePerUser = subPrice * (1 - feePercent);
  const variableCostPerUser = mau > 0 ? aiCostMonthly / mau : 0;
  const contributionPerPaidUser = netRevenuePerUser - variableCostPerUser;

  const breakEvenPaidUsers =
    contributionPerPaidUser > 0 ? Math.ceil((infraCost + fixedCosts) / contributionPerPaidUser) : Infinity;

  return {
    paidUsers,
    monthlyRevenue: sanitizeNumber(monthlyRevenue),
    totalMonthlyRequests: workloadRes.totalMonthlyRequests,
    aiCostMonthly: sanitizeNumber(aiCostMonthly),
    infrastructureCostMonthly: sanitizeNumber(infraCost),
    paymentFeesMonthly: sanitizeNumber(paymentFeesMonthly),
    totalCostMonthly: sanitizeNumber(totalCostMonthly),
    grossProfitMonthly: sanitizeNumber(grossProfitMonthly),
    grossMarginPercent: sanitizeNumber(grossMarginPercent),
    breakEvenPaidUsers: isFinite(breakEvenPaidUsers) ? breakEvenPaidUsers : 0,
    costPerPaidUserMonthly: sanitizeNumber(costPerPaidUser),
  };
}

