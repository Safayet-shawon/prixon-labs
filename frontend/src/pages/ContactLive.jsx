import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useCatalog } from '../catalog'
import { sendContact } from '../api'
import { PageIntro } from '../components/Primitives'

export function ContactLive() {
  const { services } = useCatalog()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())
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
      <PageIntro number="04 / GET IN TOUCH" title={<>LET’S START<br /><em>SOMETHING.</em></>} description="A new idea, a problem to solve, or simply a conversation. We’d love to hear what you’re working on." />
      <section className="contact-section container">
        <div className="contact-aside">
          <span className="eyebrow"><span className="status-dot" /> OPEN FOR NEW PROJECTS</span>
          <h2>Good work starts<br />with a <em>hello.</em></h2>
          <p>Tell us a little about your project and we’ll take it from there.</p>
          <div className="contact-location">DHAKA, BANGLADESH<br />WORKING WORLDWIDE</div>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <div className="form-row">
            <label>Your name <span>*</span><input name="name" required minLength="2" maxLength="100" autoComplete="name" /></label>
            <label>Email<input name="email" type="email" maxLength="254" autoComplete="email" /></label>
          </div>
          <div className="form-row">
            <label>Company<input name="company" maxLength="100" autoComplete="organization" /></label>
            <label>Phone<input name="phone" type="tel" maxLength="40" autoComplete="tel" /></label>
          </div>
          <label>What can we help with? <span>*</span>
            <select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}<option value="Business workflow demo">Business workflow demo</option></select>
          </label>
          <label>Tell us about your project <span>*</span><textarea name="message" required minLength="10" maxLength="5000" rows="5" /></label>
          <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
          <div className="form-submit"><p>We’ll only use these details to reply to your enquiry.</p><button type="submit" className="button-dark" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send your message'} <ArrowUpRight size={19} /></button></div>
          <div className="form-status" role="status" aria-live="polite">{status === 'success' && 'Thanks for reaching out. Your message has been sent.'}{status === 'error' && error}</div>
        </form>
      </section>
    </>
  )
}
