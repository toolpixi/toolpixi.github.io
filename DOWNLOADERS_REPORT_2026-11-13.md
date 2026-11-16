# ToolPixi Downloaders + Ratings — Build Report (2026-11-13)

Built and deployed on Hamza's explicit order of 13 Nov 2026 (~1:09 PM PKT): "Downloaders bhi abhi banao — risk samajh kar mera faisla hai." The AdSense-verdict hold is off by his decision.

**Result: 5 of 7 downloaders LIVE and evidence-tested; 2 deliberately NOT built (no login-free public route exists — details below). Ratings live on all 132 tool pages.**

---

## 1. Backend — Cloudflare Worker "toolpixi-api"

- **Worker source:** `~/workspace/toolpixi-api/worker.mjs` (deploy helpers beside it: `cfw.py`, `cfdeploy.py` — multipart script upload via the vault "Hana Full Access" token surrogate; no wrangler needed).
- **Canonical URL:** https://toolpixi-api.toolpixi-api.workers.dev (workers.dev subdomain `toolpixi-api` was created on the account via API for this).
- **Site API base (what the pages call):** https://api.mythpost.com — a Workers route (`api.mythpost.com/*` → script `toolpixi-api`) + proxied AAAA record on the mythpost.com zone, same Cloudflare account. Reason: this sandbox VM cannot reach `*.workers.dev` at all (edge resets the connection), so the custom-domain route was the only way to test end-to-end from here; it is also a stable, brand-owned endpoint. Both URLs serve the same worker.
- **Endpoints:**
  - `POST /api/resolve {platform, url, kind}` → `{ok, platform, title, thumbnail, options:[{url, type, quality, ext}]}`. For Facebook/Instagram/X the option URLs are wrapped in our own download proxy; for TikTok they are direct (see flags).
  - `GET /api/dl?u=<media url>` → streams the file with `Content-Disposition: attachment`. Host allowlist only (fbcdn.net, cdninstagram.com, tiktok.com/tiktokcdn/tiktokv, twimg.com, byteimg, akamaized). Nothing is stored.
  - `POST /api/rate {tool, stars 1–5}` and `GET /api/ratings?tool=<slug>` → `{count, average}`.
  - `GET /api/health` → `{ok:true}`.
- **Ratings storage — Durable Object (SQLite), not KV/D1:** the account token returned **401 on every KV and D1 call** (its grants are Pages Edit / Workers Scripts Edit / Account Settings Read — no KV/D1 permissions). A SQLite-backed Durable Object class ships inside the script upload itself, so it works under Workers Scripts Edit. One global instance, table `ratings(tool, cnt, total)`; atomic increments; only slug + counts stored, no personal data.
- **CORS:** `https://toolpixi.com` / `https://www.toolpixi.com` only.
- **Cost:** Workers free tier (100k requests/day) + free DO SQLite. $0.

## 2. Per-tool verdicts with test evidence

Every shipped tool was tested against a real public post through the DEPLOYED worker; the returned media URL was HEAD/ranged-GET checked.

### ✅ Facebook Video Downloader — LIVE
- Route: `facebook.com/plugins/video.php` embed page → `hd_src`/`sd_src` (fallback: watch-page `browser_native_hd_url`/`browser_native_sd_url`). No login, no cookies.
- Test: `https://www.facebook.com/MarsCuriosity/videos/923746871008622/` → HD + SD options.
  - Raw media: `https://video-lax3-2.xx.fbcdn.net/o1/v/t2/f2/m412/AQO5U_dt8….mp4?…` → **HEAD 200, video/mp4**.
  - **In-browser download through our proxy completed: `toolpixi-download.mp4`, 4,183,005 bytes** (exactly the file size the prototype measured independently).
- Also tested: BBC video `watch/?v=429869528334023` → HD + SD (raw HEAD 200 video/mp4, 25,485,870 bytes per prototype).
- Page: https://toolpixi.com/facebook-video-downloader/

### ✅ TikTok Video Downloader — LIVE
- Route: watch-page `__UNIVERSAL_DATA_FOR_REHYDRATION__` → `itemStruct.video.bitrateInfo[].PlayAddr.UrlList`, selecting the `tiktok.com/aweme/v1/play` URL in each list. (The raw v16/v19 CDN `playAddr`/`downloadAddr` URLs answer **403** to direct fetches — prototype-verified — so they are never offered.)
- Tests: `@scout2015/video/6718335390845095173` → 5 quality options (992–2241 kbps); `@dancingtrends24/video/7690359798990146847` → 4 options.
  - Raw media (top option): `https://www.tiktok.com/aweme/v1/play/?faid=1988&file_id=6a93ef99…` → **ranged GET 206, video/mp4, body starts `ftypisom`** (real MP4 bytes).
