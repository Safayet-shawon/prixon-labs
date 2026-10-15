import { useMemo, useState } from 'react'
import { useCatalog } from '../catalog'
import { useDebouncedValue } from '../hooks/useDebounce'
import { Callout, PageIntro, ProjectCard } from '../components/Primitives'

const PAGE_SIZE = 6

export function Work() {
  const { projects } = useCatalog()
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const search = useDebouncedValue(query, 250).trim().toLowerCase()

  const filtered = useMemo(
    () =>
      search
        ? projects.filter((p) =>
            [p.name, p.type, p.summary, p.intro, ...(p.scope || [])]
              .join(' ')
              .toLowerCase()
              .includes(search),
          )
        : projects,
    [projects, search],
  )
  const shown = filtered.slice(0, visible)

  return (
    <>
      <PageIntro
        number="02 / SELECTED WORK"
        title={
          <>
            A LITTLE LESS
            <br />
            <em>ORDINARY.</em>
          </>
        }
        description="A selection of ideas, interfaces, and digital directions. Each one starts with a real problem worth solving."
      />
      <section className="section container work-page">
        <div className="work-search">
          <label htmlFor="work-search">Search by sector, discipline or name</label>
          <input
            id="work-search"
            type="search"
            value={query}
            placeholder="Try “inventory”, “booking” or “healthcare”"
            onChange={(event) => {
              setQuery(event.target.value)
              setVisible(PAGE_SIZE)
            }}
            autoComplete="off"
          />
        </div>
        <div className="work-filter">
          <span>SELECTED PROJECTS / 2025—26</span>
          <span aria-live="polite">
            SHOWING {String(shown.length).padStart(2, '0')} OF{' '}
            {String(filtered.length).padStart(2, '0')} PROJECTS
          </span>
        </div>
        {shown.length === 0 ? (
          <p className="work-empty" role="status">
            No projects match “{query.trim()}”. Try a broader word.
          </p>
        ) : (
          <div className="projects-grid">
            {shown.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        )}
        {filtered.length > visible && (
          <div className="work-more">
            <button type="button" className="btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Show more projects ({filtered.length - visible} left)
            </button>
          </div>
        )}
        <p className="work-disclaimer">
          Project stories and imagery shown here are concept presentations. Full client outcomes
          will be added when available.
        </p>
      </section>
      <Callout />
    </>
  )
}
