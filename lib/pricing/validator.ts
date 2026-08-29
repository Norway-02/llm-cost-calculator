import modelsData from '../../data/models.json';
import { ModelsDatasetSchema, ModelPricing } from './schema';
import { providerDefaultConfigs } from './index';

export interface ValidationIssue {
  type: 'error' | 'warning';
  modelId?: string;
  message: string;
}

export function validatePricingRegistry(): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  // 1. Zod Schema Check
  const parseResult = ModelsDatasetSchema.safeParse(modelsData);
  if (!parseResult.success) {
    issues.push({
      type: 'error',
      message: `Schema validation failed: ${parseResult.error.message}`,
    });
    return { valid: false, issues };
  }

  const models: ModelPricing[] = parseResult.data;
  const modelMap = new Map<string, ModelPricing>();
  const modelIdsSet = new Set<string>();
  const currentDateStr = new Date().toISOString().split('T')[0];

  // 2. Duplicate IDs and Strict Model Invariants
  for (const m of models) {
    if (modelIdsSet.has(m.id)) {
      issues.push({
        type: 'error',
        modelId: m.id,
        message: `Duplicate model ID: "${m.id}"`,
      });
    }
    modelIdsSet.add(m.id);
    modelMap.set(m.id, m);

    // Required fields check
    if (!m.id) issues.push({ type: 'error', message: 'Model missing ID' });
    if (!m.provider) issues.push({ type: 'error', modelId: m.id, message: 'Missing provider' });
    if (!m.lifecycle) issues.push({ type: 'error', modelId: m.id, message: 'Missing lifecycle' });
    if (typeof m.inputPricePerMillion !== 'number' || m.inputPricePerMillion < 0) {
      issues.push({ type: 'error', modelId: m.id, message: 'Invalid inputPricePerMillion' });
    }
    if (typeof m.outputPricePerMillion !== 'number' || m.outputPricePerMillion < 0) {
      issues.push({ type: 'error', modelId: m.id, message: 'Invalid outputPricePerMillion' });
    }

    // Invariant: Verified model must have official pricing sourceUrl
    if (m.status === 'verified' && !m.sourceUrl) {
      issues.push({ type: 'error', modelId: m.id, message: 'Verified model missing official pricing sourceUrl' });
    }
    if (!m.lastVerifiedDate) {
      issues.push({ type: 'error', modelId: m.id, message: 'Missing lastVerifiedDate' });
    }
    if (!m.effectiveDate) {
      issues.push({ type: 'error', modelId: m.id, message: 'Missing effectiveDate' });
    }

    // Invariant: Recommended model must be available
    if (m.recommendation === 'recommended' && m.availability !== 'available') {
      issues.push({
        type: 'error',
        modelId: m.id,
        message: `Recommended model "${m.id}" must have availability "available", but got "${m.availability}"`,
      });
    }

    // Invariant: Recommended model must have recommendationSourceUrl and recommendationVerifiedDate
    if (m.recommendation === 'recommended') {
      if (!m.recommendationSourceUrl) {
        issues.push({
          type: 'error',
          modelId: m.id,
          message: `Recommended model "${m.id}" is missing required recommendationSourceUrl`,
        });
      }
      if (!m.recommendationVerifiedDate) {
        issues.push({
          type: 'error',
          modelId: m.id,
          message: `Recommended model "${m.id}" is missing required recommendationVerifiedDate`,
        });
      }
    }

    // Invariant: Current model cannot have past shutdown date
    if (m.lifecycle === 'current' && m.shutdownDate && m.shutdownDate <= currentDateStr) {
      issues.push({
        type: 'error',
        modelId: m.id,
        message: `Current model "${m.id}" has already passed shutdown date (${m.shutdownDate})`,
      });
    }

    // Invariant: Shutdown model must have shutdownDate
    if (m.lifecycle === 'shutdown' && !m.shutdownDate) {
      issues.push({
        type: 'error',
        modelId: m.id,
        message: `Shutdown model "${m.id}" is missing required shutdownDate`,
      });
    }

    // Invariant: Deprecated model with past shutdown date must be marked shutdown
    if (m.lifecycle === 'deprecated' && m.shutdownDate && m.shutdownDate <= currentDateStr) {
      issues.push({
        type: 'error',
        modelId: m.id,
        message: `Deprecated model "${m.id}" has past shutdown date (${m.shutdownDate}) and must be marked lifecycle "shutdown"`,
      });
    }
  }

  // 3. Provider Default Configurations Invariants
  for (const cfg of providerDefaultConfigs) {
    const { provider, modelId, recommendationVerifiedDate, recommendationSourceUrl } = cfg;
    const model = modelMap.get(modelId);

    if (!model) {
      issues.push({
        type: 'error',
        message: `Provider default config for "${provider}" references non-existent model ID "${modelId}"`,
      });
      continue;
    }

    if (model.lifecycle !== 'current') {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) has non-current lifecycle: "${model.lifecycle}"`,
      });
    }

    if (model.availability !== 'available') {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) is not available: "${model.availability}"`,
      });
    }

    if (model.shutdownDate && model.shutdownDate <= currentDateStr) {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) has a shutdown date in the past: ${model.shutdownDate}`,
      });
    }

    if (model.recommendation !== 'recommended') {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) must have recommendation === "recommended", got "${model.recommendation}"`,
      });
    }

    if (!model.sourceUrl) {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) missing pricing sourceUrl`,
      });
    }

    if (!recommendationSourceUrl || !model.recommendationSourceUrl) {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) missing recommendationSourceUrl`,
      });
    }

    if (!recommendationVerifiedDate || !model.recommendationVerifiedDate) {
      issues.push({
        type: 'error',
        modelId,
        message: `Provider default for "${provider}" (${modelId}) missing recommendationVerifiedDate`,
      });
    }
  }

  // 4. Recursive Replacement Chain Validation
  for (const m of models) {
    if (m.replacementModelId) {
      const visited = new Set<string>([m.id]);
      let currId: string | undefined = m.replacementModelId;

      while (currId) {
        if (visited.has(currId)) {
          issues.push({
            type: 'error',
            modelId: m.id,
            message: `Cyclic replacement model chain detected starting at "${m.id}"`,
          });
          break;
        }
        visited.add(currId);

        const targetModel = modelMap.get(currId);
        if (!targetModel) {
          issues.push({
            type: 'error',
            modelId: m.id,
            message: `Model "${m.id}" references non-existent replacement model ID "${currId}"`,
          });
          break;
        }

        if (targetModel.availability !== 'available') {
          issues.push({
            type: 'error',
            modelId: m.id,
            message: `Model "${m.id}" replacement chain terminates at unavailable model "${targetModel.id}" (${targetModel.availability})`,
          });
          break;
        }

        if (targetModel.lifecycle === 'shutdown') {
          issues.push({
            type: 'error',
            modelId: m.id,
            message: `Model "${m.id}" replacement chain terminates at shutdown model "${targetModel.id}"`,
          });
          break;
        }

        if (targetModel.lifecycle === 'deprecated') {
          issues.push({
            type: 'error',
            modelId: m.id,
            message: `Model "${m.id}" replacement chain terminates at deprecated model "${targetModel.id}"`,
          });
          break;
        }

        currId = targetModel.replacementModelId;
      }
    }
  }

  const errors = issues.filter((i) => i.type === 'error');
  return { valid: errors.length === 0, issues };
}
