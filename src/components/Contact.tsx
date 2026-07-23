import { Section } from '@/components/Section'
import { Typed } from '@/components/Typed'
import { Button } from '@/components/ui/button'
import { profile } from '@/data/content'

const links = [
  { label: 'Email', href: `mailto:${profile.email}`, external: false },
  { label: 'GitHub', href: profile.github, external: true },
  { label: 'LinkedIn', href: profile.linkedin, external: true },
  { label: 'Résumé', href: profile.resume, external: true },
  { label: profile.phone, href: profile.phoneHref, external: false },
]

export function ContactBody({ headingId }: { headingId?: string }) {
  return (
    <>
      <Typed
        order={0}
        as="h2"
        id={headingId}
        className="text-[clamp(1.8rem,6vw,3rem)] font-bold tracking-[-1px]"
        segments={[
          { text: "let's " },
          { text: '<', className: 'text-muted-foreground' },
          { text: 'build' },
          { text: '/>', className: 'text-muted-foreground' },
          { text: ' together' },
        ]}
      />

      <Typed
        order={1}
        as="p"
        className="mx-auto mt-4 mb-[30px] max-w-[460px] text-muted-foreground"
        segments={[
          { text: 'Open to opportunities and collaborations. Drop a line — I usually reply fast.' },
        ]}
      />

      <div className="flex flex-wrap justify-center gap-3.5">
        {links.map((link) => (
          <Button
            key={link.label}
            asChild
            variant="outline"
            className="h-auto min-h-11 border-dim bg-transparent px-[22px] py-3 text-sm text-foreground hover:bg-foreground hover:text-background"
          >
            <a
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </a>
          </Button>
        ))}
      </div>
    </>
  )
}

export function Contact() {
  return (
    <Section
      id="contact"
      heading="contact"
      headingAs="div"
      labelledBy="contact-heading"
      headingClassName="tag-center"
      className="pb-[60px] text-center"
    >
      <ContactBody headingId="contact-heading" />
    </Section>
  )
}
