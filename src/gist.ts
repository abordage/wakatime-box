import { Octokit } from '@octokit/rest';
import { formatLine } from './formatLine.js';
import type { DateRange, WakaTimeLanguage } from './types.js';
import { OTHER_LANGUAGES } from './types.js';

export function generateTitle(dateRange: DateRange, updateDate: string): string {
  const rangeLabels: Record<DateRange, string> = {
    last_7_days: 'weekly',
    last_30_days: 'monthly',
    last_6_months: '6-month',
    last_year: 'yearly',
    all_time: 'all-time',
  };

  const label = rangeLabels[dateRange] ?? 'latest';
  return `My ${label} stack [update ${updateDate}]`;
}

export function generateGistContent(
  languages: WakaTimeLanguage[],
  maxResult: number,
  useOldFormat: boolean
): string {
  let otherTotalSeconds = 0;
  let otherPercent = 0;

  const lines: string[] = [];

  for (const lang of languages) {
    const isOtherLanguage = OTHER_LANGUAGES.includes(lang.name as typeof OTHER_LANGUAGES[number]);
    const isOverLimit = lines.length >= maxResult - 1;

    if (isOtherLanguage || isOverLimit) {
      otherTotalSeconds += lang.total_seconds;
      otherPercent += lang.percent;
      continue;
    }

    lines.push(formatLine(lang.name, lang.total_seconds, lang.percent, useOldFormat));
  }

  if (otherTotalSeconds > 0 || otherPercent > 0) {
    lines.push(formatLine('Other', otherTotalSeconds, otherPercent, useOldFormat));
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

