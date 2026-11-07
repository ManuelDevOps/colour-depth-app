export function initialTheme(getStorage = () => sessionStorage) {
  try {
    return getStorage().getItem('colour-explorer-theme') === 'colourful' ? 'colourful' : 'cyber';
  } catch {
    return 'cyber';
  }
}
