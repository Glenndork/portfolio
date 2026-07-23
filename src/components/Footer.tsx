import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer className="relative z-[2] px-[6vw] pt-[30px] pb-10 text-center text-xs text-muted-foreground">
      <Separator className="mb-[30px] bg-border" />
      <p>
        © 2026 Glenn B. Viola —{' '}
        <span className="text-foreground">built with {'{ code }'}</span> &amp; curiosity.
      </p>
    </footer>
  )
}
