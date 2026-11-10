import { useEffect, useState } from 'react'

/** TEMPORARY: lets Dolapo compare font pairings on the real site.
 *  Only appears when the URL has ?fonts (remembered afterwards), and is
 *  removed once a pairing is chosen and made the default. */
const FONTS = [
  { id: 'inter', name: 'Inter + DM Mono', sample: '"Inter"' },
  { id: 'geist', name: 'Geist', sample: '"Geist"' },
  { id: 'plex', name: 'IBM Plex', sample: '"IBM Plex Sans"' },
  { id: 'fraunces', name: 'Fraunces headings', sample: '"Fraunces"' },
  { id: 'journal', name: 'Source Serif (journal)', sample: '"Source Serif 4"' },
  { id: 'instrument', name: 'Instrument Serif headings', sample: '"Instrument Serif"' },
]

const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // private mode: the choice just isn't remembered
  }
}

export function FontPicker() {
  const [show] = useState(() => {
    if (new URLSearchParams(window.location.search).has('fonts')) {
      write('ods-font-picker', '1')
      return true
    }
    return read('ods-font-picker') === '1'
  })
  const [current, setCurrent] = useState(() => read('ods-font') || 'inter')

  useEffect(() => {
    const root = document.documentElement
    if (current === 'inter') root.removeAttribute('data-font')
    else root.setAttribute('data-font', current)
    write('ods-font', current)
  }, [current])

  if (!show) return null
  return (
    <div className="preview-picker" role="group" aria-label="Font pairing (preview)">
      {FONTS.map((f) => (
        <button type="button" key={f.id} aria-pressed={current === f.id} onClick={() => setCurrent(f.id)}>
          <span style={{ fontFamily: f.sample, fontSize: 17 }}>Aa</span>
          {f.name}
        </button>
      ))}
    </div>
  )
}
