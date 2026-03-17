# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Production build (static output)
npm run preview    # Preview production build locally
```

No test runner or linter is configured.

## Architecture

Astro v4 static site with Svelte v5 interactive islands and Tailwind CSS v3. Deployed on Vercel. Site: abdulla.dev.

### Layout & Routing

All pages use `src/layouts/BaseLayout.astro`, which loads the Svelte `Navigation` component with `client:load` and wraps page content in `<main>`. Pages live in `src/pages/` and map directly to routes (`me.astro` → `/me`, `projects.astro` → `/projects`).

### Interactive Components (Svelte Islands)

- **Navigation.svelte** — Full-screen menu overlay with a 2×3 CSS grid. Hover physics expand/compress grid rows and columns via reactive Svelte stores (`colTemplate`, `rowTemplate`) driven by `hoveredCell`. Mobile overrides to single column at ≤768px.
- **ThreeScene.svelte** — Home page Three.js sphere cluster (12 metallic spheres with physics, cursor repulsion via raycasting, collision chain reactions, spring-back animation).
- **ImageWarp.svelte** — About page profile photo with GLSL fragment shader for mouse-following Gaussian distortion (Three.js orthographic camera).
- **PhotographyGrid.svelte** — Photography page masonry grid.

### Path Aliases

Defined in `tsconfig.json`: `@/*` → `src/*`, `@components/*`, `@layouts/*`, `@assets/*`.

### Styling

Dark theme (#0a0a0a background, white text). Fonts: Space Grotesk (headings/display), Inter (body). Global styles in `src/styles/global.css`. Component-level styling uses Tailwind utilities.

### Content Collections

Blog collection is scaffolded in `src/content/config.ts` with Zod schema (title, description, pubDate, tags, draft) but has no posts yet. Posts go in `src/content/blog/` as `.md` files.

### Static Assets

`public/` contains `cv.pdf`, `favicon.svg`, `robots.txt`. Photography images would go in `public/photography/`.
