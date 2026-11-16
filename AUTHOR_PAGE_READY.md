# ToolPixi — Founder/Author Page: READY TO APPLY (DO NOT DEPLOY EARLY)

**Status:** Prepared 2026-11-15 on Hamza's order ("ToolPixi wala ready rakhna").
ToolPixi is mid-AdSense-review — **nothing in this file has been applied.** `build.py`
is untouched, no build has been run, nothing is deployed or pushed.
**Apply only on the day ToolPixi's AdSense verdict arrives**, using the checklist in §4.

**Target URL:** https://toolpixi.com/author/hamza-ali-basra/
**Model:** MythPost's live author page (structure only — this copy is written fresh in
ToolPixi's voice, not copied).
**Photo:** no new asset needed — `/assets/founder-hamza.jpg` (480×480) already ships
with the site and is already used by the About page's Founder block.

---

## 1. Final page copy (exactly as it will read on the page)

**Title tag:** Hamza Ali Basra | ToolPixi
**Meta description:** Hamza Ali Basra — founder of ToolPixi, Grab AI Tool, DailyWallPix
and MythPost. Why he built free browser tools that never upload your files, what the
tools do, and where to find his other projects.
**H1:** Hamza Ali Basra
**Lede:** Founder of Grab AI Tool, ToolPixi & DailyWallPix — and the person who built
every tool on this page.

