import { useEffect, useRef } from 'react'
import contact from '@/content/site/contact.json'
import hero from '@/content/site/hero.json'
import schools from '@/content/site/cv-schools.json'
import { awardEntries, cvAppointmentEntries, cvEducationEntries, type CvEntry } from '@/lib/content'
import { PageHead, SectionLabel } from '@/components/site/PageHead'

const cvUrl = hero.ctas.find((c) => /cv/i.test(c.label))?.url

/** Fills the timeline's track down to a reading line just below the
 *  middle of the viewport, and marks each entry once its dot passes it. */
function useTimelineProgress(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.6
      const box = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (line - box.top) / box.height))
      el.style.setProperty('--p', p.toFixed(4))
      el.querySelectorAll<HTMLElement>('.tl-entry').forEach((entry) => {
        entry.classList.toggle('is-passed', entry.getBoundingClientRect().top + 14 < line)
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref])
}

function Timeline({ entries }: { entries: CvEntry[] }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useTimelineProgress(ref)
  return (
    <div className="timeline" ref={ref}>
      <span className="tl-track" aria-hidden="true">
        <span className="tl-progress" />
      </span>
      <ol>
      {entries.map((e) => (
        <li className="tl-entry rise" key={e.title + e.org}>
          <div className="tl-dates">
            <span className="tl-year">{e.dateStart}</span>
            {/* a blank end year is ambiguous in the CMS (ongoing or a one-year role), so only show a range when there is one */}
            {e.dateEnd && (
              <span className="tl-range">
                {e.dateStart} – {e.dateEnd}
              </span>
            )}
          </div>
          <span className="tl-dot" aria-hidden="true" />
          <div className="tl-body">
            <h3>{e.title}</h3>
            <p className="tl-org">{e.org}</p>
            <p className="tl-desc">{e.desc}</p>
          </div>
        </li>
      ))}
      </ol>
    </div>
  )
}

export function Cv() {
  return (
    <main className="page" id="content">
      <PageHead no="04" kicker="Curriculum vitae" title="Experience & education">
        <p>Field to model: hatcheries in Nigeria, metabolism labs in Lecce, ROV surveys in Malta and computer vision in Pisa.</p>
        {cvUrl && (
          <a className="pill-link solid" href={cvUrl} target="_blank" rel="noreferrer">
            Download full CV ↗
          </a>
        )}
      </PageHead>

      <SectionLabel>Appointments</SectionLabel>
      <Timeline entries={cvAppointmentEntries} />

      <SectionLabel>Education</SectionLabel>
      <Timeline entries={cvEducationEntries} />

      <SectionLabel>Awards &amp; grants</SectionLabel>
      <ul className="rows">
        {awardEntries.map((a) => (
          <li className="row rise" key={a.title}>
            <div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
            <span className="row-year">{a.year}</span>
          </li>
        ))}
      </ul>

      <SectionLabel>Schools &amp; training</SectionLabel>
      <ul className="rows">
        {schools.items.map((s) => (
          <li className="row rise" key={s.label}>
            <div>
              <h3>{s.label}</h3>
            </div>
            <span className="row-year">{s.year}</span>
          </li>
        ))}
      </ul>

      <SectionLabel>Get in touch</SectionLabel>
      <dl className="facts rise">
        <div>
          <dt>Email</dt>
          <dd>
            <a className="text-link" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt>Office</dt>
          <dd>
            {contact.officeLocation}
            <br />
            {contact.officeHours}
          </dd>
        </div>
        <div>
          <dt>Open to</dt>
          <dd>{contact.openTo}</dd>
        </div>
        <div>
          <dt>Member of</dt>
          <dd>{contact.affiliations}</dd>
        </div>
      </dl>
    </main>
  )
}
