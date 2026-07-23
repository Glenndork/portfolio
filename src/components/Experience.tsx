import { Section } from '@/components/Section'
import { Typed } from '@/components/Typed'
import { experience } from '@/data/content'

export function ExperienceBody() {
  let order = 0

  return (
    <>
      {experience.map((job) => (
        <div key={job.title} className="entry">
          <Typed
            order={order++}
            as="div"
            className="text-[12.5px] tracking-[1px] text-muted-foreground"
            segments={[{ text: job.when }]}
          />
          <Typed
            order={order++}
            as="h3"
            className="mt-1.5 text-[1.25rem] font-bold"
            segments={[{ text: job.title }]}
          />
          <Typed
            order={order++}
            as="div"
            className="mt-0.5 text-[0.95rem] text-muted-foreground"
            segments={[{ text: job.org }]}
          />
          <ul className="entry-list mt-3.5 flex flex-col gap-2">
            {job.points.map((point) => (
              <Typed key={point} order={order++} as="li" segments={[{ text: point }]} />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

export function Experience() {
  return (
    <Section id="experience" heading="experience">
      <ExperienceBody />
    </Section>
  )
}
