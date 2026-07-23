import { Section } from '@/components/Section'
import { Typed } from '@/components/Typed'
import { about } from '@/data/content'

export function About() {
  return (
    <Section id="about" heading="about">
      <Typed
        order={0}
        as="p"
        className="max-w-[720px] text-[clamp(1.05rem,2.4vw,1.35rem)] leading-[1.7] text-[#d8d8d8]"
        segments={[
          { text: "I'm a " },
          { text: 'Computer Science', className: 'font-bold text-foreground' },
          { text: ' graduate and ' },
          { text: 'software developer', className: 'font-bold text-foreground' },
          {
            text: ' who enjoys breathing new life into legacy systems — modernizing old workflows without breaking what already works.',
          },
        ]}
      />
      <Typed
        order={1}
        as="p"
        className="comment mt-[22px] text-[0.95rem] text-muted-foreground"
        segments={[{ text: about.comment }]}
      />
    </Section>
  )
}
