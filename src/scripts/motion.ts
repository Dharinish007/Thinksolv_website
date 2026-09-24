// Motion: scroll reveals, count-ups, cursor spotlight, preloader hand-off, hero intro, sticky StepStory.
// Per-page observers are created on `astro:page-load` and torn down before each ClientRouter swap.

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
let cleanups: (() => void)[] = [];

// ClientRouter replaces <html> attributes on swap — restore the JS flag before paint.
// `via-router` marks client-side navigations: elements that a view transition carries in
// (e.g. the product title) must not also play their own entrance.
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('js', 'via-router'));
document.addEventListener('astro:before-swap', () => { cleanups.forEach((fn) => fn()); cleanups = []; });

/* ---------------- Scroll reveal ---------------- */
function initReveals() {
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (reduce() || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ---------------- Count-up metrics ---------------- */
function initCounters() {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!counters.length) return;
  const fmt = (n: number) => n.toLocaleString('en-US');
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count || '0');
    const suffix = el.dataset.suffix || '';
    if (reduce()) { el.textContent = fmt(target) + suffix; return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 900, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  // The final value stays in place until the number enters view, then counts up from 0 at once —
  // so captures, print, skipped sections or a number peeking above the fold never sit at "0".
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); }
    });
  });
  counters.forEach((c) => io.observe(c));
  cleanups.push(() => io.disconnect());
}

/* ---------------- Cursor spotlight (desktop only) ---------------- */
function onPointer(e: PointerEvent) {
  const el = (e.target as Element).closest?.<HTMLElement>('.spotlight');
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}
if (finePointer()) document.addEventListener('pointermove', onPointer, { passive: true });

/* ---------------- StepStory: active step drives sticky visual ---------------- */
function initStepStories() {
  document.querySelectorAll<HTMLElement>('[data-steps]').forEach((root) => {
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
    const visuals = Array.from(root.querySelectorAll<HTMLElement>('[data-step-visual]'));
    const activate = (i: number) => {
      steps.forEach((s, j) => s.classList.toggle('is-active', i === j));
      visuals.forEach((v, j) => v.classList.toggle('is-active', i === j));
    };
    activate(0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target as HTMLElement)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
    cleanups.push(() => io.disconnect());
  });
}

/* ---------------- Preloader → header hand-off, then page intro ---------------- */
function playIntro() {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  if (!intro) return;
  requestAnimationFrame(() => intro.classList.add('is-in'));
  if (intro.hasAttribute('data-hero')) {
    const scene = intro.querySelector<HTMLElement>('[data-hero-scene]');
    scene?.classList.add('is-playing');
    setTimeout(() => {
      scene?.classList.add('is-settled');
      document.dispatchEvent(new CustomEvent('ts:hero-done'));
    }, reduce() ? 0 : 1900);
  }
}

function runPreloader(): Promise<void> {
  const html = document.documentElement;
  const pre = document.getElementById('preloader');
  if (!html.classList.contains('preload') || !pre) return Promise.resolve();
  const done = () => { html.classList.remove('preload'); pre.classList.remove('is-leaving'); };
  return new Promise((resolve) => {
    const finish = () => { done(); resolve(); };
    // Hard cap measured from navigation start: never hold the page past ~1.1s.
    const elapsed = performance.now();
    if (elapsed > 700) { finish(); return; } // scripts arrived late — skip the flourish
    const cap = setTimeout(finish, 1100 - elapsed);
    setTimeout(() => {
      const from = pre.querySelector<SVGElement>('[data-preloader-mark]');
      const to = document.querySelector<SVGElement>('#site-header [data-logo-mark]');
      if (!from || !to || !to.getClientRects().length) return;
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      from.animate(
        [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${b.width / a.width})` }],
        { duration: 360, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
      );
      pre.animate([{ backgroundColor: getComputedStyle(pre).backgroundColor }, { backgroundColor: 'transparent' }], { duration: 360, fill: 'forwards' });
      setTimeout(() => { clearTimeout(cap); finish(); }, 380);
    }, Math.max(0, 680 - elapsed));
  });
}

/* ---------------- Lifecycle ---------------- */
let first = true;
document.addEventListener('astro:page-load', async () => {
  initReveals();
  initCounters();
  initStepStories();
  if (first) { first = false; await runPreloader(); }
  playIntro();
});
