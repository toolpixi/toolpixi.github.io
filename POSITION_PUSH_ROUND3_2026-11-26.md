# ToolPixi Position Push — ROUND 3 (site-wide sweep) — 2026-11-26

Ordered by Hamza Ali Basra (voice call, Nov 26, 2026): apply the full ranking method — audience-searched keywords, audience-phrased titles, answer-first content, strong-page internal links — across the WHOLE ToolPixi site today, not just a few pages. Status: **SHIPPED + LIVE-VERIFIED** (deploy commit `f4e5063bd1c2c245c915d2b4f603c517e6de93d9`).

## How the scope was set (evidence, not guesswork)

A full inventory was taken by importing build.py and auditing every one of the 174 pages (139 tools + guides + hubs + info pages):

- **154 pages already carried a DEEP_DIVE section** (the Nov 12 AdSense-depth pass + Rounds 1–2). These were NOT re-touched.
- **Exactly 23 tool pages had no deep dive at all** — the entire uncovered set: 7 PDF tools (crop-pdf, organize-pdf, compare-pdf, unlock-pdf, protect-pdf, repair-pdf, pdf-to-excel), 5 calculators (mortgage-calculator, currency-converter, gpa-calculator, scientific-calculator, auto-loan-calculator), barcode-generator, and 9 media/text tools (typing-speed-test, meme-generator, gif-maker, qr-code-scanner, resume-builder, image-to-text, invoice-generator, screen-recorder, video-to-gif, photo-collage-maker). **All 23 were treated this round.**
- All 23 already had 4–7 FAQs and mostly sound titles — the gap was answer-depth (and the visible-FAQ block that DEEP_DIVE injection brings with it), not FAQ count.
- Hubs (image-tools, pdf-tools, date-tools, text-tools, calculators), the 22 guide articles and legal/info pages were deliberately left alone: hubs already carry intro + pick-guide structures, guides are already full articles, and legal pages have no searched demand to answer. Countdown/event pages and the 20 unit-pair pages already carry deep dives + tables from earlier passes.

**Git-diff ground truth: exactly 25 files changed** — the 23 deepened pages + 2 donor pages whose related lists grew (pdf-to-jpg, compound-interest-calculator). No new pages, no new URLs (sitemap still 175), no design/layout changes, logo untouched, removed downloaders stay removed, GSC not touched, zero spend.

## Keyword evidence (Google autocomplete, suggestqueries.google.com, pulled 2026-11-26)

28 seed queries pulled this round. The phrases that drove decisions:

