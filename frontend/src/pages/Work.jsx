import { useCatalog } from '../catalog'
import { Callout, PageIntro, ProjectCard } from '../components/Primitives'

export function Work() {
  const { projects } = useCatalog()
  return (
    <>
      <PageIntro
        number="02 / SELECTED WORK"
        title={<>A LITTLE LESS<br /><em>ORDINARY.</em></>}
        description="A selection of ideas, interfaces, and digital directions. Each one starts with a real problem worth solving."
      />
      <section className="section container work-page">
        <div className="work-filter">
          <span>SELECTED PROJECTS / 2025—26</span>
          <span>SHOWING {String(projects.length).padStart(2, '0')} PROJECTS</span>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
        </div>
        <p className="work-disclaimer">
          Project stories and imagery shown here are concept presentations. Full client outcomes will be added when available.
        </p>
      </section>
      <Callout />
    </>
  )
}