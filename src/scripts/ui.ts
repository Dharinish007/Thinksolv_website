// UI behaviour: header, mobile menu, command palette, assistant.
// Document-level listeners are registered once (module scope) so they survive ClientRouter swaps;
// per-page setup runs on `astro:page-load`.

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/* ---------------- Header: frosted state, hide on scroll down, sliding pill ---------------- */

let lastY = 0;
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY;
    const nav = $('#site-header [data-nav]');
    const bar = $('#site-header [data-header-bar]');
    nav?.classList.toggle('is-scrolled', y > 12);
    if (bar) {
      const focusInside = bar.matches(':focus-within');
      if (y > 400 && y - lastY > 4 && !focusInside) bar.classList.add('is-hidden');
      else if (lastY - y > 4 || y <= 400) bar.classList.remove('is-hidden');
    }
    lastY = y;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
document.addEventListener('focusin', (e) => {
  if ((e.target as Element).closest?.('#site-header')) $('#site-header [data-header-bar]')?.classList.remove('is-hidden');
});

function movePill(list: HTMLElement, link: HTMLElement | null, animate = true) {
  const pill = $('[data-nav-pill]', list);
  if (!pill) return;
  if (!link) { pill.style.opacity = '0'; return; }
  if (!animate) pill.style.transition = 'none';
  pill.style.width = `${link.offsetWidth}px`;
  pill.style.transform = `translateX(${link.offsetLeft}px)`;
  pill.style.opacity = '1';
  if (!animate) { pill.offsetWidth; pill.style.transition = ''; }
}

function initHeader() {
  lastY = window.scrollY;
  onScroll();
  const list = $('#site-header [data-nav-list]');
  if (list) {
    const active = () => $<HTMLElement>('[aria-current="page"]', list);
    movePill(list, active(), false);
    $$('[data-nav-link]', list).forEach((a) => a.addEventListener('mouseenter', () => movePill(list, a)));
    list.addEventListener('mouseleave', () => movePill(list, active()));
  }
  // Keep the toggle's aria-expanded in sync however the menu closes (Escape, button, link)
  const menu = $<HTMLDialogElement>('#mobile-menu');
  const toggle = $('[data-menu-toggle]');
  if (menu && toggle) {
    const mo = new MutationObserver(() => {
      toggle.setAttribute('aria-expanded', String(menu.open));
      if (!menu.open && menu.contains(document.activeElement)) toggle.focus();
    });
    mo.observe(menu, { attributes: true, attributeFilter: ['open'] });
    document.addEventListener('astro:before-swap', () => mo.disconnect(), { once: true });
  }
  // Platform-appropriate shortcut hint
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  $$('[data-kbd]').forEach((k) => (k.textContent = isMac ? '⌘K' : 'Ctrl K'));
}

/* ---------------- Mobile menu (native <dialog>) ---------------- */

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  const toggle = t.closest<HTMLElement>('[data-menu-toggle]');
  const menu = $<HTMLDialogElement>('#mobile-menu');
  if (!menu) return;
  if (toggle) {
    const r = toggle.getBoundingClientRect();
    menu.style.setProperty('--cx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--cy', `${r.top + r.height / 2}px`);
    menu.showModal();
  } else if (t.closest('[data-menu-close]') || (t.closest('#mobile-menu a') && menu.open)) {
    menu.close();
  }
});

/* ---------------- Command palette ---------------- */

