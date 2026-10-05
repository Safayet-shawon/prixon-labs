import { PageIntro } from '../components/Primitives'

export function Privacy() {
  return (
    <>
      <PageIntro
        number="05 / PRIVACY"
        title={
          <>
            YOUR DETAILS.
            <br />
            <em>YOUR TRUST.</em>
          </>
        }
        description="A short, plain-language note about information you choose to share with Praxivon Labs."
      />
      <section className="section container privacy-page">
        <div className="privacy-copy">
          <h2>What we collect</h2>
          <p>
            If you contact us through this site, we may receive the name, email address, phone
            number, company, selected service, and project details you choose to submit.
          </p>

          <h2>Why we use it</h2>
          <p>
            We use enquiry information to understand your request, reply to you, and discuss a
            potential project. We do not ask you to submit passwords, payment credentials, or other
            confidential secrets through this form.
          </p>

          <h2>How enquiries are delivered</h2>
          <p>
            Enquiries submitted through the contact form are sent through the email service
            configured for Praxivon Labs. If the service is unavailable, the site provides a direct
            email fallback rather than pretending that the message was delivered.
          </p>

          <h2>Third-party services</h2>
          <p>
            The site may use infrastructure and hosting providers needed to serve the website,
            deliver email, and provide optional links such as WhatsApp. Those services may process
            technical information according to their own policies.
          </p>

          <h2>Your choices</h2>
          <p>
            If you have a question about an enquiry you submitted or want to ask about your
            information, contact us at the public email address shown on this site.
          </p>

          <p className="work-disclaimer">
            This page is a plain-language website notice, not legal advice. If Praxivon Labs begins
            collecting additional categories of personal information or operates under specific
            regulatory requirements, this notice should be updated accordingly.
          </p>
        </div>
      </section>
    </>
  )
}
