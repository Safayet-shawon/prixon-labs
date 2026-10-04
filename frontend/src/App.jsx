import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Asterisk, Menu, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { process, projects, services } from './data'
import { sendContact } from './api'

const email = 'hello@praxivon.com'

function Wordmark({ inverse = false }) {
  return <Link to="/" className={`wordmark ${inverse ? 'wordmark-light' : ''}`} aria-label="Praxivon Labs home"><span className="wordmark-mark">✳</span><span>praxivon<span className="wordmark-dot">.</span><small>LABS</small></span></Link>
}

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])
  const nav = [['/', 'Home'], ['/services', 'Services'], ['/work', 'Work'], ['/studio', 'Studio'], ['/contact', 'Contact']]
  return <header className="site-header">
    <div className="header-inner container"><Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}</nav>
      <Link className="header-cta" to="/contact">Let’s talk <ArrowUpRight size={16} /></Link>
      <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={25} /> : <Menu size={25} />}</button>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}<ArrowUpRight size={19} /></NavLink>)}</nav>}
  </header>
}

function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-top"><div><span className="eyebrow light"><span className="status-dot" /> HAVE SOMETHING IN MIND?</span><h2>LET’S MAKE<br /><em>IT HAPPEN.</em></h2></div><Link className="footer-arrow" to="/contact" aria-label="Go to contact page"><ArrowUpRight strokeWidth={1.3} /></Link></div>
    <div className="footer-middle"><Wordmark inverse /><div><span className="footer-label">SAY HELLO</span><a href={`mailto:${email}`}>{email}</a></div><div><span className="footer-label">EXPLORE</span><Link to="/work">Selected work</Link><Link to="/services">What we do</Link><Link to="/studio">The studio</Link></div><div><span className="footer-label">LOCATION</span><span>Dhaka, Bangladesh</span><span>Working worldwide</span></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Praxivon Labs. Built with intention.</span><span>Independent by nature. Ambitious by design.</span><a href="#top">Back to top ↑</a></div>
  </div></footer>
}

function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.13 }} transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

function SectionHead({ kicker, title, link, linkLabel = 'Explore all' }) {
  return <div className="section-head"><div><span className="eyebrow">{kicker}</span><h2 className="section-title">{title}</h2></div>{link && <Link className="text-link" to={link}>{linkLabel} <ArrowUpRight size={17} /></Link>}</div>
}

function Artwork({ project, hero = false }) {
  return <div className={`artwork artwork-${project.color} ${hero ? 'artwork-hero' : ''}`} role="img" aria-label={`${project.name} illustrative interface concept`}>
    <div className="artwork-grain" />
    {project.slug === 'nexora' && <div className="mock-dashboard"><div className="mock-side"><span className="mock-symbol">◈</span><i /><i /><i /><i /></div><div className="mock-main"><div className="mock-toolbar"><b>nexora</b><span>⌕ &nbsp; ◯</span></div><div className="mock-greeting">Good morning, Alex<span>Here’s what is happening today.</span></div><div className="mock-metrics"><div><small>REVENUE</small><strong>$128.4k</strong><em>↗ 12.8%</em></div><div><small>ACTIVE USERS</small><strong>24,890</strong><em>↗ 8.2%</em></div><div><small>NEW PROJECTS</small><strong>48</strong><em>↗ 4.6%</em></div></div><div className="mock-chart"><span>Performance overview</span><div className="chart-bars">{[32,45,38,62,55,76,68,83,73,95,86,100].map((n,i)=><i key={i} style={{height:`${n}%`}} />)}</div></div></div></div>}
    {project.slug === 'rowna' && <div className="mock-commerce"><div className="commerce-top">ROWNA <span>SHOP &nbsp; COLLECTIONS &nbsp; ABOUT &nbsp; ◯</span></div><div className="commerce-content"><div className="commerce-copy"><small>NEW SEASON / 001</small><strong>Form<br />meets<br /><em>feeling.</em></strong><span>Objects for the everyday extraordinary ↗</span></div><div className="commerce-object"><div className="vase-neck" /><div className="vase-body" /><div className="vase-shadow" /></div></div><div className="commerce-bottom">COLLECTION 01 <span>DISCOVER THE COLLECTION →</span></div></div>}
    {project.slug === 'hajj-umrah' && <div className="mock-travel"><div className="travel-top">H<span>J</span> <small>JOURNEYS WITH PURPOSE</small><span>DESTINATIONS &nbsp; OUR PACKAGES &nbsp; ☰</span></div><div className="travel-sky"><div className="travel-sun" /><div className="travel-arch travel-arch-back" /><div className="travel-arch travel-arch-front" /></div><div className="travel-panel"><small>THOUGHTFULLY PLANNED</small><strong>A journey<br />of a lifetime.</strong><span>Explore Hajj & Umrah packages <ArrowUpRight size={14} /></span></div></div>}
    {project.slug === 'tomadachi' && <div className="mock-community"><div className="community-top">tomadachi<span>discover &nbsp; circles &nbsp; events &nbsp; ◯</span></div><div className="community-orb orb-one" /><div className="community-orb orb-two" /><div className="community-orb orb-three" /><div className="community-content"><small>FIND YOUR PEOPLE</small><strong>Better<br />together<span>.</span></strong><p>A place to connect over what you love.</p><b>Explore your world ↗</b></div></div>}
    {project.slug === 'school-management' && <div className="mock-school"><div className="school-side"><b>◓ schoolly</b><span>◫ &nbsp; Overview</span><span>▣ &nbsp; Classes</span><span>♙ &nbsp; Students</span><span>▤ &nbsp; Attendance</span><span>☷ &nbsp; Reports</span></div><div className="school-main"><div className="school-top">Dashboard <span>Academic year 2025–26 &nbsp; ◯</span></div><small>MONDAY, 22 SEPTEMBER</small><strong className="school-greeting">Welcome back, Sarah 👋</strong><div className="school-stats"><div><small>TOTAL STUDENTS</small><b>1,284</b><span>↗ 4.2% this term</span></div><div><small>ATTENDANCE TODAY</small><b>96.8%</b><span>↗ 1.3% this week</span></div></div><div className="school-table"><b>Today’s classes</b>{['Mathematics · 8A','English · 7B','Science · 9C'].map((v,i)=><span key={v}>{v}<small>{['09:00','11:30','13:45'][i]} &nbsp; ●</small></span>)}</div></div></div>}
  </div>
}

