import { lazy, Suspense, useEffect, useState } from 'react'
import { SylvaScene } from '../components/SylvaScene'
import { Skeleton } from '../components/Skeleton'

const HomeSections = lazy(() => import('./HomeSections').then((m) => ({ default: m.HomeSections })))

// Everything below the hero (animation library, 3D feature, stories) loads on the
// first sign of engagement, or when the browser is idle after load.
function useEngaged() {
  const [engaged, setEngaged] = useState(false)
  useEffect(() => {
    if (engaged) return undefined
    const go = () => setEngaged(true)
    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown']
    events.forEach((name) => window.addEventListener(name, go, { once: true, passive: true }))
    let cancel = () => {}
    // Wait a few seconds after load so the hero settles first, then use idle time.
    const arm = () => {
      let idleId
      const timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(go)
        else go()
      }, 6000)
      cancel = () => {
        window.clearTimeout(timer)
        if (idleId) window.cancelIdleCallback(idleId)
      }
    }
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })
    return () => {
      events.forEach((name) => window.removeEventListener(name, go))
      window.removeEventListener('load', arm)
      cancel()
    }
  }, [engaged])
  return engaged
}

export function Home() {
  const engaged = useEngaged()
  return (
    <>
      <SylvaScene />
      {engaged ? (
        <Suspense fallback={<HomeFallback />}>
          <HomeSections />
        </Suspense>
      ) : (
        <HomeFallback />
      )}
    </>
  )
}

function HomeFallback() {
  return (
    <div className="container home-fallback" aria-hidden="true">
      <Skeleton className="sk-title sk-title-short" />
      <Skeleton className="sk-card" />
    </div>
  )
}
