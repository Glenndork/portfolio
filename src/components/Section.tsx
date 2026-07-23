import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TypeGroup } from '@/components/Typed'

/**
 * Shared section shell: reveals on scroll, names itself for assistive tech,
 * and drives the typewriter sequence for everything inside it.
 */
export function Section({
  id,
  heading,
  headingAs = 'h2',
  labelledBy,
  className,
  headingClassName,
  children,
}: {
  id: string
  heading: string
  headingAs?: 'h2' | 'div'
  labelledBy?: string
  className?: string
  headingClassName?: string
  children: React.ReactNode
}) {
  const { ref, inView } = useInView<HTMLElement>()
  const reduced = useReducedMotion()
  const headingId = `${id}-title`
  const HeadingTag = headingAs

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy ?? (headingAs === 'h2' ? headingId : undefined)}
      className={cn(
        'mx-auto max-w-[920px] px-[6vw] py-20',
        !reduced && 'transition-all duration-700 ease-out',
        !reduced && (inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'),
        className,
      )}
    >
      <HeadingTag
        id={headingAs === 'h2' ? headingId : undefined}
        className={cn('tag', headingClassName)}
      >
        {heading}
      </HeadingTag>
      <TypeGroup active={inView}>{children}</TypeGroup>
    </section>
  )
}
