import * as core from '@actions/core';
import { getInputs, isRunningInGitHubActions, loadEnvForLocalDev } from './config.js';
import { fetchStatistics } from './wakatime.js';
import { generateGistContent, generateTitle, updateGist } from './gist.js';
import { printSummary } from './summary.js';

async function run(): Promise<void> {
  await loadEnvForLocalDev();

  const inputs = getInputs();

  console.log(`Fetching WakaTime statistics (${inputs.dateRange})...`);

  const languages = await fetchStatistics(
    inputs.wakatimeBaseUrl,
    inputs.dateRange,
    inputs.wakatimeApiKey
  );

  if (languages.length === 0) {
    console.log('No statistics for the selected time period. Gist not updated.');
    return;
  }

  const content = generateGistContent(languages, inputs.maxResult, inputs.useOldFormat);
  const updateDate = new Date().toLocaleDateString('en-us', {
    day: 'numeric',
    year: 'numeric',
    month: 'short',
  });
  const title = generateTitle(inputs.dateRange, updateDate);

  await updateGist(inputs.ghToken, inputs.gistId, title, content);

  console.log('Gist updated successfully!');

  await printSummary(inputs.printSummary);
}

run().catch((error: Error) => {
  if (isRunningInGitHubActions()) {
    core.setFailed(`Action failed: ${error.message}`);
  } else {
    console.error('Error:', error.message);
    process.exit(1);
  }
});
