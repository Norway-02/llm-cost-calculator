import React from 'react';
import { ModelPricing, getEffectiveFreshnessStatus, formatDateUTC } from '@/lib/pricing/schema';
import { Badge } from './ui/Badge';

export interface PricingFreshnessBadgeProps {
  model: ModelPricing;
}

export const PricingFreshnessBadge: React.FC<PricingFreshnessBadgeProps> = ({ model }) => {
  const status = getEffectiveFreshnessStatus(model);

  const formattedDate = formatDateUTC(model.lastVerifiedDate);

  const statusLabels: Record<ModelPricing['status'], string> = {
    verified: `Pricing verified ${formattedDate}`,
    stale: `Outdated (Verified ${formattedDate})`,
    scheduled: `Scheduled Change (${formattedDate})`,
    unverified: `Unverified Pricing`,
  };

  return <Badge variant={status}>{statusLabels[status]}</Badge>;
};
