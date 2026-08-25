import { useRef } from 'react'
import contact from '@/content/site/contact.json'
import { useReveal } from '@/hooks/useReveal'

export function Contact() {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)

  return (
    <section className="sect" id="contact">
      <div className="sec-kicker">
        <span className="idx">07</span>
        <span className="rule" />
        <span>Contact &amp; office hours</span>
      </div>

      <div className="fi" ref={ref}>
        <a href={`mailto:${contact.email}`} data-magnetic="1" className="contact-email">
          {contact.email}
        </a>

        <div className="contact-grid">
          <div>
            <div className="contact-block-label">Office hours</div>
            <div className="contact-block-body">
              {contact.officeHours}
              <br />
              <span className="dim">{contact.officeLocation}</span>
            </div>
          </div>
          <div>
            <div className="contact-block-label">Elsewhere</div>
            <div className="contact-links">
              {contact.elsewhere.map((e) => (
                <a href={e.url} target="_blank" rel="noreferrer" data-magnetic="1" key={e.label}>
                  {e.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="contact-block-label">Affiliations</div>
            <div className="contact-block-body">{contact.affiliations}</div>
          </div>
          <div>
            <div className="contact-block-label">Open to</div>
            <div className="contact-block-body">{contact.openTo}</div>
          </div>
        </div>
      </div>

      <div className="footer-bar">
        <span>{contact.footerLocation}</span>
        <span>{contact.footerUpdated}</span>
        <a href="#top" data-magnetic="1" className="back-to-top">
          Back to top
        </a>
      </div>
    </section>
  )
}
