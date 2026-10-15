import { useEffect, useState } from 'react'
import { BUTTON_STYLES, BUTTON_STYLE_KEY, readButtonStyle } from '../lib/buttonStyle'

export function ButtonStyleSwitch() {
  const [style, setStyle] = useState(readButtonStyle)
  useEffect(() => {
    document.documentElement.dataset.btn = style
    try {
      localStorage.setItem(BUTTON_STYLE_KEY, style)
    } catch {
      /* storage blocked */
    }
  }, [style])
  return (
    <div className="btn-switch" role="group" aria-label="Button style">
      <span className="footer-label">BUTTON STYLE</span>
      <div>
        {BUTTON_STYLES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`btn btn-sm ${style === id ? 'is-active' : ''}`}
            aria-pressed={style === id}
            onClick={() => setStyle(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
