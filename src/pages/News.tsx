import { useState } from 'react'
import { newsEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead } from '@/components/site/PageHead'

/** CMS tags are a comma-separated string ("Research, Publication"); the
 *  first is the post's category. Stray quotes from older entries are tidied. */
const tagsOf = (tag: string) =>
  tag
    .replace(/"/g, '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

const FILTERS = ['All', 'Research', 'Personal'] as const
type Filter = (typeof FILTERS)[number]

export function News() {
  const [filter, setFilter] = useState<Filter>('All')
  const shown = newsEntries.filter((n) => filter === 'All' || tagsOf(n.tag)[0]?.toLowerCase() === filter.toLowerCase())

  return (
    <main className="page" id="content">
      <PageHead no="05" kicker="News" title="Notes & updates">
        <p>Short updates on research, talks and life outside the lab, posted as they happen.</p>
      </PageHead>

      <div className="news-filters rise" role="group" aria-label="Filter news">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="news-filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="news-list">
        {shown.map((n, i) => {
          const tags = tagsOf(n.tag)
          return (
            <article className="news card rise" key={n.title} style={{ '--d': i + 1 } as React.CSSProperties}>
              {n.image && (
                <div className="news-media">
                  <img src={n.image} alt={n.imageAlt || n.title} loading="lazy" />
                </div>
              )}
              <div className="news-copy">
                <p className="news-meta">
                  <span className="news-date">{n.date}</span>
                  {(tags.length ? tags : ['Update']).map((t, k) => (
                    <span key={t} className={`news-tag${k === 0 ? ' is-main' : ''}`}>
                      {t}
                    </span>
                  ))}
                </p>
                <h3>{n.title}</h3>
                <p className="news-body">{richText(n.body)}</p>
                {n.url && (
                  <a className="pill-link" href={n.url} target="_blank" rel="noreferrer">
                    {n.urlLabel || 'Read more'} ↗
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
