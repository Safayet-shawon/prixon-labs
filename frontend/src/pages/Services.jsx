import { Asterisk } from 'lucide-react'
import { useCatalog } from '../catalog'
import { Callout, PageIntro, Process, Reveal } from '../components/Primitives'
import { SolutionStories } from '../components/SolutionStories'
import { ConnectedBusiness } from '../components/ConnectedBusiness'

export function Services() {
  const { services } = useCatalog()
  const groups = ['Web & commerce', 'Platforms & systems', 'Design & strategy', 'Growth & evolution']

  return (
    <>
      <PageIntro
        number="01 / SERVICES"
        title={<>WHAT WE<br /><em>MAKE POSSIBLE.</em></>}
        description="From a first impression to a complete operating system, we design and build what your business needs to move forward."
      />
      <SolutionStories />
      <ConnectedBusiness />
      <section className="section container">
        <div className="service-group-grid">
          {groups.map((group, index) => (
            <Reveal key={group} className="service-group">
              <div className="service-group-head">
                <span>0{index + 1} / {group.toUpperCase()}</span>
                <Asterisk size={22} />
              </div>
              {services.filter((s) => s.category === group).map((service, serviceIndex) => (
                <div className="service-detail" key={service.id || service.number}>
                  <span className="service-icon">{service.icon || String(serviceIndex + 1).padStart(2, '0')}</span>
                  <div><h2>{service.title}</h2><p>{service.short || service.description}</p></div>
                </div>
              ))}
            </Reveal>
          ))}
        </div>
      </section>
      <Process />
      <Callout />
    </>
  )
}