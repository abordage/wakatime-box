import { HttpClient } from '@actions/http-client';
import type { DateRange, WakaTimeLanguage } from './types.js';

const USER_AGENT = 'WakaTime-Gist/3.0 +https://github.com/marketplace/actions/wakatime-gist';

export async function fetchStatistics(
  baseUrl: string,
  dateRange: DateRange,
  apiKey: string
): Promise<WakaTimeLanguage[]> {
  const httpClient = new HttpClient(USER_AGENT);
  const authHeader = `Basic ${Buffer.from(apiKey).toString('base64')}`;

  const response = await httpClient.getJson<{ data: { languages: WakaTimeLanguage[] } }>(
    `${baseUrl}/users/current/stats/${dateRange}`,
    { Authorization: authHeader }
  );

  if (!response.result?.data?.languages) {
    throw new Error('Empty response from WakaTime API');
  }

  return response.result.data.languages;
}

