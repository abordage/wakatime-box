import * as core from '@actions/core';
import {HttpClient} from '@actions/http-client';
import {Octokit} from '@octokit/rest';
import {config} from 'dotenv';
import {resolve} from 'path';
import formatLine from './formatLine';

config({path: resolve(__dirname, '../.env')});

const GH_TOKEN = core.getInput('GH_TOKEN', {required: true});
const WAKA_API_KEY = core.getInput('WAKA_API_KEY', {required: true});
const GIST_ID = core.getInput('GIST_ID', {required: true});
const MAX_RESULT = Number(core.getInput('MAX_RESULT', {required: true}));
const DATE_RANGE = core.getInput('DATE_RANGE', {required: false});
const PRINT_SUMMARY = core.getBooleanInput('PRINT_SUMMARY', {required: true});

let range: string = DATE_RANGE;
if (!['last_7_days', 'last_30_days', 'last_6_months', 'last_year'].includes(range)) range = 'last_7_days';

(async () => {
  /**
   * Get statistics
   */
  const httpClient = new HttpClient('WakaTime-Gist/1.2 +https://github.com/marketplace/actions/wakatime-gist');
  const response = await httpClient.getJson('https://wakatime.com/api/v1/users/current/stats/' + range,
    {Authorization: `Basic ${Buffer.from(WAKA_API_KEY || '').toString('base64')}`})
    .catch(error => core.setFailed(`Action failed with error ${error.message}`));

  // @ts-ignore
  const languages: any[] = response.result.data.languages;
  if (!languages) {
    core.setFailed('Action failed (empty response)');
    return;
  }

  /**
   * Formatting
   */
  let otherTotalSeconds = 0;
  let otherPercent = 0;
  const lines = languages.reduce((prev: any[], cur: any) => {
    const {name, percent, total_seconds} = cur;
    const line = formatLine(name, total_seconds, percent);

    if (name == 'Other' || prev.length >= MAX_RESULT - 1) {
      otherTotalSeconds += total_seconds;
      otherPercent += percent;
      return prev;
    }

    return [...prev, line];
  }, []);

  lines.push(formatLine('Other lang', otherTotalSeconds, otherPercent));
  if (lines.length === 0) return;

  let title: string = 'Latest';
  if (range === 'last_7_days') title = 'Weekly';
  if (range === 'last_30_days') title = 'Monthly';
  const updateDate = new Date().toLocaleDateString('en-us', {day: 'numeric', year: 'numeric', month: 'short'});

  /**
   * Update gist
   */
  const octokit = new Octokit({auth: `token ${GH_TOKEN}`});
  const gist = await octokit.gists.get({gist_id: GIST_ID})
    .catch(error => core.setFailed(`Action failed with error: Gist ${error.message}`));
  if (!gist) return;

  const filename = Object.keys(gist.data.files || {})[0];
  await octokit.gists.update({
    gist_id: GIST_ID,
    files: {
      [filename]: {
        filename: title + ' statistics [update ' + updateDate + ']',
        content: lines.join('\n'),
      },
    },
  }).catch(error => core.setFailed(`Action failed with error: Gist ${error.message}`));

  if (PRINT_SUMMARY) {
    await core.summary
      .addHeading('Results')
      .addTable([
        [{data: 'Action', header: true}, {data: 'Result', header: true}],
        ['Statistics received', '✔'],
        ['Gist updated', '✔']
      ])
      .addBreak()
      .addLink('wakatime-gist', 'https://github.com/marketplace/actions/wakatime-gist')
      .write();
  }
})();