import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { isVideo, type InterestMedia } from '@/lib/content'

/** Full-size viewer for an interest's photos and videos. Arrow keys or
 *  the buttons step through; Escape, the close button or a click on the
 *  backdrop closes it (Escape is caught here first, so it doesn't also
 *  trigger the site-wide "Escape goes home" shortcut). Rendered into
 *  <body> so a hovered (transformed) card or the large-screen zoom on
 *  .site can't trap or rescale it. */
export function MediaViewer({
  title,
  items,
  start = 0,
  onClose,
}: {
  title: string
  items: InterestMedia[]
  start?: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(start)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const item = items[index]
  const many = items.length > 1
  const step = (d: number) => setIndex((i) => (i + d + items.length) % items.length)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % items.length)
      else if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [items.length, onClose])

  if (!item) return null
  return createPortal(
    <div className="viewer" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="viewer-inner" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-bar">
          <p>
            <span>{title}</span>
            {many && (
              <span className="viewer-count">
                {index + 1} / {items.length}
              </span>
            )}
          </p>
          <button type="button" ref={closeRef} className="viewer-btn" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
        <figure className="viewer-stage">
          {isVideo(item.file) ? (
            <video key={item.file} src={item.file} controls autoPlay playsInline aria-label={item.caption || title} />
          ) : (
            <img key={item.file} src={item.file} alt={item.caption || title} />
          )}
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
        {many && (
          <>
            <button type="button" className="viewer-btn viewer-prev" onClick={() => step(-1)} aria-label="Previous">
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>
            <button type="button" className="viewer-btn viewer-next" onClick={() => step(1)} aria-label="Next">
              <ChevronRight size={20} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
