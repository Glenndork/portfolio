import { Section } from '@/components/Section'
import { Typed, type Segment } from '@/components/Typed'
import { education } from '@/data/content'

export function Education() {
  let order = 0

  return (
    <Section id="education" heading="education">
      {education.map((item) => {
        const org: Segment[] = [{ text: item.org }]
        for (const extra of item.extra) {
          org.push({ text: ' • ', className: 'text-dim' }, { text: extra })
        }
        if (item.honors) {
          org.push({ text: ' • ', className: 'text-dim' }, {
            text: item.honors,
            className: 'text-foreground',
          })
        }

        return (
          <div key={item.title} className="entry">
            <Typed
              order={order++}
              as="div"
              className="text-[12.5px] tracking-[1px] text-muted-foreground"
              segments={[{ text: item.when }]}
            />
            <Typed
              order={order++}
              as="h3"
              className="mt-1.5 text-[1.25rem] font-bold"
              segments={[{ text: item.title }]}
            />
            <Typed
              order={order++}
              as="div"
              className="mt-0.5 text-[0.95rem] text-muted-foreground"
              segments={org}
            />
          </div>
        )
      })}
    </Section>
  )
}