- **mortgage calculator** → "…with extra payments" is a top branch (→ new FAQ + worked extra-payment example in the deep dive); state variants (florida/texas/ohio/california) confirm the US homebuyer intent the page's tax/insurance/PMI framing already serves
- **scientific calculator** → "scientific calculator online" is suggestion #2; the old title carried no "Online" (→ title fix)
- **car loan calculator / auto loan calculator** → twin head terms, equal trees (→ title now carries "Car Loan Payment")
- **rearrange pdf pages** → its own full tree ("…free", "…online free", "…free no sign up"); users type "rearrange", the page said "Reorder" (→ title fix)
- **currency converter** → pair-led tree: "euro to usd", "pounds to dollars", "cad to usd", "to usd" (→ pair FAQ + worked pair mechanics in the deep dive)
- **gpa calculator** → "…college", "…high school", "…from percentage", "…with current gpa" (cumulative-GPA worked example in the deep dive answers the "with current gpa" intent)
- **unlock pdf** → "…online free", "…without password" (the page's honest boundary — password required, no recovery — is now stated in the deep dive as well as the FAQ)
- **protect pdf** → "…from editing", "…from copying" branches (permission-flags explanation expanded in the deep dive)
- **qr code scanner** → "…from image", "…for pc", "…online" (deep dive leads with the from-image/PC use and the read-before-you-open safety angle)
- **image to text / ocr online** → "image to text converter free", "ocr online pdf" (deep dive covers the PDF route honestly: scanned PDFs → PDF to Excel's OCR)
- **video to gif** → "…high quality", "…converter free" (fps/width/length trade-off with verified frame counts)
- **gif maker** → "…from images", "…from video", "…for discord" (this tool is the from-images one; deep dive written to that intent)
- **typing test / typing speed test** → "…wpm", "…online free" (WPM formula + net-vs-gross worked example)
- **resume builder** → "…free no sign up" (title already carries it; deep dive reinforces the no-account, in-browser build)
- **barcode generator** → "barcode generator 128" (Code 128 already in title; deep dive explains the symbology choice + EAN checksum, the classic home-label failure)
- **compare pdf** → searched as plural "compare pdfs / compare pdfs for differences" (title already carries "Two PDFs"; deep dive written to the version-differences intent)
- **crop pdf / repair pdf / pdf to excel / organize pdf / invoice generator / screen recorder / meme generator / photo collage maker** → head-term + "free/online" trees match existing titles; the gap was depth only

## Changes shipped

### 1. DEEP_DIVE sections — 23 pages (DEEP_DIVE dict 154 → 177 entries)

Each page gained one substantial original section in the site's established voice (editorial H2, honest limits stated, in-browser privacy note where it matters), injected before Related tools together with the visible-FAQ block. Angles per page:

| Page | Section angle |
|---|---|
| crop-pdf | Cropping reframes, it does not erase — the honest "hidden ≠ deleted" warning |
| organize-pdf | Page order = argument order; lossless rebuild; extract-by-deletion |
| compare-pdf | Word-by-word diffing; the shall→may / one-digit changes that matter; text-layer limit |
| unlock-pdf | The two locks (open password vs owner restrictions); honest no-recovery boundary |
| protect-pdf | 256-bit AES + permission flags as two separate jobs; share the password by a different channel |
| repair-pdf | Corruption is usually a broken cross-reference map; qpdf rebuild; what repair cannot invent |
| pdf-to-excel | Tables rebuilt cell-by-cell; numbers stored as real numbers; OCR route for scans + the verify-one-total habit |
| barcode-generator | Symbologies as dialects (Code 128 / EAN-13 / UPC); the checksum home labels get wrong; print test |
| mortgage-calculator | PITI+PMI unbundled; term comparison table + extra-payments example (verified figures below) |
| currency-converter | Mid-market rate explained (ECB source); pair mechanics + inverse; weekend rates note |
| gpa-calculator | Quality-points method with worked semester (3.52) and cumulative (3.55) examples; scale-variation warning |
| scientific-calculator | DEG/RAD mode trap; order of operations; anchor facts (log₁₀1000 = 3, 2¹⁰ = 1024, √144 = 12, 5! = 120) |
| auto-loan-calculator | The four-number stack (price − down − trade-in + tax); worked $25,000-financed example |
| invoice-generator | The non-negotiable fields; itemised worked example ($800 + 8% = $864); numbering sequence |
| typing-speed-test | WPM = (chars ÷ 5) ÷ minutes; gross 50 vs net 47.6 worked example; what the scores mean |
| meme-generator | Caption craft: thumbnail-size readability, setup/twist split; no watermark, in-browser |
| gif-maker | Frame order = story, delay = tempo; the frames-×-weight size trade |
| qr-code-scanner | Read-before-you-open safety model; from-image/screenshot scanning on PC; barcodes too |
| resume-builder | The six-second scan; achievements over duties; one-file privacy |
| image-to-text | OCR quality is a property of the image; photographic fixes; the PDF route via PDF to Excel |
| screen-recorder | Scope choice (window/tab vs desktop) + narration; nothing installed, nothing uploaded |
| video-to-gif | The fps/width/length three-way trade; 10 s @ 12 fps = 120 frames, @ 15 fps = 150 |
| photo-collage-maker | Grid as grammar, order as reading path; export size per destination |

### 2. Titles & metas — 3 pages (SEO_OVERRIDES 48 → 51)

| Page | Old title | New title |
|---|---|---|
| scientific-calculator | Scientific Calculator — Trig, Logs, Powers & Roots in Your Browser \| ToolPixi | **Scientific Calculator Online — Trig, Logs, Powers & Roots \| ToolPixi** |
| auto-loan-calculator | Auto Loan Calculator — Car Payment with Tax, Trade-In & Down Payment \| ToolPixi | **Auto Loan Calculator — Car Loan Payment with Tax & Trade-In \| ToolPixi** |
| organize-pdf | Organize PDF — Reorder, Rotate & Delete PDF Pages Free \| ToolPixi | **Organize PDF — Rearrange, Rotate & Delete PDF Pages Free \| ToolPixi** |

New metas written for all three (pair/twin-phrase led, honest, no clickbait). Every other in-scope title was checked against its autocomplete tree and left as-is — they already lead with the exact searched phrase.

### 3. FAQ top-ups — 2 pages (FAQ_TOPUPS)

- **mortgage-calculator** +1: "What happens if I pay extra on my mortgage each month?" — the autocomplete branch, answered with the verified example (extra $200/mo on $350,000 @ 6.5% → paid off in 285 months instead of 360, ≈$108,000 interest saved).
- **currency-converter** +1: "How do I convert pounds to dollars, or euros to dollars?" — the pair-phrase branch, answered with the mid-market/ECB explanation and an explicitly-framed example rate (1 GBP = 1.27 USD → £100 = $127; arithmetic verified).

### 4. Internal links — RELATED_TOPUP (Round 2b pattern: feed the deepened pages)

- **→ mortgage-calculator:** auto-loan-calculator (new donor), compound-interest-calculator (added to its existing list) — on top of the pre-existing loan-calculator link
- **→ currency-converter:** invoice-generator (new donor) — on top of discount/salary/tip/vat/unit-converter
- **→ image-to-text:** pdf-to-excel (new donor), pdf-to-jpg (added to its existing list — the scan→JPG→OCR workflow)
- **→ barcode-generator:** qr-code-scanner (new donor) — on top of qr-code-generator
The layout skips any target a page already links, so no duplicates were created.

### Verification of examples (all computed in Python before shipping)

- Mortgage $350,000 @ 6.5%: 30-yr = $2,212.24/mo, $446,406 total interest · 15-yr = $3,048.88/mo, $198,798 interest, $247,608 saved · +$200/mo extra → payoff at month 285, interest $338,307, ≈$108,098 saved ✓
- Auto loan $25,000 financed @ 7%, 60 mo = $495.03/mo, $4,702 interest ✓
- GPA semester: (4.0×3 + 3.3×3 + 3.7×4 + 3.0×3) = 45.7 quality points ÷ 13 credits = 3.52 · cumulative (3.4×30 + 3.7×32) ÷ 62 = 3.55 ✓
- Scientific anchors: sin 30° = 0.5, log₁₀(1000) = 3, 2¹⁰ = 1024, √144 = 12, 5! = 120 ✓
- Typing: 250 chars/60 s = 50 WPM gross; (250 − 12) ÷ 5 = 47.6 net ✓
- Invoice: $450 + $150 + $200 = $800 subtotal; 8% tax = $64; total $864 ✓
- GIF frames: 10 s × 12 fps = 120; × 15 fps = 150 ✓
- Currency example framed as an example rate (1 USD = 0.92 EUR → $250 = €230; inverse 1 ÷ 0.92 = 1.087) — no live-rate claim made ✓

## Deploy & verification

- Recipe followed exactly: backup first (`~/workspace/toolpixi-backups/build.py.bak-2026-11-26-round3`) → `python3 build.py` → rsync (excludes .git/build.py/NOTES.md) → growth-batch files removed from clone → commit → `gh auth setup-git` → push. Commit: **f4e5063bd1c2c245c915d2b4f603c517e6de93d9** (25 files, HTML only).
- **ads.txt md5 = 9e5ab8a9e3daa0f2160b3444d2113bb3** — verified in source before build, after build, and live on toolpixi.com after deploy. Unchanged.
- Live checks (~90 s after push, toolpixi.com): homepage 200 ✓ · all 3 new titles live ✓ · mortgage deep dive + extra-payments FAQ live ✓ · unlock-pdf deep dive live ✓ · currency-converter deep dive live ✓ · GPA worked example (45.7 quality points) live ✓ · typing net-WPM example (47.6) live ✓ · auto-loan → mortgage-calculator link live ✓ · pdf-to-excel → image-to-text link live ✓ · live sitemap = 175 URLs ✓.

## Deliberately left alone, and why

- **The 154 pages that already carry deep dives** (incl. all Rounds 1–2 targets and all 20 unit-pair pages): re-editing proven pages risks the CTR winners (PNG to ICO at 9.2%) for no evidence of gain.
- **Giant-held head terms** (image-compressor pos 67.4, webp-to-jpg pos 72.2): unchanged since Round 1 — not winnable by on-page edits alone.
- **Hubs, guides, legal pages:** hubs already have intro + pick-guide structure; guides are already full articles; legal pages have no query demand.
- **Countdown/event pages:** already deep-dived; their demand is seasonal and date-led, not content-led.

## What to watch at the Dec 2 checkpoint (same checkpoint as Rounds 1–2)

Round 3's bet is breadth of depth: 23 previously thin pages now carry the same answer-first structure as the site's proven pages, which is the December core-update readiness play (complete answers to specific questions) as much as a position play. Watch: (1) impressions appearing/growing on the calculator cluster (mortgage, currency, GPA, auto loan) and the PDF long tail (unlock/protect/organize/compare), where the site previously had pages with no depth to rank; (2) whether "scientific calculator online", "car loan calculator" and "rearrange pdf pages" queries start registering for their pages after the title fixes; (3) site totals against the Nov 25 baseline: **33 clicks / 4,944 imp / CTR 0.7% / avg pos 34.5**. With Rounds 1–3 combined, every tool page on the site now carries a deep-dive section — the on-page sweep Hamza ordered is complete; remaining levers after Dec 2 are the ones the data names next.
