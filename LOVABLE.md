Portfolio Rebuild — Full Context Handoff

Concept

Covenant Adeogo's portfolio, rebuilt around a network-tier-adaptive experience. One URL, three renderings, chosen by the visitor's connection speed / device capability. Slow ships instantly and meaningfully; mid adds motion; high adds full Three.js + Matter.js physics. User can manually override the tier.

The controlling metaphor: a ball. On high tier, the 3D name drops from above, then a physics ball is "born" from the letters and follows the cursor through the page.

---

File Map

```
src/
  routes/
    __root.tsx                          # shell, fonts <link> in head
    index.tsx                           # TierProvider + dynamic tier switcher
  components/portfolio/
    TierProvider.tsx                    # React context, SSR-safe hydration
    TierToggle.tsx                      # bottom-right override pill (slow/mid/high)
    CTA.tsx                             # top-right resume/contact links
    slow/
      Manifesto.tsx                     # printed-page SSR fallback, zero JS animation
    mid/
      MidExperience.tsx                 # CSS+motion; accepts skipHero prop
    high/
      HighExperience.tsx                # 3D hero + Ball + <MidExperience skipHero />
      NameScene.tsx                     # Three.js/drei Text3D name drop
      Ball.tsx                          # Matter.js physics ball, cursor magnet
  content/
    portfolio.ts                        # ALL copy (identity, projects, timeline, capabilities, reveal)
  lib/
    tier.ts                             # detectTier() + localStorage override
    audio.ts                            # WebAudio synth, armed on first pointer/key
```

Deleted/legacy: none of the old page bodies remain in `index.tsx`; everything routes through `TierProvider`.

---

Tier Detection (`src/lib/tier.ts`)

```ts
type Tier = "slow" | "mid" | "high"
```

Rules, in order:
1. `prefers-reduced-motion: reduce` → slow
2. `connection.saveData` → slow
3. `effectiveType` ∈ {`slow-2g`,`2g`} → slow
4. `effectiveType === "3g"` → mid
5. `deviceMemory < 2` → mid
6. otherwise → high

Override lives at `localStorage["portfolio:tier-override"]`. `getOverride()` / `setOverride()` are the only writers.

SSR contract: `detectTier()` returns `"slow"` when `window` is undefined. `TierProvider` seeds state with `"slow"` and only calls `detectTier()` inside `useEffect`, flipping a `hydrated` flag. `index.tsx` renders `<Manifesto />` until `hydrated`. This guarantees SSR HTML === first client render → no hydration mismatch.

---

Route (`src/routes/index.tsx`)

```tsx
<TierProvider>
  <CTA />
  <Experience />          // returns Manifesto | MidExperience | HighExperience
  <ClientOnly><TierToggle /></ClientOnly>
</TierProvider>
```

`MidExperience` and `HighExperience` are `React.lazy()` — Three.js and Matter.js never enter the SSR bundle. `<Suspense fallback={<Manifesto />}>` wraps the switch so the manifesto is also the loading state.

Head metadata: title/desc/og set for "Covenant Adeogo — Backend Engineer" with the tagline as description.

---

Slow Tier — `Manifesto.tsx`

- Black background, warm off-white type (`#f2ece0`)
- `Fraunces` serif italic manifesto text, `JetBrains Mono` labels
- Horizontal rules, section numerals (I. II. III. IV.)
- CSS-only cursor pulse via `::before` on body-level dot (no JS)
- Renders full content (projects list, timeline, reveal) as static prose
- Zero client-side motion, zero fetches beyond fonts

---

Mid Tier — `MidExperience.tsx`

Signature: `MidExperience({ skipHero = false })`. `HighExperience` passes `skipHero` so the CSS hero doesn't stack under the 3D one.

Sections:
1. Hero — `Big Shoulders Display` 900, `clamp(3rem, 14vw, 14rem)`. Name is split by words; each word is `<span class="inline-flex whitespace-nowrap">` containing per-letter `motion.span` with staggered spring drop. Word-level grouping prevents `flex-wrap` from breaking "ADEOGO" into "A / DEOGO".
2. I. The Work — 2-col grid, cards fade+rise on `whileInView`, stack chips in mono.
3. II. The Domain — divided list of capabilities.
4. III. The Timeline — dl grid, `when` in mono, `where. what` in body.
5. IV. The Reveal — inverted color block (`#f2ece0` bg, black text), Fraunces serif paragraph, resume + email links.

`CursorDot` — fixed 12px white dot, `mix-blend-difference`, `pointer: coarse` → disabled on touch.

---

High Tier — `HighExperience.tsx`

Layout:
```
<section h-screen>       # 3D hero
  <NameScene onIntroDone />
  <tagline motion.p>
  <scroll indicator>
</section>
<Ball enabled={ballLive} />         # fixed-position physics overlay
<MidExperience skipHero />          # rest of the site
```

