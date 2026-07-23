import { Section } from '@/components/Section'
import { skillRows } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export function Skills() {
  const reduced = useReducedMotion()

  return (
    <Section id="skills" heading="technical skills">
      {skillRows.map((row, i) => (
        <div key={i} className={cn('marquee', i > 0 && 'mt-4')}>
          <div className={cn('track', i % 2 === 0 ? 'track-left' : 'track-right')}>
            {/* Duplicated once so translateX(-50%) loops seamlessly. */}
            {(reduced ? row : [...row, ...row]).map((skill, j) => (
              <span
                key={`${skill}-${j}`}
                className="item flex flex-none items-center gap-3.5 px-1 py-2 text-[15px] tracking-[0.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </Section>
  )
}
