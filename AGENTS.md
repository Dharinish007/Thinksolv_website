# AGENTS.md — ThinkSolv Website

> **These rules are mandatory for every task.** If a rule conflicts with a user request, say so in one line, then follow the user.

## 1. 🎯 Project
ThinkSolv marketing site (document-centric Google Workspace tools). **Astro 5 · Tailwind 4 · TypeScript.** Static site, sitemap via `@astrojs/sitemap`. Branch convention: `redesign/*`; `main` is the PR base.

## 2. ⌨️ Commands
| Do | Run |
|---|---|
| Dev server | `npm run dev` (use the preview tool, not a raw shell server) |
| Type check | `npm run check` |
| Build | `npm run build` |
| Serve build | `npm run preview` |

## 3. 🗺️ Site map
```
/                Home      Hero · Proof · What we do · Products(bento) · How we build(3-step story) · Services · About · CTA
/products        Products  PageHero · Featured(ink) · Browse+filter · CTA
/products/[slug] Product   Hero · Problem→Solution · How it works · Features · Outcomes(ink) · Related · CTA   (6 products)
/services        Services  PageHero · Problems · Offer(2x2) · Capabilities(ink) · How we work · Use cases · Proof · CTA
/about           About     PageHero · Who we are · Mission/Vision · Values · Timeline(ink) · Team · Quote · CTA
/contact         Contact   PageHero · Options+Form · Company details · CTA
/404             noindex
Global (layouts/Base.astro): Preloader · Header · Footer · CommandPalette · Assistant
```
Products: Bulk Converter Pro, Docs to Markdown Pro, Docs to PDF Pro (featured), Docs to WP Pro, Merge Docs Pro, PDF to Docs Pro.

## 4. 🧱 Where to edit
```
Product copy           → src/content/products/*.md   (schema: src/content.config.ts)
Nav / metrics / values / timeline → src/data/site.ts
Page copy + layout     → src/pages/*.astro
Shared UI              → src/components/*.astro
Colours / type / spacing tokens → src/styles/global.css
Animation              → src/scripts/motion.ts
Interactions / form    → src/scripts/ui.ts
Document shell / SEO   → src/layouts/Base.astro
```
**Never edit:** `dist/`, `.astro/`, `node_modules/`, `skills-lock.json`, `.agents/`, `.playwright-mcp/`.

## 5. 🧠 Working principles (Karpathy-derived, hardened)
1. **Think before coding.** Restate the request in 1–2 lines. List assumptions. If ambiguous, show the interpretations and ask — never guess silently. Push back if a simpler way exists.
2. **Simplicity first.** Minimum change that solves it. No speculative features, one-use abstractions, unrequested config, or handling of impossible cases.
3. **Surgical changes.** Touch only what the request needs. Match surrounding style. No drive-by refactors or reformatting. Remove only orphans *your* change created; mention (don't fix) unrelated issues.
4. **Goal-driven.** Turn the request into a checkable outcome, then verify it (§8) before saying "done".
5. **Read before write.** Read the file(s) and trace the flow first. Search `src/components` and `src/data` for an existing helper before creating one.
6. **Truth over comfort.** Report what actually happened. Failing check = say so with output. Not verified = say "not verified". State a **confidence level** (🟢 high / 🟡 medium / 🔴 low) on analysis, plans and claims.
7. **Content integrity.** Never invent facts (metrics, clients, team, emails, prices, testimonials). Unknown → ask or mark `TODO` and tell the user.

## 6. 🎨 Design system rules
- Use tokens from `src/styles/global.css` (`--color-*`, `--text-*`, `--radius*`, `--shadow-*`, `--ease-*`, `--dur-*`, `--section-y*`). **No hardcoded hex values, ad-hoc font sizes or magic durations.**
- Palette: warm off-white bg, white surface, dark warm ink, single coral accent. Don't add new accent colours without asking.
- Pages are built from `Section` (`tone`: `base` | `surface` | `ink`), `SectionHeader`, `PageHero`, `CtaSection`, `StatBand`, `StepStory`, `ProductCard`, `Button`, `Icon`. **Reuse these first.**
- Keep section tones alternating (base → surface → ink) for rhythm; every page ends with `CtaSection`.
- Numbered `SectionHeader`s (01, 02…) stay sequential per page.
- Use the installed skills for visual work: `frontend-design` (distinct aesthetic), `ui-ux-pro-max` (UX/palette/type decisions), `web-design-guidelines` (audit/accessibility review).

## 7. ♿ Non-negotiables (never regress)
- Accessibility: semantic landmarks, one `h1` per page, labels on inputs, visible focus, sufficient contrast, `aria-live` on form status.
- `prefers-reduced-motion` must disable/soften all motion (`motion.ts`, CSS, Preloader, HeroScene).
- Contact form keeps Netlify attributes, validation, and mailto fallback.
- `404` stays `noindex`; every page keeps `<title>` + description via `Base`.
- Mobile-first: no horizontal scroll at 375px; check desktop and mobile.
- Performance: self-hosted fonts, no new heavy dependencies without asking. Prefer CSS/native over JS.

## 8. ✅ Definition of done
1. `npm run check` passes (no new errors).
2. `npm run build` passes.
3. UI change → opened in the preview, console clean, checked at mobile (375) and desktop widths, screenshot as proof.
4. No unrelated files changed (`git diff --stat` reviewed).
Skipped any step → say which and why.

## 9. 🔁 Workflow & reply format (every change request)
```
User: one change → Claude: restate + assumptions → smallest correct edit → verify → report
```
End **every** reply with:
- 📋 **Summary** — what changed (files + 1 line each)
- ➡️ **Next** — recommended next step
- ❓ **Why** — reason for the change and the next step
- 💡 **Ideas** — 2–3 suggestions that suit the site (suggest only; do not apply unasked)
- 🎯 **Confidence** — 🟢/🟡/🔴 plus what is unverified

Style: concise, clear, bullet points, emojis for scanning, tables/diagrams when they clarify. No filler.

## 10. 🔀 Git
Commit/push only when asked. Never `--no-verify`, never force-push. Prefer new commits over amend. Don't commit `.env` or build output.

## 11. ⚠️ Known unknowns (ask the user, don't assume)
- Hosting target (Netlify attributes suggest Netlify — 🟡 unconfirmed)
- Official contact email / company details beyond `src/data/site.ts`
- Analytics, cookie/consent policy
_User will fill these in later._
