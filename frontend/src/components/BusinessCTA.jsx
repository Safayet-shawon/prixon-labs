import { useRef, useState } from 'react'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { email, whatsappNumber } from '../config'
import { sendContact } from '../api'
import { Reveal } from './Primitives'
import './business-cta.css'

export function BusinessCTA() {
  const formRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const baseWhatsApp = `https://wa.me/${whatsappNumber || ''}?text=`
  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'sending') return
    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form).entries())
    if (fields.website) return
    const digitCount = fields.phone.replace(/\D/g, '').length
    if (digitCount < 7 || digitCount > 15) {
      form.elements.phone.setCustomValidity('Please enter a phone number with 7 to 15 digits.')
      form.reportValidity()
      return
    }
    setStatus('sending')
    setError('')
    try {
      await sendContact({
        name: fields.name.trim(),
        company: fields.company.trim(),
        phone: fields.phone.trim(),
        message: fields.problem.trim(),
        service: 'Business workflow demo',
        website: fields.website,
      })
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }
  function prepareWhatsApp(event) {
    const fields = Object.fromEntries(new FormData(formRef.current).entries())
    const brief = [
      'Hello Praxivon Labs, I would like to discuss a business workflow.',
      fields.name && `Name: ${fields.name}`,
      fields.company && `Company: ${fields.company}`,
      fields.phone && `Phone: ${fields.phone}`,
      fields.problem && `Problem: ${fields.problem}`,
      `${window.location.origin}/contact#demo`,
    ]
      .filter(Boolean)
      .join('\n')
    event.currentTarget.href = `${baseWhatsApp}${encodeURIComponent(brief)}`
  }
  return (
    <section className="business-cta" id="demo" aria-labelledby="demo-title">
      <div className="container business-cta-grid">
        <Reveal className="business-cta-copy">
          <span className="eyebrow">START WITH WHAT IS GETTING IN THE WAY</span>
          <h2 id="demo-title">
            Let’s find the biggest <em>problem</em> in your business.
          </h2>
          <p>
            Tell us where work gets stuck. We’ll discuss the workflow, the right first step and what
            improvement would mean for your team.
          </p>
          <a className="text-link" href={`mailto:${email}`}>
            {email}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </Reveal>
        <Reveal>
          <form ref={formRef} className="business-demo-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Name <span>*</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength="2"
                  maxLength="100"
                  placeholder="Your name"
                />
              </label>
              <label>
                Company <span>*</span>
                <input
                  name="company"
                  autoComplete="organization"
                  required
                  maxLength="100"
                  pattern=".*\S.*"
                  placeholder="Your business"
                />
              </label>
            </div>
            <label>
              Phone <span>*</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                minLength="7"
                maxLength="40"
                pattern="\+?[0-9\(\) .\-]*"
                onInput={(event) => event.currentTarget.setCustomValidity('')}
                placeholder="+880 1XXXXXXXXX"
                aria-describedby="demo-phone-hint"
              />
            </label>
            <span id="demo-phone-hint" className="demo-field-hint">
              Include your country code so we can reach you.
            </span>
            <label>
              What is the biggest problem? <span>*</span>
              <textarea
                name="problem"
                required
                minLength="10"
                maxLength="5000"
                rows="4"
                placeholder="For example: sales and stock records never match…"
              />
            </label>
            <label className="honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex="-1" autoComplete="off" />
            </label>
            <p className="demo-privacy">We’ll use these details to respond to your enquiry.</p>
            <div className="demo-actions">
              <button className="button-dark" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Get a Demo'}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <a
                className="whatsapp-button"
                href={`${baseWhatsApp}${encodeURIComponent('Hello Praxivon Labs, I would like to discuss a business workflow.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={prepareWhatsApp}
              >
                <MessageCircle size={18} aria-hidden="true" />
                {whatsappNumber ? 'WhatsApp us' : 'Share brief on WhatsApp'}
              </a>
            </div>
            <div
              className={`form-status ${status === 'error' ? 'demo-error' : ''}`}
              role="status"
              aria-live="polite"
            >
              {status === 'success' && 'Thank you. Your enquiry has been sent. We’ll be in touch.'}
              {status === 'error' && (
                <>
                  {error} <a href={`mailto:${email}`}>Email us instead ↗</a>
                </>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
