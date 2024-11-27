import * as core from '@actions/core';
import {HttpClient} from '@actions/http-client';
import {Octokit} from '@octokit/rest';
import {config as loadEnvConfig} from 'dotenv';
import {resolve} from 'path';
import formatLine from './formatLine';

loadEnvConfig({path: resolve(__dirname, '../.env')});

const DEFAULT_WAKATIME_BASE_URL = 'https://wakatime.com/api/v1';
const OTHER_LANGUAGES = ['Other', 'AUTO_DETECTED', 'unknown', 'Log', 'Text', 'GitIgnore file', '.env file'];

function loadConfiguration() {
  return {
    GH_TOKEN: core.getInput('GH_TOKEN', {required: true}),
    WAKATIME_BASE_URL: core.getInput('WAKATIME_BASE_URL', {required: false}) || DEFAULT_WAKATIME_BASE_URL,
    WAKA_API_KEY: core.getInput('WAKA_API_KEY', {required: true}),
    GIST_ID: core.getInput('GIST_ID', {required: true}),
    MAX_RESULT: Number(core.getInput('MAX_RESULT', {required: true})),
    DATE_RANGE: core.getInput('DATE_RANGE', {required: false}) || 'last_7_days',
    PRINT_SUMMARY: core.getBooleanInput('PRINT_SUMMARY', {required: true}),
    USE_OLD_FORMAT: core.getBooleanInput('USE_OLD_FORMAT', {required: false}),
  };
}

function generateTitle(range: string, updateDate: string) {
  let title = 'latest';
  if (range === 'last_7_days') title = 'weekly';
  else if (range === 'last_30_days') title = 'monthly';
  return `My ${title} stack [update ${updateDate}]`;
}

async function fetchStatistics(httpClient: HttpClient, wakatimeBaseURL: string, range: string, apiKey: string) {
  const response = await httpClient.getJson(
    `${wakatimeBaseURL}/users/current/stats/${range}`,
    {Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`}
  ).catch(error => core.setFailed('Action failed: ' + error.message));
  // @ts-ignore
  return response.result?.data.languages;
}

function generateLanguageSummary(languages: any[], maxResult: number, useOldFormat: boolean) {
  let otherTotalSeconds = 0;
  let otherPercent = 0;
  const lines = languages.reduce((result: any[], lang: any) => {
    const {name, percent, total_seconds} = lang;
    if (OTHER_LANGUAGES.includes(name) || result.length >= maxResult - 1) {
      otherTotalSeconds += total_seconds;
      otherPercent += percent;
      return result;
    }
    result.push(formatLine(name, total_seconds, percent, useOldFormat));
    return result;
  }, []);
  lines.push(formatLine('Other', otherTotalSeconds, otherPercent, useOldFormat));
  return lines;
}

function createSummaryTable() {
  return [[{data: 'Action', header: true}, {data: 'Result', header: true}]];
}

async function processSummary({
  GH_TOKEN,
  WAKATIME_BASE_URL,
  WAKA_API_KEY,
  GIST_ID,
  MAX_RESULT,
  DATE_RANGE,
  PRINT_SUMMARY,
  USE_OLD_FORMAT
}) {
  const httpClient = new HttpClient('WakaTime-Gist/1.3 +https://github.com/marketplace/actions/wakatime-gist');
  const languages = await fetchStatistics(httpClient, WAKATIME_BASE_URL, DATE_RANGE, WAKA_API_KEY);
  if (!languages) {
    core.setFailed('Action failed: empty response from wakatime.com');
    return;
  }
  const updateDate = new Date().toLocaleDateString('en-us', {day: 'numeric', year: 'numeric', month: 'short'});
  const title = generateTitle(DATE_RANGE, updateDate);
  const summaryTable: any[] = createSummaryTable();
  summaryTable.push(['Statistics received', '✔']);
  const lines = generateLanguageSummary(languages, MAX_RESULT, USE_OLD_FORMAT);
  if (lines.length === 0) {
    core.notice('No statistics for the last time period. Gist not updated');
    return;
  }
  const octokit = new Octokit({auth: GH_TOKEN});
  const gist = await octokit.gists.get({gist_id: GIST_ID}).catch(error => {
    core.setFailed('Action failed: Gist ' + error.message);
    return null;
  });
  if (!gist) return;
  const filename = Object.keys(gist.data.files || {})[0];
  if (!filename) {
    core.setFailed('Action failed: Gist filename not found');
    return;
  }
  await octokit.gists.update({
    gist_id: GIST_ID,
    files: {
      [filename]: {
        filename: title,
        content: lines.join('\n'),
      },
    },
  }).catch(error => core.setFailed('Action failed: Gist ' + error.message));
  summaryTable.push(['Gist updated', '✔']);
  const summary = core.summary
    .addHeading('Results')
    .addTable(summaryTable)
    .addBreak()
    .addLink('WakaTime-Gist/2.0', 'https://github.com/marketplace/actions/wakatime-gist');
  if (PRINT_SUMMARY) {
    await summary.write();
  } else {
    console.log(summary.stringify());
  }
}

(async () => {
  const config = loadConfiguration();
  await processSummary(config);
})();
