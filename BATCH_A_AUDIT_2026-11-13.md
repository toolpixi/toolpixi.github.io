# ToolPixi — Batch A INDEPENDENT AUDIT, 2026-11-13

Auditor: independent of the builder. Everything below verified from the LIVE site (curl)
and the repo (commit 99d0987), not from the builder's report.
Scope: /disclaimer/, /dmca/, /cookie-policy/, /guides/why-whatsapp-compresses-your-photos/,
/guides/pdf-too-big-to-email/, homepage counters strip + "Popular on ToolPixi" rail.

**OVERALL: 15 SAFE · 0 FIX NEEDED · 0 RISK · 3 observations (cosmetic/future notes only).**
Nothing shipped in Batch A duplicates existing content, and nothing in it should hurt the
pending AdSense review or create a future problem.

---

## A. DUPLICATES

### A1. URL / sitemap duplicates — ✅ SAFE
- Live sitemap: 158 `<loc>` entries, **158 unique** — zero duplicate URLs anywhere.
- Each of the 5 new URLs appears **exactly once**.
- URL variants all **301 → the canonical URL** (tested: www + slash, non-www no-slash,
  http) for the new pages — no second URL serves the same page.
- Canonical tags on all 5 new pages (and the homepage) point to **themselves**.
- /cookie-policy/ vs /privacy/ are distinct pages with distinct canonicals — no overlap issue.

