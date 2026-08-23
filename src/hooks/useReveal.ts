import { useEffect, type RefObject } from 'react'

/** Adds the `vis` class once an element crosses the viewport — for
 *  elements that already carry their own opacity/transform base rule
 *  keyed off their own class name (.tl-item, .pub, .news-item,
 *  .proj-item), as opposed to <Reveal>'s generic `.fi` treatment. */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}
