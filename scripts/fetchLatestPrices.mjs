import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsPath = path.resolve(__dirname, '../data/models.json');
const tmpModelsPath = path.resolve(__dirname, '../data/models.tmp.json');

const IS_DRY_RUN = process.argv.includes('--dry-run');
const TODAY = new Date().toISOString().split('T')[0];

console.log(`🌐 Automated Daily Pricing Synchronization Started (${TODAY})...`);
if (IS_DRY_RUN) {
  console.log('🔍 DRY-RUN MODE ACTIVE: No file system changes will be persisted.');
}

const syncMetadataPath = path.resolve(__dirname, '../data/sync-metadata.json');

function updateSyncMetadata({ status, modelsChecked = 0, modelsUpdated = 0, lastError = null }) {
  const nowIso = new Date().toISOString();
  let currentMetadata = {
    lastAttemptAt: nowIso,
    lastSuccessfulSyncAt: nowIso,
    status: 'success',
    modelsChecked: 0,
    modelsUpdated: 0,
    lastError: null,
  };

  try {
    if (fs.existsSync(syncMetadataPath)) {
      currentMetadata = JSON.parse(fs.readFileSync(syncMetadataPath, 'utf8'));
    }
  } catch {
    // fallback
  }

  if (status === 'success') {
    currentMetadata.lastAttemptAt = nowIso;
    currentMetadata.lastSuccessfulSyncAt = nowIso;
    currentMetadata.status = 'success';
    currentMetadata.modelsChecked = modelsChecked;
    currentMetadata.modelsUpdated = modelsUpdated;
    currentMetadata.lastError = null;
  } else {
    currentMetadata.lastAttemptAt = nowIso;
    currentMetadata.status = 'failed';
    currentMetadata.lastError = lastError || 'Synchronization pipeline failed';
    // IMPORTANT: lastSuccessfulSyncAt remains unchanged!
  }

  if (!IS_DRY_RUN) {
    fs.writeFileSync(syncMetadataPath, JSON.stringify(currentMetadata, null, 2) + '\n', 'utf8');
    console.log(`✓ Sync Metadata updated: status=${currentMetadata.status}, lastSuccessfulSyncAt=${currentMetadata.lastSuccessfulSyncAt}`);
  } else {
    console.log(`🔍 [DRY-RUN] Sync Metadata would be updated: status=${currentMetadata.status}`);
  }
}

// 1. Fail-Closed Remote Fetch
async function fetchLiveInternetPricing() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    if (!json || !Array.isArray(json.data)) {
      throw new Error('Malformed API payload: missing data array');
    }
    if (json.data.length < 50) {
      throw new Error(`Incomplete catalog retrieved (${json.data.length} models < 50 minimum threshold)`);
    }
    return json.data;
  } catch (err) {
    console.error(`❌ FAIL-CLOSED: External provider pricing fetch failed: ${err.message}`);
    updateSyncMetadata({ status: 'failed', lastError: err.message });
    process.exit(1);
  }
}

function normalizePricePerMillion(rawTokenPrice) {
  if (rawTokenPrice === null || rawTokenPrice === undefined) return 0;
  const price = Number(rawTokenPrice);
  if (isNaN(price) || !isFinite(price) || price < 0) return 0;
  // Convert per-token price to per 1,000,000 tokens price
  const perMillion = Math.round(price * 1_000_000 * 10000) / 10000;
  return Math.max(0, perMillion);
}

function isPriceAnomaly(oldPrice, newPrice) {
  if (oldPrice <= 0 || newPrice <= 0) {
    // Zero price anomaly check for established paid models
    if (oldPrice > 0 && newPrice === 0) return true;
    return false;
  }

  const ratio = newPrice / oldPrice;
  // Flag as anomaly if price jumps > 10x (1000%) or drops > 10x (< 10%)
  if (ratio > 10 || ratio < 0.1) {
    return true;
  }

  return false;
}

