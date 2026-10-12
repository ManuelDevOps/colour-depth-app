import test from 'node:test';
import assert from 'node:assert/strict';
import { getTranslations, pixelDescription, switchDescription } from '../src/translations.js';

test('English and Spanish provide every interface and help key', () => {
  const en = getTranslations('en');
  const es = getTranslations('es');
  assert.deepEqual(Object.keys(en).sort(), Object.keys(es).sort());
  for (const key of Object.keys(en)) {
    assert.equal(typeof en[key], 'string', key);
    assert.ok(en[key].trim(), key);
    assert.ok(es[key].trim(), key);
  }
  assert.equal(en.languageTarget, 'ES');
  assert.equal(es.languageTarget, 'EN');
  assert.match(es.depthTitle, /píxel/);
  assert.match(es.helpGeneral, /0.*1/s);
});

test('help is specific to each depth and historical 8-bit alternatives are not erased', () => {
  for (const locale of ['en', 'es']) {
    const text = getTranslations(locale);
    assert.match(text.help1, /black|negro/i);
    assert.match(text.help3, /RGB111/);
    assert.match(text.help8, /RGB332/);
    assert.match(text.help8, /index|índice|indizad/i);
    assert.match(text.help24, /RGB888/);
    assert.match(text.help24, /16[,.]777[,.]216/);
  }
});

test('dynamic switch descriptions translate channel, position and state', () => {
  assert.equal(switchDescription('en', 'red', 2, 3, true), 'Red bit 2 of 3, on');
  assert.equal(switchDescription('es', 'red', 2, 3, false), 'Bit 2 de 3 de rojo, apagado');
  assert.equal(switchDescription('es', 'monochrome', 1, 1, true),
    'Bit 1 de 1 de monocromo (todos los canales RGB), encendido');
});

test('the pixel description localizes its label without changing the hexadecimal value', () => {
  assert.equal(pixelDescription('en', '#C86496'), 'Resulting pixel: #C86496');
  assert.equal(pixelDescription('es', '#C86496'), 'Píxel resultante: #C86496');
});

test('unsupported locales cannot silently show mismatched language content', () => {
  assert.throws(() => getTranslations('fr'), RangeError);
  assert.throws(() => switchDescription('fr', 'red', 1, 1, false), RangeError);
});
