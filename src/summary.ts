import * as core from '@actions/core';
import { isRunningInGitHubActions } from './config.js';
import type { Card } from './types.js';

const ACTION_URL = 'https://github.com/marketplace/actions/wakatime-gist';
const ACTION_VERSION = '3.0';

type SummaryTableCell = { data: string; header?: boolean } | string;
type SummaryTableRow = SummaryTableCell[];

function buildSummaryTable(card: Card): SummaryTableRow[] {
  return [
    [{ data: 'Action', header: true }, { data: 'Result', header: true }],
    ['Card', card],
    ['Statistics received', '\u2714'],
    ['Gist updated', '\u2714'],
  ];
}

export async function printSummary(shouldWrite: boolean, card: Card): Promise<void> {
  if (!isRunningInGitHubActions()) {
    printToConsole(card);
    return;
  }

  const table = buildSummaryTable(card);

  const summary = core.summary
    .addHeading('Results')
    .addTable(table)
    .addBreak()
    .addLink(`WakaTime-Gist/${ACTION_VERSION}`, ACTION_URL);

  if (shouldWrite) {
    await summary.write();
  } else {
    console.log(summary.stringify());
  }
}

function printToConsole(card: Card): void {
  console.log('\n=== WakaTime Statistics ===');
  console.log(`Card: ${card}`);
  console.log('Statistics received: OK');
  console.log('Gist updated: OK');
  console.log('===========================\n');
}

