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

Astro v4 static site with Svelte v5 interactive islands, Tailwind CSS v3, and Three.js for 3D/shader effects. TypeScript throughout. Deployed on Vercel at abdulla.dev.

### Tech Stack

- **Astro v4.16** — Static site generator (island architecture, zero JS by default)
- **Svelte v5** — Interactive component islands (hydrated selectively)
- **Tailwind CSS v3.4** — Utility-first styling
- **Three.js v0.170** — 3D rendering engine (used via Threlte + directly for GLSL shader effects)
- **Threlte 8** (`@threlte/core`, `@threlte/extras`) — Declarative Svelte wrapper for Three.js
- **TypeScript v5.6** — Strict mode (extends Astro's strict config)
- **Sharp** — Thumbnail generation (used in build script, not in package.json deps)

### Layout & Routing

All pages use `src/layouts/BaseLayout.astro`, which loads the Svelte `Navigation` component with `client:load` and wraps page content in `<main>`. File-based routing in `src/pages/`.

### Pages

| Route | File | Key Feature |
|-------|------|-------------|
| `/` | `index.astro` | Hero + Three.js sphere cluster |
| `/me` | `me.astro` | Bio, education, profile photo with shader warp |
| `/projects` | `projects.astro` | 11 project cards, sidebar category filter |
| `/projects/rest-api` | `projects/rest-api.astro` | REST API source code + architecture diagrams |
| `/projects/operating-systems` | `projects/operating-systems.astro` | OS project PDF browser |
| `/skills` | `skills.astro` | 5 skill categories + 3 certifications |
| `/photography` | `photography.astro` | Masonry photo gallery with lightbox |
| `/contact` | `contact.astro` | Formspree form + social links + CV download |

### Interactive Components (Svelte Islands)

- **Navigation.svelte** (`client:load`) — Full-screen menu overlay with 2×3 CSS grid. Hover physics expand/compress rows and columns via reactive stores (`colTemplate`, `rowTemplate`) driven by `hoveredCell`. The "Me" cell spans both columns in row 1; 4 remaining cells fill a 2×2 grid below. Mobile overrides to single column at ≤768px. Transitions: 0.6s cubic-bezier.
- **ThreeScene.svelte** (`client:load`) — Home page 3D scene: thin Canvas wrapper using Threlte 8. Delegates to `TorusKnotScene.svelte`.
- **TorusKnotScene.svelte** — Threlte 8 floating wireframe torus knot with mouse-follow rotation. Uses `<Float>` for bobbing/auto-rotation, `<Wireframe>` for white wireframe lines, and `useTask` for smooth cursor-tracking tilt.
- **ImageWarp.svelte** (`client:visible`) — About page profile photo with GLSL fragment shader for mouse-following Gaussian distortion. Three.js orthographic camera, smooth lerp (0.08 position, 0.06 strength). Hidden on mobile (≤768px).
- **PhotographyGrid.svelte** (`client:load`) — CSS columns masonry layout (10 cols desktop → 3 cols mobile). Phase-based state machine for lightbox: idle → expanding → expanded → collapsing. Loads WebP thumbnails, swaps to full-res on click. Lazy loading + async decoding.

### Path Aliases

Defined in `tsconfig.json`: `@/*` → `src/*`, `@components/*`, `@layouts/*`, `@assets/*`.

### Styling

Dark theme (#0a0a0a background, #fafafa text). Fonts: Space Grotesk (headings/display), Inter (body) — loaded via Google Fonts with preconnect. Global styles in `src/styles/global.css` (smooth scrolling, custom scrollbar, font smoothing). Component-level styling uses Tailwind utilities inline. Primary mobile breakpoint: 768px.

### Content Collections

Blog collection is scaffolded in `src/content/config.ts` with Zod schema (title, description, pubDate, tags, draft) but has no posts yet. Posts go in `src/content/blog/` as `.md` files.

### Static Assets

```
public/
├── cv.pdf                    # Downloadable CV
├── favicon.svg
├── robots.txt
├── aboutme.jpg               # Profile photo (used by ImageWarp shader)
├── 01-05.jpg                 # Project poster/thumbnail images
├── photography/              # Full-size photography gallery images
│   └── thumbs/               # Auto-generated WebP thumbnails (gitignored)
└── projects/
    ├── docs/                  # Project PDFs
    ├── rest-api/              # REST API project assets
    └── architecture-blueprint/
```

### External Integrations

- **Formspree** — Contact form backend (endpoint: `https://formspree.io/f/xreapker`)
- **Google Fonts** — Space Grotesk + Inter (preconnect)
- **Vercel** — Static hosting (`vercel.json` declares framework: astro)

## Project Status

### Completed
- All 8 pages functional and responsive
- Navigation with hover physics
- Three.js home page sphere scene
- GLSL shader profile photo effect
- Photography masonry grid with lightbox
- 11 project cards with category filtering
- Contact form, skills page, about page

### Not Yet Built
- Blog posts (collection scaffolded, no content)
- Detail pages for most projects (only rest-api and operating-systems have them)
- Page transitions between routes
- Light mode toggle

## Key File Map

```
src/
├── components/
│   ├── Navigation.svelte         # Menu overlay with grid hover physics
│   ├── ThreeScene.svelte         # Home page 3D scene (Threlte Canvas wrapper)
│   ├── TorusKnotScene.svelte     # Wireframe torus knot with Float + mouse-follow
│   ├── ImageWarp.svelte          # About page photo distortion shader
│   └── PhotographyGrid.svelte   # Photography masonry + lightbox
├── layouts/
│   └── BaseLayout.astro          # Page wrapper (nav + meta + fonts)
├── pages/
│   ├── index.astro               # Home
│   ├── me.astro                  # About
│   ├── projects.astro            # Projects grid + filter
│   ├── projects/rest-api.astro   # REST API detail page
│   ├── projects/operating-systems.astro
│   ├── photography.astro         # Photo gallery
│   ├── skills.astro              # Skills + certs
│   └── contact.astro             # Contact form
├── styles/
│   └── global.css                # Tailwind base + global styles
└── content/
    ├── config.ts                 # Blog collection schema
    └── blog/                     # Empty, ready for .md posts
scripts/
└── generate-thumbs.mjs          # Sharp thumbnail generator
```
