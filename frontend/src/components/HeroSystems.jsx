import { usePrefersReducedMotion } from '../hooks/useMotionPreferences'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import './hero-systems.css'

export function HeroSystems() {
  const sectionRef = useRef(null)
  const canvasHostRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })
  const connectedRef = useRef(false)
  const [connected, setConnected] = useState(false)
  const [eligible, setEligible] = useState(() => {
    const connection = navigator.connection
    return (
      window.matchMedia('(min-width: 961px) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !connection?.saveData &&
      !['slow-2g', '2g'].includes(connection?.effectiveType)
    )
  })
  const [nearViewport, setNearViewport] = useState(false)
  const [sceneState, setSceneState] = useState('static')
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = progress >= 0.65
    if (connectedRef.current !== next) {
      connectedRef.current = next
      setConnected(next)
    }
  })

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 961px) and (pointer: fine)')
    const connection = navigator.connection
    const update = () => {
      const constrainedConnection =
        connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType)
      setEligible(desktop.matches && !reducedMotion && !constrainedConnection)
    }
    update()
    desktop.addEventListener('change', update)
    connection?.addEventListener?.('change', update)
    return () => {
      desktop.removeEventListener('change', update)
      connection?.removeEventListener?.('change', update)
    }
  }, [reducedMotion])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), {
      rootMargin: '500px',
    })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!eligible || !nearViewport) {
      setSceneState('static')
      return
    }

    let cancelled = false
    let scene
    let intersects = false
    const host = canvasHostRef.current
    const updateActivity = () => scene?.setActive(intersects && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting
      updateActivity()
    })
    observer.observe(host)
    document.addEventListener('visibilitychange', updateActivity)
    setSceneState('loading')

    // Importing here keeps Three.js out of mobile and reduced-motion requests.
    import('./createHeroScene.js')
      .then(({ createHeroScene }) => {
        if (cancelled) return
        scene = createHeroScene({
          host,
          getProgress: () => scrollYProgress.get(),
          getPointer: () => pointer.current,
          onReady: () => !cancelled && setSceneState('ready'),
          onFailure: () => !cancelled && setSceneState('failed'),
        })
        updateActivity()
      })
      .catch(() => {
        if (!cancelled) setSceneState('failed')
      })

    return () => {
      cancelled = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateActivity)
      scene?.destroy()
    }
  }, [eligible, nearViewport, scrollYProgress])

  function updatePointer(event) {
    if (!eligible) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointer.current.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    pointer.current.y = -((event.clientY - bounds.top) / bounds.height - 0.5) * 2
  }

  return (
    <div
      ref={sectionRef}
      className={`hero-systems ${eligible && sceneState !== 'failed' ? 'hero-systems-interactive' : ''}`}
      data-scene={sceneState}
    >
      <div className="hero-systems-sticky container">
        <div
          className="hero-systems-stage"
          onPointerMove={updatePointer}
          onPointerLeave={() => {
            pointer.current = { x: 0, y: 0 }
          }}
        >
          <div className="hero-systems-heading">
            <span className="eyebrow">YOUR BUSINESS / CONNECTED</span>
            <span className="hero-systems-caption">Six systems. One clear picture.</span>
          </div>
          <img
            className="hero-systems-fallback"
            src="/images/connected-systems.svg"
            width="1280"
            height="720"
            alt="ERP, CRM, Inventory, Finance, HR and Web connected in one unified business dashboard."
          />
          <div className="hero-systems-canvas" ref={canvasHostRef} aria-hidden="true" />
          <div className="hero-systems-footer">
            <div className="hero-systems-state" aria-hidden="true">
              <span>
                {eligible && sceneState === 'ready' && !connected
                  ? 'SCROLL TO CONNECT ↓'
                  : 'ONE CONNECTED VIEW ↗'}
              </span>
            </div>
            <span className="hero-systems-note">Illustrative interface / Praxivon Labs</span>
          </div>
          {eligible && sceneState === 'ready' && (
            <div className="hero-systems-progress" aria-hidden="true">
              <motion.span style={{ scaleX: scrollYProgress }} />
            </div>
          )}
        </div>
        <p className="sr-only">
          The desktop illustration brings six separate systems together as you scroll. A static
          dashboard is displayed on mobile and when reduced motion is enabled.
        </p>
      </div>
    </div>
  )
}
