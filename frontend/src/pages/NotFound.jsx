import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function NotFound() {
  return (
    <section className="not-found container">
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>
        Lost in the
        <br />
        <em>good ideas?</em>
      </h1>
      <p>This page isn’t here, but there’s plenty more to explore.</p>
      <Link className="button-dark" to="/">
        Back home <ArrowRight size={19} />
      </Link>
    </section>
  )
}
