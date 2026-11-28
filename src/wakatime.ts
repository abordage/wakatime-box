import { HttpClient } from '@actions/http-client';
import { authorizationHeader } from './authorization.js';
import type { DateRange, WakaTimeLanguage, WakaTimeModel, WakaTimeStats } from './types.js';

const USER_AGENT = 'WakaTime-Gist/3.0 +https://github.com/marketplace/actions/wakatime-gist';
const DEFAULT_STATS_ATTEMPTS = 3;
const DEFAULT_STATS_RETRY_DELAY_MS = 2000;

interface LoadStatsOptions {
  attempts?: number;
  retryDelayMs?: number;
  wait?: (ms: number) => Promise<void>;
  warn?: (message: string) => void;
}

export async function fetchStatistics(
  baseUrl: string,
  dateRange: DateRange,
  apiKey: string
): Promise<WakaTimeStats> {
  const httpClient = new HttpClient(USER_AGENT);
  const authHeader = authorizationHeader(apiKey);

  return loadCurrentStats(async () => {
    const response = await httpClient.getJson<{ data?: unknown }>(
      `${baseUrl}/users/current/stats/${dateRange}`,
      { Authorization: authHeader }
    );

    return readStats(response.result?.data);
  });
}

export async function loadCurrentStats(
  load: () => Promise<WakaTimeStats>,
  options: LoadStatsOptions = {}
): Promise<WakaTimeStats> {
  const attempts = options.attempts ?? DEFAULT_STATS_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_STATS_RETRY_DELAY_MS;
  const wait = options.wait ?? delay;
  const warn = options.warn ?? console.warn;

  let latest: WakaTimeStats | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    latest = await load();
    if (latest.isUpToDate || attempt === attempts) {
      if (!latest.isUpToDate) {
        warn('WakaTime stats are not up to date. Using the latest response.');
      }
      return latest;
    }

    warn(`WakaTime stats are not up to date (attempt ${attempt} of ${attempts}). Retrying...`);
    await wait(retryDelayMs);
  }

  throw new Error('Empty response from WakaTime API');
}

export function readStats(data: unknown): WakaTimeStats {
  if (!isRecord(data)) {
    throw new Error('Empty response from WakaTime API');
  }

  const languages = Array.isArray(data.languages) ? parseLanguages(data.languages) : null;
  const models = parseModels(data);
  const sawModels = Array.isArray(data.ai_model_breakdown) || isRecord(data.ai_model_line_changes);

  if (languages === null && !sawModels) {
    throw new Error('Empty response from WakaTime API');
  }

  return {
    languages: languages ?? [],
    models,
    isUpToDate: data.is_up_to_date !== false,
  };
}

function parseLanguages(value: unknown[]): WakaTimeLanguage[] {
  const languages: WakaTimeLanguage[] = [];

  for (const item of value) {
    if (!isRecord(item) || typeof item.name !== 'string') {
      continue;
    }

    const totalSeconds = finiteNumber(item.total_seconds);
    const percent = finiteNumber(item.percent);
    if (totalSeconds === null || percent === null) {
      continue;
    }

    languages.push({
      name: item.name,
      total_seconds: totalSeconds,
      percent,
    });
  }

  return languages;
}

function parseModels(data: Record<string, unknown>): WakaTimeModel[] {
  const breakdown = parseBreakdown(data.ai_model_breakdown);
  if (breakdown.length > 0) {
    return breakdown;
  }

  return parseLineChangeMap(data.ai_model_line_changes);
}

function parseBreakdown(value: unknown): WakaTimeModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const models: WakaTimeModel[] = [];

  for (const item of value) {
    if (!isRecord(item) || typeof item.name !== 'string') {
      continue;
    }

    const lines = finiteNumber(item.lines);
    if (lines === null || lines <= 0) {
      continue;
    }

    models.push({ name: item.name, lines });
  }

  return models;
}

function parseLineChangeMap(value: unknown): WakaTimeModel[] {
  if (!isRecord(value)) {
    return [];
  }

  const models: WakaTimeModel[] = [];

  for (const [name, rawLines] of Object.entries(value)) {
    const lines = finiteNumber(rawLines);
    if (lines === null || lines <= 0) {
      continue;
    }

    models.push({ name, lines });
  }

  return models;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
