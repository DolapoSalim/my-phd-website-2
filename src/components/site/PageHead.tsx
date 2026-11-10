import type { ReactNode } from 'react'

export function PageHead({ no, kicker, title, children }: { no?: string; kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="page-head rise">
      <p className="kicker">{no ? `Nº ${no} — ${kicker}` : kicker}</p>
      <h1>{title}</h1>
      {children && <div className="lead">{children}</div>}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="section-label rise">
      <span>{children}</span>
      <span className="rule" aria-hidden="true" />
    </h2>
  )
}
