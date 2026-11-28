import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLine } from './formatLine.js';

const LANGUAGE_LINE = 'Python......... 4h 12m .........................42.1%';
const MODEL_LINE = 'Claude-Sonnet...................................48.0%';

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

test('shows only the model percent and keeps the full name', () => {
  assert.equal(formatLine('Claude-Sonnet', 12400, 48, false, 'lines'), MODEL_LINE);
  assert.equal(
    formatLine('Opus', 37500, 84.4, false, 'lines'),
    `Opus${'.'.repeat(44)}84.4%`
  );
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

