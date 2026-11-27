# ToolPixi — Crawled-Not-Indexed Fix — 2026-11-26

Hamza's order (Nov 26, 2026): fix the quality issue on the 19 pages Google crawled
Nov 24–25 but chose not to index, so Google indexes them. Status: **SHIPPED +
LIVE-VERIFIED 19/19** (deploy commit `6f9cb3d597066c098c7fdb63f049fb2814a0dcbc`).

## Diagnosis (audit before touching anything)

All 19 pages already carried the full lower-page stack from the Nov 12 depth pass
and Rounds 1–3: a "why" section, a DEEP_DIVE section and 4–7 FAQs (visible +
schema). The converters already had formula sections and common-values tables.
The one element every one of the 19 lacked — and the element Round 2 proved on
Unit Converter — was a **direct-answer block above the fold**: each page opened
with a one-line lede (14–31 words), and the first real answer sat far down the
page. Google crawled, found a tool widget and a thin opening, and passed.

## What was added

A new `QUICK_ANSWER` dict in build.py (19 entries), injected in main()
immediately under the tool, before "How to use it" — the Round 2 placement.
Each block: an H2 led by the page's #1 searched phrase (KEYWORD_MAP_2026-11-26),
a 2–3 line direct answer, verified specifics, and prose links to 2–3 sibling
pages with exact search-phrase anchors. Every conversion figure was computed in
Python from the exact defined factors before shipping. Titles untouched.

| Page | What the new block adds |
|---|---|
| miles-to-km | Formula up top + 65 mph = 104.61 km/h, 300 mi = 482.80 km; links: km to miles converter, unit converter |
| km-to-miles | Formula + 100 km = 62.14 mi, 120 km/h = 74.56 mph; links: miles to km converter, unit converter |
| liters-to-gallons | Exact factor + US vs imperial gallon note; 40 L tank = 10.57 gal, 19 L bottle = 5.02 gal; links: gallons to liters converter, unit converter |
| gallons-to-liters | Formula + 13.2 gal tank = 49.97 L, 25 gal aquarium = 94.64 L; links: liters to gallons converter, unit converter |
| yards-to-meters | Exact 0.9144 + football field 100 yd = 91.44 m, 25 yd pool = 22.86 m (swim intent); links: meters to yards converter, unit converter |
| meters-to-yards | Formula + 100 m = 109.36 yd, 50 m pool = 54.68 yd, 10 m = 32.81 ft; links: yards to meters converter, unit converter |
| crop-pdf | What cropping does + honest limit (hides, does not delete — not redaction); links: rearrange pdf pages, rotate pdf |
| organize-pdf | Lossless-rebuild explanation + extract-by-deletion use case; links: crop pdf, merge pdf |
| compare-pdf | Word-by-word diff explained + text-layer/moved-paragraph limits; links: pdf to text converter, merge pdf |
| protect-pdf | 256-bit AES vs permission flags as two jobs + password-channel habit; links: unlock pdf, add a watermark to a pdf |
| unlock-pdf | The two locks (open password vs owner restrictions) + honest no-recovery boundary; links: protect pdf, pdf to text converter |
| repair-pdf | Broken cross-reference map explanation + what repair cannot invent; links: compress pdf, split pdf |
| pdf-to-excel | Real-cells/real-numbers answer + scanned-PDF OCR limit; links: image to text converter, pdf to text converter |
| meme-generator | No-watermark/in-browser answer + thumbnail-readability caption craft; links: gif maker, photo collage maker |
| image-to-text | OCR what/how + image-quality factors + the scanned-PDF route; links: pdf to excel converter, pdf to jpg |
| spin-the-wheel | Visible-draw fairness answer + remove-winner/one-entry rules; links: name picker, dice roller |
| random-name-generator | Intent correction up top (picks from your list, does not invent names); links: spin the wheel, random number generator |
| invoice-generator | The six non-negotiable invoice fields + worked $800 + 8% = $864 example; links: currency converter, vat calculator |
| photo-collage-maker | In-browser assembly answer + order/consistency craft; links: image resizer, meme generator |

Word counts rose ~120–135 per page (e.g. crop-pdf 948 → 1,071; unlock-pdf
797 → 930; meters-to-yards 699 → 793).

## Donor links FROM strong pages (sparing, topical only)

- **Unit Converter** (pos 29.1): its "most-searched conversions, answered"
  table grew 9 → 12 rows — added Km to miles (100 km = 62.14 miles), Yards to
  meters (10 yd = 9.14 m) and Meters to yards (10 m = 10.94 yd) rows with
  exact-phrase anchors; closing line updated so yards is no longer listed as
  an "other pair".
- **RELATED_TOPUP**: merge-pdf → +organize-pdf (merge-then-arrange workflow);
  rotate-pdf → +crop-pdf, +organize-pdf (page-geometry siblings).

## Deploy & verification

- Backup first: `~/workspace/toolpixi-backups/build.py.bak-2026-11-26-crawledfix`.
- Recipe followed exactly: `python3 build.py` → rsync (excludes
  .git/build.py/NOTES.md) → growth-batch files removed from clone → commit →
  `gh auth setup-git` → push. Commit: **6f9cb3d597066c098c7fdb63f049fb2814a0dcbc**
  (22 HTML files: the 19 targets + unit-converter, merge-pdf, rotate-pdf).
- **ads.txt md5 = 9e5ab8a9e3daa0f2160b3444d2113bb3** — verified in source after
  build and live on toolpixi.com after deploy. Unchanged.
- **Live check (~90 s after push): all 19 pages HTTP 200 with their new
  distinctive content string present — 19/19.** Unit Converter's 3 new rows
  live. Live sitemap = **175 URLs**. Titles confirmed unchanged (incl. the
  Nov 26 sweep titles on compare-pdf, image-to-text, random-name-generator,
  organize-pdf).
- No other pages touched: PNG to ICO and Date Calculator untouched, no new
  pages, no title changes.

## GSC booster queue

All 19 URLs appended to `~/workspace/gsc-indexing/pending.txt` dated
2026-11-26 in the file's existing format (`date \t toolpixi \t url`), for the
daily GSC run to submit over the coming days.

## What to watch at the Dec 2 checkpoint

Whether the 19 move out of "Crawled - currently not indexed" on Google's next
crawl, and whether the pair pages start registering impressions on their
"…conversion" queries with Unit Converter now linking all 12 pairs. Baseline
remains the Nov 25 figures: 33 clicks / 4,944 imp / CTR 0.7% / avg pos 34.5.
