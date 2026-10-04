import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { process } from '../data'

export function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const reduced = useReducedMotion()
  const Component = as === 'li' ? motion.li : motion.div
  return (
    <Component
      className={className}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.13 }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}

export function SectionHead({ kicker, title, link, linkLabel = 'Explore all' }) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      {link && (
        <Link className="text-link" to={link}>
          {linkLabel} <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  )
}

export function Artwork({ project, hero = false }) {
  return (
    <div
      className={`artwork artwork-${project.color} ${hero ? 'artwork-hero' : ''}`}
      role="img"
      aria-label={`${project.name} illustrative interface concept`}
    >
      <div className="artwork-grain" />
      {project.slug === 'nexora' && (
        <div className="mock-dashboard">
          <div className="mock-side">
            <span className="mock-symbol">◈</span>
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="mock-main">
            <div className="mock-toolbar">
              <b>nexora</b>
              <span>⌕ &nbsp; ◯</span>
            </div>
            <div className="mock-greeting">
              Good morning, Alex<span>Here’s what is happening today.</span>
            </div>
            <div className="mock-metrics">
              <div>
                <small>REVENUE</small>
                <strong>$128.4k</strong>
                <em>↗ 12.8%</em>
              </div>
              <div>
                <small>ACTIVE USERS</small>
                <strong>24,890</strong>
                <em>↗ 8.2%</em>
              </div>
              <div>
                <small>NEW PROJECTS</small>
                <strong>48</strong>
                <em>↗ 4.6%</em>
              </div>
            </div>
            <div className="mock-chart">
              <span>Performance overview</span>
              <div className="chart-bars">
                {[32, 45, 38, 62, 55, 76, 68, 83, 73, 95, 86, 100].map((n, i) => (
                  <i key={i} style={{ height: `${n}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {project.slug === 'rowna' && (
        <div className="mock-commerce">
          <div className="commerce-top">
            ROWNA <span>SHOP &nbsp; COLLECTIONS &nbsp; ABOUT &nbsp; ◯</span>
          </div>
          <div className="commerce-content">
            <div className="commerce-copy">
              <small>NEW SEASON / 001</small>
              <strong>
                Form
                <br />
                meets
                <br />
                <em>feeling.</em>
              </strong>
              <span>Objects for the everyday extraordinary ↗</span>
            </div>
            <div className="commerce-object">
              <div className="vase-neck" />
              <div className="vase-body" />
              <div className="vase-shadow" />
            </div>
          </div>
          <div className="commerce-bottom">
            COLLECTION 01 <span>DISCOVER THE COLLECTION →</span>
          </div>
        </div>
      )}
      {project.slug === 'hajj-umrah' && (
        <div className="mock-travel">
          <div className="travel-top">
            H<span>J</span> <small>JOURNEYS WITH PURPOSE</small>
            <span>DESTINATIONS &nbsp; OUR PACKAGES &nbsp; ☰</span>
          </div>
          <div className="travel-sky">
            <div className="travel-sun" />
            <div className="travel-arch travel-arch-back" />
            <div className="travel-arch travel-arch-front" />
          </div>
          <div className="travel-panel">
            <small>THOUGHTFULLY PLANNED</small>
            <strong>
              A journey
              <br />
              of a lifetime.
            </strong>
            <span>
              Explore Hajj & Umrah packages <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      )}
      {project.slug === 'tomadachi' && (
        <div className="mock-community">
          <div className="community-top">
            tomadachi<span>discover &nbsp; circles &nbsp; events &nbsp; ◯</span>
          </div>
          <div className="community-orb orb-one" />
          <div className="community-orb orb-two" />
          <div className="community-orb orb-three" />
          <div className="community-content">
            <small>FIND YOUR PEOPLE</small>
            <strong>
              Better
              <br />
              together<span>.</span>
            </strong>
            <p>A place to connect over what you love.</p>
            <b>Explore your world ↗</b>
          </div>
        </div>
      )}
      {project.slug === 'school-management' && (
        <div className="mock-school">
          <div className="school-side">
            <b>◓ schoolly</b>
            <span>◫ &nbsp; Overview</span>
            <span>▣ &nbsp; Classes</span>
            <span>♙ &nbsp; Students</span>
            <span>▤ &nbsp; Attendance</span>
            <span>☷ &nbsp; Reports</span>
          </div>
          <div className="school-main">
            <div className="school-top">
              Dashboard <span>Academic year 2025–26 &nbsp; ◯</span>
            </div>
            <small>MONDAY, 22 SEPTEMBER</small>
            <strong className="school-greeting">Welcome back, Sarah 👋</strong>
            <div className="school-stats">
              <div>
                <small>TOTAL STUDENTS</small>
                <b>1,284</b>
                <span>↗ 4.2% this term</span>
              </div>
              <div>
                <small>ATTENDANCE TODAY</small>
                <b>96.8%</b>
                <span>↗ 1.3% this week</span>
              </div>
            </div>
            <div className="school-table">
              <b>Today’s classes</b>
              {['Mathematics · 8A', 'English · 7B', 'Science · 9C'].map((v, i) => (
                <span key={v}>
                  {v}
                  <small>{['09:00', '11:30', '13:45'][i]} &nbsp; ●</small>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProjectCard({ project, index }) {
  return (
    <Reveal className={`project-card project-card-${index % 2}`}>
      <Link
        to={`/work/${project.slug}`}
        className="project-card-link"
        aria-label={`Explore ${project.name} case study`}
      >
        <Artwork project={project} />
        <div className="project-meta">
          <span>
            {project.number} / {project.type}
          </span>
          <span>{project.year}</span>
        </div>
        <div className="project-bottom">
          <div>
            <h3>{project.name}</h3>
            <p>{project.summary}</p>
          </div>
          <span className="circle-arrow">
            <ArrowUpRight size={24} />
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

export function PageIntro({ number, title, description }) {
  return (
    <section className="page-intro container">
      <div className="page-intro-top">
        <span className="eyebrow">
          <span className="status-dot" /> {number}
        </span>
        <span>PRAXIVON LABS / DIGITAL PRODUCT STUDIO</span>
      </div>
      <Reveal>
        <h1>{title}</h1>
      </Reveal>
      <div className="page-intro-bottom">
        <span className="intro-star">✳</span>
        <p>{description}</p>
      </div>
    </section>
  )
}

export function Process() {
  return (
    <section className="process-section">
      <div className="container">
        <Reveal>
          <SectionHead
            kicker="OUR PROCESS / FROM IDEA TO IMPACT"
            title={
              <>
                How we make
                <br />
                <em>things happen.</em>
              </>
            }
          />
        </Reveal>
        <div className="process-grid">
          {process.map((step) => (
            <div key={step.number} className="process-step">
              <span>{step.number} / 06</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Callout() {
  return (
    <section className="callout container">
      <Reveal>
        <span className="eyebrow">HAVE A PROJECT IN MIND?</span>
        <h2>
          GOOD THINGS
          <br />
          START WITH A <em>CONVERSATION.</em>
        </h2>
        <Link className="button-dark" to="/contact">
          Let’s talk <ArrowUpRight size={19} />
        </Link>
      </Reveal>
    </section>
  )
}
