import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { newsEntries, type NewsEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead } from '@/components/site/PageHead'
import { NewsReader } from '@/components/site/NewsReader'

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

/** One news card. Every card has the same height; if the title or text
 *  doesn't fit, it fades out and "Read more" opens the full post. */
function NewsCard({ post, index, onOpen }: { post: NewsEntry; index: number; onOpen: () => void }) {
  const tags = tagsOf(post.tag)
  const shownTags = tags.length ? tags : ['Update']
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [cut, setCut] = useState(false)

  useLayoutEffect(() => {
    const check = () => {
      const t = titleRef.current
      const b = bodyRef.current
      setCut(!!((t && t.scrollHeight > t.clientHeight + 1) || (b && b.scrollHeight > b.clientHeight + 1)))
    }
    check()
    const ro = new ResizeObserver(check)
    if (bodyRef.current) ro.observe(bodyRef.current)
    document.fonts?.ready.then(check)
    return () => ro.disconnect()
  }, [post])

  return (
    <article className={`news card rise${cut ? ' is-cut' : ''}`} style={{ '--d': index + 1 } as React.CSSProperties}>
      {post.image && (
        <div className="news-media">
          {/* every post gets the same frame; logos/figures are shown whole */}
          <div className={`news-frame fit-${post.imageFit === 'contain' ? 'contain' : 'cover'}`}>
            <img
              src={post.image}
              alt={post.imageAlt || post.title}
              loading="lazy"
              style={post.imagePosition ? { objectPosition: post.imagePosition } : undefined}
            />
          </div>
        </div>
      )}
      <div className="news-copy">
        <p className="news-meta">
          <span className="news-date">{post.date}</span>
          {shownTags.map((t, k) => (
            <span key={t} className={`news-tag${k === 0 ? ' is-main' : ''}`}>
              {t}
            </span>
          ))}
        </p>
        <h3 ref={titleRef}>{post.title}</h3>
        <div className="news-excerpt" ref={bodyRef}>
          <p className="news-body">{richText(post.body)}</p>
        </div>
        {(cut || post.url) && (
          <div className="news-actions">
            {cut && (
              <button type="button" className="pill-link solid" onClick={onOpen}>
                Read more
              </button>
            )}
            {post.url && (
              <a className="pill-link" href={post.url} target="_blank" rel="noreferrer">
                {post.urlLabel || 'Open link'} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function News() {
  const [filter, setFilter] = useState<Filter>('All')
  const [open, setOpen] = useState<NewsEntry | null>(null)
  const close = useCallback(() => setOpen(null), [])
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
        {shown.map((n, i) => (
          <NewsCard key={n.title} post={n} index={i} onOpen={() => setOpen(n)} />
        ))}
      </div>

      {open && <NewsReader post={open} tags={tagsOf(open.tag)} onClose={close} />}
    </main>
  )
}