async function runAutoIngestion() {
  const originalRaw = fs.readFileSync(modelsPath, 'utf8');
  const modelsData = JSON.parse(originalRaw);

  const liveModels = await fetchLiveInternetPricing();
  console.log(`✓ Retried catalog: ${liveModels.length} models fetched from API provider sources.`);

  let updatedCount = 0;
  let unchangedCount = 0;
  let anomaliesCount = 0;
  const changesReport = [];

  // Deep clone modelsData for safe atomic operations
  const workingDataset = JSON.parse(JSON.stringify(modelsData));

  for (const m of workingDataset) {
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

      const oldInput = m.inputPricePerMillion;
      const oldOutput = m.outputPricePerMillion;

      // Anomaly detection check before accepting new price
      const inputAnomaly = isPriceAnomaly(oldInput, liveInputPrice);
      const outputAnomaly = isPriceAnomaly(oldOutput, liveOutputPrice);

      if (inputAnomaly || outputAnomaly) {
        console.warn(`⚠️ [ANOMALY REJECTED] ${m.provider} ${m.modelName} (${m.id}): Proposed Input $${liveInputPrice} (was $${oldInput}), Output $${liveOutputPrice} (was $${oldOutput}). Retaining current rates.`);
        anomaliesCount++;
        unchangedCount++;
        continue;
      }

      if (liveInputPrice > 0 || liveOutputPrice > 0) {
        if (oldInput !== liveInputPrice || oldOutput !== liveOutputPrice) {
          changesReport.push(`- ${m.provider} ${m.modelName} (${m.id}): Input $${oldInput} -> $${liveInputPrice}, Output $${oldOutput} -> $${liveOutputPrice}`);
          m.inputPricePerMillion = liveInputPrice;
          m.outputPricePerMillion = liveOutputPrice;
          m.lastVerifiedDate = TODAY;
          updatedCount++;
          continue;
        }
      }
    }

    unchangedCount++;
  }

  // Reporting Summary
  console.log('\n====================================================');
  console.log('Automated Daily Pricing Synchronization Summary');
  console.log('====================================================');
  console.log(`Date:                       ${TODAY}`);
  console.log(`Providers/Models Processed: ${workingDataset.length}`);
  console.log(`Models Changed:             ${updatedCount}`);
  console.log(`Models Unchanged:           ${unchangedCount}`);
  console.log(`Anomalies Filtered:         ${anomaliesCount}`);
  console.log('----------------------------------------------------');

  if (changesReport.length > 0) {
    console.log('Detected Price Changes:');
    changesReport.forEach((msg) => console.log(msg));
  }

  // 4. Atomic Replace or No-Op Handling
  if (updatedCount === 0) {
    console.log('\n[NO-OP] No pricing rate changes detected across provider catalogs.');
    console.log('Updating sync metadata freshness timestamp without modifying data/models.json.');
    updateSyncMetadata({
      status: 'success',
      modelsChecked: workingDataset.length,
      modelsUpdated: 0,
    });
    console.log('====================================================\n');
    process.exit(0);
  }

  // Write to temporary file first
  fs.writeFileSync(tmpModelsPath, JSON.stringify(workingDataset, null, 2) + '\n', 'utf8');

  // Validate temporary file
  try {
    console.log('Running pricing invariants validator on temporary dataset...');
    execSync(`node scripts/validatePricing.mjs "${tmpModelsPath}"`, { stdio: 'inherit' });
    console.log('✓ Validation Result: PASS');

    if (IS_DRY_RUN) {
      console.log('\n[DRY-RUN COMPLETE] Validation passed. Temporary dataset unlinked without replacing data/models.json.');
      fs.unlinkSync(tmpModelsPath);
      updateSyncMetadata({
        status: 'success',
        modelsChecked: workingDataset.length,
        modelsUpdated: updatedCount,
      });
      process.exit(0);
    }

    // Atomic replace
    fs.renameSync(tmpModelsPath, modelsPath);
    updateSyncMetadata({
      status: 'success',
      modelsChecked: workingDataset.length,
      modelsUpdated: updatedCount,
    });
    console.log('✓ Atomic Replacement: data/models.json successfully updated.');
    console.log('\nDisclaimer: The model dataset reflects pricing rates retrieved from configured API provider catalogs and official pricing documentation at the time of the latest successful automated daily sync and validation check.');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ FAIL-CLOSED: Temporary dataset validation failed. Unlinking tmp file and failing workflow.');
    if (fs.existsSync(tmpModelsPath)) {
      fs.unlinkSync(tmpModelsPath);
    }
    updateSyncMetadata({
      status: 'failed',
      modelsChecked: workingDataset.length,
      modelsUpdated: 0,
      lastError: err.message || 'Validation failed',
    });
    process.exit(1);
  }
}

runAutoIngestion();
