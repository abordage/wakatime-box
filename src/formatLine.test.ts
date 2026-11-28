import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatCount, formatLine } from './formatLine.js';

const LANGUAGE_LINE = 'Python......... 4h 12m .........................42.1%';
const MODEL_LINE = 'Claude-Sonnet.. 12.4k ..........................48.0%';

test('keeps the language line layout', () => {
  assert.equal(formatLine('Python', 15120, 42.1, false), LANGUAGE_LINE);
});

test('keeps the language bar layout', () => {
  const bar = '\u2588'.repeat(9) + '\u258B' + '\u2591'.repeat(13);
  const expected = [
    'Python'.padEnd(12),
    `\uD83D\uDD53 ${'4h 12m'.padEnd(9)}`,
    bar,
    ' 42.1%',
  ].join(' ');

  assert.equal(formatLine('Python', 15120, 42.1, true), expected);
});

test('still truncates long language names to 10 characters', () => {
  assert.match(formatLine('CoffeeScript', 10, 1, false), /^CoffeeS\.\.\./);
});

test('shows a model line count and keeps the full name', () => {
  assert.equal(formatLine('Claude-Sonnet', 12400, 48, false, 'lines'), MODEL_LINE);
});

test('keeps language and model lines the same width', () => {
  assert.equal(LANGUAGE_LINE.length, MODEL_LINE.length);
  assert.equal(
    formatLine('Python', 15120, 42.1, true).length,
    formatLine('Claude-Sonnet', 12400, 48, true, 'lines').length
  );
});

test('truncates a long model name at the column width', () => {
  assert.match(
    formatLine('claude-opus-4.6-high', 10, 1, false, 'lines'),
    /^claude-opus-\.\.\./
  );
});

test('formats line counts', () => {
  assert.equal(formatCount(0), '0');
  assert.equal(formatCount(999), '999');
  assert.equal(formatCount(1000), '1k');
  assert.equal(formatCount(1500), '1.5k');
  assert.equal(formatCount(12400), '12.4k');
  assert.equal(formatCount(999999), '1m');
  assert.equal(formatCount(1_500_000), '1.5m');
  assert.equal(formatCount(-1500), '-1.5k');
  assert.equal(formatCount(Number.NaN), '0');
});