function paletteItems(dlg: HTMLElement) {
  return $$<HTMLAnchorElement>('[data-cmdk-item]', dlg).filter((i) => !i.hidden);
}
function selectItem(dlg: HTMLElement, idx: number) {
  const items = paletteItems(dlg);
  $$('[data-cmdk-item]', dlg).forEach((it) => it.setAttribute('aria-selected', 'false'));
  items[idx]?.setAttribute('aria-selected', 'true');
  items[idx]?.scrollIntoView({ block: 'nearest' });
  dlg.dataset.sel = String(idx);
}
function filterPalette(dlg: HTMLElement, q: string) {
  const query = q.trim().toLowerCase();
  $$<HTMLAnchorElement>('[data-cmdk-item]', dlg).forEach((it) => {
    it.hidden = !!query && !query.split(/\s+/).every((w) => (it.dataset.search ?? '').includes(w));
  });
  $$('[data-cmdk-group]', dlg).forEach((g) => (g.hidden = !$$('[data-cmdk-item]:not([hidden])', g).length));
  $('[data-cmdk-empty]', dlg)?.classList.toggle('hidden', paletteItems(dlg).length > 0);
  selectItem(dlg, 0);
}
function openPalette() {
  const dlg = $<HTMLDialogElement>('#cmdk');
  if (!dlg || dlg.open) return;
  $<HTMLDialogElement>('#mobile-menu')?.close();
  const input = $<HTMLInputElement>('[data-cmdk-input]', dlg)!;
  input.value = '';
  filterPalette(dlg, '');
  dlg.showModal();
  input.focus();
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const dlg = $<HTMLDialogElement>('#cmdk');
    dlg?.open ? dlg.close() : openPalette();
    return;
  }
  const dlg = $<HTMLDialogElement>('#cmdk');
  if (!dlg?.open) return;
  const items = paletteItems(dlg);
  let sel = Number(dlg.dataset.sel ?? 0);
  if (e.key === 'ArrowDown') { e.preventDefault(); selectItem(dlg, (sel + 1) % items.length); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selectItem(dlg, (sel - 1 + items.length) % items.length); }
  else if (e.key === 'Enter' && items[sel]) { e.preventDefault(); items[sel].click(); }
});
document.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.matches('[data-cmdk-input]')) filterPalette($('#cmdk')!, t.value);
});
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-cmdk-open]')) { openPalette(); return; }
  const dlg = $<HTMLDialogElement>('#cmdk');
  if (!dlg?.open) return;
  if (t === dlg || t.closest('[data-cmdk-close]')) { dlg.close(); return; } // backdrop click lands on <dialog>
  const item = t.closest<HTMLAnchorElement>('[data-cmdk-item]');
  if (item) {
    dlg.close();
    if (item.dataset.cmdkAction === 'assistant') { e.preventDefault(); openAssistant(); }
  }
});
document.addEventListener('mousemove', (e) => {
  const item = (e.target as Element).closest?.('#cmdk [data-cmdk-item]');
  if (item) selectItem($('#cmdk')!, paletteItems($('#cmdk')!).indexOf(item as HTMLAnchorElement));
});

/* ---------------- Assistant (Tier A, rule-based) ---------------- */

type Product = { id: string; name: string; tagline: string; text: string };
let products: Product[] | null = null;
const getProducts = () =>
  (products ??= JSON.parse($('[data-assistant-data]')?.textContent || '[]') as Product[]);

const SYNONYMS: Record<string, string> = {
  wordpress: 'wp', md: 'markdown', combine: 'merge', join: 'merge', batch: 'bulk', many: 'bulk',
  folder: 'bulk', multiple: 'bulk', whole: 'bulk', google: 'docs', doc: 'docs', document: 'docs', documents: 'docs',
};
const STOP = new Set(['a', 'an', 'the', 'to', 'into', 'i', 'want', 'my', 'of', 'and', 'for', 'with', 'me', 'need', 'how', 'can', 'do', 'from', 'in', 'is', 'it']);
const tokens = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)).map((w) => SYNONYMS[w] ?? w);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const card = (p: Product) =>
  `<a class="assistant-card" href="/products/${p.id}"><strong class="block text-sm">${esc(p.name)}</strong><span class="block text-xs text-muted">${esc(p.tagline)}</span></a>`;
const HUMAN = `<a class="assistant-card" href="/contact"><strong class="block text-sm">Talk to the team</strong><span class="block text-xs text-muted">A real person replies within one business day.</span></a>`;

function reply(q: string): string {
  const lower = q.toLowerCase();
  if (/\b(custom|automat|appsheet|workflow|service|build|integrat|consult)/.test(lower)) {
    return `That sounds like a job for our services team — we design Document AI and workflow solutions around how you work.<a class="assistant-card" href="/services"><strong class="block text-sm">Explore services</strong><span class="block text-xs text-muted">Document AI, AppSheet & Workspace integration</span></a>${HUMAN}`;
  }
  const qt = tokens(q);
  const toDocs = /pdf.*\b(to|into|edit)\b.*(doc|google)|editable/.test(lower);
  const toPdf = /(doc|google).*\b(to|into|as)\b.*pdf/.test(lower);
  const scored = getProducts()
    .filter((p) => !(toDocs && !toPdf && p.id === 'docs-to-pdf-pro') && !(toPdf && !toDocs && p.id === 'pdf-to-docs-pro'))
    .map((p) => {
      const name = tokens(p.name), tag = tokens(p.tagline), text = tokens(p.text);
      let s = 0;
      for (const w of qt) s += (name.includes(w) ? 3 : 0) + (tag.includes(w) ? 2 : 0) + (text.includes(w) ? 1 : 0);
      // Direction matters: "PDF to Docs" vs "Docs to PDF"
      if (toDocs && p.id === 'pdf-to-docs-pro') s += 4;
      if (toPdf && p.id === 'docs-to-pdf-pro') s += 4;
      return { p, s };
    })
    .filter((x) => x.s > 1)
    .sort((a, b) => b.s - a.s);

  if (!scored.length) {
    return `I couldn’t find an exact match for that — but our team can help, and we build custom solutions too.${HUMAN}`;
  }
  const top = scored[0];
  const close = scored.slice(1).filter((x) => x.s >= top.s * 0.75).slice(0, 1);
  return `${close.length ? 'These look like the best fit:' : `<strong>${esc(top.p.name)}</strong> looks like the right fit.`}${card(top.p)}${close.map((x) => card(x.p)).join('')}`;
}

