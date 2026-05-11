# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Generate thumbnails + Astro production build (static output to dist/)
npm run thumbs     # Generate photography WebP thumbnails only (400px width via Sharp)
npm run preview    # Preview production build locally
```

No test runner or linter is configured.

## Architecture

Astro v4 static site with Svelte v5 interactive islands, Tailwind CSS v3, and Three.js for 3D/shader effects. TypeScript throughout. Deployed on Vercel at www.abdullaalbassam.com (Vercel project: `portfolio`).

**The site has two parallel surfaces:**
1. **V2 (current, in-progress)** — A minimal text-forward site at `/`, `/projects`, `/photography`, `/skills`. Uses `MinimalLayout.astro`. Pampas (#f4f3ee) + Crail (#c15f3c) palette. No 3D, no shaders, no heavy JS.
2. **V1 (archived showcase)** — The original design-heavy site, moved to `/showcase/*`. Uses `BaseLayout.astro` + the Svelte `Navigation` overlay. Three.js TV model, GLSL shader photo, masonry gallery, etc. Linked from the V2 sidebar as "Portfolio V1".

### Tech Stack

- **Astro v4.16** — Static site generator (island architecture, zero JS by default)
- **Svelte v5** — Interactive component islands (hydrated selectively) — only used by V1
- **Tailwind CSS v3.4** — Utility-first styling
- **Three.js v0.170** — Used by V1 only (via Threlte + directly for GLSL)
- **Threlte 8** (`@threlte/core`, `@threlte/extras`) — Declarative Svelte wrapper for Three.js
- **TypeScript v5.6** — Strict mode (extends Astro's strict config)
- **Sharp** — Thumbnail generation (used in build script, not in package.json deps)

### Layouts

- `src/layouts/MinimalLayout.astro` — V2 wrapper. Two-column grid (180px sticky sidebar + 580px content), centered footer with socials + CV download. Sidebar nav: About, Projects, Photography, Skills & Certs, plus a "Portfolio V1" button linking to `/showcase`. Pampas/Crail palette declared inline via CSS variables.
- `src/layouts/BaseLayout.astro` — V1 wrapper. Full-screen Svelte `Navigation` overlay with 2×3 grid hover physics. Dark theme.

### Pages

**V2 (top-level — current minimal site):**

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.astro` | About bio + Education list + "Currently" bullets |
| `/projects` | `projects.astro` | Plain list of 11 projects with category filter |
| `/photography` | `photography.astro` | Reads `public/photography/` directly, uses thumbs/mid variants |
| `/skills` | `skills.astro` | 5 skill groups + certifications |

**V1 (archived under `/showcase/`):**

| Route | File |
|-------|------|
| `/showcase` | `showcase/index.astro` |
| `/showcase/me` | `showcase/me.astro` |
| `/showcase/projects` | `showcase/projects.astro` |
| `/showcase/projects/rest-api` | `showcase/projects/rest-api.astro` |
| `/showcase/projects/operating-systems` | `showcase/projects/operating-systems.astro` |
| `/showcase/photography` | `showcase/photography.astro` |
| `/showcase/skills` | `showcase/skills.astro` |
| `/showcase/contact` | `showcase/contact.astro` |

V2 has no `/contact` page yet — socials and CV are in the `MinimalLayout` footer.

### Interactive Components (Svelte Islands — V1 only)

- **Navigation.svelte** (`client:load`) — Full-screen menu overlay with 2×3 CSS grid hover physics. All hrefs now point to `/showcase/*`.
- **ThreeScene.svelte** / **TorusKnotScene.svelte** — Home page 3D scene (V1 only).
- **ImageWarp.svelte** (`client:visible`) — About page profile photo with GLSL shader.
- **PhotographyGrid.svelte** (`client:load`) — Masonry + lightbox.
- **InProgressCard.svelte** — 3D tilt card with blinking dot + blueprint overlay.

### Path Aliases

Defined in `tsconfig.json`: `@/*` → `src/*`, `@components/*`, `@layouts/*`, `@assets/*`.

### Styling

- **V2:** Pampas background (#f4f3ee), Ink text (#1a1816), Crail accent (#c15f3c). Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (meta). Styles live inline in `MinimalLayout.astro` and per-page `<style>` blocks.
- **V1:** Dark theme (#0a0a0a background, #fafafa text). Global styles in `src/styles/global.css`. Has a localStorage-backed light mode toggle.

Primary mobile breakpoint: 768px (V1), 860px (V2).

### Content Collections

Blog collection is scaffolded in `src/content/config.ts` with Zod schema but has no posts yet.

### Static Assets

```
public/
├── cv.pdf                    # Downloadable CV
├── favicon.svg
├── robots.txt
├── aboutme.jpg               # Profile photo (V1 only)
├── 01-05.jpg                 # V1 project thumbnails
├── photography/              # Full-size photography gallery images
│   ├── thumbs/               # WebP thumbnails (auto-generated, gitignored)
│   └── mid/                  # Mid-size WebP variants (used by V2)
└── projects/
    ├── docs/                 # Project PDFs
    ├── rest-api/             # REST API project assets
    └── architecture-blueprint/
```

### External Integrations

- **Formspree** — Contact form backend, V1 only (`/showcase/contact`)
- **Google Fonts** — Space Grotesk + Inter (+ JetBrains Mono in V2)
- **Vercel** — Static hosting (`vercel.json` declares framework: astro)
- **Umami** — Analytics, loaded in both layouts (`8c977691-5137-4260-bd4b-9abd81c35a1a`)

## Key File Map

```
src/
├── components/                  # All V1 — Svelte islands
│   ├── Navigation.svelte         # Now points at /showcase/*
│   ├── ThreeScene.svelte
│   ├── TorusKnotScene.svelte
│   ├── ImageWarp.svelte
│   ├── PhotographyGrid.svelte
│   └── InProgressCard.svelte
├── layouts/
│   ├── BaseLayout.astro          # V1 wrapper (dark, nav overlay)
│   └── MinimalLayout.astro       # V2 wrapper (pampas, sidebar)
├── pages/
│   ├── index.astro               # V2 home (about)
│   ├── projects.astro            # V2 projects list
│   ├── photography.astro         # V2 photo gallery (uses /photography/mid + /thumbs)
│   ├── skills.astro              # V2 skills + certs
│   └── showcase/                 # All V1 pages archived here
│       ├── index.astro
│       ├── me.astro
│       ├── projects.astro
│       ├── projects/
│       │   ├── rest-api.astro
│       │   └── operating-systems.astro
│       ├── photography.astro
│       ├── skills.astro
│       └── contact.astro
├── styles/
│   └── global.css                # V1 global styles
└── content/
    ├── config.ts                 # Blog collection schema (unused)
    └── blog/
scripts/
└── generate-thumbs.mjs          # Sharp thumbnail generator
```

## MCP Tooling

Playwright MCP is installed at user scope in **headed mode** so a real Chromium window opens when I drive the browser:

```bash
claude mcp list  # should show: playwright: npx -y @playwright/mcp@latest --headed
```

**MCP servers only load at Claude Code startup.** If you don't see Playwright tools available, exit the session and re-launch `claude` from `~/Portfolio`. First browser action will install Chromium (~150MB, ~30s).

Puppeteer MCP is also installed (headless) — fine fallback for screenshot-only flows.

---

## Session: 2026-05-11

### State of working tree (uncommitted)

- **Staged:** all 8 V1 pages renamed `src/pages/*.astro` → `src/pages/showcase/*.astro`.
- **Modified (unstaged):**
  - `src/components/Navigation.svelte` — all menu hrefs repointed to `/showcase/*` so V1 still navigates internally.
  - `src/pages/showcase/me.astro`, `projects.astro`, `projects/rest-api.astro`, `projects/operating-systems.astro` — small path/link tweaks after the move.
  - `CLAUDE.md` — this rewrite.
- **Untracked (new V2 surface):**
  - `src/layouts/MinimalLayout.astro`
  - `src/pages/index.astro`, `projects.astro`, `photography.astro`, `skills.astro`
  - `.claude/` (still not in `.gitignore`)

Nothing is committed yet — pick up here and decide whether to keep iterating before the commit.

### Accomplished this session

- Caught up on the V1→V2 split that the previous session set up.
- Installed **Playwright MCP** at user scope, headed mode, via `claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest --headed`. Requires Claude Code restart to take effect.
- Updated this CLAUDE.md to reflect the new dual-surface architecture.

### Next steps (pick whichever)

1. **Restart Claude Code** so Playwright MCP loads, then open the dev site and visually review the four V2 pages.
2. Decide what `/contact` looks like in V2 (currently only socials in footer; no form).
3. Polish the V2 pages — I've only opened `index.astro` so far; haven't reviewed projects/photography/skills line by line.
4. Add `.claude/` to `.gitignore` before committing.
5. Commit the V1→V2 split as a single coherent commit and push.

### Open questions

- Is the V2 design locked, or still iterating?
- Should `/showcase/me` keep the scroll-driven education timeline, or trim now that V2 has a simpler version on `/`?
- Do you want page transitions between V2 pages, or is the abrupt nav fine for the minimal aesthetic?

---

## Session: 2026-04-05

### Accomplished
- Identified and pushed uncommitted local changes to `main` so Vercel could deploy to production
- Conducted full security audit of the codebase from a pentester perspective

### Decisions Made
- Committed all 5 changed/new files in a single commit since they were part of the same body of UI work
- Excluded `.claude/` directory from the commit (not gitignored yet, but shouldn't be in repo)
- Did not patch security headers yet; explained the issue in plain English first to align on approach

### Files Changed
- `src/components/PhotographyGrid.svelte` — CSS animation replaced with JS-driven requestAnimationFrame scroll (smoother hover deceleration)
- `src/pages/me.astro` — education section redesigned with scroll-driven animated timeline
- `src/pages/photography.astro` — changed to full-viewport flex layout
- `src/pages/projects.astro` — replaced inline in-progress badges with new InProgressCard component
- `src/components/InProgressCard.svelte` — **new file**: 3D perspective tilt card, blinking dot, blueprint grid overlay

### Open work carried forward
- Patch `vercel.json` with HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Strip EXIF metadata from photography originals in `generate-thumbs.mjs`
- Add `.claude/` to `.gitignore`
