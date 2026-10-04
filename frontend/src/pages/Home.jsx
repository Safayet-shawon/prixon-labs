import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { projects, services } from '../data'
import { ProjectCard, Reveal, SectionHead } from '../components/Primitives'

export function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-top">
          <span className="eyebrow">
            <span className="status-dot" /> INDEPENDENT DIGITAL PRODUCT STUDIO
          </span>
          <span className="hero-index">
            BASED IN DHAKA · WORKING EVERYWHERE
            <br />
            DESIGN + ENGINEERING / EST. 2025
          </span>
        </div>
        <Reveal>
          <h1>
            WE DESIGN
            <br />
            <span>
              DIGITAL <em>PRODUCTS</em>
            </span>
            <br />
            THAT <span className="hero-outline">MOVE</span>
            <br className="hero-mobile-break" /> BUSINESSES<span className="lime-period">.</span>
          </h1>
        </Reveal>
        <div className="hero-bottom">
          <div className="hero-scroll">
            <ArrowDown size={21} />
            <span>SCROLL TO EXPLORE</span>
          </div>
          <p>
            Strategy, design, and technology—together under one roof. We turn ambitious ideas into
            digital experiences people want to use.
          </p>
          <Link className="button-dark" to="/work">
            Explore our work <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
      <section className="hero-feature">
        <div className="feature-caption container">
          <span>01 / FEATURED THINKING</span>
          <span>BUILT FOR WHAT’S NEXT ↗</span>
        </div>
        <div className="feature-stage container">
          <div className="feature-giant">
            P<span>✳</span>
          </div>
          <div className="feature-card">
            <span className="feature-card-kicker">Praxivon / Inside the process</span>
            <span className="feature-card-title">
              Good ideas deserve
              <br />
              <em>great execution.</em>
            </span>
            <div className="feature-card-foot">
              <span>
                Design meets development
                <br />
                without the handoff.
              </span>
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="feature-orbit">
            INDEPENDENT
            <br />
            BY NATURE
            <br />✳<br />
            AMBITIOUS
            <br />
            BY DESIGN
          </div>
        </div>
      </section>
      <section className="section container" id="selected-work">
        <Reveal>
          <SectionHead
            kicker="01 / SELECTED WORK"
            title={
              <>
                Ideas made <em>tangible.</em>
              </>
            }
            link="/work"
            linkLabel="View all projects"
          />
        </Reveal>
        <div className="projects-grid">
          {projects.slice(0, 4).map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>
      <section className="services-preview">
        <div className="container">
          <Reveal>
            <SectionHead
              kicker="02 / WHAT WE DO"
              title={
                <>
                  From first sketch
                  <br />
                  to <em>what’s next.</em>
                </>
              }
              link="/services"
              linkLabel="All capabilities"
            />
          </Reveal>
          <div className="service-list">
            {services.slice(0, 6).map((service) => (
              <Link key={service.number} to="/services" className="service-row">
                <span>{service.number}</span>
                <h3>{service.title}</h3>
                <span className="service-category">{service.category}</span>
                <ArrowUpRight size={24} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="statement-section container">
        <Reveal>
          <span className="eyebrow">03 / OUR POINT OF VIEW</span>
          <p>
            We believe the best digital work is equal parts <em>useful, thoughtful,</em> and
            impossible to ignore<span className="lime-period">.</span>
          </p>
          <Link className="text-link" to="/studio">
            Meet the studio <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <span className="statement-star">✳</span>
      </section>
    </>
  )
}
