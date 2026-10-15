import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const SCENE_SRC = '/landing-pages/praxivon-green-3d.html'

// The 3D introduction is heavy (several WebGL canvases). Only upgrade to it on
// capable desktop-class devices, and only after the page has loaded and gone
// idle. Everyone else gets an instant, accessible poster and can opt in.
function canRunScene() {
  if (typeof window === 'undefined') return false
  const media = (query) => window.matchMedia(query).matches
  const connection = navigator.connection
  return (
    media('(min-width: 1024px)') &&
    media('(pointer: fine)') &&
    !media('(prefers-reduced-motion: reduce)') &&
    !connection?.saveData &&
    (navigator.hardwareConcurrency || 4) >= 4 &&
    (navigator.deviceMemory || 8) >= 4
  )
}

function whenIdle(callback, timeout) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(callback, timeout)
  return () => window.clearTimeout(id)
}

export function DeferredLandingScene() {
  const hostRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [capable] = useState(canRunScene)

  const mount = useCallback(() => setMounted(true), [])

  useEffect(() => {
    if (!capable) return undefined
    const host = hostRef.current
    let cancelIdle = () => {}
    let stopped = false
    const start = () => {
      if (stopped) return
      cancelIdle = whenIdle(mount, 3000)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    // Also upgrade as soon as the visitor shows intent.
    host?.addEventListener('pointermove', mount, { once: true })
    return () => {
      stopped = true
      cancelIdle()
      window.removeEventListener('load', start)
      host?.removeEventListener('pointermove', mount)
    }
  }, [capable, mount])

  return (
    <section ref={hostRef} className="sylva-scene" aria-label="Praxivon Labs introduction">
      <div className="sylva-poster" hidden={ready}>
        <div className="sylva-poster-inner container">
          <span className="eyebrow">
            <span className="status-dot" /> PRAXIVON LABS / DIGITAL PRODUCT STUDIO
          </span>
          <h1>
            Software that makes the whole business <em>connect.</em>
          </h1>
          <p>
            CRM, ERP, inventory, websites and automation, designed and engineered by an independent
            studio in Dhaka.
          </p>
          <div className="sylva-poster-actions">
            <Link className="btn" to="/contact#demo">
              Get a demo <ArrowUpRight size={16} />
            </Link>
            <Link className="btn btn-quiet" to="/lab">
              Try the Solution Lab
            </Link>
            {!mounted && (
              <button type="button" className="btn btn-quiet" onClick={mount}>
                Play the interactive intro
              </button>
            )}
          </div>
          <nav className="sylva-poster-nav" aria-label="Main navigation">
            <Link to="/services">Services</Link>
            <Link to="/work">Work</Link>
            <Link to="/lab">Lab</Link>
            <Link to="/studio">Studio</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </div>
      {mounted && (
        <iframe
          className="sylva-scene-frame"
          title="Praxivon Labs interactive introduction"
          src={SCENE_SRC}
          referrerPolicy="no-referrer"
          onLoad={() => setReady(true)}
        />
      )}
    </section>
  )
}
