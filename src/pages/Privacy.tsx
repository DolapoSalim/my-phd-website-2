import privacy from '@/content/site/privacy.json'
import { richText } from '@/lib/richtext'
import { PageHead } from '@/components/site/PageHead'

export function Privacy() {
  return (
    <main className="page" id="content">
      <PageHead kicker="Privacy" title={privacy.heading}>
        <p>{richText(privacy.intro)}</p>
      </PageHead>
      <ul className="privacy-list">
        {privacy.sections.map((s, i) => (
          <li className="privacy-item rise" key={s.title} style={{ '--d': i + 1 } as React.CSSProperties}>
            <h2>{s.title}</h2>
            <p>{richText(s.body)}</p>
          </li>
        ))}
      </ul>
      <p className="privacy-updated">Last updated {privacy.updated}</p>
    </main>
  )
}
