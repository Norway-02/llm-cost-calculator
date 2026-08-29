import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsPath = path.resolve(__dirname, '../data/models.json');
const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

const providerDefaultConfigs = [
  {
    provider: 'OpenAI',
    modelId: 'gpt-4o',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://platform.openai.com/docs/models',
  },
  {
    provider: 'Anthropic',
    modelId: 'claude-sonnet-5',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
  },
  {
    provider: 'Google',
    modelId: 'gemini-3.7-flash',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
  },
  {
    provider: 'DeepSeek',
    modelId: 'deepseek-v4-flash',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://www.deepseek.com/pricing',
  },
  {
    provider: 'Meta',
    modelId: 'llama-3-3-70b',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://www.llama.com/docs/models',
  },
  {
    provider: 'Mistral',
    modelId: 'mistral-large-2',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://docs.mistral.ai/models',
  },
  {
    provider: 'Cohere',
    modelId: 'command-a-plus-05-2026',
    recommendationVerifiedDate: '2026-08-24',
    recommendationSourceUrl: 'https://docs.cohere.com/docs/models',
  },
];

const issues = [];
const modelMap = new Map();
const modelIdsSet = new Set();
const currentDateStr = new Date().toISOString().split('T')[0];

console.log('Running LLM Pricing Dataset & Invariants Validator...');

// 1. Duplicate IDs & Basic Fields
for (const m of modelsData) {
  if (modelIdsSet.has(m.id)) {
    issues.push(`Duplicate model ID: "${m.id}"`);
  }
  modelIdsSet.add(m.id);
  modelMap.set(m.id, m);

  if (!m.id) issues.push('Model missing ID');
  if (!m.provider) issues.push(`(${m.id}) Missing provider`);
  if (!m.lifecycle) issues.push(`(${m.id}) Missing lifecycle`);
  if (typeof m.inputPricePerMillion !== 'number' || m.inputPricePerMillion < 0) {
    issues.push(`(${m.id}) Invalid inputPricePerMillion`);
  }
  if (typeof m.outputPricePerMillion !== 'number' || m.outputPricePerMillion < 0) {
    issues.push(`(${m.id}) Invalid outputPricePerMillion`);
  }
  if (m.status === 'verified' && !m.sourceUrl) issues.push(`(${m.id}) Missing official pricing sourceUrl`);
  if (!m.lastVerifiedDate) issues.push(`(${m.id}) Missing lastVerifiedDate`);
  if (!m.effectiveDate) issues.push(`(${m.id}) Missing effectiveDate`);

  // Invariant: Recommended model must be available
  if (m.recommendation === 'recommended' && m.availability !== 'available') {
    issues.push(`Recommended model "${m.id}" must have availability "available", but got "${m.availability}"`);
  }

  // Invariant: Recommended model must have recommendationSourceUrl and recommendationVerifiedDate
  if (m.recommendation === 'recommended') {
    if (!m.recommendationSourceUrl) {
      issues.push(`Recommended model "${m.id}" missing required recommendationSourceUrl`);
    }
    if (!m.recommendationVerifiedDate) {
      issues.push(`Recommended model "${m.id}" missing required recommendationVerifiedDate`);
    }
  }

  // Invariant: Reject shutdown models marked current
  if (m.lifecycle === 'current' && m.shutdownDate && m.shutdownDate <= currentDateStr) {
    issues.push(`Current model "${m.id}" has already passed shutdown date (${m.shutdownDate})`);
  }

  // Invariant: Require shutdownDate for shutdown models
  if (m.lifecycle === 'shutdown' && !m.shutdownDate) {
    issues.push(`Shutdown model "${m.id}" is missing required shutdownDate`);
  }

  // Invariant: Deprecated model with past shutdown date must be marked shutdown
  if (m.lifecycle === 'deprecated' && m.shutdownDate && m.shutdownDate <= currentDateStr) {
    issues.push(`Deprecated model "${m.id}" has past shutdown date (${m.shutdownDate}) and must be marked lifecycle "shutdown"`);
  }
}

// 2. Provider Default Configurations Invariants
for (const cfg of providerDefaultConfigs) {
  const { provider, modelId, recommendationVerifiedDate, recommendationSourceUrl } = cfg;
  const model = modelMap.get(modelId);

  if (!model) {
    issues.push(`Provider default config for "${provider}" references non-existent model ID "${modelId}"`);
    continue;
  }

  if (model.lifecycle !== 'current') {
    issues.push(`Provider default for "${provider}" (${modelId}) has non-current lifecycle: "${model.lifecycle}"`);
  }

  if (model.availability !== 'available') {
    issues.push(`Provider default for "${provider}" (${modelId}) is not available: "${model.availability}"`);
  }

  if (model.shutdownDate && model.shutdownDate <= currentDateStr) {
    issues.push(`Provider default for "${provider}" (${modelId}) has a shutdown date in the past: ${model.shutdownDate}`);
  }

  if (model.recommendation !== 'recommended') {
    issues.push(`Provider default for "${provider}" (${modelId}) must have recommendation === "recommended", got "${model.recommendation}"`);
  }

  if (!model.sourceUrl) {
    issues.push(`Provider default for "${provider}" (${modelId}) missing pricing sourceUrl`);
  }

  if (!recommendationSourceUrl || !model.recommendationSourceUrl) {
    issues.push(`Provider default for "${provider}" (${modelId}) missing recommendationSourceUrl`);
  }

  if (!recommendationVerifiedDate || !model.recommendationVerifiedDate) {
    issues.push(`Provider default for "${provider}" (${modelId}) missing recommendationVerifiedDate`);
  }
}

// 3. Recursive Replacement Chain Validation
for (const m of modelsData) {
  if (m.replacementModelId) {
    const visited = new Set([m.id]);
    let currId = m.replacementModelId;

    while (currId) {
      if (visited.has(currId)) {
        issues.push(`Cyclic replacement chain starting at "${m.id}"`);
        break;
      }
      visited.add(currId);

      const targetModel = modelMap.get(currId);
      if (!targetModel) {
        issues.push(`Model "${m.id}" references non-existent replacement model ID "${currId}"`);
        break;
      }

      if (targetModel.availability !== 'available') {
        issues.push(`Model "${m.id}" replacement chain terminates at unavailable model "${targetModel.id}" (${targetModel.availability})`);
        break;
      }

      if (targetModel.lifecycle === 'shutdown') {
        issues.push(`Model "${m.id}" replacement chain terminates at shutdown model "${targetModel.id}"`);
        break;
      }

      if (targetModel.lifecycle === 'deprecated') {
        issues.push(`Model "${m.id}" replacement chain terminates at deprecated model "${targetModel.id}"`);
        break;
      }

      currId = targetModel.replacementModelId;
    }
  }
}

if (issues.length > 0) {
  console.error('\n❌ VALIDATION ERRORS FOUND:');
  issues.forEach((msg) => console.error(`- ${msg}`));
  process.exit(1);
} else {
  console.log('✅ ALL PRICING INVARIANTS AND PROVIDER DEFAULTS PASSED VALIDATION!');
  process.exit(0);
}