### A2. Legal-page text overlap vs Privacy / Terms — ✅ SAFE
Paragraph-level comparison (difflib) of Disclaimer, DMCA, Cookie Policy against Privacy
Policy and Terms. **No substantive paragraph is >80% identical to an existing page.**
The only matches above 0.80 are:
- "Last updated: …" lines (the dates themselves differ — trivially not content),
- the shared section heading "Third-party code libraries",
- one closing sentence ("If this policy changes, the new version will appear on this page
  with an updated date…", 0.86) — standard closing boilerplate used on every policy page,
- the Google Ad Settings opt-out instruction sentence (0.84) — a functional direction to
  Google's own settings page, deliberately worded the same as in the Privacy Policy.
Judgement: normal legal boilerplate and deliberate cross-policy consistency, **not duplicate
content**. Each new page carries substantial unique substance (Disclaimer 396 words,
DMCA 416, Cookie Policy 528 — real prose, all measured live).

### A3. Tutorials vs the 15 existing guides — ✅ SAFE
- Full-text similarity of each new guide against its closest existing neighbours
  (how-to-compress-a-pdf, pdf-compression-trade-offs, how-to-compress-a-photo-to-an-exact-size,
  how-to-resize-an-image-for-an-online-form): **0.01–0.02**. Shared paragraphs (>0.6 similar):
  **zero**. The two new guides vs each other: 0.01.
- Topics are adjacent (PDF size, photo size) but the questions answered are different
  (email limits/Base64 inflation; WhatsApp's re-encoding/HD/document route) — normal topical
  clustering with internal links, not duplication or doorway behaviour.

## B. ADSENSE / FUTURE RISK — claims read as a reviewer would

### B1. "127 Free tools" (homepage counter) — ✅ SAFE
Independently counted from the live sitemap: 158 URLs − homepage − guides index − 17 guides
− 7 info pages (about/privacy/contact/terms/disclaimer/dmca/cookie-policy) − 5 category hubs
= **exactly 127 tool pages**. The number is literally true. All tools are free (no paywall
exists anywhere on the site).

### B2. "0 Sign-ups needed" — ✅ SAFE
The site has no accounts or sign-up anywhere; both new policies confirm this. True.

### B3. "0 Files ever uploaded" — ✅ SAFE
Architecturally true, not just a promise: ToolPixi is a static site (GitHub Pages) — **no
server exists that could receive a file**; the Nov 12 functional test proved the tools process
client-side. The jsDelivr exception (docx + FFmpeg libraries) concerns *downloading code*,
not uploading user files, and both the Privacy Policy and the new Cookie Policy disclose it
honestly, including that jsDelivr sees the visitor's IP like any web server. The counter
claims files, not network requests — accurate as written.

### B4. Policy consistency (Cookie ↔ Privacy, DMCA, Disclaimer) — ✅ SAFE
- Cookie Policy and Privacy Policy agree on every shared point: no cookies of ToolPixi's own,
  no analytics trackers, AdSense connected for verification, **no ads currently shown**,
  DoubleClick/personalised-ads explanation with the same opt-out routes, the same jsDelivr
  pair (docx + FFmpeg). The Cookie Policy's extra detail (favourites/recently-used live in
  browser local storage, never transmitted) adds information; it contradicts nothing —
  local storage is not a cookie, and Privacy never claims no local storage exists.
- **DMCA contact email = contact@hamzaalibasra.com — matches the live Contact page exactly**
  (it is the only email on the Contact page). Same address on Disclaimer and Cookie Policy.
- DMCA process claims are operable and accurate: notice contents mirror §512(c)(3);
  the 10–14-business-day counter-notice restoration window mirrors §512(g); the statements
  "ToolPixi hosts no user content / there is no user content on this site to take down" are
  literally true (no uploads, no UGC, no server). The one operational promise ("we review
  every complete notice promptly… we will reply") routes to a monitored inbox.
- Disclaimer contradicts nothing on the tool pages; it is protective (verify results,
  not professional advice) and names real tools (BMI, pregnancy due-date, loan/VAT —
  all present in the sitemap).

### B5. Tutorial factual claims — ✅ SAFE
- PDF guide: Gmail 25 MB ✓, Outlook.com 20 MB ✓, Yahoo 25 MB ✓; Base64 inflation "roughly a
  third" ✓; ZIP on an already-compressed PDF gains only a few percent ✓. Its description of
  the Compress PDF tool ("the largest target — 500 KB") matches the tool's own page, which
  offers 100KB/200KB/500KB targets ✓. The image-re-render trade-off (text no longer selectable)
  is disclosed openly in the guide — honesty that helps, not hurts, with a reviewer.
- WhatsApp guide: ~1,600 px long-edge resize, 5 MB → 100–300 KB, metadata stripped, HD-quality
  setting path (Settings → Storage and data → Media upload quality), send-as-document steps
  for Android and iPhone — all accurate, and the uncertain figures are hedged ("typically",
  "around", "commonly"). "HD is still a re-encode, not your original file" is correct.

### B6. Thin content / keyword stuffing — ✅ SAFE
Real word counts measured live: guides **847** and **882** words (the builder's figures
reproduce exactly); legal pages 396–528 words of original prose. Anchor texts are descriptive
and varied. No stuffing patterns, no doorway signals.

### B7. Copied text — ✅ SAFE
Three distinctive sentences (the "photocopier tuned for speed" line, "photographs wearing a
document's coat", "bounce-and-apologise cycle") were web-searched in quotes: **zero exact
matches anywhere**. The tutorials are original writing.

### B8. Titles / meta descriptions — ✅ SAFE
Checked across **every page in the repo**, not just the new ones: zero duplicate `<title>`s
and zero duplicate meta descriptions site-wide. The 5 new pages' titles/descriptions are unique.

## C. MECHANICS

### C1. Footer links — ✅ SAFE
/disclaimer/, /dmca/, /cookie-policy/ links present in the footer of: homepage, a tool page
(/image-compressor/), the Guides index, and the new pages themselves (sitewide by template).

### C2. Internal links resolve — ✅ SAFE
All 14 unique internal links from the two tutorials and the Popular rail returned **HTTP 200**
(HEIC to JPG, Image Compressor, Image Resizer, Compress PDF, PDF compression trade-offs guide,
Split PDF, Merge PDF, JPG to PDF, PDF to JPG, Background Remover, QR Code Generator, Password
Generator, Word Counter, YouTube Thumbnail Downloader).

### C3. Template / hygiene — ✅ SAFE
New pages render in the identical template (same header, footer, and the AdSense verification
script — 1 occurrence, same as /privacy/); no hidden-text tricks (no display:none /
visibility:hidden content in any new page). Commit 99d0987 did **not** touch ads.txt (live
ads.txt still carries the single correct line `google.com, pub-9717573976248563, DIRECT,
f08c47fec0942fa0`); robots.txt unchanged and permissive; the sitemap changed only by the +5
new URLs (153 → 158).

---

## Observations (not FIX, not RISK — no action needed for AdSense)
1. The homepage now carries both the pre-existing "Popular tools" card grid and the new
   "Popular on ToolPixi" text rail — a cosmetic redundancy, no policy or SEO impact.
2. The counters line "every tool works on any device with a web browser" is mildly broad
   (the FFmpeg/docx tools need a modern browser) — ordinary generality, identical in spirit
   to the homepage positioning that predates Batch A.
3. The YouTube Thumbnail Downloader fetches images from YouTube's servers using a URL the
   visitor pastes — a download *from* a third party, not a user-file upload; it is disclosed
   in the Privacy Policy's External links section and does not affect the "0 files uploaded"
   claim.

**Bottom line for Hamza: Batch A is clean. No duplicates, no false claims, no contradictions —
the additions are exactly the kind of trust/completeness signals the AdSense review rewards,
and nothing in them needs to change before the verdict.**
