const svgNamespace = 'http://www.w3.org/2000/svg';
const channels = ['r', 'g', 'b'];

function curve(start, end) {
  const middle = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${middle}, ${end.x} ${middle}, ${end.x} ${end.y}`;
}

function railCurve(start, end, railX) {
  const entry = start.y - 6;
  const exit = end.y + 14;
  return [
    `M ${start.x} ${start.y}`,
    `C ${start.x} ${entry}, ${railX} ${entry}, ${railX} ${entry}`,
    `L ${railX} ${exit}`,
    `C ${railX} ${end.y + 7}, ${end.x} ${end.y + 7}, ${end.x} ${end.y}`,
  ].join(' ');
}

/** Return one route per bit-to-bulb relationship, then three bulb-to-pixel routes. */
export function buildWirePaths(groups, bulbs, pixel) {
  const wires = [];

  for (const group of groups) {
    const targets = group.channel === 'all' ? channels : [group.channel];
    for (const bit of group.bits) {
      for (const channel of targets) {
        const path = group.rails
          ? railCurve(bit, bulbs[channel].bottom, group.rails[channel])
          : curve(bit, bulbs[channel].bottom);
        wires.push({ channel, path });
      }
    }
  }

  for (const channel of channels) {
    wires.push({ channel, path: curve(bulbs[channel].top, pixel) });
  }

  return wires;
}

function anchor(element, origin, edge) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - origin.left,
    y: (edge === 'top' ? rect.top : rect.bottom) - origin.top,
  };
}

/** Measure the current reflowed DOM, then draw non-interactive SVG paths. */
export function renderWiring(svg, diagram, switchGroups, bulbElements, swatch) {
  const bounds = diagram.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const bulbs = Object.fromEntries(channels.map((channel, index) => [channel, {
    top: anchor(bulbElements[index], bounds, 'top'),
    bottom: anchor(bulbElements[index], bounds, 'bottom'),
  }]));
  const stacked = window.matchMedia('(max-width: 560px)').matches;
  const groups = [...switchGroups.querySelectorAll('.bit-group')].map((group) => {
    const rect = group.getBoundingClientRect();
    return {
      channel: group.dataset.channel,
      bits: [...group.querySelectorAll('.bit-switch')].map((bit) => anchor(bit, bounds, 'top')),
      rails: stacked ? {
        r: rect.left - bounds.left - 16,
        g: rect.left - bounds.left - 8,
        b: rect.right - bounds.left + 10,
      } : null,
    };
  });
  const pixel = anchor(swatch, bounds, 'bottom');
  const paths = buildWirePaths(groups, bulbs, pixel).map(({ channel, path }) => {
    const element = document.createElementNS(svgNamespace, 'path');
    element.setAttribute('class', `wire wire-${channel}`);
    element.setAttribute('d', path);
    return element;
  });

  svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
  svg.replaceChildren(...paths);
}
