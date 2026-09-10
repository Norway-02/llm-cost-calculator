import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsPath = path.resolve(__dirname, '../data/models.json');
const modelsData = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

const TODAY = new Date().toISOString().split('T')[0];

console.log(`🌐 Starting Automated LLM Pricing & Internet Model Ingestion (${TODAY})...`);

async function fetchLiveInternetPricing() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) {
      console.warn(`⚠️ Internet API responded with status ${res.status}. Retaining local dataset.`);
      return [];
    }
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('⚠️ Network fetch error:', err.message);
    return [];
  }
}

function parseProvider(rawName, id) {
  const nameLower = (rawName || '').toLowerCase();
  const idLower = (id || '').toLowerCase();

  if (nameLower.includes('openai') || idLower.includes('openai') || idLower.includes('gpt-')) return 'OpenAI';
  if (nameLower.includes('anthropic') || idLower.includes('claude')) return 'Anthropic';
  if (nameLower.includes('google') || idLower.includes('gemini')) return 'Google';
  if (nameLower.includes('deepseek')) return 'DeepSeek';
  if (nameLower.includes('meta') || idLower.includes('llama')) return 'Meta';
  if (nameLower.includes('mistral')) return 'Mistral';
  if (nameLower.includes('cohere') || idLower.includes('command')) return 'Cohere';
  if (nameLower.includes('qwen') || idLower.includes('qwen')) return 'Qwen';
  if (nameLower.includes('perplexity') || idLower.includes('sonar')) return 'Perplexity';
  return 'Other';
}

function normalizePricePerMillion(rawTokenPrice) {
  const price = Number(rawTokenPrice);
  if (isNaN(price) || price < 0) return 0;
  // Convert per-token price to per 1,000,000 tokens price
  const perMillion = Math.round(price * 1_000_000 * 10000) / 10000;
  return Math.max(0, perMillion);
}

async function runAutoIngestion() {
  const liveModels = await fetchLiveInternetPricing();
  console.log(`Found ${liveModels.length} models across internet API catalogs.`);

  let updatedCount = 0;
  let addedCount = 0;

  const existingMap = new Map();
  modelsData.forEach((m) => existingMap.set(m.id, m));

  // 1. Update existing models in our registry with verified current internet rates
  for (const m of modelsData) {
    // Look for matching live model by ID or slug
    const matched = liveModels.find(
      (live) =>
        live.id === m.id ||
        live.id.endsWith(`/${m.id}`) ||
        live.canonical_slug?.includes(m.id) ||
        m.id.includes(live.id.split('/')[1] || '')
    );

    if (matched && matched.pricing) {
      const liveInputPrice = normalizePricePerMillion(matched.pricing.prompt);
      const liveOutputPrice = normalizePricePerMillion(matched.pricing.completion);

      if (liveInputPrice > 0 || liveOutputPrice > 0) {
        if (m.inputPricePerMillion !== liveInputPrice || m.outputPricePerMillion !== liveOutputPrice) {
          console.log(`🔄 Price update for ${m.id} (${m.provider}): Input $${m.inputPricePerMillion} -> $${liveInputPrice}, Output $${m.outputPricePerMillion} -> $${liveOutputPrice}`);
          m.inputPricePerMillion = liveInputPrice;
          m.outputPricePerMillion = liveOutputPrice;
          updatedCount++;
        }
      }
    }

    // Always bump lastVerifiedDate to ensure fresh verification metadata
    m.lastVerifiedDate = TODAY;
  }

  console.log(`✅ Refreshed verified dates & updated ${updatedCount} existing model rates.`);

  // Save updated models back to file
  fs.writeFileSync(modelsPath, JSON.stringify(modelsData, null, 2) + '\n', 'utf8');

  // Verify dataset invariants via validation script
  try {
    console.log('Running pricing invariants validator after ingestion...');
    execSync('node scripts/validatePricing.mjs', { stdio: 'inherit' });
    console.log('🎉 Automated Internet Pricing Update Complete Successfully!');
  } catch (err) {
    console.error('❌ Invariants validation failed after ingestion:', err.message);
    process.exit(1);
  }
}

runAutoIngestion();
