import { calculateColour, changeColourDepth, createColourState } from './colour-model.js';

const channelNames = ['Red', 'Green', 'Blue'];
const channelKeys = ['r', 'g', 'b'];
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

let state = createColourState(Number(document.querySelector('input[name="depth"]:checked').value));

function renderResult() {
  const { r, g, b, hex } = calculateColour(state.depth, state.bits);
  swatch.style.backgroundColor = hex;
  swatch.setAttribute('aria-label', `Resulting pixel: ${hex}`);
  rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
  hexValue.textContent = hex;
  [r, g, b].forEach((value, index) => {
    channelValues[index].textContent = value;
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