**Intro block** (photo + text, reusing the About page's founder-block styling):

> Hamza Ali Basra is an entrepreneur and the founder of Grab AI Tool, ToolPixi and
> DailyWallPix. He builds small, honest web products and runs them himself — ToolPixi
> has no team, no support department and no ticket queue; the person who wrote these
> tools is the person who answers the mail. His personal website is hamzaalibasra.com.

**Why I built ToolPixi**

> Every tool site I used wanted the same thing first: my file. Upload your PDF, upload
> your photo, wait in a queue, and trust that a stranger's server deletes it afterwards.
> For a passport scan, a signed form or a family photo, that trade never sat right with
> me — so I built the version I wanted to use. Every ToolPixi tool runs entirely in
> your browser, on your own device. Your files never leave your device: no uploads, no
> servers, no sign-ups. Close the tab and nothing remains, because nothing was ever
> sent anywhere.

**What ToolPixi does**

> ToolPixi is a free collection of 126 online tools (the count is automatic — it grows
> as new tools ship): image compressors that shrink a photo to the exact kilobyte size
> a form demands, converters for HEIC, PNG, WebP and PDF files, PDF merging, splitting
> and compression, calculators, countdowns and everyday utilities in between. Each tool
> does one job, states its limits plainly on its own page, and finishes in seconds.
> Where a result involves a trade-off — a little sharpness for a smaller file, text
> that stops being selectable after compression — the page says so before you rely on
> it. That honesty is deliberate: a tool you can trust beats a tool that promises magic.

**My other projects**

> - **Grab AI Tool** (grabaitool.com) — a directory for finding and comparing AI tools,
>   so people can choose AI software without overpaying for it.
> - **DailyWallPix** (dailywallpix.com) — a free phone-wallpaper library, refreshed
>   daily.
> - **MythPost** (mythpost.com) — a news site built on one rule: every story carries a
>   verdict on what is actually true.
>
> The through-line is the same in all four: verify before you trust, say plainly what a
> thing can and cannot do, and let reputation compound.

**Coverage & elsewhere**

> Hamza's founder interview appeared in ValiantCEO Magazine ("Hamza Ali Basra of Grab
> AI Tool on Turning Complexity into Clarity", October 2026). You can also find him on
> Facebook, Instagram, X and TikTok — every profile is @hamzaalibasra — and at his
> personal website, hamzaalibasra.com.

**Questions**

> Questions about a tool, a correction, or an idea for a tool that does not exist yet:
> use the contact page or email contact@hamzaalibasra.com. I read everything myself
> and reply personally.

---

## 2. Person JSON-LD schema (same pattern as MythPost's author page)

This goes at the end of the page body (build.py has no generic extra-schema hook —
FAQ schema is the only auto-appended graph, so the ProfilePage block ships as its own
`<script>` tag inside the body, which is valid and read by Google the same way).

```html
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": {"@type": "Person", "name": "Hamza Ali Basra", "jobTitle": "Founder of Grab AI Tool, ToolPixi & DailyWallPix", "url": "https://hamzaalibasra.com", "image": "https://toolpixi.com/assets/founder-hamza.jpg", "worksFor": {"@type": "Organization", "name": "ToolPixi", "url": "https://toolpixi.com/"}, "sameAs": ["https://hamzaalibasra.com", "https://www.facebook.com/hamzaalibasra", "https://www.instagram.com/hamzaalibasra", "https://x.com/hamzaalibasra", "https://www.tiktok.com/@hamzaalibasra"]}}</script>
```

---

## 3. Exact build.py insertion plan (3 small edits, minutes to apply)

### How build.py works (verified 2026-11-15, build.py = 6,989 lines)

- Static pages are dicts in lists: `PAGES` (tools), `GUIDE_PAGES`, `INFO_PAGES`.
  The About page lives in **`INFO_PAGES`**, which starts at the line
  `INFO_PAGES = [` — its first entry is `dict(slug="about", ...)` (line 6718).
- `main()` (line 6865) emits **every** page generically: for any non-empty slug it runs
  `os.makedirs(ROOT/<slug>)` and writes `<slug>/index.html`. A nested slug
  `"author/hamza-ali-basra"` therefore produces `author/hamza-ali-basra/index.html`,
  served at `/author/hamza-ali-basra/` — **no new routing code needed.**
- `layout()` builds the canonical as `BASE_URL + "/" + slug + "/"`, i.e.
  `https://toolpixi.com/author/hamza-ali-basra/` automatically.
- **Sitemap: AUTO-GENERATED.** `main()` builds the URL list from every emitted page
  (skipping only `noindex` pages) and rewrites `sitemap.xml` on every build. Adding
  the dict below is all it takes — the new URL appears in the sitemap by itself.
  (`llms.txt` is also auto-generated and does not list the author page; no edit needed.)

### Edit A — add the page dict to INFO_PAGES

Insert the block below **immediately after the About dict closes** — i.e. between the
About entry's closing line `</section>"""),` and the next line
`    dict(slug="privacy", title="Privacy Policy | ToolPixi",`.

```python
    dict(slug="author/hamza-ali-basra", title="Hamza Ali Basra | ToolPixi",
         desc="Hamza Ali Basra — founder of ToolPixi, Grab AI Tool, DailyWallPix and MythPost. Why he built free browser tools that never upload your files, what the tools do, and where to find his other projects.",
         body=page_head("Hamza Ali Basra", "Founder of Grab AI Tool, ToolPixi &amp; DailyWallPix — and the person who built every tool on this site.")
         + """<section class="section">
<div class="founder-block">
<img class="founder-photo" src="/assets/founder-hamza.jpg" alt="Hamza Ali Basra" width="120" height="120">
<p><strong>Hamza Ali Basra</strong> is an entrepreneur and the founder of <a href="https://grabaitool.com/">Grab AI Tool</a>, <a href="https://toolpixi.com/">ToolPixi</a> and <a href="https://dailywallpix.com/">DailyWallPix</a>. He builds small, honest web products and runs them himself — ToolPixi has no team, no support department and no ticket queue; the person who wrote these tools is the person who answers the mail. His personal website is <a href="https://hamzaalibasra.com/">hamzaalibasra.com</a>.</p>
</div>
<h2>Why I built ToolPixi</h2>
<p>Every tool site I used wanted the same thing first: my file. Upload your PDF, upload your photo, wait in a queue, and trust that a stranger's server deletes it afterwards. For a passport scan, a signed form or a family photo, that trade never sat right with me — so I built the version I wanted to use. Every ToolPixi tool runs entirely in your browser, on your own device. <strong>Your files never leave your device</strong>: no uploads, no servers, no sign-ups. Close the tab and nothing remains, because nothing was ever sent anywhere.</p>
<h2>What ToolPixi does</h2>
<p>ToolPixi is a free collection of __N__ online tools: image compressors that shrink a photo to the exact kilobyte size a form demands, converters for HEIC, PNG, WebP and PDF files, PDF merging, splitting and compression, calculators, countdowns and everyday utilities in between. Each tool does one job, states its limits plainly on its own page, and finishes in seconds. Where a result involves a trade-off — a little sharpness for a smaller file, text that stops being selectable after compression — the page says so before you rely on it. That honesty is deliberate: a tool you can trust beats a tool that promises magic.</p>
<h2>My other projects</h2>
<ul>
<li><strong><a href="https://grabaitool.com/">Grab AI Tool</a></strong> — a directory for finding and comparing AI tools, so people can choose AI software without overpaying for it.</li>
<li><strong><a href="https://dailywallpix.com/">DailyWallPix</a></strong> — a free phone-wallpaper library, refreshed daily.</li>
<li><strong><a href="https://mythpost.com/">MythPost</a></strong> — a news site built on one rule: every story carries a verdict on what is actually true.</li>
</ul>
<p>The through-line is the same in all four: verify before you trust, say plainly what a thing can and cannot do, and let reputation compound.</p>
<h2>Coverage &amp; elsewhere</h2>
<p>My founder interview appeared in <a href="https://valiantceo.com/hamza-ali-basra-of-grab-ai-tool-on-turning-complexity-into-clarity/">ValiantCEO Magazine</a> — "Hamza Ali Basra of Grab AI Tool on Turning Complexity into Clarity" (October 2026). You can also find me on <a href="https://www.facebook.com/hamzaalibasra">Facebook</a>, <a href="https://www.instagram.com/hamzaalibasra">Instagram</a>, <a href="https://x.com/hamzaalibasra">X</a> and <a href="https://www.tiktok.com/@hamzaalibasra">TikTok</a> — every profile is @hamzaalibasra — and at my personal website, <a href="https://hamzaalibasra.com/">hamzaalibasra.com</a>.</p>
<h2>Questions</h2>
<p>Questions about a tool, a correction, or an idea for a tool that does not exist yet: use the <a href="/contact/">contact page</a> or email <a href="mailto:contact@hamzaalibasra.com">contact@hamzaalibasra.com</a>. I read everything myself and reply personally.</p>
</section>"""
         + '<script type="application/ld+json">{"@context": "https://schema.org", "@type": "ProfilePage", "mainEntity": {"@type": "Person", "name": "Hamza Ali Basra", "jobTitle": "Founder of Grab AI Tool, ToolPixi & DailyWallPix", "url": "https://hamzaalibasra.com", "image": "https://toolpixi.com/assets/founder-hamza.jpg", "worksFor": {"@type": "Organization", "name": "ToolPixi", "url": "https://toolpixi.com/"}, "sameAs": ["https://hamzaalibasra.com", "https://www.facebook.com/hamzaalibasra", "https://www.instagram.com/hamzaalibasra", "https://x.com/hamzaalibasra", "https://www.tiktok.com/@hamzaalibasra"]}}</script>'),
```

Notes on the block: `__N__` is build.py's own placeholder (the About page uses it too) —
`main()` replaces it with the live tool count, so the page always shows the correct
number (126 today). The `founder-block` / `founder-photo` classes already exist in
`assets/css/style.css`, so the intro renders exactly like the About page's Founder block.

### Edit B — link to the new page from the About page's Founder block

In the About dict's body, find this exact text:

```
</div>
<h2>What's next</h2>
```

Replace it with:

```
</div>
<p><a href="/author/hamza-ali-basra/">More about Hamza Ali Basra, ToolPixi's founder</a></p>
<h2>What's next</h2>
```

(The link goes **after** the founder-block's closing `</div>` on purpose: `.founder-block`
is a flex row, so a second `<p>` inside it would break the layout.)

### Edit C — make layout() type the page as WebPage, not WebApplication

In `layout()` (line 1479), find:

```python
        "@type": "WebPage" if slug in ("about", "privacy", "contact", "terms", "disclaimer", "dmca", "cookie-policy") or slug in HUB_SLUGS or slug.startswith("guides") else ("WebApplication" if slug else "WebSite"),
```

Replace with:

```python
        "@type": "WebPage" if slug in ("about", "privacy", "contact", "terms", "disclaimer", "dmca", "cookie-policy", "author/hamza-ali-basra") or slug in HUB_SLUGS or slug.startswith("guides") else ("WebApplication" if slug else "WebSite"),
```

(One token added to the tuple. Without it the page still works, but its auto-generated
JSON-LD would call it a WebApplication — wrong for a profile page.)

---

## 4. Deploy-day checklist (only on/after the AdSense verdict)

1. Apply Edits A + B + C above to `~/workspace/toolpixi/build.py`.
2. Build: `cd ~/workspace/toolpixi && python3 build.py`
   → confirm the printed page list includes `author/hamza-ali-basra/index.html` and the
   total page count is exactly **one more** than before the patch.
3. Local sanity checks (before anything leaves the machine):
   - `grep -o '<title>[^<]*</title>' ~/workspace/toolpixi/author/hamza-ali-basra/index.html`
     → `Hamza Ali Basra | ToolPixi`
   - `grep -c 'author/hamza-ali-basra' ~/workspace/toolpixi/sitemap.xml` → 1
   - `grep -c 'ProfilePage' ~/workspace/toolpixi/author/hamza-ali-basra/index.html` → 1
   - `md5sum ~/workspace/toolpixi/ads.txt` → must stay `9e5ab8a9e3daa0f2160b3444d2113bb3`
4. Sync to the deploy clone — **note the extra exclude for this prep file, it must
   never go live:**
   `rsync -a --delete --exclude='.git' --exclude='build.py' --exclude='NOTES.md' --exclude='AUTHOR_PAGE_READY.md' ~/workspace/toolpixi/ ~/workspace/toolpixi-repo/`
   Then delete any `growth-batch-*.md` files the sync carried into the clone.
5. Commit + push:
   `cd ~/workspace/toolpixi-repo && git config user.name "toolpixi" && git config user.email "moonalibasra@gmail.com"`
   → `git add -A && git commit -m "Add founder/author page for Hamza Ali Basra"` →
   `gh auth setup-git` → `git push -q origin main`
6. Wait ~90 seconds, then verify live with curl:
   - `curl -s https://toolpixi.com/author/hamza-ali-basra/ | grep -o '<title>[^<]*</title>'`
     → `Hamza Ali Basra | ToolPixi`
   - `curl -s https://toolpixi.com/sitemap.xml | grep -c 'author/hamza-ali-basra'` → 1
   - `curl -s -o /dev/null -w '%{http_code}' https://toolpixi.com/` → 200 (homepage untouched)
   - `curl -s https://toolpixi.com/about/ | grep -c '/author/hamza-ali-basra/'` → ≥1 (new link live)
7. Report to Hamza: author page live + verified, with the URL.
