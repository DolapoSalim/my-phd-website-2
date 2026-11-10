import { Link, type Route } from '@/lib/router'

export type Sheet =
  | { kind: 'image'; src: string }
  | { kind: 'logo'; src: string }
  | { kind: 'paper'; title: string; meta: string }

function SheetFace({ sheet }: { sheet: Sheet }) {
  if (sheet.kind === 'paper') {
    return (
      <span className="sheet sheet-paper">
        <span className="sheet-paper-meta">{sheet.meta}</span>
        <span className="sheet-paper-title">{sheet.title}</span>
        <span className="sheet-paper-lines" />
      </span>
    )
  }
  return (
    <span className={`sheet sheet-${sheet.kind}`}>
      <img src={sheet.src} alt="" loading="lazy" decoding="async" />
    </span>
  )
}

/** A manila field-records folder: up to three sheets peek out of it, and
 *  fan out when the folder is hovered or focused. The front flap carries
 *  a specimen-style label (catalogue number + item count). */
export function FieldFolder({
  to,
  no,
  label,
  count,
  sheets,
}: {
  to: Route
  no: string
  label: string
  count: string
  sheets: Sheet[]
}) {
  return (
    <Link to={to} className="folder-btn">
      <span className="folder" aria-hidden="true">
        <span className="folder-back" />
        <span className="folder-sheets">
          {sheets.slice(0, 3).map((s, i) => (
            <SheetFace sheet={s} key={i} />
          ))}
        </span>
        <span className="folder-front">
          <span className="folder-label">
            <span>Nº {no}</span>
            <span>{count}</span>
          </span>
        </span>
      </span>
      <span className="folder-caption">{label}</span>
    </Link>
  )
}
