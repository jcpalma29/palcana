# PALCANA

Single-page site for PALCANA — Next.js (App Router), TypeScript, Tailwind CSS v4, GSAP (ScrollTrigger, SplitText) and Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Sections, in order: Hero → Our Brands → Contact (with the footer).

- Design tokens (colors, type scale, spacing, motion): `src/app/globals.css` (`@theme`)
- Copy, brands, and contact details: `src/content/site.ts`
- Sections and UI: `src/components/`
- Animation helpers: `src/lib/` — GSAP setup (`gsap.ts`), the diamond → circle shape morph (`shapes.ts`, `shape-track.ts`), Lenis scroll control (`scroll.ts`)
- SEO: metadata and Organization JSON-LD in `src/app/layout.tsx`, plus `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`

The preloader plays once per browser session (`sessionStorage` key `palcana:intro`) and is skipped when the visitor prefers reduced motion.
