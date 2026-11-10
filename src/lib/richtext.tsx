import type { ReactNode } from 'react'

const LINK = /^\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)$/

/** Tiny inline-emphasis parser for CMS-authored copy, so editors can add
 *  emphasis and links in plain text without writing HTML:
 *    **text**     -> <strong> (var(--text), bold)
 *    __text__     -> <b>      (var(--accent), bold)
 *    _text_       -> <em>     (italic, var(--accent))
 *    [text](url)  -> link (https://, mailto: or a site path like /notes)
 *  Mirrors the emphasis classes already used across the legacy CSS
 *  (.about-text p strong/b, .pub-authors em, .hero-bio strong, ...). */
export function richText(source: string): ReactNode[] {
  const tokens = source
    .split(/(\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\)|\*\*.+?\*\*|__.+?__|_.+?_)/g)
    .filter((t) => t !== '')
  return tokens.map((token, i) => {
    const link = LINK.exec(token)
    if (link) {
      const [, label, href] = link
      const external = !href.startsWith('/')
      return (
        <a key={i} className="text-link" href={href} {...(external && !href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {label}
        </a>
      )
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('__') && token.endsWith('__')) {
      return <b key={i}>{token.slice(2, -2)}</b>
    }
    if (token.startsWith('_') && token.endsWith('_')) {
      return <em key={i}>{token.slice(1, -1)}</em>
    }
    return token
  })
}
