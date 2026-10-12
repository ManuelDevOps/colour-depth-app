import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateColour,
  changeColourDepth,
  createColourState,
} from '../src/colour-model.js';

const bits = (binary) => [...binary.replaceAll(' ', '')].map(Number);

test('1-bit monochrome drives every channel together', () => {
  assert.deepEqual(calculateColour(1, [0]), {
    r: 0, g: 0, b: 0, hex: '#000000',
  });
  assert.deepEqual(calculateColour(1, [1]), {
    r: 255, g: 255, b: 255, hex: '#FFFFFF',
  });
});

test('RGB111 assigns left-to-right bits to red, green and blue', () => {
  const expected = [
    ['000', 0, 0, 0, '#000000'],
    ['001', 0, 0, 255, '#0000FF'],
    ['010', 0, 255, 0, '#00FF00'],
    ['011', 0, 255, 255, '#00FFFF'],
    ['100', 255, 0, 0, '#FF0000'],
    ['101', 255, 0, 255, '#FF00FF'],
    ['110', 255, 255, 0, '#FFFF00'],
    ['111', 255, 255, 255, '#FFFFFF'],
  ];

  for (const [binary, r, g, b, hex] of expected) {
    assert.deepEqual(calculateColour(3, bits(binary)), { r, g, b, hex }, binary);
  }
});

test('RGB332 rounds every red and green step onto 0..255', () => {
  const steps = [0, 36, 73, 109, 146, 182, 219, 255];
  for (let value = 0; value < steps.length; value += 1) {
    const threeBits = value.toString(2).padStart(3, '0');
    assert.equal(calculateColour(8, bits(`${threeBits} 000 00`)).r, steps[value]);
    assert.equal(calculateColour(8, bits(`000 ${threeBits} 00`)).g, steps[value]);
  }
});

test('RGB332 scales both blue bits, retaining channel order', () => {
  const expected = [
    ['000 000 00', 0, 0, 0, '#000000'],
    ['000 000 01', 0, 0, 85, '#000055'],
    ['000 000 10', 0, 0, 170, '#0000AA'],
    ['000 000 11', 0, 0, 255, '#0000FF'],
    ['001 010 01', 36, 73, 85, '#244955'],
    ['100 001 10', 146, 36, 170, '#9224AA'],
    ['111 111 11', 255, 255, 255, '#FFFFFF'],
  ];

  for (const [binary, r, g, b, hex] of expected) {
    assert.deepEqual(calculateColour(8, bits(binary)), { r, g, b, hex }, binary);
  }
});

test('RGB332 encodes all 256 bit combinations as distinct valid colours', () => {
  const colours = new Set();
  for (let value = 0; value < 256; value += 1) {
    const binary = value.toString(2).padStart(8, '0');
    const input = bits(binary);
    const colour = calculateColour(8, input);
    assert.match(colour.hex, /^#[0-9A-F]{6}$/);
    assert.deepEqual(input, bits(binary), 'Calculation must not change input bits');
    colours.add(colour.hex);
  }
  assert.equal(colours.size, 256);
});

test('RGB888 reads eight MSB-first bits per channel without scaling', () => {
  assert.deepEqual(calculateColour(24, bits('00000000 00000000 00000000')), {
    r: 0, g: 0, b: 0, hex: '#000000',
  });
  assert.deepEqual(calculateColour(24, bits('11001000 01100100 10010110')), {
    r: 200, g: 100, b: 150, hex: '#C86496',
  });
  assert.deepEqual(calculateColour(24, bits('10000000 01000000 00000001')), {
    r: 128, g: 64, b: 1, hex: '#804001',
  });
  assert.deepEqual(calculateColour(24, Array(24).fill(1)), {
    r: 255, g: 255, b: 255, hex: '#FFFFFF',
  });
});

test('creation and a depth change start all switches at zero', () => {
  for (const depth of [1, 3, 8, 24]) {
    assert.deepEqual(createColourState(depth), { depth, bits: Array(depth).fill(0) });
  }

  const original = { depth: 3, bits: [1, 0, 1] };
  const changed = changeColourDepth(original, 8);
  assert.deepEqual(changed, { depth: 8, bits: Array(8).fill(0) });
  assert.deepEqual(original, { depth: 3, bits: [1, 0, 1] });
  assert.notStrictEqual(changed.bits, original.bits);
  assert.deepEqual(calculateColour(changed.depth, changed.bits), {
    r: 0, g: 0, b: 0, hex: '#000000',
  });

  const unchanged = changeColourDepth(original, 3);
  assert.deepEqual(unchanged, original);
  assert.notStrictEqual(unchanged.bits, original.bits);
});

test('every change between supported depths clears all prior bits', () => {
  for (const previousDepth of [1, 3, 8, 24]) {
    const prior = { depth: previousDepth, bits: Array(previousDepth).fill(1) };
    for (const nextDepth of [1, 3, 8, 24]) {
      if (previousDepth !== nextDepth) {
        assert.deepEqual(changeColourDepth(prior, nextDepth), {
          depth: nextDepth,
          bits: Array(nextDepth).fill(0),
        });
      }
    }
    assert.deepEqual(prior.bits, Array(previousDepth).fill(1));
  }
});

test('unsupported depths are rejected by every model entry point', () => {
  for (const depth of [0, 2, 32, 1.5, '8', NaN, Infinity, null, undefined]) {
    assert.throws(() => createColourState(depth), RangeError);
    assert.throws(() => calculateColour(depth, []), RangeError);
    assert.throws(() => changeColourDepth({ depth: 3, bits: [1, 0, 1] }, depth), RangeError);
  }
});

test('bit arrays must contain exactly one binary number per switch', () => {
  for (const invalid of [
    undefined, null, '010', new Uint8Array([0, 1, 0]),
    [], [0, 1], [0, 1, 0, 0], [0, 1, 2], [0, -1, 1],
    [0, true, 1], [0, '1', 1], [0, undefined, 1],
    new Array(3),
  ]) {
    assert.throws(() => calculateColour(3, invalid), TypeError);
  }
});

test('depth transitions reject malformed existing state', () => {
  for (const invalid of [
    undefined, null, {}, { depth: 2, bits: [0, 0] },
    { depth: 3, bits: [1] }, { depth: 3, bits: [1, 2, 0] },
  ]) {
    assert.throws(() => changeColourDepth(invalid, 8), TypeError);
  }
});
