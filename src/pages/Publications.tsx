import { publicationEntries } from '@/lib/content'
import { richText } from '@/lib/richtext'
import contact from '@/content/site/contact.json'
import { PageHead } from '@/components/site/PageHead'

const researchGate = contact.elsewhere.find((e) => /researchgate/i.test(e.url))?.url

export function Publications() {
  return (
    <main className="page" id="content">
      <PageHead no="03" kicker="Publications" title="Publications">
        <p>Papers, posters and talks, newest first.</p>
        {researchGate && (
          <a className="pill-link" href={researchGate} target="_blank" rel="noreferrer">
            All on ResearchGate ↗
          </a>
        )}
      </PageHead>
      <ol className="pub-list">
        {publicationEntries.map((p, i) => (
          <li className="pub card rise" key={p.title} style={{ '--d': i + 1 } as React.CSSProperties}>
            <p className="meta-row">
              <span>{p.year}</span>
              <span>{p.type}</span>
            </p>
            <h3>{p.title}</h3>
            {p.desc && <p className="pub-desc">{p.desc}</p>}
            <p className="pub-authors">{richText(p.authors)}</p>
            <div className="pub-foot">
              <p className="pub-venue">
                <em>{p.journal}</em>
                {p.journalMeta && <span> · {p.journalMeta}</span>}
              </p>
              <div className="pub-links">
                {p.doiUrl && (
                  <a className="pill-link" href={p.doiUrl} target="_blank" rel="noreferrer">
                    {p.doi && p.doi !== 'DOI' ? p.doi : 'Read the paper'} ↗
                  </a>
                )}
                {p.researchgateUrl && (
                  <a className="pill-link" href={p.researchgateUrl} target="_blank" rel="noreferrer">
                    ResearchGate ↗
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
