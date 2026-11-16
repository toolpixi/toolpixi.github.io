# ToolPixi — Downloaders + YouTube Thumbnail Downloader REMOVAL — 2026-11-13 (evening)

Hamza's order (Nov 13 evening, reversing his same-day morning decision): the 5 social-media
downloader tools feel risky for the AdSense review and generally — remove them completely.
Follow-up decision in the same pass: also remove the YouTube Thumbnail Downloader (an old
pre-existing tool) because a tool named "…Downloader" groups with the cleaned-out category
while ToolPixi is in AdSense review.

## What was removed

### Site (build.py — all content lives there)
- **6 registry entries** from TOOLS: instagram-video-downloader, instagram-photo-downloader,
  tiktok-video-downloader, facebook-video-downloader, twitter-video-downloader,
  youtube-thumbnail-downloader. Their TILE dict entries, the YouTube Thumbnail MENU_SHORT
  entry and its ICON_PATHS glyph also removed.
- **6 PAGES.append blocks**: the 5 `downloader_page(...)` pages (with DL_NOTE / DL_RIGHTS /
  `_DL_RELATED` and the whole downloader page-builder block) and the YouTube Thumbnail
  Downloader page builder.
- **Homepage "Downloaders" section**: DOWNLOADER_SLUGS / DOWNLOADER_SLUG_SET definitions,
  the `dl_tiles` / `downloaders_sec` section and its comment block, and the category-loop
  slug-set filter — all deleted. Homepage sections are back to [Toolbox, counters, Popular rail]
  plus the 5 category groups.
- **Nav**: desktop "Downloaders" dropdown (`nav_items.append(... /#downloaders ...)`) and the
  mobile-menu "Downloaders" group deleted; the now-unused `nav_dropdown_slugs()` helper deleted.
- **Deep-dive copy**: all 6 tools' "goes deeper" sections removed from the DEEP dict.
- **Internal links cleaned**: youtube-thumbnail-downloader removed from the related-tools
  lists of word-counter, qr-code-generator, mp4-to-mp3 and video-compressor, from
  POPULAR_HOME and from the homepage Popular rail slug list. Final grep of build.py:
  **zero occurrences** of any of the 6 slugs, and zero "downloader" mentions of any kind.
- **JS assets deleted**: `assets/js/downloaders.js` and `assets/js/yt-thumb.js`
  (each was referenced only by its removed page).
- **Privacy Policy**: the Nov 13 additive section re-headed "Tool ratings (added
  13 November 2026)" — the downloader link-processing half removed, the anonymous-ratings
  sentence kept verbatim in substance. One further minimal edit, flagged: the older
  "External links" paragraph cited the YouTube thumbnail tool as its example ("YouTube
  thumbnail images are fetched … when you use that tool"); with the tool gone the
  parenthetical example was dropped, sentence otherwise unchanged. No other Privacy text touched.
- **Kept unchanged**: DMCA, Disclaimer, Cookie Policy pages; ratings UI on all remaining
  tool pages; "My ToolPixi Toolbox"; hubs; guides; ads.txt (byte-identical, see below).
  style.css untouched (the `.file-list` / `.thumb-preview` rules used only by the removed
  pages are now unused but harmless; no CSS version bump needed).

### Worker (~/workspace/toolpixi-api/worker.mjs)
- Removed: `/api/resolve` (POST) and `/api/dl` (GET) routes, the four platform resolvers
  (resolveFacebook / resolveTikTok / resolveTwitter / resolveInstagram + helpers
  fetchText / unesc / igCode / igMediaImage / GOOGLEBOT_UA), RESOLVERS and DL_HOSTS.
- Kept exactly as-is: `/api/ratings` (GET), `/api/rate` (POST), `/api/health`, CORS handling,
  and the RatingsStore Durable Object class (copied verbatim).
- Redeployed via cfdeploy.py with the standard metadata (RATINGS Durable Object binding);
  upload 200, new deployment tag f22144814e5a4ea6a13def4759401a21.

## Deploy
- Site commit: **6ea0da6** on toolpixi-repo main ("Remove downloaders + YouTube Thumbnail
  Downloader…"). Change set: 8 deletions (6 page files + 2 JS assets), 160 modified files.
- Counts: **tools 132 → 126 · sitemap 163 → 157 URLs**.

## Verification (all actual results)

Local (before deploy):
- `python3 build.py` — OK, "Wrote 157 pages"; sitemap.xml has 157 `<loc>` entries.
- Built-HTML grep: zero references to any of the 6 slugs (only hit anywhere:
  `pre-upgrade-filelist.txt`, a pre-existing internal snapshot file — not a page; it was
  already tracked in the repo before this change and was left as-is).
- Homepage: 126 tiles, 126 unique hrefs; counters show 126; no `id="downloaders"`,
  no "Downloaders" text, no `/#downloaders` link.
- Playwright headless harness on the local build: homepage 126 unique tiles, no Downloaders
  section/nav/menu, live search filter works, word-counter loads ratings.js, text hub has
  0 links to removed tools, **zero JS page errors**.

Live (curl, after deploy):
- All 6 removed URLs return **404**: /instagram-video-downloader/, /instagram-photo-downloader/,
  /tiktok-video-downloader/, /facebook-video-downloader/, /twitter-video-downloader/,
  /youtube-thumbnail-downloader/.
- Homepage: HTTP 200, 126 unique tiles, counter shows 126, no "Downloaders".
- https://toolpixi.com/sitemap.xml: **157 URLs**, zero downloader slugs.
- https://api.mythpost.com/api/health → `{"ok":true,"service":"toolpixi-api"}`.
- POST /api/resolve → **404**; GET /api/dl → **404**.
- GET /api/ratings?tool=word-counter → `{"tool":"word-counter","count":0,"average":null}`
  (ratings DB intact; still empty after the Nov 13 test-vote cleanup).
- /word-counter/ and /compress-pdf/: HTTP 200 with ratings.js + rating widget present.
- /assets/js/downloaders.js and /assets/js/yt-thumb.js → 404; /assets/js/ratings.js → 200.
- Live Privacy page: heading "Tool ratings (added 13 November 2026)", zero "downloader" mentions.
  Live text-tools hub and llms.txt: zero removed-slug references.
- ads.txt md5 before AND after: **9e5ab8a9e3daa0f2160b3444d2113bb3** (unchanged).

## Notes / judgment calls
- One Privacy sentence outside the Nov-13 section was minimally edited (the external-links
  example that named the removed YouTube thumbnail tool) — flagged above; everything else
  in Privacy is byte-identical.
- The Text category's short description still contains the generic word "thumbnails"
  ("Word counts, QR codes, thumbnails and random numbers") — pre-existing generic category
  prose, not a link or reference to the removed tool; left unchanged.
- Nothing else could not be removed cleanly: no dangling internal links, no build errors,
  no JS errors.
