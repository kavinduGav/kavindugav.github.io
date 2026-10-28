# kavindugav.github.io

Kavindu Gavesha's portfolio site. Built with [Astro](https://astro.build), Tailwind CSS v4, GSAP/ScrollTrigger/SplitText, Howler.js, and self-hosted fonts via Fontsource.

Live at [kavindugav.github.io](https://kavindugav.github.io).

## Running locally

Requires **Node 22.23.4+** (Astro 7's hard minimum — the repo's `.nvmrc` pins this; run `nvm use` if you have nvm).

```bash
npm install
npm run dev
```

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the production build locally (no dev toolbar, closer to what actually ships)

### Contact form

The contact form posts to [Web3Forms](https://web3forms.com). Create a free account, grab your access key, and set it locally:

```bash
cp .env.example .env
# then edit .env and set PUBLIC_WEB3FORMS_KEY
```

For the deployed site, add the same value as a repository secret named `PUBLIC_WEB3FORMS_KEY` (Settings → Secrets and variables → Actions) — the deploy workflow passes it through at build time. Without a key set, the form still validates and shows its error state correctly; it just can't actually send.

## Adding a project

Projects live in `src/content/projects/*.md` as a content collection (schema in `src/content.config.ts`). Each file is frontmatter-only (no body needed):

```md
---
title: "Project Name"
description: "Short card description"
summary: "Longer one- or two-sentence summary for the case-study header."
tag: "Next.js"
category: "Web" # Web | Mobile | Research
order: 7
homeMedia: "screenshot: whatever shows on the Home card"
role: "Your role"
company: "Company"
timeline: "2026"
platforms: "Web"
problem: "..."
approach: "..."
outcome: "..."
tech: ["Node.js", "PostgreSQL"]
heroCaption: "video demo: ..."
screenshots:
  - media: "screenshot: ..."
    caption: "Caption shown under the figure"
    wide: true # optional, spans both columns
---
```

A new entry automatically:
- Shows up on the Home grid, sorted by `order`
- Gets its own page at `/work/<filename-slug>` (unless you set `href` to point it somewhere else instead, the way `canine-biometric-id.md` points at `/research`)
- Joins the "next project" chain on the case-study pages

## Swapping placeholder media

Everything currently shown is a striped placeholder (`MediaPlaceholder.astro`) with a small mono caption. To replace one:

1. Drop the real image/video in `public/` (or wherever you're hosting it).
2. Swap the relevant `<MediaPlaceholder ... />` usage for an `<img>`/`<video>`, or extend `MediaPlaceholder` to accept a `src` and conditionally render the real media when one's given.

Site-wide swaps to do once you have assets:
- `public/Kavindu_Gavesha_Resume.pdf` — the Download CV buttons already link here
- About page portrait (`src/pages/about.astro`)
- Home showreel (`src/pages/index.astro`)
- `public/audio/ambient.{webm,mp3}` and `public/audio/click.mp3` — the sound toggle (`src/lib/sound.ts`) is fully wired and fails silently until these exist, so dropping them in is all that's needed
- `src/pages/research.astro` — flip `siteConfig.research.paperPublished` to `true` and set `paperUrl` once the IJACSA paper is live (in `src/lib/config.ts`)

## Compressing video

Keep clips short and under GitHub's 100MB file limit. A good starting point with ffmpeg:

```bash
# H.264 MP4
ffmpeg -i input.mov -vcodec libx264 -crf 28 -preset slow -vf "scale=1920:-2" -movflags +faststart -an output.mp4

# WebM (VP9) for smaller size as a second source
ffmpeg -i input.mov -c:v libvpx-vp9 -crf 32 -b:v 0 -vf "scale=1920:-2" -an output.webm
```

Drop the `-an` if the clip needs audio. For a 30s muted showreel loop, scaling down and keeping CRF around 28–32 usually lands well under 5MB.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds with the official [`withastro/action`](https://github.com/withastro/action) and publishes to GitHub Pages via `actions/deploy-pages`.

One-time setup in the GitHub repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Also add the `PUBLIC_WEB3FORMS_KEY` repository secret (see above) before the first deploy if you want the contact form to work on the live site.

## What's left

Tracking against the original brief — not yet done:
- Real media (resume PDF, photos, videos, audio, research figures) — placeholders are in everywhere they're needed
- A full Lighthouse pass against the 95+/100/100/100 mobile targets (the site now carries Lenis, GSAP Flip/ScrambleText/SplitText, and Howler, so this is worth checking once real media is in)
