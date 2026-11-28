import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getInputs } from './config.js';

type EnvKey = 'CARD' | 'GITHUB_ACTIONS';

function writeEnv(key: EnvKey, value: string | undefined): void {
  if (key === 'CARD') {
    if (value === undefined) {
      delete process.env.CARD;
    } else {
      process.env.CARD = value;
    }
    return;
  }

  if (value === undefined) {
    delete process.env.GITHUB_ACTIONS;
  } else {
    process.env.GITHUB_ACTIONS = value;
  }
}

function withEnv(overrides: Partial<Record<EnvKey, string | undefined>>, run: () => void): void {
  const keys = Object.keys(overrides) as EnvKey[];
  const saved = keys.map((key) => ({ key, value: process.env[key] }));

  try {
    for (const key of keys) {
      writeEnv(key, overrides[key]);
    }
    run();
  } finally {
    for (const entry of saved) {
      writeEnv(entry.key, entry.value);
    }
  }
}

test('CARD defaults to models', () => {
  withEnv({ GITHUB_ACTIONS: undefined, CARD: undefined }, () => {
    assert.equal(getInputs().card, 'models');
  });
});

test('CARD selects models, ignoring case and surrounding spaces', () => {
  withEnv({ GITHUB_ACTIONS: undefined, CARD: '  Models  ' }, () => {
    assert.equal(getInputs().card, 'models');
  });
});

test('an unknown CARD falls back to models', () => {
  const warn = console.warn;
  console.warn = () => {};

  try {
    withEnv({ GITHUB_ACTIONS: undefined, CARD: 'both' }, () => {
      assert.equal(getInputs().card, 'models');
    });
  } finally {
    console.warn = warn;
  }
});
