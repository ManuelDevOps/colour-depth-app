const translations = {
  en: {
    title: 'Binary Pixel Colour Explorer',
    depthTitle: 'Colour depth (bits per pixel)',
    depth1: '1 bit',
    depth3: '3 bits',
    depth8: '8 bits',
    depth24: '24 bits',
    resultTitle: 'Resulting pixel',
    rgbLabel: 'RGB colour:',
    hexLabel: 'Hexadecimal colour:',
    channelsTitle: 'RGB channels',
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    monochrome: 'Monochrome (all RGB channels)',
    switchesTitle: 'Binary switches',
    bit: 'Bit',
    on: 'on',
    off: 'off',
    languageTarget: 'ES',
    languageAction: 'Switch to Spanish',
    helpButton: 'Help',
    helpTitle: 'How the explorer works',
    helpGeneral: 'Each switch represents one binary bit: 0 is off and 1 is on. Together the bits determine the red, green and blue light levels and the final pixel colour. More bits allow more possible colours. Changing depth resets all switches to 0.',
    helpModeTitle: 'Current colour depth',
    help1: '1 bit: The single switch controls all three channels together. 0 makes a black pixel; 1 makes a white pixel. There are 2 possible colours.',
    help3: '3 bits (RGB111): One bit controls each of red, green and blue. Each channel is either 0 or 255, giving 8 possible colours.',
    help8: '8 bits (RGB332): Three bits control red, three green and two blue, giving 256 direct colours. Blue has fewer levels because reduced blue precision is generally less noticeable. RGB332 is one common historical direct-colour convention, not the only 8-bit format; indexed colour also existed and is outside this explorer.',
    help24: '24 bits (RGB888): Eight bits control each channel. Each channel ranges from 0 to 255, giving 16,777,216 possible colours.',
    closeHelp: 'Close help',
  },
  es: {
    title: 'Explorador del color de píxeles binarios',
    depthTitle: 'Profundidad de color (bits por píxel)',
    depth1: '1 bit',
    depth3: '3 bits',
    depth8: '8 bits',
    depth24: '24 bits',
    resultTitle: 'Píxel resultante',
    rgbLabel: 'Color RGB:',
    hexLabel: 'Color hexadecimal:',
    channelsTitle: 'Canales RGB',
    red: 'Rojo',
    green: 'Verde',
    blue: 'Azul',
    monochrome: 'Monocromo (todos los canales RGB)',
    switchesTitle: 'Interruptores binarios',
    bit: 'Bit',
    on: 'encendido',
    off: 'apagado',
    languageTarget: 'EN',
    languageAction: 'Cambiar a inglés',
    helpButton: 'Ayuda',
    helpTitle: 'Cómo funciona el explorador',
    helpGeneral: 'Cada interruptor representa un bit binario: 0 significa apagado y 1, encendido. Los bits determinan la intensidad de las luces roja, verde y azul y el color final del píxel. Más bits permiten más colores. Al cambiar la profundidad, todos los interruptores vuelven a 0.',
    helpModeTitle: 'Profundidad de color actual',
    help1: '1 bit: El único interruptor controla los tres canales a la vez. 0 produce un píxel negro y 1, uno blanco. Hay 2 colores posibles.',
    help3: '3 bits (RGB111): Un bit controla cada canal: rojo, verde y azul. Cada canal vale 0 o 255, lo que permite 8 colores.',
    help8: '8 bits (RGB332): Tres bits controlan el rojo, tres el verde y dos el azul, lo que permite 256 colores directos. El azul tiene menos niveles porque la pérdida de precisión en ese canal suele notarse menos. RGB332 es una convención histórica habitual de color directo, no el único formato de 8 bits; también existió el color indexado, que queda fuera de este explorador.',
    help24: '24 bits (RGB888): Ocho bits controlan cada canal. Cada canal puede valer entre 0 y 255, lo que permite 16.777.216 colores.',
    closeHelp: 'Cerrar ayuda',
  },
};

Object.values(translations).forEach(Object.freeze);

export function getTranslations(locale) {
  if (!Object.hasOwn(translations, locale)) throw new RangeError('Unsupported language.');
  return translations[locale];
}

/** Visible labels share the accessible state vocabulary, with switch-face casing. */
export function switchStateLabel(locale, enabled) {
  const text = getTranslations(locale);
  return (enabled ? text.on : text.off).toUpperCase();
}

export function switchDescription(locale, channel, position, width, enabled) {
  const text = getTranslations(locale);
  if (!['red', 'green', 'blue', 'monochrome'].includes(channel)) {
    throw new RangeError('Unsupported channel.');
  }
  const channelName = text[channel][0].toLowerCase() + text[channel].slice(1);
  return locale === 'es'
    ? `Bit ${position} de ${width} de ${channelName}, ${enabled ? text.on : text.off}`
    : `${text[channel]} bit ${position} of ${width}, ${enabled ? text.on : text.off}`;
}

export function pixelDescription(locale, hex) {
  return `${getTranslations(locale).resultTitle}: ${hex}`;
}
