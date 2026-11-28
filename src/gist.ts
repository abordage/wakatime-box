import { Octokit } from '@octokit/rest';
import { formatLine } from './formatLine.js';
import type { Card, DateRange, Measure, StatRow, WakaTimeModel, WakaTimeStats } from './types.js';
import { OTHER_LANGUAGES } from './types.js';

const RANGE_LABELS: Record<DateRange, string> = {
  last_7_days: 'weekly',
  last_30_days: 'monthly',
  last_6_months: '6-month',
  last_year: 'yearly',
  all_time: 'all-time',
};

const CARD_SUBJECTS: Record<Card, string> = {
  languages: 'stack',
  models: 'AI',
};

export function cardMeasure(card: Card): Measure {
  return card === 'models' ? 'lines' : 'time';
}

export function emptyCardMessage(card: Card): string {
  if (card === 'models') {
    return 'No AI model statistics for the selected time period. Gist not updated.';
  }

  return 'No statistics for the selected time period. Gist not updated.';
}

export function generateTitle(dateRange: DateRange, updateDate: string, card: Card): string {
  const label = RANGE_LABELS[dateRange] ?? 'latest';
  return `My ${label} ${CARD_SUBJECTS[card]} [update ${updateDate}]`;
}

export function rowsForCard(stats: WakaTimeStats, card: Card): StatRow[] {
  if (card === 'models') {
    return modelRows(stats.models);
  }

  return stats.languages.map((language) => ({
    name: language.name,
    amount: language.total_seconds,
    percent: language.percent,
  }));
}

export function generateGistContent(
  rows: StatRow[],
  maxResult: number,
  useOldFormat: boolean,
  measure: Measure
): string {
  const mergeNames: readonly string[] = measure === 'time' ? OTHER_LANGUAGES : [];
  let otherAmount = 0;
  let otherPercent = 0;
  const lines: string[] = [];

  for (const row of rows) {
    const isMerged = mergeNames.includes(row.name);
    const isOverLimit = lines.length >= maxResult - 1;

    if (isMerged || isOverLimit) {
      otherAmount += row.amount;
      otherPercent += row.percent;
      continue;
    }

    lines.push(formatLine(row.name, row.amount, row.percent, useOldFormat, measure));
  }

  if (otherAmount > 0 || otherPercent > 0) {
    lines.push(formatLine('Other', otherAmount, otherPercent, useOldFormat, measure));
  }

  return lines.join('\n');
}

export async function updateGist(
  token: string,
  gistId: string,
  title: string,
  content: string
): Promise<void> {
  const octokit = new Octokit({ auth: token });

  const gist = await octokit.gists.get({ gist_id: gistId });
  const files = gist.data.files;

  if (!files) {
    throw new Error('Gist has no files');
  }

  const filename = Object.keys(files)[0];
  if (!filename) {
    throw new Error('Gist filename not found');
  }

  await octokit.gists.update({
    gist_id: gistId,
    files: {
      [filename]: {
        filename: title,
        content,
      },
    },
  });
}

function modelRows(models: WakaTimeModel[]): StatRow[] {
  const totals = new Map<string, number>();

  for (const model of models) {
    const name = model.name.trim();
    if (name === '' || !Number.isFinite(model.lines)) {
      continue;
    }

    totals.set(name, (totals.get(name) ?? 0) + model.lines);
  }

  const ranked = [...totals.entries()]
    .map(([name, lines]) => ({ name, lines: Math.round(lines) }))
    .filter((model) => model.lines > 0)
    .sort((left, right) => right.lines - left.lines || left.name.localeCompare(right.name));

  const total = ranked.reduce((sum, model) => sum + model.lines, 0);

  return ranked.map((model) => ({
    name: model.name,
    amount: model.lines,
    percent: total === 0 ? 0 : (model.lines / total) * 100,
  }));
}
