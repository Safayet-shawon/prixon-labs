import { HttpError } from './http.js'
import { saveEnquiry } from './store.js'

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mirrors the Spring ContactRequest rules so both backends behave the same.
export function validateContact(body) {
  const b = body && typeof body === 'object' ? body : {}
  const c = {
    name: str(b.name),
    email: str(b.email),
    service: str(b.service),
    message: str(b.message),
    company: str(b.company),
    phone: str(b.phone),
    website: str(b.website),
  }
  const bad = () => new HttpError(400, 'Please check the required fields and try again.')
  if (c.name.length < 2 || c.name.length > 100) throw bad()
  if (!c.service || c.service.length > 100) throw bad()
  if (c.message.length < 10 || c.message.length > 5000) throw bad()
  if (c.company.length > 100 || c.website.length > 500) throw bad()
  if (c.email && (c.email.length > 254 || !EMAIL.test(c.email))) throw bad()
  if (c.phone) {
    if (c.phone.length > 40 || !/^\+?[0-9() .-]*$/.test(c.phone)) throw bad()
    const digits = c.phone.replace(/\D/g, '').length
    if (digits < 7 || digits > 15)
      throw new HttpError(400, 'Phone numbers must contain 7 to 15 digits.')
  }
  if (!c.email && !c.phone)
    throw new HttpError(400, 'An email address or phone number is required.')
  if (c.service === 'Business workflow demo' && !c.company)
    throw new HttpError(400, 'Please provide the company for a business workflow demo.')
  return c
}

const escapeHtml = (s) =>
  s.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  )

// Optional: forward a notification through Resend when configured. The
// enquiry is already safely stored, so a mail failure never loses a lead.
async function notify(c) {
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: CONTACT_TO.split(',').map((s) => s.trim()),
        reply_to: c.email || undefined,
        subject: `New enquiry: ${c.service} — ${c.name}`.slice(0, 200),
        html: `<p><b>${escapeHtml(c.name)}</b> (${escapeHtml(c.email || c.phone)})${c.company ? ` · ${escapeHtml(c.company)}` : ''}</p><p>${escapeHtml(c.service)}</p><p>${escapeHtml(c.message).replace(/\n/g, '<br>')}</p>`,
      }),
    })
  } catch {
    /* best effort */
  }
}

export async function handleContact(body) {
  const c = validateContact(body)
  if (c.website) return // honeypot: pretend success, store nothing
  await saveEnquiry(c)
  await notify(c)
}
