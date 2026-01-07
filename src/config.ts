import * as core from '@actions/core';
import { DATE_RANGES, type ActionInputs, type DateRange } from './types.js';

const DEFAULT_WAKATIME_BASE_URL = 'https://wakatime.com/api/v1';
const DEFAULT_MAX_RESULT = 5;
const DEFAULT_DATE_RANGE: DateRange = 'last_7_days';

export function isRunningInGitHubActions(): boolean {
  return process.env.GITHUB_ACTIONS === 'true';
}

function getInput(key: string, required = false): string {
  if (isRunningInGitHubActions()) {
    return core.getInput(key, { required });
  }
  return process.env[key] ?? '';
}

function getInputWithDefault(key: string, defaultValue: string): string {
  const value = getInput(key, false);
  return value === '' ? defaultValue : value;
}

function getBooleanInput(key: string, defaultValue: boolean): boolean {
  if (isRunningInGitHubActions()) {
    const value = core.getInput(key);
    if (value === '') {
      return defaultValue;
    }
    return core.getBooleanInput(key);
  }

  const envValue = process.env[key];
  if (envValue === undefined || envValue === '') {
    return defaultValue;
  }
  return envValue.toLowerCase() === 'true';
}

function getNumberInput(key: string, defaultValue: number): number {
  const value = getInput(key, false);
  if (value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getDateRangeInput(): DateRange {
  const value = getInputWithDefault('DATE_RANGE', DEFAULT_DATE_RANGE);
  const normalized = value.toLowerCase();

  if (!DATE_RANGES.includes(normalized as DateRange)) {
    console.warn(`Invalid DATE_RANGE "${value}", using default "${DEFAULT_DATE_RANGE}"`);
    return DEFAULT_DATE_RANGE;
  }

  return normalized as DateRange;
}

export function getInputs(): ActionInputs {
  return {
    ghToken: getInput('GH_TOKEN', true),
    wakatimeApiKey: getInput('WAKA_API_KEY', true),
    wakatimeBaseUrl: getInputWithDefault('WAKATIME_BASE_URL', DEFAULT_WAKATIME_BASE_URL),
    gistId: getInput('GIST_ID', true),
    maxResult: getNumberInput('MAX_RESULT', DEFAULT_MAX_RESULT),
    dateRange: getDateRangeInput(),
    printSummary: getBooleanInput('PRINT_SUMMARY', true),
    useOldFormat: getBooleanInput('USE_OLD_FORMAT', false),
  };
}

export async function loadEnvForLocalDev(): Promise<void> {
  if (isRunningInGitHubActions()) {
    return;
  }

  try {
    const { config } = await import('dotenv');
    config();
  } catch {
    // dotenv is a dev dependency, may not be available
  }
}
