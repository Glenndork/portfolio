/* ==========================================================================
   Progressive enhancement only — every word and link works without this file.
   1. falling code rain      2. skills marquee loop
   3. typewriter + reveals   4. terminal boot sequence
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ Falling code rain (black & white) ============ */
(function () {
    const canvas = document.getElementById('matrix');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');

    // fragments from different programming languages
    const snippets = [
        'public static void main', '#include <stdio.h>', 'const x =>', '<?php echo $row; ?>',
        'function()', 'import React', 'SELECT * FROM', 'npm run dev', 'git commit -m',
        'return true;', 'System.out.println', 'if(err) throw', 'Route::get()', 'useState()',
        'while(1){}', 'printf("%d\\n")', 'class App {', '</div>', '=> {}', '$this->model',
        'async await', 'node_modules', 'void render()', 'int i=0;', 'MySQL', 'Laravel',
        'React.render', 'let arr=[]', '<html>', '#define', 'cout<<', 'catch(e){}', 'flutter run',
        'try{}', '0x1F', '!=null', '++i', 'const [', '=> res.json', 'php artisan', 'npm i',
        'boolean', 'String[]', 'float', 'double', 'struct', 'malloc()', 'new Promise', 'fetch()',
        '{ }', '[ ]', '< >', '&&', '||', '===', '!==', '//TODO', '/* */', '?:', '::', '->',
        '01001', '10110', '0xFF', '\\n', '\\t', ';', '}', '{', '$', '@'
    ];

    const chars = '01<>{}[]();=+-*/&|$#@!?:.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let cols, drops, fontSize, frame = null;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        fontSize = window.innerWidth < 640 ? 13 : 16;
        cols = Math.floor(canvas.width / fontSize);
        drops = new Array(cols).fill(0).map(() => Math.random() * -canvas.height / fontSize);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        // translucent black over the previous frame -> trailing effect
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + "px 'SFMono-Regular', Consolas, monospace";

        for (let i = 0; i < cols; i++) {
            const y = drops[i] * fontSize;

            // occasionally draw a bright fragment, otherwise a single dim glyph
            if (Math.random() < 0.07) {
                const frag = snippets[(Math.random() * snippets.length) | 0];
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fillText(frag, i * fontSize, y);
            } else {
                const ch = chars[(Math.random() * chars.length) | 0];
                const shade = 120 + ((Math.random() * 135) | 0);
                ctx.fillStyle = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
                ctx.fillText(ch, i * fontSize, y);
            }

            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i] += 0.55;
        }
        frame = requestAnimationFrame(draw);
    }

    // don't burn cycles on a background tab
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (frame) cancelAnimationFrame(frame);
            frame = null;
        } else if (!frame) {
            frame = requestAnimationFrame(draw);
        }
    });

    draw();
})();

/* ============ Skills marquee: duplicate items for a seamless loop ============ */
(function () {
    if (reduceMotion) return;
    document.querySelectorAll('.track[data-loop]').forEach((track) => {
        track.innerHTML += track.innerHTML;   // 2x content -> translateX(-50%) loops seamlessly
    });
})();

