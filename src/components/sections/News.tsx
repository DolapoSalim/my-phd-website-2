import { useRef } from 'react'
import { newsEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { SectionHeader } from '@/components/effects/SectionHeader'
import { AccordionGallery, type AccordionGalleryItem } from '@/components/effects/AccordionGallery'
import { useReveal } from '@/hooks/useReveal'

const items: AccordionGalleryItem[] = newsEntries.map((entry, i) => ({
  key: entry.title,
  index: String(i + 1).padStart(2, '0'),
  title: entry.title,
  meta: entry.date,
  content: (
    <>
      {entry.image && <img src={entry.image} alt={entry.imageAlt || entry.title} className="news-thumb" />}
      <div className="article-idx">
        <span>{entry.tag || 'Update'}</span>
        <span className="yr">{entry.date}</span>
      </div>
      <h3 className="article-title">{entry.title}</h3>
      <p className="article-body">{richText(entry.body)}</p>
      {entry.url && (
        <a href={entry.url} target="_blank" rel="noreferrer" data-magnetic="1" className="article-foot">
          {entry.urlLabel || 'Read more'}
        </a>
      )}
    </>
  ),
}))

export function News() {
  const ref = useRef<HTMLDivElement | null>(null)
  useReveal(ref)

  return (
    <section className="sect" id="news">
      <SectionHeader
        index="02"
        label="Notes & updates"
        heading="News"
        aside={<p style={{ maxWidth: '40ch' }}>Short updates on new tools, papers and conferences — posted as they happen.</p>}
      />
      <div className="fi" ref={ref}>
        <AccordionGallery items={items} defaultIndex={0} trigger="hover" />
      </div>
    </section>
  )
}