function ProjectCard({ project, index }) {
  return <Reveal className={`project-card project-card-${index % 2}`}><Link to={`/work/${project.slug}`} className="project-card-link" aria-label={`Explore ${project.name} case study`}><Artwork project={project} /><div className="project-meta"><span>{project.number} / {project.type}</span><span>{project.year}</span></div><div className="project-bottom"><div><h3>{project.name}</h3><p>{project.summary}</p></div><span className="circle-arrow"><ArrowUpRight size={24} /></span></div></Link></Reveal>
}

function Home() {
  return <>
    <section className="hero container"><div className="hero-top"><span className="eyebrow"><span className="status-dot" /> INDEPENDENT DIGITAL PRODUCT STUDIO</span><span className="hero-index">BASED IN DHAKA · WORKING EVERYWHERE<br />DESIGN + ENGINEERING / EST. 2025</span></div><Reveal><h1>WE DESIGN<br /><span>DIGITAL <em>PRODUCTS</em></span><br />THAT <span className="hero-outline">MOVE</span><br className="hero-mobile-break" /> BUSINESSES<span className="lime-period">.</span></h1></Reveal><div className="hero-bottom"><div className="hero-scroll"><ArrowDown size={21} /><span>SCROLL TO EXPLORE</span></div><p>Strategy, design, and technology—together under one roof. We turn ambitious ideas into digital experiences people want to use.</p><Link className="button-dark" to="/work">Explore our work <ArrowUpRight size={19} /></Link></div></section>
    <section className="hero-feature"><div className="feature-caption container"><span>01 / FEATURED THINKING</span><span>BUILT FOR WHAT’S NEXT ↗</span></div><div className="feature-stage container"><div className="feature-giant">P<span>✳</span></div><div className="feature-card"><span className="feature-card-kicker">Praxivon / Inside the process</span><span className="feature-card-title">Good ideas deserve<br /><em>great execution.</em></span><div className="feature-card-foot"><span>Design meets development<br />without the handoff.</span><ArrowUpRight size={24} /></div></div><div className="feature-orbit">INDEPENDENT<br />BY NATURE<br />✳<br />AMBITIOUS<br />BY DESIGN</div></div></section>
    <section className="section container" id="selected-work"><Reveal><SectionHead kicker="01 / SELECTED WORK" title={<>Ideas made <em>tangible.</em></>} link="/work" linkLabel="View all projects" /></Reveal><div className="projects-grid">{projects.slice(0,4).map((project,index)=><ProjectCard key={project.slug} project={project} index={index} />)}</div></section>
    <section className="services-preview"><div className="container"><Reveal><SectionHead kicker="02 / WHAT WE DO" title={<>From first sketch<br />to <em>what’s next.</em></>} link="/services" linkLabel="All capabilities" /></Reveal><div className="service-list">{services.slice(0,6).map(service=><Link key={service.number} to="/services" className="service-row"><span>{service.number}</span><h3>{service.title}</h3><span className="service-category">{service.category}</span><ArrowUpRight size={24} /></Link>)}</div></div></section>
    <section className="statement-section container"><Reveal><span className="eyebrow">03 / OUR POINT OF VIEW</span><p>We believe the best digital work is equal parts <em>useful, thoughtful,</em> and impossible to ignore<span className="lime-period">.</span></p><Link className="text-link" to="/studio">Meet the studio <ArrowUpRight size={18} /></Link></Reveal><span className="statement-star">✳</span></section>
  </>
}

