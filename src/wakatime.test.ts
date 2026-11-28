import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCurrentStats, readStats } from './wakatime.js';
import type { WakaTimeStats } from './types.js';

function stats(partial: Partial<WakaTimeStats> = {}): WakaTimeStats {
  return {
    languages: partial.languages ?? [],
    models: partial.models ?? [],
    isUpToDate: partial.isUpToDate ?? true,
  };
}

test('reads languages and prefers the model breakdown', () => {
  const parsed = readStats({
    languages: [
      { name: 'Python', total_seconds: '10', percent: 80, text: '10 secs' },
      { name: 'Broken' },
      { total_seconds: 5, percent: 20 },
    ],
    ai_model_breakdown: [
      { name: 'Opus', lines: 10, cost: 1.5 },
      { name: 'Zero', lines: 0, cost: 4 },
    ],
    ai_model_line_changes: { Hidden: 99 },
    is_up_to_date: true,
  });

  assert.deepEqual(parsed.languages, [
    { name: 'Python', total_seconds: 10, percent: 80 },
  ]);
  assert.deepEqual(parsed.models, [{ name: 'Opus', lines: 10 }]);
  assert.equal(parsed.isUpToDate, true);
});

test('falls back to the line-change map when the breakdown is empty', () => {
  const parsed = readStats({
    languages: [],
    ai_model_breakdown: [{ name: 'Zero', lines: 0 }],
    ai_model_line_changes: { Opus: 4, Nope: 0, Bad: 'nope' },
  });

  assert.deepEqual(parsed.models, [{ name: 'Opus', lines: 4 }]);
  assert.equal(parsed.isUpToDate, true);
});

test('accepts model lines without a languages array', () => {
  const parsed = readStats({
    ai_model_line_changes: { Grok: '3' },
    is_up_to_date: false,
  });

  assert.deepEqual(parsed.languages, []);
  assert.deepEqual(parsed.models, [{ name: 'Grok', lines: 3 }]);
  assert.equal(parsed.isUpToDate, false);
});

test('rejects a payload that has neither languages nor models', () => {
  assert.throws(() => readStats(null), /Empty response from WakaTime API/);
  assert.throws(() => readStats({}), /Empty response from WakaTime API/);
  assert.throws(() => readStats({ languages: null }), /Empty response from WakaTime API/);
});

test('retries while stats are stale and stops when they are ready', async () => {
  const waits: number[] = [];
  let calls = 0;

  const parsed = await loadCurrentStats(async () => {
    calls += 1;
    return stats({ isUpToDate: calls >= 2 });
  }, {
    attempts: 3,
    retryDelayMs: 2000,
    warn: () => {},
    wait: async (ms) => {
      waits.push(ms);
    },
  });

  assert.equal(calls, 2);
  assert.deepEqual(waits, [2000]);
  assert.equal(parsed.isUpToDate, true);
});

test('uses the latest response when stats stay stale', async () => {
  let calls = 0;

  const parsed = await loadCurrentStats(async () => {
    calls += 1;
    return stats({
      languages: [{ name: 'Python', total_seconds: 1, percent: 100 }],
      isUpToDate: false,
    });
  }, {
    attempts: 3,
    warn: () => {},
    wait: async () => {},
  });

  assert.equal(calls, 3);
  assert.equal(parsed.languages[0]?.name, 'Python');
  assert.equal(parsed.isUpToDate, false);
});
