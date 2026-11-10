import { useCallback, useState } from 'react'
import aboutMe from '@/content/site/about-me.json'
import { interestEntries, isVideo, type InterestEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead } from '@/components/site/PageHead'
import { InterestCovers } from '@/components/site/Covers'
import { MediaViewer } from '@/components/site/MediaViewer'

function countLabel(files: string[]) {
  const videos = files.filter(isVideo).length
  const photos = files.length - videos
  const part = (n: number, w: string) => (n ? `${n} ${w}${n === 1 ? '' : 's'}` : '')
  return [part(photos, 'photo'), part(videos, 'video')].filter(Boolean).join(' & ')
}

function InterestCard({ interest, index }: { interest: InterestEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const media = (interest.media ?? []).filter((m) => m.file)
  const hasMedia = media.length > 0

  return (
    <article className="interest card rise" style={{ '--d': index + 1 } as React.CSSProperties}>
      {hasMedia ? (
        <button type="button" className="interest-open" onClick={() => setOpen(true)} aria-label={`Open ${interest.title}: ${countLabel(media.map((m) => m.file))}`}>
          <InterestCovers interest={interest} />
        </button>
      ) : (
        <InterestCovers interest={interest} />
      )}
      <div className="interest-copy">
        <h3>{interest.title}</h3>
        <p className="interest-tagline">{interest.tagline}</p>
        {interest.desc && <p className="interest-desc">{richText(interest.desc)}</p>}
        {(hasMedia || interest.url) && (
          <div className="interest-actions">
            {hasMedia && (
              <button type="button" className="interest-link" onClick={() => setOpen(true)}>
                View {countLabel(media.map((m) => m.file))}
              </button>
            )}
            {interest.url && (
              <a className="interest-link" href={interest.url} target="_blank" rel="noreferrer">
                {interest.urlLabel || 'Take a look'} ↗
              </a>
            )}
          </div>
        )}
      </div>
      {open && <MediaViewer title={interest.title} items={media} onClose={close} />}
    </article>
  )
}

export function About() {
  return (
    <main className="page page-wide" id="content">
      <PageHead no="06" kicker="About me" title={aboutMe.heading}>
        <p>{richText(aboutMe.copy)}</p>
      </PageHead>
      <div className="interest-grid">
        {interestEntries.map((it, i) => (
          <InterestCard interest={it} index={i} key={it.title} />
        ))}
      </div>
    </main>
  )
}
