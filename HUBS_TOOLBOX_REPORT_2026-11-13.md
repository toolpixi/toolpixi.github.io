# ToolPixi — Category Hubs + My ToolPixi Toolbox — Report, 2026-11-13

Status: **SHIPPED + LIVE-VERIFIED.** Commit `25388e7` in toolpixi-repo (134 files modified, 0 added, 0 deleted).
All changes additive: no URL changes, no nav restructure, no edits to existing copy/titles, ads.txt untouched.

## 1. Category hubs — key finding: they already existed

The brief assumed hubs were missing. They were not: the 2026-11-07 "internal-link backbone"
pass already built one hub per REAL category in build.py's taxonomy (`CATS`), each with an
intro, a "Picking the right one" guide, FAQs + FAQPage schema, a link to every member tool,
sitemap entry, a footer "Categories" column on every page, and a homepage "Browse by family"
section. The site's real taxonomy has exactly **5 categories** — there are no separate Video,
Audio or Developer categories (MP4-to-MP3 / Video Compressor sit in Image; JSON/Base64 sit in
Text), so inventing 8–10 hubs would have meant fabricating a taxonomy. All counts ≥ 12 tools,
so no merging applied either.

| Hub | URL | Tools | Words before → after |
|---|---|---|---|
| Image Tools | https://toolpixi.com/image-tools/ | 34 | 2,218 → 2,458 |
| PDF Tools | https://toolpixi.com/pdf-tools/ | 13 | 1,857 → 2,082 |
| Date & Time Tools | https://toolpixi.com/date-tools/ | 29 | 2,128 → 2,378 |
| Text & Generator Tools | https://toolpixi.com/text-tools/ | 25 | 2,064 → 2,294 |
| Calculators & Converters | https://toolpixi.com/calculators/ | 23 | 2,016 → 2,262 |

(Counts = TOOLS-list members + standalone tool pages in the family; totals reconcile to 127 tools.)

**What this run added:** the one element the brief asked for that the hubs lacked — explicit
workflow copy chaining tools together. Each hub gained a new section,
**"Workflows: putting these tools together"** (~220–245 words, 3 workflows per hub, original
copy, internal links throughout), inserted between the intro and the tool list. Existing hub
text, titles, FAQs and URLs are byte-unchanged. Examples: Image — HEIC→JPG → Resizer →
Compressor for form photos; PDF — JPG→PDF → Merge → Compress → Sign for a job-application
pack; Date — Age Calculator → Age on a Specific Date for school cut-offs; Text — Word Counter
→ Reading Time → Case Converter draft-to-submission; Calc — Loan → Compound Interest →
Salary Converter before signing a loan.

## 2. My ToolPixi Toolbox (retention branding + share)

localStorage behaviour is **identical** (same keys `tp_favs` / `tp_recent`, same toggle logic);
only labels/headings changed, plus the new share feature — all in `assets/js/favs.js` and the
homepage/tool-page templates in build.py:

- Homepage favourites section heading → **"My ToolPixi Toolbox"**; recents heading →
  **"Recently used in your Toolbox"**. Tool-page toggle now reads **"Save to my Toolbox" /
  "Saved in my Toolbox"**; card star aria-labels match.
- **Share my Toolbox** button (inside the Toolbox section): builds
  `https://toolpixi.com/?toolbox=slug1,slug2` from the visitor's favourites and copies it to
  the clipboard (fallback: a visible read-only link field if clipboard is unavailable).
- **Shared landing** on the homepage: a `?toolbox=` URL renders a section **"A Toolbox shared
  with you"** — "Open any tool — or tap ☆ on the ones you like to save them into your own
  Toolbox." Read-only from the URL: viewing writes nothing to localStorage; invalid/duplicate
  slugs are filtered against the tool catalog (capped at 30).

**Headless verification** (Playwright harness, local build, zero page errors): shared URL
rendered the 3 correct cards and left `tp_favs` empty; starring a shared card saved it and
revealed the "My ToolPixi Toolbox" section; the share button put
`…/?toolbox=merge-pdf` on the clipboard with its confirmation message; junk slugs were
ignored; tool-page toggle + Recently Used worked under the new labels.

## 3. Sitemap / safety

- **Sitemap delta: 0 URLs (158 → 158)** — hubs were already in the sitemap; the Toolbox share
  lives on the existing homepage URL, so no new URL was created.
- ads.txt: byte-identical before/after (md5 `9e5ab8a9e3daa0f2160b3444d2113bb3`; live line
  re-verified). Navigation, Privacy/Terms text and all existing titles untouched.
- Deploy: rsync dry-run first showed **0 deletions**; two unrelated working files were kept
  out of the push (`FUNCTIONAL_TEST_2026-11-12.md` as usual, and `OFFSITE_PREP_2026-11-13.md`
  — a prep doc from the Medium/roundup workstream, not part of this task).

## 4. Live verification (curl, after deploy)

All 5 hubs **200** with the Workflows section present · homepage **200** with "My ToolPixi
Toolbox", "A Toolbox shared with you", the share button and "Recently used in your Toolbox" ·
live sitemap **158** URLs · live favs.js is the new build (shared-toolbox renderer present) ·
a live tool page shows "Save to my Toolbox" · ads.txt live line correct.

## 5. Skipped / notes

- **No new hub URLs created** — the real taxonomy has 5 categories and all 5 hubs pre-existed;
  see §1. Splitting fake sub-hubs (e.g. a separate "Video Tools" hub for 2 tools) would have
  violated the brief's own merge rule and the no-new-URL-structure caution.
- **No separate /toolbox/ landing page** — the brief allowed "homepage ?toolbox= … or a
  /toolbox/ landing"; the homepage route reuses the existing catalog/sections with zero new
  URLs, which is the safer additive choice mid-review.
- The Privacy Policy / Cookie Policy still describe the feature in plain words ("favourite
  tools", "tools you used recently") — deliberately untouched per the mid-review guardrail;
  the descriptions remain accurate under the Toolbox branding.
