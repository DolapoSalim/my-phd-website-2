import { useEffect, useState } from 'react'

/** TEMPORARY: lets Dolapo compare colour palettes on the real site.
 *  Only appears when the URL has ?palettes (remembered afterwards), and
 *  is removed once a palette is chosen and made the default. */
const PALETTES = [
  { id: 'field', name: 'Field station', swatch: ['#f7f7f4', '#e7d9b5', '#0b6b70'] },
  { id: 'ocean', name: 'Deep ocean', swatch: ['#f4f7fa', '#c9d8e8', '#1d5fb8'] },
  { id: 'coral', name: 'Coral reef', swatch: ['#faf6f1', '#f1d2c2', '#b8432a'] },
  { id: 'kelp', name: 'Kelp forest', swatch: ['#f5f6f0', '#dedfba', '#3d6b35'] },
  { id: 'notebook', name: 'Lab notebook', swatch: ['#fafafa', '#e9e5d9', '#bf3220'] },
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
    /* private mode: the choice just isn't remembered */
  }
}

export function PalettePicker() {
  const [show] = useState(() => {
    if (new URLSearchParams(window.location.search).has('palettes')) {
      write('ods-palette-picker', '1')
      return true
    }
    return read('ods-palette-picker') === '1'
  })
  const [current, setCurrent] = useState(() => read('ods-palette') || 'field')

  useEffect(() => {
    const root = document.documentElement
    if (current === 'field') root.removeAttribute('data-palette')
    else root.setAttribute('data-palette', current)
    write('ods-palette', current)
  }, [current])

  if (!show) return null
  return (
    <div className="palette-picker" role="group" aria-label="Colour palette (preview)">
      {PALETTES.map((p) => (
        <button type="button" key={p.id} aria-pressed={current === p.id} onClick={() => setCurrent(p.id)}>
          <i aria-hidden="true">
            {p.swatch.map((c) => (
              <b key={c} style={{ background: c }} />
            ))}
          </i>
          {p.name}
        </button>
      ))}
    </div>
  )
}
