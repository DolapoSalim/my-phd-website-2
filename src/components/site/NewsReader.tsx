import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { NewsEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'

/** Full-length news post in a pop-up over the News page. Escape, the close
 *  button or a click outside closes it (Escape is caught here first so it
 *  doesn't also trigger the site-wide "Escape goes back" shortcut). */
export function NewsReader({ post, tags, onClose }: { post: NewsEntry; tags: string[]; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [onClose])

  return createPortal(
    <div className="reader" onClick={onClose}>
      <article className="reader-card" role="dialog" aria-modal="true" aria-labelledby="reader-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" ref={closeRef} className="reader-close" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={1.8} />
        </button>
        {post.image && (
          <div className={`reader-media fit-${post.imageFit === 'contain' ? 'contain' : 'cover'}`}>
            <img src={post.image} alt={post.imageAlt || post.title} style={post.imagePosition ? { objectPosition: post.imagePosition } : undefined} />
          </div>
        )}
        <div className="reader-copy">
          <p className="news-meta">
            <span className="news-date">{post.date}</span>
            {tags.map((t, k) => (
              <span key={t} className={`news-tag${k === 0 ? ' is-main' : ''}`}>
                {t}
              </span>
            ))}
          </p>
          <h2 id="reader-title">{post.title}</h2>
          <p className="reader-body">{richText(post.body)}</p>
          {post.url && (
            <a className="pill-link" href={post.url} target="_blank" rel="noreferrer">
              {post.urlLabel || 'Open link'} ↗
            </a>
          )}
        </div>
      </article>
    </div>,
    document.body,
  )
}
