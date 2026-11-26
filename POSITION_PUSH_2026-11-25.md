# ToolPixi Position Push — 2026-11-25

Ordered by Hamza Ali Basra (voice call, Nov 25, 2026): start immediately; one-week target to **Dec 2, 2026** — push the striking-distance pages toward top 5 and lift CTR. Status: **SHIPPED + LIVE-VERIFIED** (deploy commit `ee679d7cb70a3b9fff9dcd59338a4e168283dfca`).

## Baseline — the before-picture (GSC, last 28 days, read live Nov 25, 2026)

- Site: **33 clicks · 4,944 impressions · CTR 0.7% · avg position 34.5**
- Date Calculator `/date-calculator/` — 1,376 imp, pos 20.9, 0 clicks (28% of all site impressions). Query family already top-10 on specific date questions: "90 days from 8/18/26" pos 9.2 (32 imp), "90 days from 8/18/2026" pos 9.8 (22 imp)
- Age Difference Calculator — 467 imp, pos 10.6, 0 clicks
- Percentage Increase Calculator — 229 imp, pos 14.2, 1 click
- Number to Words Converter — 699 imp, pos 42.2, 0 clicks
- Unit Converter — 250 imp, pos 29.1, 0 clicks
- PNG to ICO — 174 imp, pos 51.1, **16 clicks = 9.2% CTR**
- Image Compressor pos 67.4, WebP to JPG pos 72.2 — giant-held head terms, deliberately untouched this run
- Indexing: 140 indexed, 38 not indexed (26 Discovered-not-indexed, 5 Crawled-not-indexed, 3× 404, 3× redirect, 1× alternate canonical). Sitemap 174 discovered, Success.
- Site after this build: 139 tools, sitemap 175 URLs.

**Dec 2 checkpoint = compare against every number above.**

## Keyword evidence (Google autocomplete, suggestqueries.google.com, pulled 2026-11-25)

- **age difference calculator** → "age difference calculator by date of birth", "…by birthday and age", "…in months", "…for siblings", "…for marriage", "…18 and 22"; **age gap calculator** → "age gap calculator dating", "…relationship", "…by date of birth"
- **percentage increase calculator** → "…between two numbers", "…from one number to another", "…salary", "…money", "…over time", "…year over year"
- **date calculator** → "date calculator add days", "…between two dates", "…days"; **days from today** → "days from today calculator", "days from today to december 18 / end of year" (specific-date pattern, matching the GSC-proven "90 days from 8/18/26")
- **number to words** → "number to words converter", "…for check", "…calculator", "…indian rupees"; **number to words converter** → "…converter check", "…converter cheque", "…converter indian rupees", "…converter english"
- **png to ico** → "png to ico converter", "png to icon converter", "png to ico converter free", "png to ico file converter", "png to ico high quality"
- **unit converter** → generic only ("unit converter weight / length / temperature / volume / money") — no sharper phrase exists; light touch only

## Changes shipped

### Titles & meta descriptions (via SEO_OVERRIDES in build.py)

| Page | Old title | New title |
|---|---|---|
| age-difference-calculator | Age Difference Calculator — Exact Age Gap Between Two People \| ToolPixi | **Age Difference Calculator — Age Gap by Date of Birth \| ToolPixi** |
| percentage-increase-calculator | Percentage Increase Calculator — % Increase & Decrease \| ToolPixi | **Percentage Increase Calculator — % Increase Between Two Numbers \| ToolPixi** |
| number-to-words-converter | Number to Words Converter — Write Numbers in Words \| ToolPixi | **Number to Words Converter — Write Any Number in Words \| ToolPixi** |
| date-calculator | (unchanged — already carries the two proven phrases "add or subtract days" + "days between dates") | — |
| png-to-ico | (unchanged — already carries exact phrase + "free"; it is the proven click-winner, not to be disturbed) | — |

New metas:
- **Age difference** — now leads with "enter two dates of birth — a couple, siblings, parent and child" and adds "the gap in months" (autocomplete phrase) alongside years/months/days + total days.
- **Percentage increase** — "find the % increase or decrease between two numbers — a salary rise, a price change, growth from one number to another — with the formula shown and worked examples. Instant, no sign-up, runs in your browser."
- **Number to words** — "turn any number into English words for cheques, checks, invoices and contracts — international (million, billion) and Indian (lakh, crore) systems."
- **Unit converter** — meta only: added "volume" + "litres to gallons" (the converter genuinely covers volume since the Nov 23 batch; the old meta omitted it).

### On-page content

