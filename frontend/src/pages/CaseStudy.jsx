import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { projects } from '../data'
import { Artwork, Reveal } from '../components/Primitives'
import { NotFound } from './NotFound'

export function CaseStudy() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  if (!project) return <NotFound />
  const next = projects[(projects.indexOf(project) + 1) % projects.length]
  return (
    <>
      <section className="case-hero container">
        <Link to="/work" className="back-link">
          <ArrowLeft size={17} /> ALL PROJECTS
        </Link>
        <div className="case-heading">
          <div>
            <span className="eyebrow">
              {project.number} / CASE STUDY · {project.year}
            </span>
            <h1>
              {project.name}
              <span className="lime-period">.</span>
            </h1>
          </div>
          <p>{project.intro}</p>
        </div>
        <div className="case-art">
          <Artwork project={project} hero />
        </div>
        <div className="case-art-caption">
          <span>{project.type.toUpperCase()}</span>
          <span>{project.note}</span>
        </div>
      </section>
      <section className="case-body container">
        <div className="case-sidebar">
          <span className="eyebrow">THE PROJECT</span>
          <div>
            <span>DISCIPLINES</span>
            {project.scope.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <div className="case-story">
          <Reveal>
            <span className="eyebrow">01 / THE OPPORTUNITY</span>
            <h2>
              Making room for
              <br />
              <em>better ideas.</em>
            </h2>
            <p>{project.challenge}</p>
          </Reveal>
          <Reveal>
            <span className="eyebrow">02 / THE APPROACH</span>
            <h2>
              Built around
              <br />
              <em>real people.</em>
            </h2>
            <p>{project.approach}</p>
          </Reveal>
          <Reveal>
            <span className="eyebrow">03 / THE DIRECTION</span>
            <h2>
              Designed to
              <br />
              <em>keep moving.</em>
            </h2>
            <p>{project.outcome}</p>
          </Reveal>
        </div>
      </section>
      <Link className="next-project" to={`/work/${next.slug}`}>
        <div className="container">
          <span>UP NEXT / {next.number}</span>
          <strong>{next.name}</strong>
          <ArrowUpRight size={54} />
        </div>
      </Link>
    </>
  )
}
