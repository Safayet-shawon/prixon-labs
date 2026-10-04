import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Callout, PageIntro, Process, Reveal } from '../components/Primitives'

export function Studio() {
  return (
    <>
      <PageIntro
        number="03 / THE STUDIO"
        title={
          <>
            SMALL STUDIO.
            <br />
            <em>BIG AMBITION.</em>
          </>
        }
        description="A focused digital studio for people building what comes next. Independent in spirit, collaborative by default."
      />
      <section className="studio-visual">
        <div className="container">
          <span>
            PRAXIVON
            <br />
            LABS <i>✳</i>
          </span>
          <p>
            Made of curiosity.
            <br />
            Built with intention.
          </p>
        </div>
      </section>
      <section className="studio-story container">
        <Reveal>
          <span className="eyebrow">WHO WE ARE / WHAT WE BELIEVE</span>
          <h2>
            We make the <em>complex</em> feel clear, and the everyday feel exceptional.
          </h2>
        </Reveal>
        <div className="studio-story-side">
          <p>
            Praxivon Labs brings design thinking and engineering together to create digital
            experiences with lasting value.
          </p>
          <p>
            We work with founders and teams who care about the details, question the obvious, and
            want a partner who can move from the first sketch to the finished product.
          </p>
          <Link className="text-link" to="/contact">
            Start a conversation <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <div className="studio-values container">
        <div>
          <span>01 /</span>
          <h3>Clarity first.</h3>
          <p>We find the simple idea at the heart of the complex problem.</p>
        </div>
        <div>
          <span>02 /</span>
          <h3>Craft matters.</h3>
          <p>We give every interaction the care it deserves.</p>
        </div>
        <div>
          <span>03 /</span>
          <h3>Built together.</h3>
          <p>The best work comes from close, honest collaboration.</p>
        </div>
      </div>
      <Process />
      <Callout />
    </>
  )
}