- **Age Difference** — new section "Common age gaps people check": verified worked pairs for the three autocomplete-proven intents — siblings (10 May 2018 & 3 Nov 2021 → 3y 5m 24d, 1,273 days), a couple (20 Jan 1988 & 4 Jul 1992 → 4y 5m 14d, 1,627 days), parent & child (15 Apr 1960 & 30 Sep 1985 → 25y 5m 15d, 9,299 days) — plus dating-gap and gap-in-months coverage. All gaps computed and checked with Python (relativedelta) before shipping.
- **Percentage Increase** — new section "Percentage increase between two numbers — worked examples": 50→75 = +50%, $50,000→$55,000 salary = +10%, 80→100 = +25%, 1,000→1,150 = +15%, 45→60 = +33.33%, 120→90 = −25% (all verified arithmetically).
- **Date Calculator** — the live "Popular date questions — answered for today" table extended from 9 to 14 rows: added **14, 21, 120, 150 and 200 days from today** (the JS fills any `data-dc-add` value generically — verified in dates.js). The proven specific-start-date pattern ("90 days from 8/18/26") was already covered by the existing worked-examples section, which stays.
- **Date hub (/date-tools/)** — intro gained a closing paragraph naming the family's two most-asked questions with links: "what date is 90 days from today" → Date Calculator, "the exact age gap between two people" → Age Difference Calculator. (Calculators + image hubs already linked their targets prominently in their pick-guides — verified, left as-is.)

### Internal links (RELATED_TOPUP — additive; layout skips any target a page already links)

New/changed donor → target links (all verified present in the built + live HTML):
- **→ age-difference-calculator:** age-calculator, days-between-dates, days-until, weekday-calculator (plus pre-existing links from date-calculator, age hub, date hub)
- **→ percentage-increase-calculator:** percentage-calculator (already linked in its deep-dive prose — topup correctly skipped a duplicate), discount-calculator, tip-calculator, loan-calculator, salary-converter, compound-interest-calculator (plus calculators hub)
- **→ number-to-words-converter:** binary-converter, scientific-calculator, roman-numeral-converter (plus pre-existing hex-converter + calculators hub)
- **→ unit-converter:** currency-converter (plus the 20 unit-pair pages + percentage-increase, which already linked it)
- **→ png-to-ico:** favicon-generator, image-resizer, image-cropper, image-watermark, background-remover, gif-to-jpg, gif-to-png, svg-to-png, svg-to-jpg, jpg-to-png, png-to-jpg, webp-to-png, bmp-to-jpg, bmp-to-png, avif-to-jpg, avif-to-png, passport-photo-maker (17 new donor pages, on top of the pre-existing compress/heic family links and the image hub)

Git diff ground truth: **28 pages modified + 6 stub pages added** (34 files). Pages not in the diff (e.g. age-calculator) already carried the target link from earlier builds — no duplicate was created anywhere.

### 404 cleanup (redirect stubs)

Git history of the deploy repo confirmed exactly six tool URLs were ever deleted: the downloaders removed 2026-11-13. They had **no redirect stubs** — the standing GSC 404s. Stubs added (tools themselves stay removed, per Hamza's standing order):
- facebook-video-downloader → video-compressor
- instagram-video-downloader → video-compressor
- tiktok-video-downloader → video-compressor
- twitter-video-downloader → video-compressor
- instagram-photo-downloader → image-compressor
- youtube-thumbnail-downloader → image-resizer

## Deploy & verification

- Recipe followed exactly: `python3 build.py` → rsync (excludes .git/build.py/NOTES.md) → commit → `gh auth setup-git` → push. Commit: **ee679d7cb70a3b9fff9dcd59338a4e168283dfca**
- **ads.txt md5 = 9e5ab8a9e3daa0f2160b3444d2113bb3** — verified in source before build, after build, and live after deploy. Unchanged.
- Logo untouched; design v9 untouched; no new tool pages added; removed downloaders NOT rebuilt (stubs only); zero spend; GSC not touched (no submissions, no indexing requests).
- Live checks (~2 min after push, toolpixi.com): new titles live on age-difference, percentage-increase, number-to-words ✓ · new percentage meta live ✓ · "Common age gaps people check" section live ✓ · percentage worked-examples live ✓ · dc-live rows 14/120/200 live ✓ · facebook-video-downloader stub returns 200 → redirects to /video-compressor/ ✓ · favicon-generator carries the /png-to-ico/ link ✓
- Housekeeping: the pre-build backup `build.py.bak-2026-11-25-positionpush` briefly rsynced into the clone; it was removed before commit (never shipped) and now lives outside the deploy tree at `~/workspace/toolpixi-backups/`.

## What to watch at the Dec 2 checkpoint

Age Difference (10.6) and Percentage Increase (14.2) are the two expected to move first — title intent now matches the exact typed phrases and both gained content + links. Date Calculator's 1,376 impressions are the biggest prize if the extended live-answers table pulls it from ~21 onto page 1. PNG to ICO should convert more of its proven 9.2% CTR as the 17 new internal links feed it visibility. The 26 "Discovered — not indexed" pages were not touched (no GSC door use this run); internal-link strengthening is the slow lever there.
