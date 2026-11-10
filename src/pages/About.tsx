import aboutMe from '@/content/site/about-me.json'
import { interestEntries, type InterestEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'
import { PageHead } from '@/components/site/PageHead'
import { InterestCovers } from '@/components/site/Covers'

function InterestCard({ interest, index }: { interest: InterestEntry; index: number }) {
  const style = { '--d': index + 1 } as React.CSSProperties
  const body = (
    <>
      <InterestCovers interest={interest} />
      <div className="interest-copy">
        <h3>{interest.title}</h3>
        <p className="interest-tagline">{interest.tagline}</p>
        {interest.desc && <p className="interest-desc">{richText(interest.desc)}</p>}
        {interest.url && <span className="interest-link">{interest.urlLabel || 'Take a look'} ↗</span>}
      </div>
    </>
  )
  return interest.url ? (
    <a className="interest card rise" href={interest.url} target="_blank" rel="noreferrer" style={style}>
      {body}
    </a>
  ) : (
    <article className="interest card rise" style={style}>
      {body}
    </article>
  )
}

export function About() {
  return (
    <main className="page page-wide" id="content">
      <PageHead no="05" kicker="About me" title={aboutMe.heading}>
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
