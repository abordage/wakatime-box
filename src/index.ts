import * as core from '@actions/core';
import { getInputs, isRunningInGitHubActions, loadEnvForLocalDev } from './config.js';
import { fetchStatistics } from './wakatime.js';
import {
  cardMeasure,
  emptyCardMessage,
  generateGistContent,
  generateTitle,
  rowsForCard,
  updateGist,
} from './gist.js';
import { printSummary } from './summary.js';

async function run(): Promise<void> {
  await loadEnvForLocalDev();

  const inputs = getInputs();

  console.log(`Fetching WakaTime statistics (${inputs.dateRange}, ${inputs.card})...`);

  const stats = await fetchStatistics(
    inputs.wakatimeBaseUrl,
    inputs.dateRange,
    inputs.wakatimeApiKey
  );

  const rows = rowsForCard(stats, inputs.card);
  if (rows.length === 0) {
    console.log(emptyCardMessage(inputs.card));
    return;
  }

  const content = generateGistContent(
    rows,
    inputs.maxResult,
    inputs.useOldFormat,
    cardMeasure(inputs.card)
  );
  const updateDate = new Date().toLocaleDateString('en-us', {
    day: 'numeric',
    year: 'numeric',
    month: 'short',
  });
  const title = generateTitle(inputs.dateRange, updateDate, inputs.card);

  await updateGist(inputs.ghToken, inputs.gistId, title, content);

  console.log('Gist updated successfully!');

  await printSummary(inputs.printSummary, inputs.card);
}

run().catch((error: Error) => {
  if (isRunningInGitHubActions()) {
    core.setFailed(`Action failed: ${error.message}`);
  } else {
    console.error('Error:', error.message);
    process.exit(1);
  }
});
