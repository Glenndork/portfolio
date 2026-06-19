const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];

const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuToggle || !mobileNav) return;

    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');

    if (restoreFocus) menuToggle.focus();
};

const openMenu = () => {
    if (!menuToggle || !mobileNav) return;

    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation');
    mobileNav.hidden = false;
    document.body.classList.add('menu-open');

    const firstLink = mobileNav.querySelector('a');
    firstLink?.focus();
};

menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
});

mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
        closeMenu({ restoreFocus: true });
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && menuToggle?.getAttribute('aria-expanded') === 'true') {
        closeMenu();
    }
});

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

requestAnimationFrame(() => document.body.classList.add('is-ready'));

const revealTargets = [...document.querySelectorAll('[data-reveal]')];

if ('IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.08,
    });

    revealTargets.forEach((target) => revealObserver.observe(target));
}

const observedSections = ['work', 'profile', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

if (observedSections.length) {
    let navFrame;

    const updateActiveNavigation = () => {
        const marker = window.scrollY + (window.innerHeight * 0.38);
        const activeSection = [...observedSections]
            .reverse()
            .find((section) => marker >= section.offsetTop) || observedSections[0];

        navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${activeSection.id}`) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const requestNavUpdate = () => {
        cancelAnimationFrame(navFrame);
        navFrame = requestAnimationFrame(updateActiveNavigation);
    };

    updateActiveNavigation();
    window.addEventListener('scroll', requestNavUpdate, { passive: true });
    window.addEventListener('resize', requestNavUpdate);
}
