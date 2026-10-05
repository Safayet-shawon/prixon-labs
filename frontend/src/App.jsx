import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { projects } from './data'
import { Header, Footer } from './components/Layout'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { Work } from './pages/Work'
import { CaseStudy } from './pages/CaseStudy'
import { Studio } from './pages/Studio'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'
import { Privacy } from './pages/Privacy'
import { BusinessCTA } from './components/BusinessCTA'
import { SectionReveals } from './components/SectionReveals'

function ScrollToTop() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    let secondFrame
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        let id = ''
        try {
          id = decodeURIComponent(hash.slice(1))
        } catch {
          /* Ignore malformed fragments. */
        }
        const target = id && document.getElementById(id)
        if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'instant' })
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [pathname, hash, key])
  useEffect(() => {
    const section =
      pathname === '/'
        ? ''
        : pathname.startsWith('/work/')
          ? projects.find((project) => pathname.endsWith(`/${project.slug}`))?.name || 'Work'
          : {
              '/services': 'Services',
              '/work': 'Work',
              '/studio': 'Studio',
              '/contact': 'Contact',
            }[pathname] || 'Page not found'
    document.title = `${section ? `${section} — ` : ''}Praxivon Labs`
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <div id="top" className={isHome ? 'app-home' : 'app-inner'}>
      <ScrollToTop />
      <SectionReveals />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!isHome && <Header />}
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BusinessCTA key={pathname} />
      </main>
      <Footer />
    </div>
  )
}
