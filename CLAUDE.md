# HALDEN Residences (placeholder name)

Sample/portfolio site for a premium residential rental service in Jakarta (apartments and houses, prices in IDR).
Core idea: **scrolling = walking into the property.** The home page is a cinematic walkthrough driven by real
footage scrubbed by scroll, with short facts appearing over each "room".

Site copy is **Indonesian** (owner's instruction, 2026-11-16; the original brief said English). Code, comments and this file stay in English. Conversation with the owner is in Indonesian.

## Stack

- Next.js (App Router) + TypeScript (strict) + Tailwind
- three + @react-three/fiber + @react-three/drei: effect layer only
- gsap + ScrollTrigger: pinning, scrub, timelines
- motion (import from `"motion/react"`, never `framer-motion`): text/UI reveals
- lenis: smooth scroll, driving ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`, gsap ticker drives `lenis.raf`)

### What each technology does (do not blur these roles)

| Tech | Role | Never |
|---|---|---|
| `<video>` footage | Main visual. Scrubbed by scroll via `currentTime`. | Autoplay with sound, decorative loops unrelated to scroll |
| R3F / WebGL | Thin post layer: dissolve/displacement shader between clips, subtle grain, vignette. Video is fed in as `VideoTexture`. | Procedural 3D objects, rooms, models, particles |
| GSAP + ScrollTrigger | Scroll progress of the (sticky-pinned) walkthrough, scrub smoothing, the per-frame ticker that maps progress to video time and room | Text reveals (that's Motion) |
| Motion | Reveal of overlay text, UI, page transitions | Driving video time |
| Lenis | Scroll smoothing only | — |

- **At most 1 active WebGL canvas** per page. Mini walkthroughs on detail pages reuse the same `EffectCanvas` pattern; never mount two at once.
- If WebGL is unavailable, the walkthrough still works with plain `<video>` + CSS crossfade.

## Pages

- `/`: main walkthrough + supporting sections
- `/properties`: listing with filters
- `/properties/[slug]`: detail with its own mini walkthrough, specs, viewing request form
- `/about`, `/contact`: short

## Design system

### Color (tokens in Tailwind theme + CSS vars)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F6F3EE` | Page background (warm white) |
| `stone` | `#D9D2C7` | Hairlines, muted fills, disabled |
| `ink` | `#1F1E1C` | Text, dark sections behind video |
| `moss` | `#2F4A3C` | **Accent, used very sparingly**: availability status, one small primary CTA per view. Never large fills, never headings. |

Overlay text on video is `paper` on a thin scrim (linear gradient of `ink` at 0 to ~45% opacity, from the edge where the text sits). No blur boxes.

### Type

- Headings: **Pluvix Luxury** (owner's choice, replaced Instrument Serif on 2026-11-16). Self-hosted via `next/font/local` from `app/fonts/PluvixLuxury-Regular.otf`; Tailwind utility `font-display`. A wide, heavy flared serif:
  - Regular only (no bold/italic): never use `font-bold` or `italic` with it (the browser would fake them).
  - No `²`, `·`, `–`, `—`, `×`, `°`, `%`, and digits are not tabular. **Never use it for data, numbers or UI text**; those glyphs fall back to Georgia. Keep heading copy free of those characters.
  - Sizes run ~20% smaller than a light serif would need, no negative tracking, leading ≥ 1 (see `components/ui/Heading.tsx`).
  - Licence (foundry page, Creativetacos): free for personal and limited small-business use; larger commercial work needs an extended licence. The page says nothing about web embedding. Fine for this sample; re-check before any commercial deployment.
- UI, body, data: **Inter**.
- All spec numbers (m², floor, IDR, distances, dates) use `tabular-nums`.
- Formats are Indonesian, through `lib/format.ts` only: `Rp 95.000.000` (dots for thousands), `0,9 km` (decimal comma), `4 Jan 2027` (Indonesian month names). `<html lang="id">`.

### Form

- `border-radius: 0` everywhere. 1px lines (`stone` on paper, `paper/20` on ink).
- No shadows, no glassmorphism, no backdrop blur.
- Generous whitespace; layout on a 12-column grid with wide margins.

### Motion

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` everywhere (Tailwind `ease-halden`, GSAP `CustomEase` or the equivalent `expo.out`-like curve, Motion `ease: [0.16, 1, 0.3, 1]`).
- Slow: reveals 0.8–1.2s, clip dissolves tied to scroll (not time). No spring/bounce, no overshoot.
- Every animation must justify itself by keeping the "moving forward through the home" illusion. Text enters slightly from below/forward and fades, as if approached; never spins, flips or scales from zero.

## Anti AI-slop rules (mandatory)

Forbidden:
- Purple/blue gradients, glassmorphism, blobs, neon, emoji, lorem ipsum
- Everything-rounded cards, generic three-icon "features" rows, gradient buttons
- Cliché copy: "Find your dream home", "Welcome to the future of living", "Luxury redefined", "Unparalleled", "Seamless"
- Fake testimonials with avatars, invented vanity stats ("10K+ happy tenants"), "AI-powered" badges

Required:
- Copy is Indonesian, specific and factual. The same cliché ban applies in Indonesian (no "hunian impian", "wujudkan", "terbaik", "eksklusif"). It states: area in m², floor, facing direction, deposit, minimum lease, what utilities are included, distance to MRT/KRL station or district centre.
- Fictional data must be plausible and internally consistent (same numbers on list, detail and walkthrough). Mark the site as a sample in the footer.
- Overlay text over video: short (one heading + max 3 data lines per room).

## Assets

- Source footage lives in `/source-video` and belongs to the owner. **Do not download other video from the internet and do not invent URLs.** No hotlinking of any media.
- Processed output goes to `/public/video` and `/public/images` (posters/stills). `/source-video` is never served.
- Use ffmpeg (installed, on PATH) for all processing. Keep the commands in `scripts/` so outputs are reproducible.

### Footage inventory (verified 2026-11-16)

The owner replaced the footage on 2026-11-16. Current contents of `/source-video`:

| File | Res / fps | Length | Content |
|---|---|---|---|
| `property-1.mp4` | 1280×720, 24fps, ~4.5 Mbps, **has audio (strip it)** | 10.03s (240 frames) | One take, no cuts, no borders, fast forward move through a travertine-and-oak house: 0–2.0s facade while the front door opens; 2.0–3.4s through the door and hallway; 3.4–5.4s living room; 5.4–7.0s kitchen island and dining table; 7.0–8.3s bedroom; 8.3–10s out through sliding doors onto the terrace. |
| `Exterior.jpg`, `enterance.jpg`, `living-room.jpg`, `kitchen.jpg`, `bedroom.jpg`, `terrace.jpg` | 2752×1536 | — | One photograph per room of the same house, different angles from the video. Used as room stills (fallback panels, loading state, listing images). |

- **Assets in use.** Kemang listing and the walkthrough: the owner's `/source-video` material only (one clip, `house-02`, and six photographs of the same house). The other five listings: stock photographs from **Pexels**, two each, which the owner asked for on 2026-11-16 so the listings stop showing the same house. Originals in `/source-images/pexels/`, processed by `scripts/make-listing-images.mjs` into `/public/images/listings/`, with photographers and source pages in `public/images/listings/CREDITS.md`. Rules: download and self-host (never hotlink); only real, verified photo pages (never invent an id or URL); look at every photograph before using it and write the listing's facts and alt text to match what it shows; record the credit. Earlier assets (`house-01`, `apartment-01`) are deleted and must not come back.
- The clip is short and fast, so it is doubled to 48 fps with motion-compensated interpolation at encode time (see `scripts/process-video.sh`). Don't switch to blend interpolation: it doubles every edge. Interpolated (odd) frames are softer than the originals, which showed as shimmer and blur while scrolling; the script sharpens only those frames (`cas` 0.4) until both measure the same with ffmpeg `blurdetect`. Re-measure if the source changes.
- 720p source: never upscale at encode; the canvas scales it. Fine detail is softer on large screens.
- Never chain clips of different properties in one walkthrough (breaks the illusion). Don't fake missing rooms with 3D or stock.

### Processing targets

- Run `bash scripts/process-video.sh` (video) and `node scripts/make-stills.mjs` (images). Walkthrough data: `src/data/walkthrough.json` (rooms, start/end seconds, stills, scroll weights, transition notes).
- Video: H.264 High, **every frame a keyframe** (`-g 1 -keyint_min 1 -sc_threshold 0 -bf 0`), no audio, `yuv420p`, `+faststart`. CRF 20 desktop (CRF 23 measurably loses sharpness against the 720p source; 20 gives 14.2 MB, under budget), CRF 23 mobile. Desktop = source width, max 1920w → `/public/video/desktop/<slug>.mp4`. Mobile max 960w → `/public/video/mobile/<slug>.mp4`.
- Stills: poster (frame 0 of the video, so poster→video has no jump) and one still per room from the owner's photographs, JPG quality 82, max 2000px wide → `/public/images/stills/<slug>-<room>.jpg`.
- Budget: a desktop clip above 15 MB must be flagged to the owner, never silently accepted. Preload `metadata` first, full `auto` once the walkthrough is near the viewport.

## Fallback (mandatory)

Use the poster-based fallback (no scrub, no WebGL) when **any** of these is true:
- `prefers-reduced-motion: reduce`
- coarse pointer / viewport < 768px
- `navigator.connection.saveData`, or `deviceMemory <= 4`, or `hardwareConcurrency <= 4`
- the video fails to load or seek within a timeout

Fallback = one full-height section per room with its poster, CSS `scroll-snap-type: y mandatory`, overlay text fades in
(reduced motion: instant, no movement). Same content and order as the scrubbed version. Decide this in one place
(`lib/capabilities.ts`) and render one mode only; don't load the other mode's assets.

## Project setup notes

- Next.js **16.4** with `cacheComponents` and `partialPrefetching` on (scaffold defaults). APIs differ from older Next: check `node_modules/next/dist/docs/` before using one (see `AGENTS.md`, which `next dev` manages; don't edit its block).
  - `usePathname` and other request-time hooks may need a `<Suspense>` boundary (see `Navbar` → `NavLinks`).
  - Don't call `new Date()`/`Math.random()` in Server Components without `"use cache"`/`connection()`.
  - `LayoutProps` / `PageProps` are global types from `next typegen`. Run `npm run typecheck` (typegen + tsc).
- Tailwind **v4**, tokens in `app/globals.css` `@theme`. The default palette, radii, shadows, blurs and eases are **reset**: only `paper/stone/ink/moss`, `ease-halden`, `h-nav`/`top-nav` exist. Don't re-add defaults.
- Navbar state is CSS-only: wrap a page's top hero in `<NavHero>` (`components/layout/NavHero.tsx`). The `over-hero:` variant applies while it is under the navbar. Pages without a hero start with `<PageIntro>` (clears the fixed nav).
- Smooth scroll: `LenisProvider` (gsap ticker drives Lenis, Lenis feeds `ScrollTrigger.update`). Register GSAP through `ensureGsap()` from `lib/gsap.ts`. The `halden` CustomEase is the default ease. Motion values live in `lib/motion.ts`.
- Base UI: `components/ui/` (Container, Heading, Label, Button, AnimatedLink, SpecList/SpecRow). Button tones: `ink`, `paper`, `moss` (sparing), `context` (follows parent `--tone-fg/--tone-bg`).
- `/styleguide` is an internal, noindex reference for tokens and components.
- `/properties`: `components/property/PropertyBrowser.tsx` (no WebGL). Filters live in the URL (`?area=&type=&beds=&price=`, logic in `lib/property-filters.ts`, unknown values ignored) and are written with `history.replaceState`; `useSearchParams` sits in a Suspense boundary whose fallback is the unfiltered grid. Cards reveal with `whileInView`, reflow with Motion `layout`; the empty state lists which single filter to drop. Number/date formatting: `lib/format.ts`.
- `/properties/[slug]`: all slugs from `generateStaticParams`. Because `partialPrefetching` is on, the page component must NOT await `params`; `PropertyDetail` reads it inside `<Suspense>` (awaiting at the top raises the dev error "encountered URL data during prerendering"). Consequence, per Next docs: an unknown slug renders `app/not-found.tsx` with `noindex` but HTTP 200, since streaming has started. Listings with footage reuse `<Walkthrough titleSize="page" compact>` (the only WebGL on the page); others get `PropertyGallery`.
- Home below the walkthrough (`components/home/`, no WebGL, all on paper so the walkthrough's warm-white ending continues without a seam): `HowItWorks` (ruled numbered list; numerals in Inter light, not the display face), `FeaturedProperties` (slugs from `featuredSlugs` in `src/data/site.ts`; one large card + two offset ones, `PropertyCard variant="featured"`), `ClosingCta`. Contact details in `src/data/site.ts` are fictional (`.example` domain) and say so on the page. "Jadwalkan survei" buttons open the viewing modal.
- Photographs on a detail page: `PropertyCarousel` (native horizontal scroll-snap, arrows, thumbnails; click opens a fullscreen preview with arrow keys, swipe, Esc, focus kept inside). On close the slider moves to the last previewed photograph and focuses it with `preventScroll` (a plain `focus()` scrolls the slider back). Listings with a walkthrough get the carousel in a "Foto" section; the others open with it.
- Scroll animations below the walkthrough: `components/ui/motion-primitives.tsx` (`RevealText` word-by-word from a mask, `DrawLine`, `Stagger`/`StaggerItem`, `ImageReveal`) plus `Reveal`. All run once on entering the viewport, use the house easing, never bounce, and reduce to a fade under reduced motion. **Never put `whileInView` on an element whose own `clip-path` starts at 100%**: the browser reports it as not intersecting and it never reveals. Watch an unclipped wrapper with `useInView` instead (see `ImageReveal`).
- **Previously visited pages stay in the DOM, hidden.** With `cacheComponents`, Next does not remove the old page on client navigation; it hides it (`display: none`) and runs effect cleanups, then re-runs effects if it is shown again. Consequences that already caused bugs here:
  - Anything read from the DOM by CSS or `querySelector` can match a hidden page. `NavHero` therefore sets `data-nav-hero="passed"` in its effect cleanup; without it the navbar stayed transparent on every page visited after the home page.
  - Ids repeat across pages: use ids unique to the content (the viewing form section is `survei-<slug>`, not a shared id).
  - Stop ongoing work in effect cleanups (the walkthrough sets its canvas `frameloop` off there).
  - Test with client-side navigation between pages, not only direct loads: these bugs do not appear on a direct load.
- "Jadwalkan survei" modal: `ViewingModalProvider` (in the root layout) + `<ViewingTrigger>` / `useViewingModal().open(slug?)`. It renders `ViewingForm` with a property select inside the shared `components/ui/Dialog.tsx` (scrim without blur, Esc/scrim to close, focus trapped and restored, page scroll locked, `data-lenis-prevent` so the panel scrolls). The navbar button, the home CTA, /about and /contact open it; a listing page keeps its inline form.
- `/about` (`ParallaxImage` for the one large still; copy states process, inspection list and who to call, with no performance promises) and `/contact` (`ContactForm` → `POST /api/contact`, a mock like the viewing endpoint; rules in `lib/contact-message.ts`). Shared field markup: `components/ui/FormField.tsx`.
- `/about` scroll effects (`components/about/`, all Framer Motion, patterns in the style of 21st.dev but written here, since 21st.dev is not installed): `AboutHero` (oversized display title, letters rise on load, lines drift apart on scroll), `ScrollRevealText` (words light up with scroll), `ExpandingImage` (inset clip opens to full width + parallax), `VelocityMarquee` (speed and direction follow the scroll, idle off screen), `StackedTopics` (sticky panels that stack; only with the `tall:` variant, i.e. large and tall screens). In stacked panels dim the content, never the panel: an opaque panel with opacity lets the one below show through.
- Tailwind v4 `@custom-variant` with a media query must use the block form (`@custom-variant x { @media (...) { @slot; } }`). The one-line form compiles to nothing, silently.
- Page transition: `components/layout/PageTransition.tsx`. A paper panel rises to cover, the route changes, the panel leaves upward (Motion `AnimatePresence`). The App Router unmounts the old page immediately, so internal link clicks are intercepted in the capture phase and `router.push` runs once the screen is covered. Not intercepted: modified clicks, new-tab/download links, other origins, same-path links (hash/query), back/forward. A 5s timeout uncovers if the route never changes.
- Custom cursor: `components/layout/Cursor.tsx`, only for `(hover: hover) and (pointer: fine)`. A small square (no radius anywhere) that becomes a thin frame over clickable things and a bar over text fields, with difference blending. The native cursor is hidden via `html.custom-cursor` only once the custom one is being drawn.
- Viewing form: `components/property/ViewingForm.tsx` → `POST /api/viewing-request`. **Mock**: the handler validates and `console.log`s, nothing is stored or sent. Rules live once in `lib/viewing-request.ts` and run on both sides. No red in the palette, so errors are text + marker + solid border. Never read the current date during render (use handlers or `useSyncExternalStore`).

### Walkthrough architecture (`components/walkthrough/`, `lib/walkthrough/`)

- `<Walkthrough clipIds>` picks one mode via `lib/capabilities.ts` and renders only that one. Server renders the shared opening title screen. Test any mode with `?walkthrough=stills|css|webgl`.
- Scrub mode: a tall track with a `position: sticky` stage (pinning without GSAP pin-spacers moving React nodes). ScrollTrigger `scrub: 0.3` drives a progress proxy; a GSAP ticker loop maps it through `lib/walkthrough/timeline.ts` (intro → clips/transitions → outro, `scrollWeights` respected) and writes seeks, shader uniforms and styles directly. React re-renders only when the active room changes. **Keep `scrub` at 0.3 and Lenis `lerp` at 0.085**: 0.6 / 0.075 were tried and the owner reported the scroll as broken (footage trails the wheel and lags on reversal). When the scroll rests, the scrubber lands on an original frame (`originalEvery` from `interpolationFactor` in the JSON).
- Clips are downloaded whole as blobs, then seeked by `VideoScrubber` (one seek in flight, latest target wins, frame-centred times). Next clip preloads halfway through the current one. Room stills cover a clip until it has loaded.
- WebGL layer: one fullscreen quad (`EffectCanvas`, `shaders.ts`), radial dissolve from the focus point in the JSON, grain, vignette. Sharpness rules, because the footage is smaller than the screen: canvas `dpr={[1, 2]}` (never lock it to 1: on HiDPI the browser enlarges the canvas again and blurs it); the shader applies a clamped unsharp mask in proportion to the enlargement; the shader must never read `video.readyState` (it drops during every seek); keep edge displacement and zoom tiny (straight architectural lines turn wavy). Runtime WebGL failure → CSS crossfades. Load error/timeout or stalled seeks → stills.
- Stills mode suspends Lenis (`useSuspendLenis`) because Lenis does not support CSS scroll-snap.

## Conventions

- Content as typed data in `src/data/` (`properties.ts`, `walkthrough.json`; import via `@/src/data/...`). The walkthrough is driven by data (room list with `start`/`end` seconds), never hardcoded timings in components.
- Server Components by default; `"use client"` only for walkthrough, canvas, filters, forms, motion wrappers.
- R3F/three code must be loaded with `next/dynamic` (`ssr: false`) and only on routes that use it.
- Accessibility: overlay text is real DOM text (not drawn in WebGL), video is `aria-hidden` with room content available as text, forms have labels and visible focus (1px `ink` outline, offset).
- Viewing request form: client validation + a route handler that only logs/echoes (sample project, no real backend). Say so in the UI.
