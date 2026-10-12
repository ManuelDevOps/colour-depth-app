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

function channelBits(value, width) {
  const maximum = 2 ** width - 1;
  for (let encoded = 0; encoded <= maximum; encoded += 1) {
    const decoded = width === 8 ? encoded : Math.round(encoded * 255 / maximum);
    if (decoded === value) {
      return [...encoded.toString(2).padStart(width, '0')].map(Number);
    }
  }
  return null;
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

/** Return the smallest exact { depth, bits } for integer RGB channels from 0 to 255. */
export function colourStateFromRgb(r, g, b) {
  if (![r, g, b].every((value) => Number.isInteger(value) && value >= 0 && value <= 255)) {
    throw new RangeError('RGB channels must be integers from 0 to 255.');
  }

  for (const depth of SUPPORTED_DEPTHS) {
    let bits;
    if (depth === 1) {
      bits = r === g && g === b && (r === 0 || r === 255) ? [r === 255 ? 1 : 0] : null;
    } else {
      const channels = [r, g, b].map((value, index) => channelBits(value, CHANNEL_WIDTHS[depth][index]));
      bits = channels.every((channel) => channel !== null) ? channels.flat() : null;
    }

    if (bits) {
      const result = calculateColour(depth, bits);
      if (result.r === r && result.g === g && result.b === b) {
        return { depth, bits };
      }
    }
  }
}

/** Parse a six-digit #RRGGBB string into numeric RGB channels. */
export function parseHexColour(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new TypeError('HEX colour must be six digits prefixed with #.');
  }
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

/** Parse #RRGGBB and return its smallest exact { depth, bits }. */
export function colourStateFromHex(hex) {
  const { r, g, b } = parseHexColour(hex);
  return colourStateFromRgb(r, g, b);
}
