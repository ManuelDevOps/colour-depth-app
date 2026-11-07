import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTheme } from '../src/theme.js';

test('defaults to cyber without a saved theme or when storage is unavailable', () => {
  assert.equal(initialTheme(() => ({ getItem: () => null })), 'cyber');
  assert.equal(initialTheme(() => { throw new Error('unavailable'); }), 'cyber');
});

test('preserves the selected theme during the session', () => {
  assert.equal(initialTheme(() => ({ getItem: () => 'colourful' })), 'colourful');
  assert.equal(initialTheme(() => ({ getItem: () => 'cyber' })), 'cyber');
});
