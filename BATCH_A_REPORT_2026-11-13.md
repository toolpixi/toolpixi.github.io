# ToolPixi — Batch A (review-safe additions) — Report, 2026-11-13

Status: **SHIPPED + LIVE-VERIFIED.** Commit `99d0987` in toolpixi-repo.
ToolPixi is in AdSense review — everything below is additive only.

## What shipped

### 1. Three new legal pages (same style/routing as /privacy/ and /terms/; footer links added on every page)
- https://toolpixi.com/disclaimer/ — tools provided as-is; results accuracy (check before relying); no professional advice (medical/financial/legal); files processed locally in the browser; external links; contact.
- https://toolpixi.com/dmca/ — how ToolPixi works (no user files are hosted — tools run in the visitor's browser), full takedown-notice contents, what happens next, counter-notification (10–14 business days), repeat misuse. Contact: the site's existing address, contact@hamzaalibasra.com (taken from the live Contact page).
- https://toolpixi.com/cookie-policy/ — honest and consistent with the Privacy Policy: ToolPixi sets no cookies of its own and runs no analytics; favourites/recently-used use on-device local storage only (not cookies, never transmitted); the AdSense verification script and possible future advertising cookies (incl. DoubleClick) explained with the same opt-out links the Privacy Policy gives; jsDelivr exception (docx + FFmpeg) disclosed the same way.

### 2. Homepage brand furniture (built from existing design components only — .countdown cells + .related links; no new CSS)
- **Counters strip** "ToolPixi in numbers": **127** Free tools · **0** Sign-ups needed · **0** Files ever uploaded · **Any** Device — phone or computer, with the line "No sign-up needed, your files never leave your device, and every tool works on any device with a web browser."
- **"Popular on ToolPixi" rail** — 10 existing tools with descriptive anchors: Image Compressor, Compress PDF, Merge PDF, JPG to PDF, PDF to JPG, Background Remover, QR Code Generator, Password Generator, Word Counter, YouTube Thumbnail Downloader.

### 3. Two tutorial-style posts (in the existing guides system — they also appear on the Guides index automatically)
- https://toolpixi.com/guides/why-whatsapp-compresses-your-photos/ — "Why WhatsApp Compresses Your Photos — And How to Send Them in Full Quality" — **847 words**. What WhatsApp does to a photo and why; HD quality setting; send-as-document route (Android + iPhone steps); when smaller is the goal it ends at the Image Compressor (+ HEIC to JPG, Image Resizer); honest note that received photos can't be un-compressed.
- https://toolpixi.com/guides/pdf-too-big-to-email/ — "PDF Too Big to Email? How to Shrink Any PDF Under 25 MB in Seconds" — **882 words**. Gmail 25 MB / Outlook 20 MB limits + the Base64 encoding inflation (aim ≤ 20 MB); why PDFs get heavy; why zipping barely helps; the fix ends at the PDF Compressor; the image-based trade-off (text no longer selectable) stated openly, with Split PDF / drive-link as the alternatives.

## Sitemap delta
**153 → 158 URLs (+5):** /disclaimer/, /dmca/, /cookie-policy/, /guides/why-whatsapp-compresses-your-photos/, /guides/pdf-too-big-to-email/.

## Guardrails held
ads.txt untouched (same publisher line, verified live) · no URL/slug changes · no navigation changes (footer links only — the task explicitly allowed footer additions) · zero edits to existing Privacy/Terms/About/Contact text · no deletions or merges · no ad placeholders · no title rewrites. Staged diff was exactly: 5 new files + footer/furniture/index updates, nothing else.

## Live verification (curl, after deploy)
Homepage 200 with counters strip + Popular rail present · /disclaimer/ 200 · /dmca/ 200 · /cookie-policy/ 200 · both tutorials 200 · live sitemap = 158 URLs including all 5 new ones.

## Skipped / notes
- **Newsletter capture: not done** — per POST_REVIEW_PLAN it is PARKED pending a Brevo/Formspree form endpoint (Hamza's 2-minute login step). Was not part of this task's DO list.
- The homepage already had a "Popular tools" card grid; the new rail is a text-link rail above it, as briefed — both now coexist.
- Both guides were written to the brief's 800–1,200-word range (first drafts came in at 755/774 words; one substantive section was added to each — no padding).