function Services() {
  const groups = ['Web & commerce', 'Platforms & systems', 'Design & strategy', 'Growth & evolution']
  return <><PageIntro number="01 / SERVICES" title={<>WHAT WE<br /><em>MAKE POSSIBLE.</em></>} description="From a first impression to a complete operating system, we design and build what your business needs to move forward." /><section className="section container"><div className="service-group-grid">{groups.map((group,index)=><Reveal key={group} className="service-group"><div className="service-group-head"><span>0{index+1} / {group.toUpperCase()}</span><Asterisk size={22} /></div>{services.filter(s=>s.category===group).map(service=><div className="service-detail" key={service.number}><span className="service-icon">{service.icon}</span><div><h2>{service.title}</h2><p>{service.short}</p></div></div>)}</Reveal>)}</div></section><Process /><Callout /></>
}

function Work() {
  return <><PageIntro number="02 / SELECTED WORK" title={<>A LITTLE LESS<br /><em>ORDINARY.</em></>} description="A selection of ideas, interfaces, and digital directions. Each one starts with a real problem worth solving." /><section className="section container work-page"><div className="work-filter"><span>SELECTED PROJECTS / 2025—26</span><span>SHOWING {String(projects.length).padStart(2,'0')} PROJECTS</span></div><div className="projects-grid">{projects.map((project,index)=><ProjectCard key={project.slug} project={project} index={index} />)}</div><p className="work-disclaimer">Project stories and imagery shown here are concept presentations. Full client outcomes will be added when available.</p></section><Callout /></>
}

function CaseStudy() {
  const { slug } = useParams()
  const project = projects.find(p=>p.slug===slug)
  if (!project) return <NotFound />
  const next = projects[(projects.indexOf(project)+1)%projects.length]
  return <><section className="case-hero container"><Link to="/work" className="back-link"><ArrowLeft size={17} /> ALL PROJECTS</Link><div className="case-heading"><div><span className="eyebrow">{project.number} / CASE STUDY · {project.year}</span><h1>{project.name}<span className="lime-period">.</span></h1></div><p>{project.intro}</p></div><div className="case-art"><Artwork project={project} hero /></div><div className="case-art-caption"><span>{project.type.toUpperCase()}</span><span>{project.note}</span></div></section><section className="case-body container"><div className="case-sidebar"><span className="eyebrow">THE PROJECT</span><div><span>DISCIPLINES</span>{project.scope.map(item=><p key={item}>{item}</p>)}</div></div><div className="case-story"><Reveal><span className="eyebrow">01 / THE OPPORTUNITY</span><h2>Making room for<br /><em>better ideas.</em></h2><p>{project.challenge}</p></Reveal><Reveal><span className="eyebrow">02 / THE APPROACH</span><h2>Built around<br /><em>real people.</em></h2><p>{project.approach}</p></Reveal><Reveal><span className="eyebrow">03 / THE DIRECTION</span><h2>Designed to<br /><em>keep moving.</em></h2><p>{project.outcome}</p></Reveal></div></section><Link className="next-project" to={`/work/${next.slug}`}><div className="container"><span>UP NEXT / {next.number}</span><strong>{next.name}</strong><ArrowUpRight size={54} /></div></Link></>
}

function Studio() {
  return <><PageIntro number="03 / THE STUDIO" title={<>SMALL STUDIO.<br /><em>BIG AMBITION.</em></>} description="A focused digital studio for people building what comes next. Independent in spirit, collaborative by default." /><section className="studio-visual"><div className="container"><span>PRAXIVON<br />LABS <i>✳</i></span><p>Made of curiosity.<br />Built with intention.</p></div></section><section className="studio-story container"><Reveal><span className="eyebrow">WHO WE ARE / WHAT WE BELIEVE</span><h2>We make the <em>complex</em> feel clear, and the everyday feel exceptional.</h2></Reveal><div className="studio-story-side"><p>Praxivon Labs brings design thinking and engineering together to create digital experiences with lasting value.</p><p>We work with founders and teams who care about the details, question the obvious, and want a partner who can move from the first sketch to the finished product.</p><Link className="text-link" to="/contact">Start a conversation <ArrowUpRight size={18} /></Link></div></section><div className="studio-values container"><div><span>01 /</span><h3>Clarity first.</h3><p>We find the simple idea at the heart of the complex problem.</p></div><div><span>02 /</span><h3>Craft matters.</h3><p>We give every interaction the care it deserves.</p></div><div><span>03 /</span><h3>Built together.</h3><p>The best work comes from close, honest collaboration.</p></div></div><Process /><Callout /></>
}