function addMsg(html: string, who: 'bot' | 'user') {
  const log = $('[data-assistant-log]');
  if (!log) return null;
  const el = document.createElement('div');
  el.className = `assistant-msg is-${who}`;
  el.innerHTML = html;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function ask(q: string) {
  const text = q.trim().slice(0, 200);
  if (!text) return;
  addMsg(esc(text), 'user');
  $('[data-assistant-chips]')?.remove();
  const typing = addMsg('<span class="assistant-typing" aria-label="Typing"><span></span><span></span><span></span></span>', 'bot');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    typing?.remove();
    addMsg(reply(text), 'bot');
  }, reduce ? 0 : 400);
}

function openAssistant() {
  const root = $('#assistant');
  if (!root) return;
  root.classList.add('is-ready', 'is-open');
  $('[data-assistant-panel]', root)?.removeAttribute('inert');
  $('[data-assistant-launcher]', root)?.setAttribute('aria-expanded', 'true');
  setTimeout(() => $<HTMLInputElement>('[data-assistant-input]', root)?.focus(), 50);
}
function closeAssistant(returnFocus = true) {
  const root = $('#assistant');
  if (!root?.classList.contains('is-open')) return;
  root.classList.remove('is-open');
  $('[data-assistant-panel]', root)?.setAttribute('inert', '');
  const launcher = $('[data-assistant-launcher]', root);
  launcher?.setAttribute('aria-expanded', 'false');
  if (returnFocus) launcher?.focus();
}

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-assistant-launcher]')) {
    $('#assistant')?.classList.contains('is-open') ? closeAssistant() : openAssistant();
  } else if (t.closest('[data-assistant-close]')) closeAssistant();
  else if (t.closest('[data-assistant-chip]')) ask(t.closest('[data-assistant-chip]')!.textContent || '');
});
document.addEventListener('submit', (e) => {
  const form = (e.target as Element).closest?.('[data-assistant-form]');
  if (!form) return;
  e.preventDefault();
  const input = $<HTMLInputElement>('[data-assistant-input]', form)!;
  ask(input.value);
  input.value = '';
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (e.target as Element).closest?.('#assistant')) closeAssistant();
});

// Launcher steps aside while a small interactive target (a button, link or form field) sits
// underneath it, so it never blocks CTAs, footer links or the contact form. Large targets such as
// product cards are ignored — they stay clickable around it. Never yields while open or focused.
const YIELD_MAX_TARGET_HEIGHT = 160;
let yieldTargets: HTMLElement[] = [];
let yieldTicking = false;
function updateLauncherYield() {
  yieldTicking = false;
  const root = $('#assistant');
  if (!root) return;
  const launcher = $('[data-assistant-launcher]', root);
  if (root.classList.contains('is-open') || document.activeElement === launcher) { root.classList.remove('is-yielding'); return; }
  const a = root.getBoundingClientRect(); // the fixed container, unaffected by the launcher's own transform
  const hit = yieldTargets.some((el) => {
    const b = el.getBoundingClientRect();
    return b.height > 0 && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  });
  root.classList.toggle('is-yielding', hit);
}
const queueYield = () => { if (!yieldTicking) { yieldTicking = true; requestAnimationFrame(updateLauncherYield); } };
window.addEventListener('scroll', queueYield, { passive: true });
window.addEventListener('resize', queueYield, { passive: true });
document.addEventListener('focusin', queueYield);
function collectYieldTargets() {
  yieldTargets = $$('main a, main button, main input, main textarea, main select, footer a, footer button')
    .filter((el) => !el.closest('#assistant')
      // form fields always count; links/buttons only when small (large cards stay clickable around it)
      && (el.matches('input, textarea, select') || el.getBoundingClientRect().height <= YIELD_MAX_TARGET_HEIGHT));
  queueYield();
}

// Launcher appears after the hero intro (motion.ts dispatches ts:hero-done), or shortly after load elsewhere.
document.addEventListener('ts:hero-done', () => $('#assistant')?.classList.add('is-ready'));

/* ---------------- Lifecycle ---------------- */

document.addEventListener('astro:page-load', () => {
  collectYieldTargets();
  initHeader();
  if (!document.querySelector('[data-hero]')) setTimeout(() => $('#assistant')?.classList.add('is-ready'), 600);
});
