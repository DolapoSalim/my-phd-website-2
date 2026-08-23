import { useState, type FormEvent, type ReactNode } from 'react'
import contact from '@/content/site/contact.json'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { Reveal } from '@/components/effects/Reveal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ICONS: Record<string, ReactNode> = {
  github: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  researchgate: <span className="soc-rg">RG</span>,
}

function ContactForm() {
  const [message, setMessage] = useState('')

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('cn') as HTMLInputElement).value
    const email = (form.elements.namedItem('ce') as HTMLInputElement).value
    const body = (form.elements.namedItem('cm') as HTMLTextAreaElement).value
    window.location.href = `mailto:${contact.mailto}?subject=${encodeURIComponent('Message from ' + name)}&body=${encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\n\n' + body)}`
    setMessage('Opening your email client…')
  }

  return (
    <Card className="border-border/60 bg-card/90">
      <CardContent>
        <form className="cf" onSubmit={onSubmit}>
          <div className="fg">
            <label htmlFor="cn">Name</label>
            <input type="text" id="cn" name="cn" placeholder="Your name" required />
          </div>
          <div className="fg">
            <label htmlFor="ce">Email</label>
            <input type="email" id="ce" name="ce" placeholder="your@email.com" required />
          </div>
          <div className="fg">
            <label htmlFor="cm">Message</label>
            <textarea id="cm" name="cm" rows={5} placeholder="How can I help?" required></textarea>
          </div>
          <Button type="submit" size="lg" className="w-fit rounded-full px-6 h-auto py-3 text-[0.88rem] font-semibold">
            Send message →
          </Button>
          <p className="cf-msg" style={{ display: message ? 'block' : 'none' }}>
            {message}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <div className="sec-label">Contact</div>
        <SectionTitle>Get in Touch</SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Reveal as="div">
            <div className="flex h-full flex-col gap-4">
              <p className="c-info-text">{contact.blurb}</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {contact.socials.map((s) => (
                  <Card key={s.network} className="border-border/60 bg-card/90 transition-colors hover:bg-[var(--surface2)]">
                    <a href={s.url} target="_blank" rel="noreferrer" className="soc !border-0 !bg-transparent !rounded-none">
                      {ICONS[s.network]}
                      {s.label}
                    </a>
                  </Card>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal as="div" delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
