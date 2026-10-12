import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWirePaths } from '../src/wiring.js';

const pixel = { x: 50, y: 20 };
const bulbs = {
  r: { top: { x: 10, y: 80 }, bottom: { x: 10, y: 120 } },
  g: { top: { x: 50, y: 80 }, bottom: { x: 50, y: 120 } },
  b: { top: { x: 90, y: 80 }, bottom: { x: 90, y: 120 } },
};

function group(channel, count, startX = 0) {
  return {
    channel,
    bits: Array.from({ length: count }, (_, index) => ({ x: startX + index, y: 300 })),
  };
}

function assertRoute(path, start, end) {
  assert.ok(path.startsWith(`M ${start.x} ${start.y} `), `Unexpected source: ${path}`);
  assert.ok(path.endsWith(`${end.x} ${end.y}`), `Unexpected destination: ${path}`);
}

test('one monochrome bit fans out to all three RGB bulbs', () => {
  const bit = { x: 25, y: 300 };
  const wires = buildWirePaths([{ channel: 'all', bits: [bit] }], bulbs, pixel);

  assert.equal(wires.length, 6);
  assert.deepEqual(wires.slice(0, 3).map(({ channel }) => channel), ['r', 'g', 'b']);
  for (const { channel, path } of wires.slice(0, 3)) {
    assertRoute(path, bit, bulbs[channel].bottom);
  }
});

test('channel-specific switch groups connect only to their own bulbs', () => {
  const groups = [group('r', 2, 11), group('g', 1, 31), group('b', 2, 71)];
  const wires = buildWirePaths(groups, bulbs, pixel);
  const switchWires = wires.slice(0, 5);

  assert.deepEqual(switchWires.map(({ channel }) => channel), ['r', 'r', 'g', 'b', 'b']);
  const sources = groups.flatMap(({ bits }) => bits);
  switchWires.forEach(({ channel, path }, index) => {
    assertRoute(path, sources[index], bulbs[channel].bottom);
  });
});

test('all approved depths produce one route per channel bit plus three pixel routes', () => {
  const modes = [
    { depth: 1, groups: [group('all', 1)], channels: ['r', 'g', 'b'] },
    { depth: 3, groups: [group('r', 1), group('g', 1), group('b', 1)], channels: ['r', 'g', 'b'] },
    {
      depth: 8,
      groups: [group('r', 3), group('g', 3), group('b', 2)],
      channels: ['r', 'r', 'r', 'g', 'g', 'g', 'b', 'b'],
    },
    {
      depth: 24,
      groups: [group('r', 8), group('g', 8), group('b', 8)],
      channels: [...Array(8).fill('r'), ...Array(8).fill('g'), ...Array(8).fill('b')],
    },
  ];

  for (const { depth, groups, channels } of modes) {
    const wires = buildWirePaths(groups, bulbs, pixel);
    assert.equal(wires.length, channels.length + 3, `${depth}-bit route count`);
    assert.deepEqual(wires.slice(0, channels.length).map(({ channel }) => channel),
      channels, `${depth}-bit channel order`);
  }
});

test('each bulb connects from its top edge to the same resulting pixel', () => {
  const wires = buildWirePaths([group('r', 1)], bulbs, pixel);
  const pixelRoutes = wires.slice(-3);

  assert.deepEqual(pixelRoutes.map(({ channel }) => channel), ['r', 'g', 'b']);
  for (const { channel, path } of pixelRoutes) {
    assertRoute(path, bulbs[channel].top, pixel);
  }
});

test('narrow side rails route each bit around the stack without changing its bulb', () => {
  const bit = { x: 25, y: 300 };
  const stacked = buildWirePaths([{
    channel: 'all',
    bits: [bit],
    rails: { r: 2, g: 4, b: 98 },
  }], bulbs, pixel);
  const wide = buildWirePaths([{ channel: 'all', bits: [bit] }], bulbs, pixel);

  for (const [index, channel] of ['r', 'g', 'b'].entries()) {
    assert.equal(stacked[index].channel, channel);
    assertRoute(stacked[index].path, bit, bulbs[channel].bottom);
    assert.ok(stacked[index].path.includes(` L ${[2, 4, 98][index]} 134 `));
    assert.ok(!wide[index].path.includes(' L '), 'Wide routes should not use side rails');
  }
  assert.deepEqual(stacked.slice(-3), wide.slice(-3), 'Side rails must not alter bulb-to-pixel routes');
});
