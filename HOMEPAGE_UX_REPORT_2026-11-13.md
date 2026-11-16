# ToolPixi Homepage UX — Report, 2026-11-13

Status: **SHIPPED + LIVE-VERIFIED.** Final commit `3bb08dc` in toolpixi-repo.

## ⚠️ DESIGN CHANGE (Hamza's decision, mid-task)

This task started as a Load-more build and that version was actually
committed and pushed (`f9fdc71`, live for under an hour). **Hamza then
rejected the Load-more pattern outright** ("Load more wala option nahi
sahi hai — kuch aur professional cheez karo"), so it was replaced the
same day by the design below. **There is no Load-more anywhere on the
site now** — zero `show-more`/`load-more` references in the live
homepage (verified by grep after deploy). What survives from the first
pass is only the professional polish (§3).

## 1. Final design — filter-first tabs (iLovePDF / Toolzin pattern)

- The pills above the tools area are now real **tabs**: **Popular**
  (default, active on load) · **Image** · **PDF** · **Text** ·
  **Date & Time** · **Calculators**. The live search box stays prominent
  in the hero above them.
- **Default view = Popular only**: one bounded grid of **18 curated
  cards** (new `POPULAR_HOME` list in build.py: the Popular rail's 10
  picks + POPULAR's extra high-demand tools + Age Calculator + Unit
  Converter; the Popular strip grew 12 → 18 cards). Exactly one tools
  section is visible at a time; the other sections toggle via the tabs.
- **No "show all 127" grid view exists.** Under the tabs, a text note
  points to the **Browse by family** hubs (given `id="browse-family"`,
  already on the homepage): every tool is reachable in ≤ 2 clicks
  (tab → tool, or hub → tool).
- **SEO / no-JS**: all cards remain in the server-rendered HTML —
  145 card elements on the homepage (127 category cards + 18 Popular
  cards). The tab script only toggles `display`; with JS off, every
  section simply shows, as before.
- **Search behaviour (chosen + noted per brief)**: search is **global**
  — while a query is typed it searches across all sections regardless
  of the active tab (this is the site's pre-existing search semantics
  and avoids "it's in another tab" dead ends). Clearing the query
  returns to whichever tab was active. The no-match message still works.

### Per-tab counts (Playwright, local build — all exact)

| Tab | Visible cards | | Tab | Visible cards |
|---|---|---|---|---|
| Popular (default) | **18** | | Text | **26** |
| Image | **33** | | Date & Time | **33** |
| PDF | **12** | | Calculators | **23** |

Category tabs sum to the 127 tools. **Count note:** the brief quoted
34/13/25/29/23 — those are the *hub-page* counts from the Hubs report,
which were compiled differently (hub membership incl. standalones).
The homepage grids are generated from the `TOOLS` registry, whose real
per-category counts are Image 33 · PDF 12 · Text 26 · Date 33 ·
Calculators 23 = 127. Tabs show exactly the tools each category
actually contains; nothing is missing or padded.

## 2. What was removed / reverted

- Load-more markup (`#load-more`, `#show-more`, status line) — removed
  from build.py; its JS cap logic replaced by the tab script; its CSS
  rules (`.load-more`, `.load-more-status`, mobile full-width rule)
  removed from style.css.
- The old "All" pill is gone — replaced by the Popular default tab;
  tab order follows the brief (Image, PDF, Text, Date & Time,
  Calculators).

## 3. Professional polish (kept, homepage-scoped under `.home`)

- **Uniform cards**: every card title gets a fixed two-line block
  (line-clamp 2 + min-height) so descriptions start on the same
  baseline across a row; grid stretch keeps row heights equal.
- **Spacing rhythm**: homepage sections unified to a 30px rhythm;
  section-heading margins unified (6px); `.cat-sub` styling (muted,
  14.5px) now applies consistently in counters/Toolbox/family sections,
  not just inside category sections.
- **Search prominence**: hero search widened (520 → 560px), padding up,
  2px border, stronger layered shadow, larger icon — existing tokens.
- **Buttons**: one style — tabs use the existing `.pill` component,
  actions use `.btn` (unchanged design system; no new colours/fonts).
- **Mobile 390px**: homepage grids switch to **2 columns** with compact
  vertical cards (icon on top, 44px tile, 3-line description clamp);
  tab row scrolls horizontally (existing pill behaviour). Verified:
  document/body scrollWidth = 390 (no horizontal scroll).
- Stylesheet cache-bust bumped `?v=20261103a → ?v=20261113b` (the `a`
  build was the short-lived Load-more CSS).

## 4. Verification

**Playwright (local build, headless Chromium, desktop 1280 + mobile 390):**
- Default load: only `#popular` visible, 18 cards, active tab = Popular,
  no Load-more element in the DOM.
- Each tab click: exactly that section visible with the counts in §1;
  clicking Popular returns to 18.
- Search "merge" → Merge PDF visible in both Popular and PDF sections;
  searching "word counter" *while the PDF tab is active* still finds it
  (global search confirmed); clearing returns to the active tab (PDF 12
  / Popular 18). Gibberish query → 0 cards + no-match message.
- **Zero JS page errors** on desktop and mobile.
- Mobile: 2-col grid (column cards), tabs work (Image → 33), no
  horizontal scroll.

**Live (curl, after deploy):** homepage **200** · all 6 tabs present ·
**0** load-more references · 145 cards in HTML incl. late-grid tools
(e.g. Percentage Increase Calculator) · CSS `?v=20261113b` live with the
new rules · sitemap **158 URLs (unchanged)** · **ads.txt md5
`9e5ab8a9e3daa0f2160b3444d2113bb3` — byte-identical** · Batch A sections
(counters, Popular rail, legal footer links) and Hubs/Toolbox sections
untouched · no URL or title changes anywhere (the only per-page diff
besides the homepage is the stylesheet `?v=` line).

## 5. Skipped / notes

- **No separate "All tools" page or grid** — deliberate, per the new
  brief: the family hubs are the all-tools route.
- The footer's "Popular" column still uses the original 12-tool
  `POPULAR` list — footer composition was out of scope and unchanged.
- One environmental note: on the local harness the AdSense script
  request fails (no external network for localhost) — it produces no
  JS page error and is unrelated to this change; the live site serves
  it normally.
