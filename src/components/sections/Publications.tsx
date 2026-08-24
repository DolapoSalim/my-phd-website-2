import { publicationEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { SectionHeader } from '@/components/effects/SectionHeader'
import { AccordionGallery, type AccordionGalleryItem } from '@/components/effects/AccordionGallery'

const items: AccordionGalleryItem[] = publicationEntries.map((entry, i) => ({
  key: entry.title,
  index: String(i + 1).padStart(2, '0'),
  title: entry.title,
  meta: entry.year,
  content: (
    <>
      <div className="pub-top">
        <span className="pub-year">{entry.year}</span>
        <span className="pub-type">{entry.type}</span>
      </div>
      <h3 className="pub-title">{entry.title}</h3>
      {entry.desc && <p className="pub-desc">{entry.desc}</p>}
      <div className="pub-authors">{richText(entry.authors)}</div>
      <div className="pub-bottom">
        <div className="pub-journal-block">
          <div className="pub-journal">{entry.journal}</div>
          {entry.journalMeta && <div className="pub-journal-meta">{entry.journalMeta}</div>}
        </div>
        {entry.doiUrl && (
          <a href={entry.doiUrl} target="_blank" rel="noreferrer" data-magnetic="1" className="pub-doi">
            {entry.doi}
          </a>
        )}
      </div>
    </>
  ),
}))

export function Publications() {
  return (
    <section className="sect" id="publications">
      <SectionHeader
        index="03"
        label="Research output"
        heading="Selected publications"
        aside={
          <a href="https://orcid.org/0009-0005-6193-336X" target="_blank" rel="noreferrer" data-magnetic="1" className="btn-accent" style={{ borderBottom: '1px solid var(--accent)', color: 'var(--accent)', paddingBottom: '5px', fontFamily: 'var(--sans-ui)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Full record on ORCID ↗
          </a>
        }
      />
      <AccordionGallery items={items} defaultIndex={0} trigger="hover" />
    </section>
  )
}
