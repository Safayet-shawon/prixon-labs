import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { email } from '../config'
import { services } from '../data'
import { sendContact } from '../api'
import { PageIntro } from '../components/Primitives'

export function Contact() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    if (payload.website) return
    setStatus('sending')
    setError('')
    try {
      await sendContact(payload)
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }
  return (
    <>
      <PageIntro
        number="04 / GET IN TOUCH"
        title={
          <>
            LET’S START
            <br />
            <em>SOMETHING.</em>
          </>
        }
        description="A new idea, a problem to solve, or simply a conversation. We’d love to hear what you’re working on."
      />
      <section className="contact-section container">
        <div className="contact-aside">
          <span className="eyebrow">
            <span className="status-dot" /> OPEN FOR NEW PROJECTS
          </span>
          <h2>
            Good work starts
            <br />
            with a <em>hello.</em>
          </h2>
          <p>Tell us a little about your project and we’ll take it from there.</p>
          <a href={`mailto:${email}`} className="contact-email">
            {email} <ArrowUpRight size={20} />
          </a>
          <div className="contact-location">
            DHAKA, BANGLADESH
            <br />
            WORKING WORLDWIDE
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Your name <span>*</span>
              <input
                name="name"
                type="text"
                required
                minLength="2"
                maxLength="100"
                autoComplete="name"
                placeholder="How should we call you?"
              />
            </label>
            <label>
              Email address <span>*</span>
              <input
                name="email"
                type="email"
                required
                maxLength="254"
                autoComplete="email"
                placeholder="you@company.com"
              />
            </label>
          </div>
          <label>
            What can we help with? <span>*</span>
            <select name="service" required defaultValue="">
              <option value="" disabled>
                Select a service
              </option>
              {services.map((s) => (
                <option key={s.number} value={s.title}>
                  {s.title}
                </option>
              ))}
              <option value="Something else">Something else</option>
            </select>
          </label>
          <label>
            Tell us about your project <span>*</span>
            <textarea
              name="message"
              required
              minLength="10"
              maxLength="5000"
              rows="5"
              placeholder="The idea, the challenge, or where you’d like to go…"
            />
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex="-1" autoComplete="off" />
          </label>
          <div className="form-submit">
            <p>We’ll only use these details to reply to your enquiry.</p>
            <button type="submit" className="button-dark" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send your message'} <ArrowUpRight size={19} />
            </button>
          </div>
          <div className="form-status" role="status" aria-live="polite">
            {status === 'success' && 'Thanks for reaching out. Your message has been sent.'}
            {status === 'error' && (
              <>
                {error} <a href={`mailto:${email}`}>Email us instead ↗</a>
              </>
            )}
          </div>
        </form>
      </section>
    </>
  )
}
