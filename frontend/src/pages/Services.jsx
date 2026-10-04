import { Asterisk } from 'lucide-react'
import { services } from '../data'
import { Callout, PageIntro, Process, Reveal } from '../components/Primitives'

export function Services() {
  const groups = [
    'Web & commerce',
    'Platforms & systems',
    'Design & strategy',
    'Growth & evolution',
  ]
  return (
    <>
      <PageIntro
        number="01 / SERVICES"
        title={
          <>
            WHAT WE
            <br />
            <em>MAKE POSSIBLE.</em>
          </>
        }
        description="From a first impression to a complete operating system, we design and build what your business needs to move forward."
      />
      <section className="section container">
        <div className="service-group-grid">
          {groups.map((group, index) => (
            <Reveal key={group} className="service-group">
              <div className="service-group-head">
                <span>
                  0{index + 1} / {group.toUpperCase()}
                </span>
                <Asterisk size={22} />
              </div>
              {services
                .filter((s) => s.category === group)
                .map((service) => (
                  <div className="service-detail" key={service.number}>
                    <span className="service-icon">{service.icon}</span>
                    <div>
                      <h2>{service.title}</h2>
                      <p>{service.short}</p>
                    </div>
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
