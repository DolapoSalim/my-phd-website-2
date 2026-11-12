import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Link2, Share2, X } from 'lucide-react'
import type { NewsEntry } from '@/lib/content'
import { richText } from '@/lib/richtext'

/** Full-length news post in a pop-up over the News page. Escape, the close
 *  button or a click outside closes it (Escape is caught here first so it
 *  doesn't also trigger the site-wide "Escape goes back" shortcut). */
export function NewsReader({ post, tags, onClose }: { post: NewsEntry; tags: string[]; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/news/${post.slug}`
  const canShare = typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches

  const share = async () => {
    if (canShare) {
      try {
        await navigator.share({ title: post.title, url: link })
      } catch {
        /* cancelled */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      window.prompt('Copy this link:', link)
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

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
          <div className="reader-actions">
            {post.url && (
              <a className="pill-link" href={post.url} target="_blank" rel="noreferrer">
                {post.urlLabel || 'Open link'} ↗
              </a>
            )}
            {post.slug && (
              <button type="button" className="pill-link" onClick={share} aria-live="polite">
                {copied ? <Check size={15} strokeWidth={2} /> : canShare ? <Share2 size={15} strokeWidth={1.8} /> : <Link2 size={15} strokeWidth={1.8} />}
                {copied ? 'Link copied' : canShare ? 'Share' : 'Copy link'}
              </button>
            )}
          </div>
        </div>
      </article>
    </div>,
    document.body,
  )
}
