export const BUTTON_STYLES = [
  ['clay', 'Clay'],
  ['glass', 'Glass'],
  ['fabric', 'Fabric'],
]

export const BUTTON_STYLE_KEY = 'praxivon:button-style'

export function readButtonStyle() {
  try {
    const stored = localStorage.getItem(BUTTON_STYLE_KEY)
    if (BUTTON_STYLES.some(([id]) => id === stored)) return stored
  } catch {
    /* storage blocked */
  }
  return 'clay'
}

// Applied once at startup so the first paint already uses the chosen style.
export function applyStoredButtonStyle() {
  document.documentElement.dataset.btn = readButtonStyle()
}
