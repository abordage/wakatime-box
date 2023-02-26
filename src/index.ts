import * as core from '@actions/core';
import {HttpClient} from '@actions/http-client';
import {Octokit} from '@octokit/rest';
import {config} from 'dotenv';
import {resolve} from 'path';
import formatLine from './formatLine';

config({path: resolve(__dirname, '../.env')});

const GH_TOKEN = core.getInput('GH_TOKEN', {required: true});
const WAKATIME_BASE_URL = core.getInput('WAKATIME_BASE_URL', {required: false});
const WAKA_API_KEY = core.getInput('WAKA_API_KEY', {required: true});
const GIST_ID = core.getInput('GIST_ID', {required: true});
const MAX_RESULT = Number(core.getInput('MAX_RESULT', {required: true}));
const DATE_RANGE = core.getInput('DATE_RANGE', {required: false});
const PRINT_SUMMARY = core.getBooleanInput('PRINT_SUMMARY', {required: true});
const USE_OLD_FORMAT = core.getBooleanInput('USE_OLD_FORMAT', {required: false});

const updateDate = new Date().toLocaleDateString('en-us', {day: 'numeric', year: 'numeric', month: 'short'});
const summaryTable: any[] = [[{data: 'Action', header: true}, {data: 'Result', header: true}]];

let wakatimeBaseURL: string = WAKATIME_BASE_URL;
if (!wakatimeBaseURL) wakatimeBaseURL = 'https://wakatime.com/api/v1';

let range: string = DATE_RANGE;
if (!['last_7_days', 'last_30_days', 'last_6_months', 'last_year'].includes(range)) range = 'last_7_days';

let title: string = 'latest';
if (range === 'last_7_days') title = 'weekly';
if (range === 'last_30_days') title = 'monthly';
title = 'My ' + title + ' stack [update ' + updateDate + ']';

(async () => {
  /** Get statistics */
  const httpClient = new HttpClient( 'WakaTime-Gist/1.3 +https://github.com/marketplace/actions/wakatime-gist');
  const response = await httpClient.getJson(wakatimeBaseURL + '/users/current/stats/' + range,
    {Authorization: `Basic ${Buffer.from(WAKA_API_KEY).toString('base64')}`})
    .catch(error => core.setFailed('Action failed: ' + error.message));

  // @ts-ignore
  const languages: any[] = response.result.data.languages;
  if (languages) {
    summaryTable.push(['Statistics received', '✔']);
  } else {
    core.setFailed('Action failed: empty response from wakatime.com');
    return;
  }

  /** Formatting */
  let otherTotalSeconds = 0;
  let otherPercent = 0;
  const otherLang = ['Other', 'Log', 'JSON', 'Text', 'GitIgnore file', 'GitIgnore file', '.env file'];
  const lines = languages.reduce((prev: any[], cur: any) => {
    const {name, percent, total_seconds} = cur;

    if (otherLang.indexOf(name) !== -1 || prev.length >= MAX_RESULT - 1) {
      otherTotalSeconds += total_seconds;
      otherPercent += percent;
      return prev;
    }

    const line = formatLine(name, total_seconds, percent, USE_OLD_FORMAT);
    return [...prev, line];
  }, []);

  lines.push(formatLine('Other', otherTotalSeconds, otherPercent, USE_OLD_FORMAT));
  if (lines.length === 0) {
    core.notice('No statistics for the last time period. Gist not updated');
    return;
  }

  /** Get gist filename */
  const octokit = new Octokit({auth: GH_TOKEN});
  const gist = await octokit.gists.get({gist_id: GIST_ID})
    .catch(error => core.setFailed('Action failed: Gist ' + error.message));
  if (!gist) return;

  const filename = Object.keys(gist.data.files || {})[0];
  if (!filename) {
    core.setFailed('Action failed: Gist filename not found');
    return;
  }

  /** Update gist */
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

  /** Print summary */
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
})();