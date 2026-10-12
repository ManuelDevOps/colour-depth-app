import { calculateColour, changeColourDepth, createColourState } from './colour-model.js';
import { renderWiring } from './wiring.js';
import { getTranslations, pixelDescription, switchDescription, switchStateLabel } from './translations.js';

const channelNames = ['red', 'green', 'blue'];
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
const languageToggle = document.querySelector('#language-toggle');
const helpOpen = document.querySelector('#help-open');
const helpDialog = document.querySelector('#help-dialog');
const helpClose = document.querySelector('#help-close');
const helpMode = document.querySelector('#help-mode');

let language = 'en';
try {
  if (sessionStorage.getItem('colour-explorer-language') === 'es') language = 'es';
} catch {
  // The explorer still works when browser storage is disabled.
}

let wiringFrame = 0;

function scheduleWiring() {
  if (wiringFrame) return;
  wiringFrame = requestAnimationFrame(() => {
    wiringFrame = 0;
    renderWiring(wiring, diagram, switchGroups, bulbElements, swatch);
  });
}

let state = createColourState(Number(document.querySelector('input[name="depth"]:checked').value));

function renderLanguage() {
  const text = getTranslations(language);
  document.documentElement.lang = language;
  document.title = text.title;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = text[element.dataset.i18n];
  });
  languageToggle.textContent = text.languageTarget;
  languageToggle.setAttribute('aria-label', text.languageAction);
  helpOpen.setAttribute('aria-label', text.helpButton);
  helpMode.textContent = text[`help${state.depth}`];

  switchGroups.querySelectorAll('.bit-group').forEach((group) => {
    const channel = group.dataset.channel === 'all'
      ? 'monochrome'
      : channelNames[channelKeys.indexOf(group.dataset.channel)];
    group.querySelector('legend').textContent = text[channel];
    group.querySelectorAll('.bit-switch').forEach((button, index) => {
      const enabled = state.bits[Number(button.dataset.bitIndex)] === 1;
      button.setAttribute('aria-label', switchDescription(language, channel, index + 1,
        Number(group.dataset.width), enabled));
      button.querySelector('.bit-state').textContent = switchStateLabel(language, enabled);
      button.querySelector('.bit-digit').textContent = enabled ? '1' : '0';
    });
  });
  renderResult();
  scheduleWiring();
}

function renderResult() {
  const { r, g, b, hex } = calculateColour(state.depth, state.bits);
  swatch.style.backgroundColor = hex;
  swatch.setAttribute('aria-label', pixelDescription(language, hex));
  rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
  hexValue.textContent = hex;
  [r, g, b].forEach((value, index) => {
    channelValues[index].textContent = value;
    const intensity = value / 255;
    const light = [0, 0, 0];
    light[index] = 255;
    bulbElements[index].style.setProperty('--bulb-colour',
      `rgba(${light.join(', ')}, ${(.75 * intensity).toFixed(3)})`);
    bulbElements[index].style.setProperty('--bulb-shine',
      `rgba(255, 255, 255, ${(.6 * intensity).toFixed(3)})`);
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
  button.setAttribute('aria-label', switchDescription(language, channelName, position, width, false));

  const track = document.createElement('span');
  track.className = 'switch-track';
  track.setAttribute('aria-hidden', 'true');
  const lever = document.createElement('span');
  lever.className = 'switch-lever';
  track.append(lever);

  const label = document.createElement('span');
  label.className = 'bit-state';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = switchStateLabel(language, false);
  const digit = document.createElement('span');
  digit.className = 'bit-digit';
  digit.setAttribute('aria-hidden', 'true');
  digit.textContent = '0';
  button.append(label, track, digit);
  return button;
}

function renderSwitches() {
  const groups = [];
  let offset = 0;

  widthsByDepth[state.depth].forEach((width, channelIndex) => {
    const name = state.depth === 1
      ? 'monochrome'
      : channelNames[channelIndex];
    const group = document.createElement('fieldset');
    group.className = 'bit-group';
    group.dataset.width = width;
    group.dataset.channel = state.depth === 1 ? 'all' : channelKeys[channelIndex];
    const legend = document.createElement('legend');
    legend.textContent = getTranslations(language)[name];

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
  const group = button.closest('.bit-group');
  const channel = group.dataset.channel === 'all'
    ? 'monochrome'
    : channelNames[channelKeys.indexOf(group.dataset.channel)];
  const position = [...group.querySelectorAll('.bit-switch')].indexOf(button) + 1;
  button.setAttribute('aria-label', switchDescription(language, channel, position,
    Number(group.dataset.width), bits[index] === 1));
  button.querySelector('.bit-state').textContent = switchStateLabel(language, bits[index] === 1);
  button.querySelector('.bit-digit').textContent = String(bits[index]);
  renderResult();
});

depthInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    state = changeColourDepth(state, Number(input.value));
    renderSwitches();
    renderLanguage();
  });
});

languageToggle.addEventListener('click', () => {
  language = language === 'en' ? 'es' : 'en';
  try {
    sessionStorage.setItem('colour-explorer-language', language);
  } catch {
    // Storage restrictions must not prevent switching languages.
  }
  renderLanguage();
});

helpOpen.addEventListener('click', () => helpDialog.showModal());
helpClose.addEventListener('click', () => helpDialog.close());
helpDialog.addEventListener('close', () => helpOpen.focus());

renderSwitches();
renderLanguage();

const resizeObserver = new ResizeObserver(scheduleWiring);
[diagram, swatch, switchGroups, ...bulbElements].forEach((element) => resizeObserver.observe(element));
window.addEventListener('resize', scheduleWiring);
document.fonts.ready.then(scheduleWiring);
