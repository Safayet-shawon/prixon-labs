import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { projects, services } from '../data'
import { ProjectCard, Reveal, SectionHead } from '../components/Primitives'
import { HeroSystems } from '../components/HeroSystems'
import { ProblemPicker, SolutionStories } from '../components/SolutionStories'
import { ConnectedBusiness } from '../components/ConnectedBusiness'
import { SylvaScene } from '../components/SylvaScene'

export function Home() {
  return (
    <>
      <SylvaScene />
      <section className="container sylva-problem-picker">
        <ProblemPicker />
      </section>
      <section className="hero-feature sylva-home-feature">
        <div className="feature-caption container">
          <span>01 / FEATURED THINKING</span>
          <span>BUILT FOR WHAT’S NEXT ↗</span>
        </div>
        <HeroSystems />
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
      <SolutionStories />
      <ConnectedBusiness />
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
