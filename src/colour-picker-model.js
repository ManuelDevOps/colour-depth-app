function wrapHue(hue) {
  const remainder = hue % 360;
  const wrapped = remainder < 0 ? remainder + 360 : remainder;
  // A tiny negative angle can round to a full turn; also normalize negative zero.
  return wrapped === 0 || wrapped === 360 ? 0 : wrapped;
}

/** Return { h, s, v }: hue in degrees, saturation/value in 0..100; gray has hue zero. */
export function rgbToHsv(r, g, b) {
  if (![r, g, b].every((value) => Number.isInteger(value) && value >= 0 && value <= 255)) {
    throw new RangeError('RGB channels must be integers from 0 to 255.');
  }

  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const chroma = maximum - minimum;
  let h = 0;

  if (chroma !== 0) {
    if (maximum === r) h = 60 * (g - b) / chroma;
    else if (maximum === g) h = 60 * ((b - r) / chroma + 2);
    else h = 60 * ((r - g) / chroma + 4);
  }

  return {
    h: wrapHue(h),
    s: maximum === 0 ? 0 : chroma * 100 / maximum,
    v: maximum * 100 / 255,
  };
}

/** Return rounded integer RGB channels; finite hue wraps, saturation/value must be in 0..100. */
export function hsvToRgb(h, s, v) {
  if (![h, s, v].every(Number.isFinite) || s < 0 || s > 100 || v < 0 || v > 100) {
    throw new RangeError('HSV requires a finite hue and saturation/value from 0 to 100.');
  }

  const sector = wrapHue(h) / 60;
  const maximum = v * 255 / 100;
  const chroma = maximum * s / 100;
  const intermediate = chroma * (1 - Math.abs(sector % 2 - 1));
  const minimum = maximum - chroma;
  let channels;

  if (sector < 1) channels = [chroma, intermediate, 0];
  else if (sector < 2) channels = [intermediate, chroma, 0];
  else if (sector < 3) channels = [0, chroma, intermediate];
  else if (sector < 4) channels = [0, intermediate, chroma];
  else if (sector < 5) channels = [intermediate, 0, chroma];
  else channels = [chroma, 0, intermediate];

  const [r, g, b] = channels.map((channel) => Math.round(channel + minimum));
  return { r, g, b };
}

/** Return clockwise hue from screen coordinates (top = 0), or null at the exact center. */
export function hueFromPoint(x, y, centerX, centerY) {
  if (![x, y, centerX, centerY].every(Number.isFinite)) {
    throw new RangeError('Pointer and center coordinates must be finite numbers.');
  }

  const dx = x - centerX;
  const dy = y - centerY;
  if (dx === 0 && dy === 0) return null;

  return wrapHue(Math.atan2(dx, -dy) * 180 / Math.PI);
}
