# ToolPixi Homepage — Compact All-Tools Catalogue, 2026-11-13

Status: **SHIPPED + LIVE-VERIFIED.** Deploy commit `adcac95` in toolpixi-repo
(supersedes the same-day tabs commit `3bb08dc`).

## Hamza's requirement (clarified ~1:11 PM PKT)

Tabs hide tools — visitors must see **all tools on the homepage**, but the
homepage must **not get long**: the fix is compact alignment. Load-more
stays rejected. This build implements exactly that.

## 1. Final design — one compact catalogue, everything visible

- The tabs system shipped earlier today is **gone**: no pills, no
  `#cat-pills`, no hidden sections, no Load-more (grep-verified zero
  `cat-pills` / `show-more` / `load-more` in the built and live homepage).
- The tools area is now **one catalogue**: all **127 tools** rendered as
  small **tiles** (icon + tool name + one short description line),
  grouped under the five family headings (Image · PDF · Date & Time ·
  Text · Calculators), each group keeping its short intro line and its
  "open the hub" link.
- Tiles per row: **4 on desktop** (256×52px tiles), **3 at ≥700px**,
  **2 on mobile 390px** (176px wide) — no horizontal scroll anywhere
  (scrollWidth = viewport width on both).
- Mobile tiles are tighter still: icon + name only (name clamped to 2
  lines; the description line shows at ≥640px). Search still matches
  name + description text on every screen size.
- Kept exactly as they were: hero + prominent search, "ToolPixi in
  numbers" counters, "Popular on ToolPixi" rail, My ToolPixi Toolbox
  (Favourites / Recently used / shared Toolbox), Browse-by-family hub
  links, "Why people use ToolPixi". The duplicated 18-card "Popular
  tools" card section (part of the tabs design) was removed — the
  text-link Popular rail remains.
- **Search** is global and live-filters the visible tiles: non-matching
  tiles hide, family groups with no match hide, the no-match message
  still works, and clearing the box restores the full catalogue.
- **Favourite stars** ride on every tile with the same `data-fav`
  contract, so favs.js / the Toolbox works unchanged (verified below).
- Defensive detail: if the TOOLS registry ever gains a category outside
  the five CATS (e.g. the downloader batch), those tools automatically
  get their own visible group — the catalogue can never hide a tool.

### Tile counts (Playwright, local build AND live — identical)

| Group | Tiles | | Group | Tiles |
|---|---|---|---|---|
| Image | **33** | | Text | **26** |
| PDF | **12** | | Calculators | **23** |
| Date & Time | **33** | | **Total visible** | **127 / 127** |

127 = the TOOLS registry total at build time; every tile is visible on
load with **zero clicks**.

## 2. Page height — measured (Playwright scrollHeight)

| Layout | Desktop 1280 | Mobile 390 |
|---|---|---|
| Tabs design (default view, only 18 of 127 tools visible) | 4,026 | 6,890 |
| Old card design with **everything** visible (JS off, 145 cards incl. duplicates) | 11,746 | 18,077 |
| **New compact catalogue (all 127 visible)** | **5,871** | **9,763** |

- At equal visibility, the new homepage is **~50% shorter on desktop and
  ~46% shorter on mobile** than the previous all-visible layout.
- The five catalogue groups themselves total **2,816px desktop /
  4,390px mobile** (≈22px / ≈35px per tool including headings). The
  rest of the mobile height is pre-existing furniture Hamza asked to
  keep (footer 2,032px, Popular rail 1,026px, hero 625px).
- Density journey: first tile pass measured 74px desktop / 83px mobile
  tile rows → tightened (smaller icon, padding, type) → **52px / 48px**.
- A grid blowout bug was caught in testing and fixed: the nowrap
  description line forced `1fr` columns to min-content width (tiles
  rendered 537px wide, page 2,376px wide). Fix: `minmax(0,1fr)` columns
  + `min-width:0` on tiles — verified gone on desktop and mobile.

## 3. Verification

**Playwright (local build, desktop 1280 + mobile 390):**
- Default load: 127/127 tiles visible, per-group counts exact (table
  above), no pills, no Load-more element, no-match hidden.
- Search "merge" → exactly 1 tile (Merge PDF, PDF group); other groups
  hidden. Gibberish → 0 tiles + no-match message. Clearing → 127 back.
- Favourite star on a tile → `tp_favs` saved, star lights up, the
  "My ToolPixi Toolbox" section appears with the card; unstarring
  reverses it. Shared-Toolbox link (`?toolbox=word-counter,merge-pdf`)
  renders its section with 2 cards.
- **Zero JS page errors** on desktop and mobile.

**Live (toolpixi.com, after deploy):**
- curl: homepage **200** · **127 tiles** in HTML · **0** `cat-pills`
  references · stylesheet `?v=20261113c` live · sitemap **158 URLs
  (unchanged)** · **ads.txt md5 `9e5ab8a9e3daa0f2160b3444d2113bb3` —
  byte-identical before and after**.
- Playwright against the live site repeats the local results exactly:
  127/127 visible, per-group counts, search, favourite star, heights
  5,871 / 9,763, scrollWidth = viewport, **zero JS errors**.
- No URL, title or meta changes anywhere; the only per-page diff besides
  the homepage itself is the stylesheet cache-bust `?v=20261113b →
  20261113c`.

## 4. Changes made

- `build.py` — `home_body()` only: new `tile()` renderer; category
  sections rebuilt as `.cat-group` + `.tiles`; Popular card section and
  the pills/tab script removed; new catalogue search script;
  stylesheet version bumped to `?v=20261113c`. Plus a fallback group
  for any non-CATS registry category.
- `assets/css/style.css` — `.cat-pills` / `.pill` / `.all-tools-note`
  rules removed; new `.home`-scoped catalogue block (`.cat-group`,
  `.tiles`, `.tile`, `.tic`, `.tn`, `.td`, tile fav-star sizing,
  700px/1024px column steps, ≤639px compact rules).

## 5. Coordination note (concurrent downloader batch)

Another agent is adding downloader tools in parallel. build.py was
stat-checked before editing, before building and before deploying —
unchanged throughout (registry still 127 tools at build time), so this
deploy is a clean, self-contained homepage change. The downloader
agent's `assets/js/downloaders.js` + `assets/js/ratings.js` appeared in
the source tree during this work; they were carried into the repo clone
by rsync but deliberately left **untracked/uncommitted** for that agent
to ship with its own pages. When its tools join the TOOLS registry they
will render in this catalogue automatically (their own group if a new
category key is used), and the `__N__` counters will follow the new
total on its next build.
