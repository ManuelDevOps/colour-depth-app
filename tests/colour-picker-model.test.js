import test from 'node:test';
import assert from 'node:assert/strict';
import { hsvToRgb, hueFromPoint, rgbToHsv } from '../src/colour-picker-model.js';
import { calculateColour, colourStateFromRgb } from '../src/colour-model.js';

const wheelColours = [
  [0, 255, 0, 0],
  [60, 255, 255, 0],
  [120, 0, 255, 0],
  [180, 0, 255, 255],
  [240, 0, 0, 255],
  [300, 255, 0, 255],
];

function assertClose(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} should equal ${expected}`);
}

function roundTrip(r, g, b) {
  const { h, s, v } = rgbToHsv(r, g, b);
  assert.ok(h >= 0 && h < 360, `Hue range for ${r}, ${g}, ${b}`);
  assert.ok(s >= 0 && s <= 100, `Saturation range for ${r}, ${g}, ${b}`);
  assert.ok(v >= 0 && v <= 100, `Value range for ${r}, ${g}, ${b}`);
  const rgb = hsvToRgb(h, s, v);
  assert.deepEqual(rgb, { r, g, b });
  return rgb;
}

test('RGB primaries and secondaries have the expected HSV hue', () => {
  for (const [h, r, g, b] of wheelColours) {
    assert.deepEqual(rgbToHsv(r, g, b), { h, s: 100, v: 100 });
  }
});

test('HSV primaries and secondaries produce exact RGB channels', () => {
  for (const [h, r, g, b] of wheelColours) {
    assert.deepEqual(hsvToRgb(h, 100, 100), { r, g, b });
  }
});

test('RGB black, white and gray use zero hue and saturation without losing brightness', () => {
  for (const channel of [0, 1, 64, 128, 254, 255]) {
    const hsv = rgbToHsv(channel, channel, channel);
    assert.equal(hsv.h, 0);
    assert.equal(hsv.s, 0);
    assertClose(hsv.v, channel * 100 / 255);
  }
});

test('HSV black, white and gray ignore hue when saturation or value is zero', () => {
  for (const h of [-60, 0, 120, 359.5, 720]) {
    assert.deepEqual(hsvToRgb(h, 100, 0), { r: 0, g: 0, b: 0 });
    assert.deepEqual(hsvToRgb(h, 0, 100), { r: 255, g: 255, b: 255 });
    assert.deepEqual(hsvToRgb(h, 0, 50), { r: 128, g: 128, b: 128 });
  }
});

test('mixed RGB channels retain fractional HSV components', () => {
  const hsv = rgbToHsv(200, 100, 150);
  assert.equal(hsv.h, 330);
  assert.equal(hsv.s, 50);
  assertClose(hsv.v, 200 * 100 / 255);
  assert.deepEqual(rgbToHsv(128, 64, 32), { h: 20, s: 75, v: 128 * 100 / 255 });
});

test('fractional HSV inputs round channels rather than truncating them', () => {
  assert.deepEqual(hsvToRgb(30, 50, 80), { r: 204, g: 153, b: 102 });
  assert.deepEqual(hsvToRgb(0.5, 100, 100), { r: 255, g: 2, b: 0 });
  assert.deepEqual(hsvToRgb(210, 50.5, 75.5), { r: 95, g: 144, b: 193 });
});

test('hue wraps across negative, positive and multiple revolutions', () => {
  for (const h of [-720, -360, -0, 0, 360, 720]) {
    assert.deepEqual(hsvToRgb(h, 100, 100), { r: 255, g: 0, b: 0 });
  }
  for (const [input, wrapped] of [[-60, 300], [420, 60], [-720.5, 359.5], [1080.5, 0.5]]) {
    assert.deepEqual(hsvToRgb(input, 75, 80), hsvToRgb(wrapped, 75, 80));
  }
  assertClose(rgbToHsv(255, 0, 1).h, 360 - 60 / 255);
  assertClose(rgbToHsv(255, 1, 0).h, 60 / 255);
});

test('pointer hue starts at the top and increases clockwise through cardinal and diagonal angles', () => {
  const centerX = 10;
  const centerY = 20;
  for (const [dx, dy, h] of [
    [0, -2, 0], [2, -2, 45], [2, 0, 90], [2, 2, 135],
    [0, 2, 180], [-2, 2, 225], [-2, 0, 270], [-2, -2, 315],
  ]) {
    assert.equal(hueFromPoint(centerX + dx, centerY + dy, centerX, centerY), h);
    assert.equal(hueFromPoint(dx * 10, dy * 10, 0, 0), h, 'Radius must not change hue');
  }
});

test('pointer hue wraps at the top seam and returns null only at the exact center', () => {
  assert.equal(hueFromPoint(10, 20, 10, 20), null);
  assert.equal(hueFromPoint(0, -0, 0, 0), null);
  assert.equal(hueFromPoint(0, -0.001, 0, 0), 0);
  assert.equal(hueFromPoint(0.001, 0, 0, 0), 90);
  const before = hueFromPoint(-0.001, -1, 0, 0);
  const after = hueFromPoint(0.001, -1, 0, 0);
  assert.ok(before > 359 && before < 360);
  assert.ok(after > 0 && after < 1);
  assertClose(360 - before, after);
  assert.equal(hueFromPoint(-Number.EPSILON, -1, 0, 0), 0, 'A rounded full turn must wrap to zero');
});

test('RGB conversion rejects non-integer, out-of-range and coerced channels', () => {
  for (const invalid of [-1, 256, 0.5, NaN, Infinity, -Infinity, '0', null, undefined, true, 1n, {}, []]) {
    for (let channel = 0; channel < 3; channel += 1) {
      const input = [0, 0, 0];
      input[channel] = invalid;
      assert.throws(() => rgbToHsv(...input), RangeError);
    }
  }
});

test('HSV requires finite numeric hue and percentages from zero to one hundred', () => {
  for (const invalid of [NaN, Infinity, -Infinity, '0', null, undefined, true, 1n, {}, []]) {
    for (let channel = 0; channel < 3; channel += 1) {
      const input = [0, 50, 50];
      input[channel] = invalid;
      assert.throws(() => hsvToRgb(...input), RangeError);
    }
  }
  for (const invalid of [-0.1, 100.1]) {
    assert.throws(() => hsvToRgb(0, invalid, 50), RangeError);
    assert.throws(() => hsvToRgb(0, 50, invalid), RangeError);
  }
});

test('pointer coordinates must be finite numbers, with fractional positions allowed', () => {
  assert.equal(hueFromPoint(1.5, 2.5, 0.5, 2.5), 90);
  for (const invalid of [NaN, Infinity, -Infinity, '0', null, undefined, true, 1n, {}, []]) {
    for (let coordinate = 0; coordinate < 4; coordinate += 1) {
      const input = [1, 0, 0, 0];
      input[coordinate] = invalid;
      assert.throws(() => hueFromPoint(...input), RangeError);
    }
  }
});

test('RGB to HSV to RGB round trips preserve a deterministic channel grid and every gray', () => {
  const channels = [0, 1, 2, 32, 64, 85, 128, 170, 200, 254, 255];
  for (const r of channels) {
    for (const g of channels) {
      for (const b of channels) roundTrip(r, g, b);
    }
  }
  for (let channel = 0; channel <= 255; channel += 1) roundTrip(channel, channel, channel);
});

test('HSV selections compose with the unchanged model at exact depths 1, 3, 8 and 24', () => {
  for (const [h, s, v, depth, rgb] of [
    [120, 100, 0, 1, { r: 0, g: 0, b: 0 }],
    [240, 0, 100, 1, { r: 255, g: 255, b: 255 }],
    [300, 100, 100, 3, { r: 255, g: 0, b: 255 }],
    [0, 100, 36 * 100 / 255, 8, { r: 36, g: 0, b: 0 }],
    [0, 100, 35 * 100 / 255, 24, { r: 35, g: 0, b: 0 }],
    [330, 50, 200 * 100 / 255, 24, { r: 200, g: 100, b: 150 }],
  ]) {
    assert.deepEqual(hsvToRgb(h, s, v), rgb);
    const state = colourStateFromRgb(rgb.r, rgb.g, rgb.b);
    assert.equal(state.depth, depth);
    const { hex, ...decoded } = calculateColour(state.depth, state.bits);
    assert.deepEqual(decoded, rgb);
  }
});

test('all RGB332 colours round trip through HSV with identical minimum-depth state', () => {
  for (let value = 0; value < 256; value += 1) {
    const bits = [...value.toString(2).padStart(8, '0')].map(Number);
    const { r, g, b } = calculateColour(8, bits);
    const rgb = roundTrip(r, g, b);
    assert.deepEqual(colourStateFromRgb(rgb.r, rgb.g, rgb.b), colourStateFromRgb(r, g, b));
  }
});
