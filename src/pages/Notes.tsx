import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Eraser, Trash2, Undo2 } from 'lucide-react'
import loveNotes from '@/content/site/love-notes.json'
import { PageHead } from '@/components/site/PageHead'

/** "My love life": a wall of hand-drawn sticky notes. Visitors draw on a
 *  note, post it (max 3 each) and can delete only their own; the API lives
 *  in netlify/functions/notes.mjs, and Dolapo downloads notes as PNGs from
 *  /admin/notes.html. */

const SIZE = 600 // note resolution in px (shown smaller, exported at this size)
const PAPERS = ['#fff1a8', '#ffd3df', '#cfe6ff', '#d7f3cf']
const INKS = ['#1b1b1b', '#c2272d', '#1d5fb8']

interface Note {
  id: string
  createdAt: number
  src: string
  mine: boolean
  /** your own note, not yet approved: only you can see it */
  pending?: boolean
}
type Point = [number, number]
interface Stroke {
  ink: string
  width: number
  points: Point[]
}

function ownerId() {
  const key = 'ods-note-owner'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID?.() ?? [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('')
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return 'session-' + [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
}

function drawAll(ctx: CanvasRenderingContext2D, paper: string, strokes: Stroke[]) {
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of strokes) {
    ctx.strokeStyle = s.ink
    ctx.lineWidth = s.width
    ctx.beginPath()
    const [first, ...rest] = s.points
    ctx.moveTo(first[0], first[1])
    if (!rest.length) ctx.lineTo(first[0] + 0.1, first[1] + 0.1)
    for (let i = 0; i < rest.length; i++) {
      const p = rest[i]
      const next = rest[i + 1]
      if (next) ctx.quadraticCurveTo(p[0], p[1], (p[0] + next[0]) / 2, (p[1] + next[1]) / 2)
      else ctx.lineTo(p[0], p[1])
    }
    ctx.stroke()
  }
}

/** Stable small tilt per note, so the wall looks hand-pinned. */
const tilt = (id: string) => [-2.4, 1.6, -1, 2.2, -1.8, 0.8, 2.8][id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 7]

export function Notes() {
  const owner = useRef(ownerId())
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const strokes = useRef<Stroke[]>([])
  const drawing = useRef<Stroke | null>(null)
  const [paper, setPaper] = useState(PAPERS[0])
  const [ink, setInk] = useState(INKS[0])
  const [count, setCount] = useState(0) // strokes, to re-render buttons
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [limit, setLimit] = useState(3)
  const [status, setStatus] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const mine = notes?.filter((n) => n.mine).length ?? 0
  const publicCount = notes?.filter((n) => !n.pending).length ?? 0
  const left = Math.max(0, limit - mine)

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) drawAll(ctx, paper, drawing.current ? [...strokes.current, drawing.current] : strokes.current)
  }, [paper])

  useEffect(redraw, [redraw])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notes', { headers: { 'x-note-owner': owner.current } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setNotes(data.notes)
      setLimit(data.limit ?? 3)
    } catch {
      setNotes([])
      setStatus({ kind: 'error', text: 'The notes wall is unavailable right now. Please try again later.' })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toCanvas = (e: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE]
  }
  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (left === 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const pressure = e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5
    drawing.current = { ink, width: 5 + pressure * 6, points: [toCanvas(e)] }
    redraw()
  }
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
    for (const ev of events) {
      const r = e.currentTarget.getBoundingClientRect()
      drawing.current.points.push([((ev.clientX - r.left) / r.width) * SIZE, ((ev.clientY - r.top) / r.height) * SIZE])
    }
    redraw()
  }
  const onUp = () => {
    if (!drawing.current) return
    strokes.current = [...strokes.current, drawing.current]
    drawing.current = null
    setCount(strokes.current.length)
    redraw()
  }
  const undo = () => {
    strokes.current = strokes.current.slice(0, -1)
    setCount(strokes.current.length)
    redraw()
  }
  const clear = () => {
    strokes.current = []
    setCount(0)
    redraw()
  }

  const post = async () => {
    const canvas = canvasRef.current
    if (!canvas || !strokes.current.length || busy) return
    setBusy(true)
    setStatus(null)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-note-owner': owner.current },
        body: JSON.stringify({ image: canvas.toDataURL('image/png') }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not post your note.')
      setNotes((list) => [data.note, ...(list ?? [])])
      clear()
      setStatus({ kind: 'ok', text: data.note?.pending ? 'Thank you! Your note will appear on the wall once Dolapo approves it.' : 'Pinned to the wall. Thank you!' })
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Could not post your note.' })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this note?')) return
    const res = await fetch('/api/notes/' + id, { method: 'DELETE', headers: { 'x-note-owner': owner.current } })
    if (res.ok) setNotes((list) => (list ?? []).filter((n) => n.id !== id))
    else setStatus({ kind: 'error', text: 'Could not delete that note.' })
  }

  return (
    <main className="page page-wide" id="content">
      <PageHead no="06" kicker="Outside the lab" title={loveNotes.heading}>
        <p>{loveNotes.intro}</p>
      </PageHead>

      <section className="composer rise" style={{ '--d': 1 } as React.CSSProperties} aria-label="Write a note">
        <div className="composer-pad" data-native-cursor>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="note-canvas"
            aria-label="Drawing area for your note"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
          {left === 0 && notes && <p className="composer-full">You’ve used all {limit} notes. Delete one of yours to write another.</p>}
        </div>
        <div className="composer-tools">
          <div className="tool-group" role="radiogroup" aria-label="Note colour">
            <span className="tool-label">Paper</span>
            {PAPERS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={paper === c} aria-label={`Paper ${c}`} className="swatch" style={{ background: c }} onClick={() => setPaper(c)} />
            ))}
          </div>
          <div className="tool-group" role="radiogroup" aria-label="Ink colour">
            <span className="tool-label">Ink</span>
            {INKS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={ink === c} aria-label={`Ink ${c}`} className="swatch" style={{ background: c }} onClick={() => setInk(c)} />
            ))}
          </div>
          <div className="tool-group">
            <button type="button" className="tool-btn" onClick={undo} disabled={!count}>
              <Undo2 size={16} strokeWidth={1.8} /> Undo
            </button>
            <button type="button" className="tool-btn" onClick={clear} disabled={!count}>
              <Eraser size={16} strokeWidth={1.8} /> Clear
            </button>
          </div>
          <button type="button" className="pill-link solid post-btn" onClick={post} disabled={!count || busy || left === 0}>
            {busy ? 'Pinning…' : 'Pin it to the wall'}
          </button>
          <p className="composer-meta">
            {notes ? `${left} of ${limit} notes left for you` : 'Loading…'}
          </p>
          {status && (
            <p className={`composer-status ${status.kind}`} role="status">
              {status.text}
            </p>
          )}
        </div>
      </section>

      <h2 className="section-label rise">
        <span>The wall{publicCount ? ` · ${publicCount}` : ''}</span>
        <span className="rule" aria-hidden="true" />
      </h2>
      {notes && notes.length === 0 && !status && <p className="wall-empty">No notes yet. Be the first.</p>}
      <ul className="wall">
        {(notes ?? []).map((n) => (
          <li key={n.id} className={`wall-note${n.pending ? ' is-pending' : ''}`} style={{ '--tilt': `${tilt(n.id)}deg` } as React.CSSProperties}>
            <img src={n.src} alt="A hand-drawn note from a visitor" loading="lazy" width={SIZE} height={SIZE} />
            {n.mine && (
              <>
                <span className="wall-mine">{n.pending ? 'Yours · pending' : 'Yours'}</span>
                <button type="button" className="wall-delete" onClick={() => remove(n.id)} aria-label="Delete your note">
                  <Trash2 size={15} strokeWidth={1.8} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
