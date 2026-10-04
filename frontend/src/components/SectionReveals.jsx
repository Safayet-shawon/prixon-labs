import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function SectionReveals() {
  const { pathname } = useLocation()
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sections = [...document.querySelectorAll('main section, main .studio-values')]
    let observer
    function reveal(element) {
      element.dataset.sectionReveal = 'visible'
      observer?.unobserve(element)
    }
    function setup() {
      observer?.disconnect()
      sections.forEach((section) => section.removeAttribute('data-section-reveal'))
      if (media.matches) return
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target)
          })
        },
        { rootMargin: '0px 0px -30px 0px', threshold: 0.02 },
      )
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top < window.innerHeight) return
        section.dataset.sectionReveal = 'pending'
        observer.observe(section)
      })
    }
    function revealFocused(event) {
      const section = event.target.closest('[data-section-reveal="pending"]')
      if (section) reveal(section)
    }
    setup()
    media.addEventListener('change', setup)
    document.addEventListener('focusin', revealFocused)
    return () => {
      observer?.disconnect()
      media.removeEventListener('change', setup)
      document.removeEventListener('focusin', revealFocused)
      sections.forEach((section) => section.removeAttribute('data-section-reveal'))
    }
  }, [pathname])
  return null
}
