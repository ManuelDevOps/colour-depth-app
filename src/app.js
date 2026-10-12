import { calculateColour, changeColourDepth, createColourState } from './colour-model.js';
import { renderWiring } from './wiring.js';

const channelNames = ['Red', 'Green', 'Blue'];
const channelKeys = ['r', 'g', 'b'];
const glowColours = ['230, 35, 55', '25, 180, 80', '40, 95, 240'];
const widthsByDepth = {
  1: [1],
  3: [1, 1, 1],
  8: [3, 3, 2],
  24: [8, 8, 8],
};

const depthInputs = document.querySelectorAll('input[name="depth"]');
const switchGroups = document.querySelector('#switch-groups');
const swatch = document.querySelector('#pixel-swatch');
const rgbValue = document.querySelector('#rgb-value');
const hexValue = document.querySelector('#hex-value');
const channelValues = channelKeys.map((key) =>
  document.querySelector(`[data-channel-value="${key}"]`)
);
const bulbElements = channelKeys.map((key) => document.querySelector(`[data-bulb="${key}"]`));
const diagram = document.querySelector('#diagram');
const wiring = document.querySelector('#wiring');

let wiringFrame = 0;

function scheduleWiring() {
  if (wiringFrame) return;
  wiringFrame = requestAnimationFrame(() => {
    wiringFrame = 0;
    renderWiring(wiring, diagram, switchGroups, bulbElements, swatch);
  });
}

let state = createColourState(Number(document.querySelector('input[name="depth"]:checked').value));

function renderResult() {
  const { r, g, b, hex } = calculateColour(state.depth, state.bits);
  swatch.style.backgroundColor = hex;
  swatch.setAttribute('aria-label', `Resulting pixel: ${hex}`);
  rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
  hexValue.textContent = hex;
  [r, g, b].forEach((value, index) => {
    channelValues[index].textContent = value;
    const intensity = value / 255;
    const light = [42, 42, 42];
    light[index] = Math.round(42 + intensity * 213);
    bulbElements[index].style.setProperty('--bulb-colour', `rgb(${light.join(' ')})`);
    bulbElements[index].style.setProperty('--bulb-glow',
      `rgba(${glowColours[index]}, ${(.7 * intensity).toFixed(3)})`);
    bulbElements[index].style.setProperty('--glow-size', `${Math.round(5 + 22 * intensity)}px`);
  });
}

function createSwitch(index, position, width, channelName) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bit-switch';
  button.dataset.bitIndex = index;
  button.setAttribute('role', 'switch');
  button.setAttribute('aria-checked', 'false');
  button.setAttribute('aria-label', `${channelName} bit ${position} of ${width}`);

  const bitIndex = document.createElement('span');
  bitIndex.className = 'bit-index';
  bitIndex.setAttribute('aria-hidden', 'true');
  bitIndex.textContent = `Bit ${position}`;

  const track = document.createElement('span');
  track.className = 'switch-track';
  track.setAttribute('aria-hidden', 'true');
  const lever = document.createElement('span');
  lever.className = 'switch-lever';
  track.append(lever);

  const digit = document.createElement('span');
  digit.className = 'bit-digit';
  digit.setAttribute('aria-hidden', 'true');
  digit.textContent = '0';
  button.append(bitIndex, track, digit);
  return button;
}

function renderSwitches() {
  const groups = [];
  let offset = 0;

  widthsByDepth[state.depth].forEach((width, channelIndex) => {
    const name = state.depth === 1
      ? 'Monochrome (all RGB channels)'
      : channelNames[channelIndex];
    const group = document.createElement('fieldset');
    group.className = 'bit-group';
    group.dataset.width = width;
    group.dataset.channel = state.depth === 1 ? 'all' : channelKeys[channelIndex];
    const legend = document.createElement('legend');
    legend.textContent = name;

    const grid = document.createElement('div');
    grid.className = 'bit-grid';
    grid.style.setProperty('--bit-count', width);
    for (let position = 1; position <= width; position += 1) {
      grid.append(createSwitch(offset + position - 1, position, width, name));
    }

    group.append(legend, grid);
    groups.push(group);
    offset += width;
  });

  switchGroups.replaceChildren(...groups);
  scheduleWiring();
}

switchGroups.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-bit-index]');
  if (!button || !switchGroups.contains(button)) return;

  const index = Number(button.dataset.bitIndex);
  const bits = [...state.bits];
  bits[index] = bits[index] === 0 ? 1 : 0;
  state = { ...state, bits };

  button.setAttribute('aria-checked', String(bits[index] === 1));
  button.querySelector('.bit-digit').textContent = String(bits[index]);
  renderResult();
});

depthInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    state = changeColourDepth(state, Number(input.value));
    renderSwitches();
    renderResult();
  });
});

renderSwitches();
renderResult();

const resizeObserver = new ResizeObserver(scheduleWiring);
[diagram, swatch, switchGroups, ...bulbElements].forEach((element) => resizeObserver.observe(element));
window.addEventListener('resize', scheduleWiring);
document.fonts.ready.then(scheduleWiring);
