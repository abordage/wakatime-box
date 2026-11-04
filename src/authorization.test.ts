import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authorizationHeader } from './authorization.js';

test('sends a personal OAuth token as Bearer', () => {
  assert.equal(authorizationHeader('waka_tok_example'), 'Bearer waka_tok_example');
});

test('strips a pasted Bearer prefix and surrounding whitespace', () => {
  assert.equal(
    authorizationHeader('  Bearer waka_tok_example  '),
    'Bearer waka_tok_example'
  );
});

test('keeps a plugin API key on Basic auth', () => {
  const key = 'waka_xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
  assert.equal(
    authorizationHeader(key),
    `Basic ${Buffer.from(key).toString('base64')}`
  );
});

test('keeps a Wakapi key on Basic auth', () => {
  const key = 'wakapi-secret';
  assert.equal(
    authorizationHeader(key),
    `Basic ${Buffer.from(key).toString('base64')}`
  );
});
