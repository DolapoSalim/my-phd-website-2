import { useEffect, useRef, useState, useMemo, useCallback, type ElementType } from 'react'

interface Point {
  x: number
  y: number
}

const dist = (a: Point, b: Point) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist)
  return Math.max(minVal, val + minVal)
}

function debounce<A extends unknown[]>(func: (...args: A) => void, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: A) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

interface TextPressureProps {
  text: string
  tag?: ElementType
  fontFamily?: string
  fontUrl?: string
  flex?: boolean
  scale?: boolean
  alpha?: boolean
  stroke?: boolean
  width?: boolean
  weight?: boolean
  italic?: boolean
  textColor?: string
  strokeColor?: string
  className?: string
  minFontSize?: number
  /** Not in the original - the source's fill-the-container sizing model
   *  makes short lines balloon far past any surrounding heading scale,
   *  so this caps it back down to fit the hero's existing type scale. */
  maxFontSize?: number
}

/** Port of React Bits' TextPressure: cursor-proximity-driven variable-
 *  font weight/width/italic per character. Adds `tag` (so it can render
 *  as a <span> inside a single outer <h1>) and `maxFontSize` (see
 *  above) on top of the original API. */
export function TextPressure({
  text,
  tag: Tag = 'h1',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',
  width = true,
  weight = true,
  italic = false,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = '#FFFFFF',
  strokeColor = '#FF0000',
  className = '',
  minFontSize = 24,
  maxFontSize = Infinity,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLElement | null>(null)
  const spansRef = useRef<(HTMLSpanElement | null)[]>([])

  const mouseRef = useRef<Point>({ x: 0, y: 0 })
  const cursorRef = useRef<Point>({ x: 0, y: 0 })

  const [fontSize, setFontSize] = useState(minFontSize)
  const [scaleY, setScaleY] = useState(1)
  const [lineHeight, setLineHeight] = useState(1)

  const chars = text.split('')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX
      cursorRef.current.y = e.clientY
    }
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      cursorRef.current.x = t.clientX
      cursorRef.current.y = t.clientY
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    if (containerRef.current) {
      const { left, top, width: w, height: h } = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = left + w / 2
      mouseRef.current.y = top + h / 2
      cursorRef.current.x = mouseRef.current.x
      cursorRef.current.y = mouseRef.current.y
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return
    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect()

    let newFontSize = containerW / (chars.length / 2)
    newFontSize = Math.min(Math.max(newFontSize, minFontSize), maxFontSize)

    setFontSize(newFontSize)
    setScaleY(1)
    setLineHeight(1)

    requestAnimationFrame(() => {
      if (!titleRef.current) return
      const textRect = titleRef.current.getBoundingClientRect()
      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height
        setScaleY(yRatio)
        setLineHeight(yRatio)
      }
    })
  }, [chars.length, minFontSize, maxFontSize, scale])

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100)
    debouncedSetSize()
    window.addEventListener('resize', debouncedSetSize)
    return () => window.removeEventListener('resize', debouncedSetSize)
  }, [setSize])

  useEffect(() => {
    let rafId: number
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect()
        const maxDist = titleRect.width / 2

        spansRef.current.forEach((span) => {
          if (!span) return
          const rect = span.getBoundingClientRect()
          const charCenter = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
          const d = dist(mouseRef.current, charCenter)

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : 0
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1'

          const newSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`
          if (span.style.fontVariationSettings !== newSettings) span.style.fontVariationSettings = newSettings
          if (alpha && span.style.opacity !== alphaVal) span.style.opacity = alphaVal
        })
      }

      rafId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(rafId)
  }, [width, weight, italic, alpha])

  const styleElement = useMemo(
    () => (
      <style>{`
        @import url('${fontUrl}');
        .text-pressure-flex { display: flex; justify-content: space-between; }
        .text-pressure-stroke span { position: relative; color: ${textColor}; }
        .text-pressure-stroke span::after {
          content: attr(data-char); position: absolute; left: 0; top: 0; color: transparent; z-index: -1;
          -webkit-text-stroke-width: 3px; -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>
    ),
    [fontUrl, textColor, strokeColor],
  )

  const dynamicClassName = [className, flex ? 'text-pressure-flex' : '', stroke ? 'text-pressure-stroke' : ''].filter(Boolean).join(' ')

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {styleElement}
      <Tag
        ref={titleRef}
        className={dynamicClassName}
        style={{
          fontFamily,
          fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          fontWeight: 100,
          width: '100%',
          display: 'block',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => { spansRef.current[i] = el }}
            data-char={char}
            style={{ display: 'inline-block', color: stroke ? undefined : textColor }}
          >
            {char}
          </span>
        ))}
      </Tag>
    </div>
  )
}
