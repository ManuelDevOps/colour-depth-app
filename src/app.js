import { calculateColour, changeColourDepth, colourStateFromHex, colourStateFromRgb, createColourState } from './colour-model.js';
import { hueFromPoint, hsvToRgb, rgbToHsv } from './colour-picker-model.js';
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
const hexInput = document.querySelector('#edit-hex');
const editorInputs = [...channelKeys.map((key) => document.querySelector(`#edit-${key}`)),
  hexInput];
const editorError = document.querySelector('#edit-error');
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
const pickerDialog = document.querySelector('#picker-dialog');
const hueRing = document.querySelector('#picker-hue');
const saturationInput = document.querySelector('#picker-saturation');
const brightnessInput = document.querySelector('#picker-brightness');
const pickerPreview = document.querySelector('#picker-preview');
const pickerHex = document.querySelector('#picker-hex');
const pickerClose = document.querySelector('#picker-close');

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
let errorInput = null;
let pickerHsv = { h: 0, s: 0, v: 0 };
let huePointer = null;

function showEditorError(input) {
  if (errorInput && errorInput !== input) {
    errorInput.removeAttribute('aria-invalid');
    errorInput.removeAttribute('aria-describedby');
  }
  errorInput = input;
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'edit-hint edit-error');
  }
  editorError.textContent = input
    ? getTranslations(language)[input.id === 'edit-hex' ? 'hexError' : 'rgbError'] : '';
}

function syncEditor(colour) {
  [...[colour.r, colour.g, colour.b], colour.hex].forEach((value, index) => {
    if (editorInputs[index].dataset.dirty !== 'true') editorInputs[index].value = value;
  });
}

function clearEditorDrafts() {
  editorInputs.forEach((input) => { input.dataset.dirty = 'false'; });
  showEditorError(null);
}

function applyColourState(next) {
  state = next;
  clearEditorDrafts();
  depthInputs.forEach((radio) => { radio.checked = Number(radio.value) === state.depth; });
  renderSwitches();
  renderLanguage();
}

function commitEditor(input) {
  try {
    let next;
    if (input.id === 'edit-hex') {
      next = colourStateFromHex(input.value);
    } else {
      const raw = input.value;
      if (input.validity.badInput || !/^\d+$/.test(raw) || Number(raw) > 255) {
        throw new RangeError('Invalid RGB channel.');
      }
      const colour = calculateColour(state.depth, state.bits);
      colour[input.id.slice(-1)] = Number(raw);
      next = colourStateFromRgb(colour.r, colour.g, colour.b);
    }
    applyColourState(next);
  } catch (error) {
    if (!(error instanceof TypeError || error instanceof RangeError)) throw error;
    input.dataset.dirty = 'true';
    showEditorError(input);
  }
}

editorInputs.forEach((input) => {
  input.addEventListener('input', () => {
    input.dataset.dirty = 'true';
    if (input === hexInput && input.value !== '' && !input.value.startsWith('#')) {
      input.value = `#${input.value}`.slice(0, 7);
      input.setSelectionRange(input.value.length, input.value.length);
    }
    if (errorInput === input) showEditorError(null);
  });
  input.addEventListener('change', () => commitEditor(input));
  input.addEventListener('blur', () => {
    if (input.dataset.dirty === 'true' && errorInput !== input) commitEditor(input);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEditor(input);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      input.dataset.dirty = 'false';
      if (errorInput === input) showEditorError(null);
      syncEditor(calculateColour(state.depth, state.bits));
    }
  });
});