function Contact() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    if (payload.website) return
    setStatus('sending'); setError('')
    try { await sendContact(payload); setStatus('success'); form.reset() }
    catch (err) { setStatus('error'); setError(err.message) }
  }
  return <><PageIntro number="04 / GET IN TOUCH" title={<>LET’S START<br /><em>SOMETHING.</em></>} description="A new idea, a problem to solve, or simply a conversation. We’d love to hear what you’re working on." /><section className="contact-section container"><div className="contact-aside"><span className="eyebrow"><span className="status-dot" /> OPEN FOR NEW PROJECTS</span><h2>Good work starts<br />with a <em>hello.</em></h2><p>Tell us a little about your project and we’ll take it from there.</p><a href={`mailto:${email}`} className="contact-email">{email} <ArrowUpRight size={20} /></a><div className="contact-location">DHAKA, BANGLADESH<br />WORKING WORLDWIDE</div></div><form className="contact-form" onSubmit={handleSubmit}><div className="form-row"><label>Your name <span>*</span><input name="name" type="text" required minLength="2" maxLength="100" autoComplete="name" placeholder="How should we call you?" /></label><label>Email address <span>*</span><input name="email" type="email" required maxLength="254" autoComplete="email" placeholder="you@company.com" /></label></div><label>What can we help with? <span>*</span><select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(s=><option key={s.number} value={s.title}>{s.title}</option>)}<option value="Something else">Something else</option></select></label><label>Tell us about your project <span>*</span><textarea name="message" required minLength="10" maxLength="5000" rows="5" placeholder="The idea, the challenge, or where you’d like to go…" /></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label><div className="form-submit"><p>We’ll only use these details to reply to your enquiry.</p><button type="submit" className="button-dark" disabled={status==='sending'}>{status==='sending' ? 'Sending…' : 'Send your message'} <ArrowUpRight size={19} /></button></div><div className="form-status" role="status" aria-live="polite">{status==='success' && 'Thanks for reaching out. Your message has been sent.'}{status==='error' && <>{error} <a href={`mailto:${email}`}>Email us instead ↗</a></>}</div></form></section></>
}

function PageIntro({ number, title, description }) {
  return <section className="page-intro container"><div className="page-intro-top"><span className="eyebrow"><span className="status-dot" /> {number}</span><span>PRAXIVON LABS / DIGITAL PRODUCT STUDIO</span></div><Reveal><h1>{title}</h1></Reveal><div className="page-intro-bottom"><span className="intro-star">✳</span><p>{description}</p></div></section>
}

function Process() {
  return <section className="process-section"><div className="container"><Reveal><SectionHead kicker="OUR PROCESS / FROM IDEA TO IMPACT" title={<>How we make<br /><em>things happen.</em></>} /></Reveal><div className="process-grid">{process.map(step=><div key={step.number} className="process-step"><span>{step.number} / 06</span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></div></section>
}

function Callout() {
  return <section className="callout container"><Reveal><span className="eyebrow">HAVE A PROJECT IN MIND?</span><h2>GOOD THINGS<br />START WITH A <em>CONVERSATION.</em></h2><Link className="button-dark" to="/contact">Let’s talk <ArrowUpRight size={19} /></Link></Reveal></section>
}

function NotFound() {
  return <section className="not-found container"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>Lost in the<br /><em>good ideas?</em></h1><p>This page isn’t here, but there’s plenty more to explore.</p><Link className="button-dark" to="/">Back home <ArrowRight size={19} /></Link></section>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const section = pathname === '/' ? '' : pathname.startsWith('/work/')
      ? projects.find(project => pathname.endsWith(`/${project.slug}`))?.name || 'Work'
      : ({ '/services': 'Services', '/work': 'Work', '/studio': 'Studio', '/contact': 'Contact' }[pathname] || 'Page not found')
    document.title = `${section ? `${section} — ` : ''}Praxivon Labs`
  }, [pathname])
  return null
}

export default function App() {
  return <div id="top"><ScrollToTop /><Header /><main><Routes><Route path="/" element={<Home />} /><Route path="/services" element={<Services />} /><Route path="/work" element={<Work />} /><Route path="/work/:slug" element={<CaseStudy />} /><Route path="/studio" element={<Studio />} /><Route path="/contact" element={<Contact />} /><Route path="*" element={<NotFound />} /></Routes></main><Footer /></div>
}
