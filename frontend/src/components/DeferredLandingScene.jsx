import { useEffect, useRef } from 'react'

export function DeferredLandingScene() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let mounted = false
    const mount = () => {
      if (mounted) return
      mounted = true
      const frame = document.createElement('iframe')
      frame.className = 'sylva-scene-frame'
      frame.title = 'Praxivon Labs interactive introduction'
      frame.src = '/landing-pages/praxivon-green-3d.html'
      frame.loading = 'lazy'
      frame.referrerPolicy = 'no-referrer'
      host.appendChild(frame)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        mount()
        observer.disconnect()
      }
    }, { rootMargin: '300px' })
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  return <section ref={hostRef} className="sylva-scene" aria-label="Praxivon Labs introduction" />
}
