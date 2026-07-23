import { cn } from '@/lib/utils'
import { navLinks } from '@/data/content'

export function SiteNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-b from-black/90 to-transparent px-[6vw] py-3 text-[13px] tracking-[0.5px] backdrop-blur-[2px] max-sm:gap-2.5 max-sm:text-xs"
    >
      <a href="#top" className="py-[11px] font-bold text-foreground no-underline">
        <span className="text-muted-foreground">~/</span>glenn.viola
      </a>

      <div className="flex flex-wrap justify-end gap-[18px] max-sm:gap-3">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn(
              'navlink py-[11px] text-muted-foreground no-underline transition-colors hover:text-foreground focus-visible:text-foreground',
              link.optional && 'max-sm:hidden',
            )}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