/* ============ Typewriter (preserves inline tags), typed on scroll ============ */
(function () {
    // Type one element char-by-char across its text nodes, keeping inline spans.
    function typeEl(el) {
        return new Promise((resolve) => {
            const nodes = [];
            (function walk(n) {
                n.childNodes.forEach((c) => {
                    if (c.nodeType === 3) nodes.push(c);
                    else if (c.nodeType === 1) walk(c);
                });
            })(el);
            const originals = nodes.map((n) => n.textContent);
            nodes.forEach((n) => { n.textContent = ''; });
            el.style.visibility = 'visible';
            el.classList.add('typing');

            const speed = el.dataset.speed ? +el.dataset.speed : 16;
            let ni = 0, ci = 0;
            (function step() {
                if (ni >= nodes.length) {
                    el.classList.remove('typing');
                    el.classList.add('typed');
                    resolve();
                    return;
                }
                const full = originals[ni];
                if (ci <= full.length) {
                    nodes[ni].textContent = full.slice(0, ci++);
                    setTimeout(step, speed);
                } else { ni++; ci = 0; step(); }
            })();
        });
    }

    // Type every .type element in a section, one after another (terminal-style).
    async function typeSection(section) {
        const targets = section.querySelectorAll('.type:not(.typed)');
        for (const t of targets) await typeEl(t);
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            if (!reduceMotion) typeSection(e.target);
            io.unobserve(e.target);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

    /* ---- boot: terminal login, then reveal + hero typing ---- */
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    // Type a command made of syntax-highlighted tokens.
    function typeCommand(container, tokens, speed) {
        return new Promise((res) => {
            const spans = tokens.map((tk) => {
                const s = document.createElement('span');
                if (tk.c) s.className = tk.c;
                container.appendChild(s);
                return { el: s, full: tk.t, i: 0 };
            });
            let idx = 0;
            (function step() {
                if (idx >= spans.length) { res(); return; }
                const sp = spans[idx];
                if (sp.i <= sp.full.length) {
                    sp.el.textContent = sp.full.slice(0, sp.i++);
                    setTimeout(step, speed);
                } else { idx++; step(); }
            })();
        });
    }

    let heroStarted = false;
    async function runHero() {
        if (heroStarted) return;
        heroStarted = true;
        const p = document.querySelector('.hero .prompt');
        const h = document.querySelector('.hero h1');
        const r = document.querySelector('.hero .role');
        if (p) await typeEl(p);
        if (h) await typeEl(h);
        if (r) { await typeEl(r); r.classList.add('done-caret'); }
        document.querySelectorAll('.hero .late').forEach((e) => e.classList.add('show'));
    }

    const bootEl = document.getElementById('boot');

    function endBoot() {
        if (!bootEl || bootEl.classList.contains('gone')) return;
        bootEl.classList.add('gone');
        document.body.classList.remove('booting');
    }

    // Skip straight to the page: used by the skip button, Escape, and the failsafe.
    function skipBoot() {
        endBoot();
        document.querySelectorAll('.hero .type').forEach((e) => { e.style.visibility = 'visible'; });
        runHero();
    }

    async function boot() {
        if (!bootEl) { runHero(); return; }

        const cmd = document.getElementById('cmd');
        const log = document.getElementById('bootlog');
        const caret = document.getElementById('bcursor');

        document.querySelector('[data-boot-skip]')?.addEventListener('click', skipBoot);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') skipBoot();
        });

        if (reduceMotion) {
            endBoot();
            document.querySelectorAll('.hero .late').forEach((e) => e.classList.add('show'));
            return;
        }

        await wait(450);
        await typeCommand(cmd, [
            { t: 'portfolio', c: 'tok-cmd' },
            { t: ' open', c: 'tok-sub' },
            { t: ' -u ', c: 'tok-flag' },
            { t: '"Glenn Viola"', c: 'tok-str' },
            { t: ' -p ', c: 'tok-flag' },
            { t: '"*****************"', c: 'tok-str' }
        ], 34);
        await wait(380);
        if (caret) caret.style.display = 'none';

        const lines = [
            '<span class="k">[auth]</span> verifying credentials ............ <span class="ok">granted</span>',
            '<span class="k">[init]</span> compiling assets ................. <span class="ok">done</span>',
            '<span class="k">[load]</span> modules: hero · about · work · projects · skills',
            '<span class="k">[boot]</span> launching interface <span class="ok">&#10003;</span>'
        ];
        for (const ln of lines) {
            const d = document.createElement('div');
            d.className = 'l';
            d.innerHTML = ln;
            log.appendChild(d);
            await wait(240);
        }
        await wait(520);
        endBoot();
        await wait(420);
        runHero();
    }

    // failsafe: never leave the page hidden behind the boot screen
    setTimeout(() => {
        if (bootEl && !bootEl.classList.contains('gone')) skipBoot();
    }, 10000);

    boot();
})();
