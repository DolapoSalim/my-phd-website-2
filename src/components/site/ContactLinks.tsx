import contact from '@/content/site/contact.json'
import hero from '@/content/site/hero.json'

const cvUrl = hero.ctas.find((c) => /cv/i.test(c.label))?.url

/** Email + the "Elsewhere" profiles from the CMS (+ the CV link from the
 *  hero buttons), as one quiet row — used under the intro and in the footer. */
export function ContactLinks({ className = 'contact-links', withCv = false }: { className?: string; withCv?: boolean }) {
  return (
    <nav className={className} aria-label="Contact links">
      <a href={`mailto:${contact.email}`}>Email</a>
      {contact.elsewhere.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
          {l.label}
        </a>
      ))}
      {withCv && cvUrl && (
        <a href={cvUrl} target="_blank" rel="noreferrer">
          CV
        </a>
      )}
    </nav>
  )
}
