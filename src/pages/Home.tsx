import hero from '@/content/site/hero.json'
import expertise from '@/content/site/expertise.json'
import { builtItems, newsEntries, publicationEntries, cvAppointmentEntries, cvEducationEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { Link } from '@/lib/router'
import { ContactLinks } from '@/components/site/ContactLinks'
import { FieldFolder, type Sheet } from '@/components/site/FieldFolder'

const plural = (n: number, word: string) => `${String(n).padStart(2, '0')} ${word}${n === 1 ? '' : 's'}`

/** The folder shows three sheets and the last one sits on top, so pick
 *  text-only sheets for the back and put pictures (or the newest) in front. */
function stack(back: Sheet[], front: Sheet[]): Sheet[] {
  const top = front.slice(-3)
  return [...back.slice(0, 3 - top.length), ...top]
}

const researchSheets = stack(
  builtItems.filter((b) => !b.image).map((b) => ({ kind: 'paper', title: b.title, meta: b.kind })),
  builtItems.filter((b) => b.image).map((b) => ({ kind: 'image', src: b.image! })),
)

const paperSheets: Sheet[] = publicationEntries
  .slice(0, 3)
  .reverse()
  .map((p) => ({ kind: 'paper', title: p.title, meta: `${p.journal} · ${p.year}` }))

const cvSheets: Sheet[] = [
  { kind: 'logo', src: '/assets/images/unipisa.png' },
  { kind: 'logo', src: '/assets/images/UniSalento-Universita-del-Salento.svg.png' },
  { kind: 'logo', src: '/assets/images/fuoye.png' },
]

const newsSheets = stack(
  newsEntries.filter((n) => !n.image).map((n) => ({ kind: 'paper', title: n.title, meta: n.date })),
  // older pictures on top, so News doesn't open on the same figure as Research
  newsEntries.filter((n) => n.image).map((n) => ({ kind: 'image', src: n.image })),
)

export function Home() {
  const latest = newsEntries[0]
  return (
    <main className="home" id="content">
      <section className="intro">
        <p className="kicker rise">{hero.kicker}</p>
        <h1 className="rise" style={{ '--d': 1 } as React.CSSProperties}>
          Hi, I’m Dolapo <span aria-hidden="true">👋🏾</span>
        </h1>
        <p className="bio rise" style={{ '--d': 2 } as React.CSSProperties}>
          {richText(hero.tagline)}.
        </p>
        <p className="status rise" style={{ '--d': 3 } as React.CSSProperties}>
          <span className="status-dot" aria-hidden="true" />
          {hero.status}
        </p>
        <div className="rise" style={{ '--d': 3 } as React.CSSProperties}>
          <ContactLinks withCv />
        </div>
      </section>

      <nav className="folders rise" style={{ '--d': 4 } as React.CSSProperties} aria-label="Sections">
        <FieldFolder to="/research" no="01" label="Research" count={plural(expertise.built.length, 'item')} sheets={researchSheets} />
        <FieldFolder to="/publications" no="02" label="Publications" count={plural(publicationEntries.length, 'item')} sheets={paperSheets} />
        <FieldFolder
          to="/cv"
          no="03"
          label="CV"
          count={plural(cvAppointmentEntries.length + cvEducationEntries.length, 'entry').replace('entrys', 'entries')}
          sheets={cvSheets}
        />
        <FieldFolder to="/news" no="04" label="News" count={plural(newsEntries.length, 'note')} sheets={newsSheets} />
      </nav>

      {latest && (
        <Link to="/news" className="latest rise" style={{ '--d': 5 } as React.CSSProperties}>
          <span className="latest-label">Latest note</span>
          <span className="latest-title">{latest.title}</span>
          <span className="latest-date">{latest.date} →</span>
        </Link>
      )}

      <figure className="portrait rise" style={{ '--d': 6 } as React.CSSProperties}>
        <img src="/assets/images/profile picture.jpg" alt="Portrait of Olatoye Dolapo Salim" width="1365" height="1667" />
        <figcaption>
          <span>{hero.nameLine1} {hero.nameLine2}</span>
          <span>{hero.navTagline}</span>
        </figcaption>
      </figure>
    </main>
  )
}
