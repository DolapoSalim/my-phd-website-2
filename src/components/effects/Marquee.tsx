interface MarqueeProps {
  items: string[]
}

/** Full-width auto-scrolling ticker band, duplicated once for a seamless
 *  loop (CSS animation translates exactly -50%). Wraps and drops the
 *  motion for prefers-reduced-motion via the .marquee-track CSS rule. */
export function Marquee({ items }: MarqueeProps) {
  const segment = (key: string) => (
    <span className="seg" key={key}>
      {items.map((item, i) => (
        <span key={i}>
          {item}
          <span className="dot"> · </span>
        </span>
      ))}
    </span>
  )

  return (
    <div className="marquee-band">
      <div className="marquee-track">
        {segment('a')}
        {segment('b')}
      </div>
    </div>
  )
}
