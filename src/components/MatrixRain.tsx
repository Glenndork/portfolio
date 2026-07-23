import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Fragments from a few languages so the rain reads like real code streams.
const SNIPPETS = [
  'public static void main', '#include <stdio.h>', 'const x =>', '<?php echo $row; ?>',
  'function()', 'import React', 'SELECT * FROM', 'npm run dev', 'git commit -m',
  'return true;', 'System.out.println', 'if(err) throw', 'Route::get()', 'useState()',
  'while(1){}', 'printf("%d\\n")', 'class App {', '</div>', '=> {}', '$this->model',
  'async await', 'node_modules', 'void render()', 'int i=0;', 'MySQL', 'Laravel',
  'React.render', 'let arr=[]', '<html>', '#define', 'cout<<', 'catch(e){}', 'flutter run',
  'try{}', '0x1F', '!=null', '++i', 'const [', '=> res.json', 'php artisan', 'npm i',
  'boolean', 'String[]', 'float', 'double', 'struct', 'malloc()', 'new Promise', 'fetch()',
  '{ }', '[ ]', '< >', '&&', '||', '===', '!==', '//TODO', '/* */', '?:', '::', '->',
  '01001', '10110', '0xFF', '\\n', '\\t', ';', '}', '{', '$', '@',
]

const CHARS =
  '01<>{}[]();=+-*/&|$#@!?:.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let fontSize = 16
    let drops: number[] = []
    let frame: number | null = null

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      fontSize = window.innerWidth < 640 ? 13 : 16
      cols = Math.floor(canvas.width / fontSize)
      drops = Array.from(
        { length: cols },
        () => (Math.random() * -canvas.height) / fontSize,
      )
    }

    const draw = () => {
      // Translucent black over the previous frame gives the trailing effect.
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px 'JetBrains Mono Variable', 'SFMono-Regular', Consolas, monospace`

      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fontSize

        if (Math.random() < 0.07) {
          ctx.fillStyle = 'rgba(255,255,255,0.85)'
          ctx.fillText(SNIPPETS[(Math.random() * SNIPPETS.length) | 0], i * fontSize, y)
        } else {
          const shade = 120 + ((Math.random() * 135) | 0)
          ctx.fillStyle = `rgb(${shade},${shade},${shade})`
          ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * fontSize, y)
        }

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.55
      }
      frame = requestAnimationFrame(draw)
    }

    // Don't burn cycles behind a hidden tab.
    const onVisibility = () => {
      if (document.hidden) {
        if (frame !== null) cancelAnimationFrame(frame)
        frame = null
      } else if (frame === null) {
        frame = requestAnimationFrame(draw)
      }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-45"
    />
  )
}
