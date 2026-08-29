'use client';

import React from 'react';
import { ModelPricing, getEffectiveFreshnessStatus } from '@/lib/pricing/schema';
import { Badge } from './ui/Badge';

export interface PricingFreshnessBadgeProps {
  model: ModelPricing;
}

export const PricingFreshnessBadge: React.FC<PricingFreshnessBadgeProps> = ({ model }) => {
  const status = getEffectiveFreshnessStatus(model);

  const statusLabels: Record<ModelPricing['status'], string> = {
    verified: `Verified (${model.lastVerifiedDate})`,
    stale: `Outdated (Last verified ${model.lastVerifiedDate})`,
    scheduled: `Scheduled Change`,
    unverified: `Unverified Pricing`,
  };

  return <Badge variant={status}>{statusLabels[status]}</Badge>;
};
