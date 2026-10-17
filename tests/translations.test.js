import test from 'node:test';
import assert from 'node:assert/strict';
import { colourCountLabel, getTranslations, pixelDescription, switchDescription, switchStateLabel } from '../src/translations.js';

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

test('the brand title stays untranslated and the subtitle switches language', () => {
  assert.equal(getTranslations('en').title, 'Colour Depth App');
  assert.equal(getTranslations('es').title, 'Colour Depth App');
  assert.equal(getTranslations('en').subtitle, "Let's paint the pixel!");
  assert.equal(getTranslations('es').subtitle, '¡Vamos a pintar el píxel!');
});

test('editor guidance and reachable validation errors are available in both languages', () => {
  for (const locale of ['en', 'es']) {
    const text = getTranslations(locale);
    for (const key of ['editHint', 'redInput', 'greenInput', 'blueInput', 'hexInput',
      'rgbError', 'hexError']) {
      assert.ok(text[key]?.trim(), `${locale}: ${key}`);
    }
    assert.match(text.rgbError, /0.*255/);
    assert.match(text.hexError, /#RRGGBB/);
    assert.match(text.editHint, /Enter/);
  }
  assert.match(getTranslations('es').rgbError, /entero/);
  assert.match(getTranslations('en').hexError, /six/i);
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
  assert.equal(pixelDescription('en', '#C86496'), 'Choose pixel colour: #C86496');
  assert.equal(pixelDescription('es', '#C86496'), 'Elegir el color del píxel: #C86496');
});

test('picker controls and live keyboard guidance are localized in both languages', () => {
  for (const locale of ['en', 'es']) {
    const text = getTranslations(locale);
    for (const key of ['pickerOpen', 'pickerTitle', 'pickerInstructions', 'pickerHue',
      'pickerSaturation', 'pickerBrightness', 'pickerPreview', 'pickerClose',
      'degrees', 'percent', 'helpPicker']) {
      assert.ok(text[key]?.trim(), `${locale}: ${key}`);
    }
    assert.match(text.pickerInstructions, /Home.*End/);
    assert.match(text.pickerInstructions, /Escape/);
    assert.match(text.helpPicker, /RGB.*HEX/);
    assert.match(text.helpPicker, /exact/i);
  }
  const en = getTranslations('en');
  const es = getTranslations('es');
  assert.match(en.pickerInstructions, /live|immediate/i);
  assert.match(en.pickerInstructions, /arrow/i);
  assert.match(es.pickerInstructions, /inmediata/i);
  assert.match(es.pickerInstructions, /flecha/i);
  assert.equal(en.pickerBrightness, 'Brightness');
  assert.equal(es.pickerBrightness, 'Brillo');
  assert.match(en.pickerClose, /close/i);
  assert.match(es.pickerClose, /cerrar/i);
});

test('unsupported locales cannot silently show mismatched language content', () => {
  assert.throws(() => getTranslations('fr'), RangeError);
  assert.throws(() => switchDescription('fr', 'red', 1, 1, false), RangeError);
});

test('visible switch faces keep ON and OFF untranslated in every language', () => {
  assert.equal(switchStateLabel('en', true), 'ON');
  assert.equal(switchStateLabel('en', false), 'OFF');
  assert.equal(switchStateLabel('es', true), 'ON');
  assert.equal(switchStateLabel('es', false), 'OFF');
  assert.throws(() => switchStateLabel('fr', true), RangeError);
});

test('the colour count shows 2 to the power of the selected depth in each language', () => {
  assert.equal(colourCountLabel('en', 1), '2 colours');
  assert.equal(colourCountLabel('en', 3), '8 colours');
  assert.equal(colourCountLabel('en', 8), '256 colours');
  assert.equal(colourCountLabel('en', 24), '16,777,216 colours');
  assert.equal(colourCountLabel('es', 1), '2 colores');
  assert.equal(colourCountLabel('es', 3), '8 colores');
  assert.equal(colourCountLabel('es', 8), '256 colores');
  assert.equal(colourCountLabel('es', 24), '16.777.216 colores');
  assert.throws(() => colourCountLabel('fr', 8), RangeError);
  assert.throws(() => colourCountLabel('en', 16), RangeError);
});

test('accessible names distinguish all RGB888 bit positions without visible captions', () => {
  for (const locale of ['en', 'es']) {
    for (const enabled of [false, true]) {
      const names = ['red', 'green', 'blue'].flatMap(channel =>
        Array.from({ length: 8 }, (_, index) =>
          switchDescription(locale, channel, index + 1, 8, enabled)));
      assert.equal(new Set(names).size, 24);
      for (const name of names) {
        assert.match(name, /[1-8].*8/);
        assert.ok(name.endsWith(enabled ? getTranslations(locale).on : getTranslations(locale).off));
      }
    }
  }
});
