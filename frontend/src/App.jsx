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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
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
  return (
    <div id="top">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
