import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLine } from './formatLine.js';
import {
  cardMeasure,
  emptyCardMessage,
  generateGistContent,
  generateTitle,
  rowsForCard,
} from './gist.js';
import type { WakaTimeStats } from './types.js';

const EMPTY_STATS: WakaTimeStats = {
  languages: [],
  models: [],
  isUpToDate: true,
};

test('language title stays the same', () => {
  assert.equal(
    generateTitle('last_7_days', 'Nov 28, 2026', 'languages'),
    'My weekly stack [update Nov 28, 2026]'
  );
});

test('model title names the card', () => {
  assert.equal(
    generateTitle('last_7_days', 'Nov 28, 2026', 'models'),
    'My weekly AI models [update Nov 28, 2026]'
  );
  assert.equal(
    generateTitle('last_6_months', 'Nov 28, 2026', 'models'),
    'My 6-month AI models [update Nov 28, 2026]'
  );
});

test('card measure follows the selected card', () => {
  assert.equal(cardMeasure('languages'), 'time');
  assert.equal(cardMeasure('models'), 'lines');
});

test('empty card messages do not offer to publish', () => {
  assert.match(emptyCardMessage('languages'), /Gist not updated/);
  assert.match(emptyCardMessage('models'), /AI model/);
  assert.match(emptyCardMessage('models'), /Gist not updated/);
});

test('languages card keeps API order and folds Text into Other', () => {
  const rows = rowsForCard({
    ...EMPTY_STATS,
    languages: [
      { name: 'Python', total_seconds: 15120, percent: 40 },
      { name: 'Text', total_seconds: 100, percent: 5 },
      { name: 'Go', total_seconds: 3600, percent: 20 },
    ],
  }, 'languages');

  const content = generateGistContent(rows, 5, false, 'time');
  const names = content.split('\n').map((line) => line.split('.')[0]);

  assert.deepEqual(names, ['Python', 'Go', 'Other']);
  assert.equal(content.split('\n')[0], formatLine('Python', 15120, 40, false));
});

test('models card ranks by lines and keeps a model named Text', () => {
  const rows = rowsForCard({
    ...EMPTY_STATS,
    models: [
      { name: 'Grok', lines: 300 },
      { name: 'Text', lines: 100 },
      { name: 'Opus', lines: 500 },
      { name: ' Opus ', lines: 100 },
      { name: ' ', lines: 80 },
      { name: 'Haiku', lines: 0 },
    ],
  }, 'models');

  assert.deepEqual(rows.map((row) => [row.name, row.amount, row.percent]), [
    ['Opus', 600, 60],
    ['Grok', 300, 30],
    ['Text', 100, 10],
  ]);

  const content = generateGistContent(rows, 5, false, 'lines');
  assert.equal(
    content.split('\n')[0],
    formatLine('Opus', 600, 60, false, 'lines')
  );
  assert.match(content, /^Text/m);
});

test('rounds summed model lines before ranking', () => {
  const rows = rowsForCard({
    ...EMPTY_STATS,
    models: [
      { name: 'Opus', lines: 1.4 },
      { name: 'Opus', lines: 1.4 },
      { name: 'Haiku', lines: 0.4 },
      { name: 'Grok', lines: 1 },
    ],
  }, 'models');

  assert.deepEqual(rows.map((row) => [row.name, row.amount, row.percent]), [
    ['Opus', 3, 75],
    ['Grok', 1, 25],
  ]);
});

test('puts model rows past the limit into Other', () => {
  const rows = rowsForCard({
    ...EMPTY_STATS,
    models: [
      { name: 'Opus', lines: 500 },
      { name: 'Grok', lines: 300 },
      { name: 'Composer', lines: 100 },
      { name: 'Sonnet', lines: 50 },
      { name: 'Cursor', lines: 30 },
      { name: 'GPT', lines: 20 },
    ],
  }, 'models');

  const names = generateGistContent(rows, 5, false, 'lines')
    .split('\n')
    .map((line) => line.split('.')[0]);

  assert.deepEqual(names, ['Opus', 'Grok', 'Composer', 'Sonnet', 'Other']);
});
