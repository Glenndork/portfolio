import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type Segment = { text: string; className?: string }

type GroupValue = {
  step: number
  advance: () => void
  active: boolean
  instant: boolean
}

const GroupCtx = createContext<GroupValue>({
  step: 0,
  advance: () => {},
  active: true,
  instant: true,
})

/**
 * Types its <Typed> descendants one after another, terminal-style.
 * Children declare their position with an explicit `order` prop — explicit
 * beats a mount-order registry, which StrictMode's double-mount would skew.
 */
export function TypeGroup({
  active,
  count,
  onComplete,
  instant: forceInstant = false,
  children,
}: {
  active: boolean
  /** How many <Typed> children this group holds; required for onComplete. */
  count?: number
  onComplete?: () => void
  /** Print everything at once — terminal output shouldn't type itself out. */
  instant?: boolean
  children: React.ReactNode
}) {
  const reducedMotion = useReducedMotion()
  const reduced = reducedMotion || forceInstant
  const [step, setStep] = useState(0)
  const advance = useCallback(() => setStep((s) => s + 1), [])
  const completed = useRef(false)

  useEffect(() => {
    if (!active || !onComplete || completed.current) return
    // Reduced motion renders everything at once, so nothing ever advances.
    if (reduced || (count !== undefined && step >= count)) {
      completed.current = true
      onComplete()
    }
  }, [active, reduced, step, count, onComplete])

  const value = useMemo(
    () => ({ step, advance, active, instant: reduced }),
    [step, advance, active, reduced],
  )

  return <GroupCtx.Provider value={value}>{children}</GroupCtx.Provider>
}

function renderSegments(segments: Segment[], count: number) {
  let remaining = count
  return segments.map((seg, i) => {
    const take = Math.max(0, Math.min(seg.text.length, remaining))
    remaining -= take
    return (
      <span key={i} className={seg.className}>
        {seg.text.slice(0, take)}
      </span>
    )
  })
}

export function Typed({
  order,
  segments,
  as: Tag = 'span',
  className,
  speed = 16,
  keepCaret = false,
  id,
}: {
  order: number
  segments: Segment[]
  as?: ElementType
  className?: string
  speed?: number
  keepCaret?: boolean
  id?: string
}) {
  const { step, advance, active, instant } = useContext(GroupCtx)
  const total = useMemo(
    () => segments.reduce((sum, s) => sum + s.text.length, 0),
    [segments],
  )

  const [count, setCount] = useState(0)
  const myTurn = active && !instant && step === order
  const finished = active && !instant && step > order
  const advanced = useRef(false)

  useEffect(() => {
    if (!myTurn) return
    if (count >= total) {
      if (!advanced.current) {
        advanced.current = true
        advance()
      }
      return
    }
    const timer = window.setTimeout(() => setCount((c) => c + 1), speed)
    return () => window.clearTimeout(timer)
  }, [myTurn, count, total, speed, advance])

  // Everything visible at once: no motion preference, or the group is inert.
  if (instant && active) {
    return (
      <Tag id={id} className={className}>
        {renderSegments(segments, total)}
      </Tag>
    )
  }

  // Not yet reached — hold the layout so nothing jumps when typing starts.
  if (!active || (!myTurn && !finished)) {
    return (
      <Tag id={id} className={cn(className, 'invisible')} aria-hidden="true">
        {renderSegments(segments, total)}
      </Tag>
    )
  }

  return (
    <Tag
      id={id}
      className={cn(className, (myTurn || (finished && keepCaret)) && 'caret')}
    >
      {renderSegments(segments, myTurn ? count : total)}
    </Tag>
  )
}

/** Convenience for the common case of a single unstyled run of text. */
export function TypedText(
  props: Omit<React.ComponentProps<typeof Typed>, 'segments'> & { text: string },
) {
  const { text, ...rest } = props
  const segments = useMemo(() => [{ text }], [text])
  return <Typed {...rest} segments={segments} />
}
