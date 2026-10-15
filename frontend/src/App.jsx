import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header, Footer } from './components/Layout'
import { BusinessCTA } from './components/BusinessCTA'
import { SectionReveals } from './components/SectionReveals'
import { PageSkeleton } from './components/Skeleton'

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })))
const Work = lazy(() => import('./pages/Work').then((m) => ({ default: m.Work })))
const CaseStudy = lazy(() => import('./pages/CaseStudy').then((m) => ({ default: m.CaseStudy })))
const Lab = lazy(() => import('./pages/Lab').then((m) => ({ default: m.Lab })))
const Studio = lazy(() => import('./pages/Studio').then((m) => ({ default: m.Studio })))
const Contact = lazy(() => import('./pages/ContactLive').then((m) => ({ default: m.ContactLive })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

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
          /* malformed hash */
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
          ? 'Work'
          : {
              '/services': 'Services',
              '/work': 'Work',
              '/lab': 'Solution Lab',
              '/studio': 'Studio',
              '/contact': 'Contact',
              '/privacy': 'Privacy',
              '/admin': 'Admin',
            }[pathname] || 'Page not found'
    document.title = `${section ? `${section} — ` : ''}Praxivon Labs`
    const description = PAGE_DESCRIPTIONS[pathname] || PAGE_DESCRIPTIONS['/']
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${SITE}${pathname === '/' ? '' : pathname}`)
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        'content',
        pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow',
      )
  }, [pathname])
  return null
}

const SITE = 'https://praxivonlabs.vercel.app'
const PAGE_DESCRIPTIONS = {
  '/': 'Praxivon Labs is an independent digital product studio building CRM, ERP, inventory, websites and automation for growing businesses.',
  '/services':
    'CRM, ERP, inventory, websites, dashboards, booking systems and automation, designed and engineered end to end.',
  '/work':
    'Sector concept projects across manufacturing, healthcare, real estate, logistics, hospitality and education.',
  '/lab':
    'Free interactive tools powered by matrix mathematics: forecast your sales pipeline, plan stock and materials, and compare options fairly.',
  '/studio':
    'A small, focused digital studio in Dhaka, Bangladesh, working with businesses worldwide.',
  '/contact': 'Tell us about your project or request a business workflow demo from Praxivon Labs.',
  '/privacy': 'How Praxivon Labs handles the details you share with us.',
}

function PageFallback() {
  return <PageSkeleton />
}

export default function App() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isAdmin = pathname.startsWith('/admin')
  return (
    <div id="top" className={isHome ? 'app-home' : 'app-inner'}>
      <ScrollToTop />
      <SectionReveals />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!isHome && !isAdmin && <Header />}
      <main id="main-content" tabIndex="-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<CaseStudy />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {!isAdmin && <BusinessCTA key={pathname} />}
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}
