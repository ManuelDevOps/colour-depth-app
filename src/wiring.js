const svgNamespace = 'http://www.w3.org/2000/svg';
const channels = ['r', 'g', 'b'];

function curve(start, end) {
  const middle = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${middle}, ${end.x} ${middle}, ${end.x} ${end.y}`;
}

/** Return one route per bit-to-bulb relationship, then three bulb-to-pixel routes. */
export function buildWirePaths(groups, bulbs, pixel) {
  const wires = [];

  for (const group of groups) {
    const targets = group.channel === 'all' ? channels : [group.channel];
    for (const bit of group.bits) {
      for (const channel of targets) {
        wires.push({ channel, path: curve(bit, bulbs[channel].bottom) });
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
  const groups = [...switchGroups.querySelectorAll('.bit-group')].map((group) => ({
    channel: group.dataset.channel,
    bits: [...group.querySelectorAll('.bit-switch')].map((bit) => anchor(bit, bounds, 'top')),
  }));
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
