import { newsEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead } from '@/components/site/PageHead'

/** CMS tags are free text — tidy stray quotes like `"phd", "UNIPI"`. */
const tidyTag = (tag: string) => tag.replace(/"/g, '').trim()

export function News() {
  return (
    <main className="page" id="content">
      <PageHead no="05" kicker="News" title="Notes & updates">
        <p>Short updates on new tools, papers and conferences, posted as they happen.</p>
      </PageHead>
      <div className="news-list">
        {newsEntries.map((n, i) => (
          <article className="news card rise" key={n.title} style={{ '--d': i + 1 } as React.CSSProperties}>
            {n.image && (
              <div className="news-media">
                <img src={n.image} alt={n.imageAlt || n.title} loading="lazy" />
              </div>
            )}
            <div className="news-copy">
              <p className="meta-row">
                <span>{n.date}</span>
                <span>{tidyTag(n.tag) || 'Update'}</span>
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
        ))}
      </div>
    </main>
  )
}