- Watermark honesty: options are TikTok's own clean web-player streams (the in-app download is the stamped copy); the page says exactly that and never claims we process the video.
- Page: https://toolpixi.com/tiktok-video-downloader/

### ✅ X (Twitter) Video Downloader — LIVE
- Route: `cdn.syndication.twimg.com/tweet-result?id=<id>&token=…` (the same public feed X's embeds use) → `mediaDetails[].video_info.variants`, bitrate-sorted. Photos in a post are listed too; GIFs arrive as MP4 (which is what they are on X).
- Test: `https://x.com/SpaceX/status/1336849897987796992` → 3 MP4 variants (2176 / 832 / 256 kbps).
  - Raw media (top): `https://video.twimg.com/ext_tw_video/1336848931783786497/pu/vid/1280x720/hgx7ug6ui58DvPVF.mp4?tag=10` → **HEAD 200, video/mp4, 2,272,419 bytes**.
- Page: https://toolpixi.com/twitter-video-downloader/

### ✅ Instagram Photo Downloader — LIVE
- Route: `GET instagram.com/p/<code>/media/?size=l` → 302 → full-size scontent JPEG (the /p/ form; works even for reels, returning the poster).
- Tests: `@natgeo /p/DUvuq9EEghG/` and `@natgeosociety /p/DR0NhcoD6jN/` → photo options.
  - Raw media: `https://scontent-lga3-2.cdninstagram.com/v/t51.82787-15/587544908_….jpg?…` → **HEAD 200, image/jpeg, 194,856 bytes** (matches the prototype's independent measurement exactly).
- Honest limit stated on the page: multi-photo posts return their first (cover) photo.
- Page: https://toolpixi.com/instagram-photo-downloader/

### ✅ Instagram Reel & Video Downloader — LIVE (one fragility flag, §4)
- Route: the browser-UA page is an empty JS shell and the embed page leaks **no** video (prototype-verified). What works login-free: the **crawler rendering** of the same public page (Googlebot UA) → DASH manifest in the SSR payload. The worker HEAD-probes the manifest's MP4 renditions and offers only the largest — verified to be the complete muxed file (smaller renditions are video-only/audio-only fragments and are deliberately not offered).
- Test: `@nasahubble /reel/DFdt1VAOWhR/` → 1 option "Reel video · 7.4 MB".
  - Raw media: `https://scontent-sea5-1.cdninstagram.com/o1/v/t2/f2/m367/AQP5nxnB….mp4?…` → **HEAD 200, video/mp4, 7,716,372 bytes** — byte-for-byte the file the prototype downloaded and ffprobe-verified as h264 720×1280 + AAC (muxed, playable).
- Page: https://toolpixi.com/instagram-video-downloader/

### ❌ WhatsApp DP Viewer/Downloader — NOT BUILT (infeasible, by the brief's hard rule)
WhatsApp has never published a login-free endpoint for a profile photo by number. Profile pictures live inside the authenticated WhatsApp protocol; every library (Baileys, whatsapp-web.js) and every hosted API (Maytapi, Whapi, …) fetches them from **a connected WhatsApp session** — sites offering "enter a number, no login" are fronting their own pooled logged-in sessions (or are scams). Building this would require running a logged-in WhatsApp account as a resolver — exactly the login-based access the brief prohibits. No page was created; the slug does not exist on the site.

### ❌ Instagram Story Viewer/Downloader — NOT BUILT (infeasible, by the brief's hard rule)
Stories are served only from session-authenticated endpoints (`/api/v1/feed/reels_media/`, story GraphQL) requiring `sessionid` cookies — prototype-verified live: unauthenticated calls return the HTML login shell, and `/stories/<user>/` returns an empty shell with zero media URLs. Even Instaloader documents stories as "Requires login". The "no-login story viewer" sites that exist run pooled logged-in Instagram sessions server-side — a third-party resolver pattern the brief excludes. No page was created; the FAQ on the Instagram video page states plainly why stories are out of scope.

## 3. Ratings

- Widget on **every tool page** (all 132, injected centrally in `layout()` before "Related tools"): 5 stars, real average + count from the API once votes exist ("Rated 5.0 / 5 by 1 person"), "No ratings yet — be the first" before that. A page's own vote is remembered in the visitor's browser only (localStorage) so the widget can say thanks.
- **No AggregateRating schema anywhere** (grep-verified 0 occurrences) — schema only after genuine ratings accumulate, per the brief.
- UI test (Playwright, in-browser): on the Instagram Photo Downloader page the meta went from "No ratings yet — be the first." to "Rated 5.0 / 5 by 1 person · You rated it 5★" after clicking 5 stars.
- **Test-vote disclosure:** the ratings DB currently contains only QA votes cast by me during testing — `probe-tool` (a non-existent slug): 2 votes, avg 4.0 · `facebook-video-downloader`: 2 votes, avg 5.0 · `word-counter`: 1 vote, avg 4.0 · `instagram-photo-downloader`: 1 vote, avg 5.0. They are real rows; Hamza should know the seed numbers on those two real tools include my test votes.
- **Bug found and fixed by testing:** the first version returned the Durable Object's responses directly, which dropped the CORS headers on `/api/ratings` + `/api/rate` (votes landed server-side but browsers couldn't read the response). Fixed by re-wrapping DO responses with CORS (`withCors`) and re-verified via curl (ACAO present) and in-browser.

## 4. Flags (transparency)

1. **No third-party resolver APIs are used anywhere.** All resolution happens inside our own worker against the platforms' own public surfaces.
2. **Instagram reels rely on Instagram's crawler rendering** (Googlebot user-agent on the public page). It is login-free and serves only public posts, but it is not an official API — Instagram can change the SSR payload or throttle datacenter IPs at any time. If it breaks, the tool returns a clear "try again in a minute / may be private" error rather than fake results. This is the one genuinely fragile route in the set.
3. **TikTok downloads are not proxied.** TikTok refuses the play endpoint and its CDN from Cloudflare's datacenter IPs (the worker gets a 404 redirect; raw CDN URLs 403 from datacenters), while ordinary browsers get the file directly (206 video/mp4 — verified from a non-datacenter fetch). So TikTok options link straight to TikTok's `aweme/v1/play` URLs and open in a new tab; the page and the results note explain the right-click → "Save link as" fallback if a browser plays the video inline instead.
4. **Homepage grouping:** the five downloaders sit in the **Text & Generators family** (category `text`, beside the YouTube Thumbnail Downloader), so they appear in the nav dropdowns, mega menu, mobile menu, homepage catalogue and the text-tools hub with zero edits to `home_body`. A dedicated "Downloaders" tab was **not** added: the tab system itself was superseded the same day by Hamza's all-tools-visible homepage order, and a parallel agent was rewriting `home_body()` concurrently (its catalogue commit `adcac95` landed during this build). If Hamza wants a dedicated Downloaders section/tab in the new homepage design, it is a small follow-up in that design — flagged here for the parent agent rather than silently merged into a moving file.
5. Facebook titles: for some videos Facebook's embed/og data yields only its generic name; the worker then returns no title (the UI simply shows no caption line) rather than printing "Facebook".

## 5. Site changes & guardrails

- **Tools: 127 → 132.** Homepage counter renders 132 (auto from `len(TOOLS)`, live-verified). New slugs: `instagram-video-downloader`, `instagram-photo-downloader`, `tiktok-video-downloader`, `facebook-video-downloader`, `twitter-video-downloader`.
- **Sitemap: 158 → 163 URLs** (live-verified).
- **ads.txt: byte-identical.** md5 before = after = live: `9e5ab8a9e3daa0f2160b3444d2113bb3`.
- **No existing URL or title changed.** Every page was rebuilt (all tool pages gained the ratings widget + the day's CSS version string); visible content of existing pages is otherwise untouched.
- **Copy rules honoured:** every downloader page carries the honest server-processing note ("How this tool differs"), public-posts-only wording, a rights/DMCA section linking the live `/dmca/` page, how-to steps, a deep-dive section and an honest FAQ (+ FAQPage schema). Meta descriptions for downloaders were written to include "Free" + "no sign-up" so the generic `_seo_desc` suffix ("runs 100% in your browser…") is **not** appended to them — verified in the built HTML.
- **Privacy Policy:** ONE additive section added ("Downloader tools and tool ratings (added 13 November 2026)") covering downloader link-processing (sent to our server, not stored) and anonymous rating counts. No existing text rewritten (the "Last updated" line was left as-is; the new section carries its own date marker).
- **Assets added:** `assets/js/downloaders.js`, `assets/js/ratings.js`; rating-widget styles appended to `assets/css/style.css` (rides the day's `?v=20261113c` cache-bust).

## 6. Testing summary (evidence, not claims)

- Worker API: all 5 platforms resolved through the deployed worker; raw media HEAD/ranged-GET checks recorded in §2.
- Playwright (local build served as https://toolpixi.com via route interception, against the deployed worker):
  - Facebook flow: 2 rows (HD/SD); **real in-browser download completed, 4,183,005 bytes, no failure**.
  - TikTok flow: 5 rows with direct aweme links. Instagram reel: 1 row (7.4 MB, proxied). X: 3 rows. Instagram photo: 1 row.
  - Ratings UI: vote cast → meta updated in-page (§3).
  - Mobile 390px (Facebook downloader page): scrollWidth = 390 (no horizontal overflow), 2 rows rendered.
  - **Zero page errors** on every flow. Console showed only platform-thumbnail resource noise (CORB/403 on hot-linked preview images — the preview hides itself on error) — no JavaScript errors from site code.
- Live post-deploy checks: all 5 new pages HTTP 200; both new JS files 200; live sitemap 163; live ads.txt md5 matches; homepage counter 132; Privacy section live; homepage catalogue contains the downloader tiles.

## 7. Deploy

- Site: standard recipe (`build.py` → rsync with the usual excludes → repo `toolpixi/toolpixi.github.io`), commit **`c157f80`** on `main`, pushed and live-verified.
- Worker: script `toolpixi-api`, deployed via `~/workspace/toolpixi-api/cfdeploy.py` (multipart upload). Redeploy = edit `worker.mjs`, rerun that script with the same metadata JSON (bindings only; migrations were only needed on the first upload).
- Worker DNS/route created for this: AAAA `api.mythpost.com` → `100::` (proxied), route `api.mythpost.com/*` → `toolpixi-api`; workers.dev subdomain `toolpixi-api` registered on the account.

## 8. Header "My Toolbox" button (follow-up order, same day ~1:31 PM PKT) — LIVE

Commit **`48e2e3f`** (on top of `c157f80`). Hamza: "header me lagana hai ya menu me, jahan behtar lage — desktop ke accordingly bhi setup kar dena aur mobile ke accordingly bhi."

**Placement chosen (both, each where it fits):**
- **Desktop (≥880px):** a pill button in the shared header, immediately after the main nav — star icon + "My Toolbox" label + a teal count badge (e.g. `★ My Toolbox [3]`) that appears only when favourites exist. No change to the dropdown menus; verified no header overflow at 1440px.
- **Mobile (<880px):** the same pill sits beside the hamburger (star + count badge; the text label collapses away under 640px so a 360px header cannot overflow — verified scrollWidth = viewport at both 390px and 360px), **plus** a prominent first row inside the mobile menu panel ("☆ My ToolPixi Toolbox · N saved") above the category grid.
- The button is emitted by the shared `header()` in build.py, so it appears on **every page** of the site.

**Behaviour (favs.js, same `tp_favs` store as the Toolbox):**
- Count syncs live: starring/unstarring any tool updates the header badge without a reload (verified 2 → 3 → 2), and cross-tab changes sync via the `storage` event.
- With saved tools: clicking scrolls smoothly to the homepage "My ToolPixi Toolbox" section (`/#favourites`) — same-page, cross-page (tool page → homepage), direct `/#favourites` arrival, and even same-document hash jumps (a `hashchange` handler re-renders + scrolls) all land with the section in view.
- With **0 favourites**: never a dead click — it goes to the homepage tools catalogue and shows a hint toast: "Tap ☆ on any tool to save it to your Toolbox — your saved tools will live here." (Cross-page clicks carry the hint via sessionStorage.)
- Stylesheet cache-bust bumped `?v=20261113c` → `?v=20261113d` for the new header styles.

**Playwright verification (local build served as toolpixi.com; harnesses `~/workspace/tp-func-test-scratch/toolbox_btn_check.py` + `toolbox_btn_d.py`):**
- Desktop 1440, tool page, 0 favs: button visible, count badge hidden, no overflow; click → homepage + hint toast shown; zero page errors.
- Desktop 1440, homepage, 2 favs seeded: badge "2", star filled ★, Toolbox section visible; click → section scrolled into view; star a tile → badge 3 without reload; unstar → back to 2; zero page errors.
- Mobile 390px and 360px, 2 favs: button visible beside the hamburger, label collapsed, scrollWidth == viewport (no overflow); menu opens, Toolbox row is the panel's first item with "· 2 saved"; clicking it closes the panel and scrolls the Toolbox section into view; zero page errors.
- Arrivals: same-document `location.hash = 'favourites'` and a cross-page header click from a tool page both end with the section in view.

**Live verification (after deploy):** the GitHub Pages build for this commit sat queued ~11 minutes (status "building", duration 0) before completing in 47s with no error; afterwards: `class="toolbox-btn"` present in live HTML on the homepage and a tool page, `class="menu-toolbox"` row present, `style.css?v=20261113d` served with the new `.toolbox-btn` rules, live `favs.js` contains the new logic, ads.txt md5 still `9e5ab8a9e3daa0f2160b3444d2113bb3`, sitemap still 163, downloader pages still 200.

## Downloaders section + menu (follow-up, Hamza's order Nov 13 ~1:50 PM PKT)

Deploy commit: **`19fb13b`** (on top of `48e2e3f`). The downloaders now have their own visible home; nothing about the registry, hubs, URLs, titles or metas changed.

### What shipped

- **Homepage "Downloaders" section** — a dedicated `cat-group` (id `downloaders`) placed **first in the catalogue, right after the "Popular on ToolPixi" rail and before the Image Tools group**. Heading "Downloaders" + sub-line ("Save public videos and photos from Instagram, TikTok, Facebook and X — and grab any YouTube thumbnail in HD. Paste the link, download the file.") + compact tiles for exactly the 6 tools: Instagram Reel & Video, Instagram Photo, TikTok, Facebook, X (Twitter), YouTube Thumbnail.
- **Homepage-only regrouping** — implemented as a slug list (`DOWNLOADER_SLUGS` in build.py) consumed by `home_body()`; the 6 are pulled OUT of the homepage Text group (31 → 25 tiles) so every tool appears **exactly once** on the homepage. Registry categories untouched: the **Text hub page keeps all 31 tools** (verified live — downloader links still present on /text-tools/).
- **Menu** — desktop: a new **"Downloaders" nav dropdown** after the category items (links to `/#downloaders`), built with the same `nav_dd_row` pattern (icon + full name, 6 rows) via a new `nav_dropdown_slugs()` helper. Mobile: a **"Downloaders" menu group** in the panel, after the five category groups and before the ToolPixi misc group (6 links, same `menu_tool_link` pattern). Header "My Toolbox" pill untouched in structure and behaviour.
- **Header fit fix (necessary side-effect, CSS-only)** — the extra nav item widened the desktop header row (nav 911 → 1046px) past the 1080px wrap, spilling the Toolbox pill off-screen even at 1440px (scrollWidth 1526). Fix, scoped to ≥880px and to top-level links only (dropdown internals untouched): nav link padding 13px → 8px, font 14.5 → 13.5px, nav gap 2 → 0, header gaps 12 → 8px, wrap side padding 16 → 10px, pill padding tightened; plus the pill's label collapses to star + count at 880–1240px (the same collapse it already had under 640px). Stylesheet cache-bust bumped `?v=20261113d` → `?v=20261113e`. Result: nav is 878px and **scrollWidth == innerWidth at every desktop width tested (1100 / 1200 / 1280 / 1366 / 1440 / 1600)** — this also repairs the milder spill the previous build already had at 1100–1366px.

### Verification (Playwright harness `dl_section_check.py`, local build then LIVE — identical results)

- Homepage groups in order: **downloaders 6 · image 33 · pdf 12 · date 33 · text 25 · calc 23 = 132 tiles, 132 unique hrefs** — no tool duplicated anywhere in the catalogue.
- Desktop nav: Downloaders dropdown present (href `/#downloaders`, label "Downloaders", 6 rows); hover → visible (opacity 1); Image Tools dropdown intact (33 rows); mega menu unbroken. Tool page (/word-counter/) carries the same header: dropdown 6 rows, menu group 6 links, Toolbox pill present.
- Search: "tiktok" → only the Downloaders group stays, exactly 1 tile (TikTok Video Downloader); "instagram" → 2 downloader tiles; clearing restores all 132.
- Favourite star on the TikTok tile: `tp_favs` gains the slug, star fills, Toolbox section appears with the card, header badge shows "1".
- Mobile 390px and 360px: Downloaders section visible (6 tiles), scrollWidth == viewport, menu opens to the Downloaders group (6 links, order: …Converters & Calculators → **Downloaders** → ToolPixi), menu closes again cleanly.
- **Zero JS errors** in every context (desktop, tool page, both mobiles), local and live.
- **Invariants:** ads.txt md5 `9e5ab8a9e3daa0f2160b3444d2113bb3` before, after and live (byte-identical); sitemap still **163** URLs; change set was exactly 164 files (163 pages with the shared header/CSS version + style.css) — no adds, no deletions, no URL/title/meta changes.
- Screenshots: `~/workspace/tp-func-test-scratch/dl_section_desktop.png` (nav + open Downloaders dropdown), `~/workspace/tp-func-test-scratch/dl_section_mobile_menu.png`.