hexInput.addEventListener('focus', () => {
  if (hexInput.value === '') hexInput.value = '#';
  if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
    hexInput.setSelectionRange(1, 7);
  } else {
    hexInput.setSelectionRange(hexInput.value.length, hexInput.value.length);
  }
});

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
  editorInputs.forEach((input, index) => {
    input.setAttribute('aria-label', text[['redInput', 'greenInput', 'blueInput', 'hexInput'][index]]);
  });
  if (errorInput) showEditorError(errorInput);
  renderPickerControls();

  switchGroups.querySelectorAll('.bit-group').forEach((group) => {
    const channel = group.dataset.channel === 'all'
      ? 'monochrome'
      : channelNames[channelKeys.indexOf(group.dataset.channel)];
    group.querySelector('legend').textContent = text[channel];
    group.querySelectorAll('.bit-switch').forEach((button, index) => {
      const enabled = state.bits[Number(button.dataset.bitIndex)] === 1;
      button.setAttribute('aria-checked', String(enabled));
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
  pickerPreview.style.backgroundColor = hex;
  pickerHex.textContent = hex;
  syncEditor({ r, g, b, hex });
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
  clearEditorDrafts();

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
    clearEditorDrafts();
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

function renderPickerControls() {
  const text = getTranslations(language);
  hueRing.setAttribute('aria-label', text.pickerHue);
  hueRing.setAttribute('aria-valuenow', String(pickerHsv.h));
  hueRing.setAttribute('aria-valuetext', `${Number(pickerHsv.h.toFixed(1))} ${text.degrees}`);
  const angle = pickerHsv.h * Math.PI / 180;
  hueRing.style.setProperty('--marker-x', `${50 + 42 * Math.sin(angle)}%`);
  hueRing.style.setProperty('--marker-y', `${50 - 42 * Math.cos(angle)}%`);
  [[saturationInput, pickerHsv.s, 'pickerSaturation'],
    [brightnessInput, pickerHsv.v, 'pickerBrightness']].forEach(([input, value, key]) => {
    input.value = value;
    input.setAttribute('aria-label', text[key]);
    input.setAttribute('aria-valuetext', `${Number(value.toFixed(1))} ${text.percent}`);
    document.querySelector(`#${input.id}-value`).textContent = `${Number(value.toFixed(1))}%`;
  });
}

function applyPickerColour() {
  // Keep floating HSV as the interaction source; rounded RGB must not feed back into it.
  const { r, g, b } = hsvToRgb(pickerHsv.h, pickerHsv.s, pickerHsv.v);
  applyColourState(colourStateFromRgb(r, g, b));
}

function promoteHueColour() {
  if (pickerHsv.s === 0) pickerHsv.s = 100;
  if (pickerHsv.v === 0) pickerHsv.v = 100;
}

function pointerHue(event) {
  const rect = hueRing.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  if (Math.hypot(event.clientX - centerX, event.clientY - centerY) < rect.width * .32) {
    return null;
  }
  return hueFromPoint(event.clientX, event.clientY, centerX, centerY);
}

hueRing.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || huePointer !== null) return;
  const hue = pointerHue(event);
  if (hue === null) return;
  event.preventDefault();
  hueRing.focus();
  huePointer = event.pointerId;
  hueRing.setPointerCapture(huePointer);
  promoteHueColour();
  pickerHsv.h = hue;
  applyPickerColour();
});

hueRing.addEventListener('pointermove', (event) => {
  if (event.pointerId !== huePointer) return;
  const hue = pointerHue(event);
  if (hue === null) return;
  pickerHsv.h = hue;
  applyPickerColour();
});

function endHueGesture(event) {
  if (event.pointerId !== huePointer) return;
  if (hueRing.hasPointerCapture(huePointer)) hueRing.releasePointerCapture(huePointer);
  huePointer = null;
}

['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
  hueRing.addEventListener(type, endHueGesture);
});

hueRing.addEventListener('keydown', (event) => {
  const directions = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
  if (!Object.hasOwn(directions, event.key) && !['Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  promoteHueColour();
  if (event.key === 'Home') pickerHsv.h = 0;
  else if (event.key === 'End') pickerHsv.h = 359;
  else pickerHsv.h = (pickerHsv.h + directions[event.key] * (event.shiftKey ? 10 : 1) + 360) % 360;
  applyPickerColour();
});

[[saturationInput, 's'], [brightnessInput, 'v']].forEach(([input, key]) => {
  input.addEventListener('input', () => {
    pickerHsv[key] = Number(input.value);
    applyPickerColour();
  });
});

swatch.addEventListener('click', () => {
  const { r, g, b } = calculateColour(state.depth, state.bits);
  pickerHsv = rgbToHsv(r, g, b);
  renderPickerControls();
  pickerDialog.showModal();
});
pickerClose.addEventListener('click', () => pickerDialog.close());
pickerDialog.addEventListener('close', () => {
  if (huePointer !== null && hueRing.hasPointerCapture(huePointer)) {
    hueRing.releasePointerCapture(huePointer);
  }
  huePointer = null;
  swatch.focus();
});

renderSwitches();
renderLanguage();

const resizeObserver = new ResizeObserver(scheduleWiring);
[diagram, swatch, switchGroups, ...bulbElements].forEach((element) => resizeObserver.observe(element));
window.addEventListener('resize', scheduleWiring);
document.fonts.ready.then(scheduleWiring);
