import {resolve} from 'path';
import {config} from 'dotenv';
import {Octokit} from '@octokit/rest';
import generateBarChart from './generateBarChart';
import convertSeconds from './convertSeconds';

const axios = require('axios');

config({path: resolve(__dirname, '../.env')});

function cutStr(str: string, len: number) {
  return str.length > len ? str.substring(0, len - 3) + '...' : str;
}

const ranges: string[] = ['last_7_days', 'last_30_days', 'last_6_months', 'last_year'];
let range: string = String(process.env.DATE_RANGE);
if (!ranges.includes(range)) {
  range = 'last_7_days';
}

(async () => {
  /**
   * Get statistics
   */
  const response = await axios.get('users/current/stats/' + range, {
    baseURL: 'https://wakatime.com/api/v1/',
    headers: {Authorization: `Basic ${Buffer.from(process.env.WAKA_API_KEY || '').toString('base64')}`}
  }).catch(function () {
    return;
  });

  /**
   * Formatting
   */
  const myStats = response.data.data;
  const maxResult: number = Number(process.env.MAX_RESULT) || 10;

  let allOtherTime = 0;
  let allOtherPercent = 0;

  const lines = myStats.languages.reduce((prev: any[], cur: any) => {
    const {name, percent, total_seconds} = cur;
    const line = [
      cutStr(name, 10).padEnd(12),
      convertSeconds(total_seconds).padEnd(11),
      generateBarChart(percent, 21),
      String(percent.toFixed(1)).padStart(5) + '%'
    ];

    if (name == 'Other' || prev.length >= maxResult - 1) {
      allOtherTime = allOtherTime + total_seconds;
      allOtherPercent = allOtherPercent + percent;
      return prev;
    }

    return [...prev, line.join(' ')];
  }, []);

  const lastLine = [
    cutStr('Other lang', 10).padEnd(12),
    convertSeconds(allOtherTime).padEnd(11),
    generateBarChart(allOtherPercent, 21),
    String(allOtherPercent.toFixed(1)).padStart(5) + '%'
  ];
  lines.push(lastLine.join(' '));

  if (lines.length === 0) return;

  let title: string = 'Latest';
  if (range === 'last_7_days') title = 'Weekly';
  if (range === 'last_30_days') title = 'Monthly';
  const updateDate = new Date().toLocaleDateString('en-us', {day: 'numeric', year: 'numeric', month: 'short'});

  /**
   * Update gist
   */
  const octokit = new Octokit({auth: `token ${process.env.GH_TOKEN}`});
  const gist = await octokit.gists.get({gist_id: process.env.GIST_ID || ''})
    .catch(error => console.error(`Unable to update gist\n${error}`));

  if (!gist) return;

  const filename = Object.keys(gist.data.files || {})[0];
  await octokit.gists.update({
    gist_id: process.env.GIST_ID || '',
    files: {
      [filename]: {
        filename: title + ' statistics [update ' + updateDate + ']',
        content: lines.join('\n'),
      },
    },
  });

})();