Sequence:
1. `NameScene` mounts, letters animate.
2. When last letter of "ADEOGO" settles → `onIntroDone()` → `introDone=true`.
3. Tagline + scroll cue fade in.
4. 600ms after intro → `ballLive=true` → `Ball` mounts and starts simulating.

Both `NameScene` and `Ball` are `lazy()`, wrapped in `<Suspense>`. Whole file only reachable via the top-level `lazy()` in `index.tsx`, so Three.js/Matter.js modules are strictly client-only.

`NameScene.tsx`

- `<Canvas>` from `@react-three/fiber`, camera `[0,0,18]` fov 40, `dpr=[1,2]`, alpha
- Lights: ambient 0.35 + directional (key 1.4, rim 0.6 warm `#ffb27a`)
- `Environment preset="city"` from drei for reflections
- Font: fetched from CDN — `https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json`. Do NOT swap to `three/examples/...?url` — that broke the Worker SSR build.
- Two rows: `COVENANT` at y=1.3, `ADEOGO` at y=-1.8, centered by drei `<Center>`.
- Each `<Letter>` is a `<Text3D>` (bevel enabled, `meshStandardMaterial` warm off-white) inside a manually-animated `<group>` via `useFrame`.
  - Row 0 (COVENANT): drops from y=14 under gravity, floor bounce at y=0 with 0.42 restitution, settles when |vy|<0.7. Per-letter stagger `index * 0.09s`.
  - Row 1 (ADEOGO): slides in horizontally from x=-25, decelerates, snaps to target. Starts after 1.2s + `index * 0.05s`.
  - Settle wobble: `sin(elapsed * 12 + index) * 0.05` on `rotation.z` until settled.
  - Last letter's `onSettled` fires `onIntroDone` (guarded by `doneRef`).
- `LETTER_WIDTH = 1.55` for centered row layout.

`Ball.tsx`

- Matter.js engine, cursor-follow via a magnetic body constraint
- Enabled only after intro; unmounts cleanly
- Fixed-position canvas overlay, ignores pointer for scroll

---

Content (`src/content/portfolio.ts`)

Single source of truth. Shapes:

```ts
identity   = { name, tagline, email, resumeHref, location }
projects   = Project[]   // { slug, name, org?, role?, blurb, impact, stack[] }
capabilities = { label, detail }[]
timeline   = { when, where, what }[]
reveal     = { paragraph }
```

Placeholders are marked with `TODO(covenant):` comments — impact numbers, real project descriptions, resume PDF path, email. Nothing is fetched; it's all a typed const module.

---

Audio (`src/lib/audio.ts`)

WebAudio synthesis (no `howler` package installed — it was in the plan but implementation went pure WebAudio):

- Silent until first `pointerdown | keydown | touchstart | wheel`
- On arm: `ctx.resume()`, then plays a low hum bed
- Exposed triggers: `paperThud()`, `glassTap()` for physics collisions
- Mute state persisted, controllable via a small speaker glyph (currently in CTA row scaffold)

---

Typography & Palette

Fonts loaded via `<link>` in `__root.tsx` head (Tailwind v4 CSS `@import` won't resolve remote URLs):
- `Big Shoulders Display` 900 — display headlines, all-caps
- `Fraunces` — serif italic for manifesto/reveal
- `JetBrains Mono` — labels, mono chrome, `text-[10px] uppercase tracking-widest`

Colors are hardcoded per-tier (no design tokens — this is intentional, tiers have distinct palettes):
- Black `#000` background across all tiers
- `#f2ece0` warm off-white for hero type and inverted reveal block
- `#ffb27a` warm rim light in NameScene
- `white/60`, `white/15` etc. for chrome

---

SSR / Runtime Guarantees

- Server always outputs Manifesto HTML (SSR-safe, no browser APIs)
- All Three.js / Matter.js / WebAudio access is behind `useEffect` or `lazy()` — the SSR bundle never touches them
- `TierToggle` wrapped in `<ClientOnly>` because it reads `localStorage`
- Font JSON fetched at runtime from unpkg (previously tried Vite `?url` import, that broke build)

---

Known TODOs (for the user, not the AI)

1. Fill `TODO(covenant):` in `src/content/portfolio.ts` — real impact metrics per project
2. Place resume PDF at `/public/covenant-adeogo.pdf`
3. Real email address in `identity.email`
4. Real project stack chips if placeholders don't match reality

---

Recent Bugfixes

- Build failure: `three/examples/fonts/helvetiker_bold.typeface.json?url` was unresolvable in Worker SSR → switched to CDN fetch string.
- "COVENANT A DEOGO" gap: mid hero used single-letter flex items with `flex-wrap`, causing "A" to break away from "DEOGO". Fixed by grouping letters per word inside `inline-flex whitespace-nowrap` wrappers.
- Duplicate hero on high tier: `HighExperience` rendered `<MidExperience />` after the 3D scene, which included the CSS hero → two "COVENANT ADEOGO" sections. Fixed by adding `skipHero` prop and passing it from High.

That should be enough for any successor to be fully oriented.