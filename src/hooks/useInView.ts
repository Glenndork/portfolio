import { useEffect, useRef, useState } from 'react'

/** Fires once when the element first scrolls into view. */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            io.disconnect()
          }
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, inView }
}
