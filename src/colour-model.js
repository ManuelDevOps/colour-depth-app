const SUPPORTED_DEPTHS = [1, 3, 8, 24];
const CHANNEL_WIDTHS = {
  3: [1, 1, 1],
  8: [3, 3, 2],
  24: [8, 8, 8],
};

function assertDepth(depth) {
  if (!SUPPORTED_DEPTHS.includes(depth)) {
    throw new RangeError('Colour depth must be 1, 3, 8 or 24 bits.');
  }
}

function assertBits(depth, bits) {
  if (!Array.isArray(bits) || bits.length !== depth) {
    throw new TypeError(`Expected an array of ${depth} binary bits.`);
  }

  for (let index = 0; index < depth; index += 1) {
    if (bits[index] !== 0 && bits[index] !== 1) {
      throw new TypeError('Each bit must be the number 0 or 1.');
    }
  }
}

function decodeChannel(bits, start, width) {
  let value = 0;
  for (let index = start; index < start + width; index += 1) {
    value = value * 2 + bits[index];
  }
  return width === 8 ? value : Math.round(value * 255 / (2 ** width - 1));
}

function toHex(channel) {
  return channel.toString(16).padStart(2, '0').toUpperCase();
}

/** Create { depth, bits } with all bits off; depth must be 1, 3, 8 or 24. */
export function createColourState(depth) {
  assertDepth(depth);
  return { depth, bits: Array(depth).fill(0) };
}

/** Return a new state: a different depth clears every bit; the same depth preserves them. */
export function changeColourDepth(state, depth) {
  assertDepth(depth);
  if (!state || typeof state !== 'object' || !SUPPORTED_DEPTHS.includes(state.depth)) {
    throw new TypeError('Expected a valid colour state.');
  }
  assertBits(state.depth, state.bits);

  if (depth === state.depth) {
    return { depth, bits: [...state.bits] };
  }
  return createColourState(depth);
}

/** Return { r, g, b, hex } from numeric bits, leftmost/MSB first in each channel. */
export function calculateColour(depth, bits) {
  assertDepth(depth);
  assertBits(depth, bits);

  let r;
  let g;
  let b;

  if (depth === 1) {
    r = g = b = bits[0] * 255;
  } else {
    const [redWidth, greenWidth, blueWidth] = CHANNEL_WIDTHS[depth];
    r = decodeChannel(bits, 0, redWidth);
    g = decodeChannel(bits, redWidth, greenWidth);
    b = decodeChannel(bits, redWidth + greenWidth, blueWidth);
  }

  return { r, g, b, hex: `#${toHex(r)}${toHex(g)}${toHex(b)}` };
}
