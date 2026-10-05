import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { email } from '../config'

export function Wordmark({ inverse = false }) {
  return (
    <Link
      to="/"
      className={`wordmark ${inverse ? 'wordmark-light' : ''}`}
      aria-label="Praxivon Labs home"
    >
      <span className="wordmark-mark">✳</span>
      <span>
        praxivon<span className="wordmark-dot">.</span>
        <small>LABS</small>
      </span>
    </Link>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname, location.hash])
  useEffect(() => {
    if (!open) return
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        document.querySelector('.menu-toggle')?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])
  const nav = [
    ['/', 'Home'],
    ['/services', 'Services'],
    ['/work', 'Work'],
    ['/studio', 'Studio'],
    ['/contact', 'Contact'],
  ]
  return (
    <header className="site-header">
      <div className="header-inner container">
        <Wordmark />
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="header-cta" to="/contact#demo">
          Get a demo <ArrowUpRight size={16} />
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-nav"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {nav.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {label}
            <ArrowUpRight size={19} />
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <span className="eyebrow light">
              <span className="status-dot" /> HAVE SOMETHING IN MIND?
            </span>
            <h2>
              LET’S MAKE
              <br />
              <em>IT HAPPEN.</em>
            </h2>
          </div>
          <Link className="footer-arrow" to="/contact" aria-label="Go to contact page">
            <ArrowUpRight strokeWidth={1.3} />
          </Link>
        </div>
        <div className="footer-middle">
          <Wordmark inverse />
          <div>
            <span className="footer-label">SAY HELLO</span>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
          <div>
            <span className="footer-label">EXPLORE</span>
            <Link to="/work">Selected work</Link>
            <Link to="/services">What we do</Link>
            <Link to="/studio">The studio</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
          <div>
            <span className="footer-label">LOCATION</span>
            <span>Dhaka, Bangladesh</span>
            <span>Working worldwide</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Praxivon Labs. Built with intention.</span>
          <span>Independent by nature. Ambitious by design.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
