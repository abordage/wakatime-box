export const DATE_RANGES = [
  'last_7_days',
  'last_30_days',
  'last_6_months',
  'last_year',
  'all_time',
] as const;

export type DateRange = typeof DATE_RANGES[number];

export interface ActionInputs {
  ghToken: string;
  wakatimeApiKey: string;
  wakatimeBaseUrl: string;
  gistId: string;
  maxResult: number;
  dateRange: DateRange;
  printSummary: boolean;
  useOldFormat: boolean;
}

export interface WakaTimeLanguage {
  name: string;
  percent: number;
  total_seconds: number;
}

export const OTHER_LANGUAGES = [
  'Other',
  'AUTO_DETECTED',
  'unknown',
  'Log',
  'Text',
  'GitIgnore file',
  '.env file',
  'Blade Template',
  'SmartyConfig',
  'textmate',
] as const;
