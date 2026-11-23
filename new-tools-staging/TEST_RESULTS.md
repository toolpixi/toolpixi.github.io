# Test results — 10 new ToolPixi tools (2026-11-23)

Method: the REAL built pages (output of `python3 build.py` in
~/workspace/toolpixi) served locally on :8901 and driven with headless
Chromium (Playwright). Every test exercises the tool's core function end
to end and captures the actual download. External requests were aborted
so any console error / pageerror counted would be a genuine local fault;
**every page finished with zero JS errors.** Suite:
`tests/run_tests.py` (fixtures in `fixtures/`).

| Tool | Result | Evidence |
|---|---|---|
| typing-speed-test | PASS | Typed the rendered passage programmatically: live WPM computed mid-test at exactly 100% accuracy for exact input; completing the passage opened the result panel with final WPM/accuracy. (First run showed 80% — a test artifact: the passage HTML renders spaces as `&nbsp;`, so the harness typed U+00A0 instead of a spacebar press. Real keystrokes produce 0x20 and score 100%; harness fixed to normalise, re-run PASS.) |
| meme-generator | PASS | Built-in "Spotlight" scene + top/bottom text rendered (canvas data URL 303,482 chars); Download produced a valid PNG, 227,595 bytes, correct PNG signature. |
| gif-maker | PASS | 3 fixture photos -> Create GIF -> downloaded file starts `GIF89a`, 10,558 bytes (gif.js + self-hosted worker). |
| qr-code-scanner | PASS | QR fixture (a code encoding `https://toolpixi.com/qr-code-scanner-test-12345`) decoded to exactly that string via jsQR. Barcode mode: PIL-drawn EAN-13 fixture decoded via ZXing to exactly `5901234123457`. |
| resume-builder | PASS | Filled name/title/experience/skills -> live A4 preview contained the entered name and role; Download produced a valid jsPDF file, 4,839 bytes, `%PDF-` header. |
| image-to-text | PASS | OCR fixture (known text) recognised by self-hosted Tesseract: "The quick brown fox / jumps over the lazy dog / Total: 12345 dollars" — all asserted strings found verbatim, incl. the number. |
| invoice-generator | PASS | Item 2 × $50 -> live subtotal $100.00; tax set to 10% -> total $110.00 (discount-before-tax order). PDF download valid, 5,894 bytes, `%PDF-` header. |
| screen-recorder | PASS (full cycle) | With the fake media device, capture started, recorded ~1.5 s, Stop produced the preview + download state. Graceful unsupported/error paths are in the code for browsers without capture; a real screen pick needs a human at the browser picker, which is the one step no automation can perform. |
| video-to-gif | PASS | 3 s MP4 fixture (320×240) converted by the self-hosted ffmpeg.wasm -> valid GIF header, 567,521 bytes (30 frames at 480px wide). |
| photo-collage-maker | PASS | 4 fixture photos placed in the 2×2 grid — canvas pixel sampling at the 4 cell centres returned the 4 distinct photo colours; PNG export valid, 51,096 bytes. |

## Build / integration facts
- Catalogue 122 -> **132 tools**; sitemap 157 -> **167 URLs**; homepage shows "132 free tools".
- ads.txt md5 before and after: `9e5ab8a9e3daa0f2160b3444d2113bb3` (unchanged).
- All libraries self-hosted under `assets/vendor/` (gif.js + worker, jsQR,
  ZXing lazy-loaded in barcode mode only, jsPDF, Tesseract engine+worker+
  cores+English data lazy-loaded on first OCR use). No external runtime
  dependency was added.
- Sequencing gate: the 38-tool removal was confirmed live (122 tiles +
  removal commit 5b0603e in toolpixi-repo) before build.py was touched.

## Deploy (2026-11-23)
- Commit **a94f71b** in toolpixi-repo, pushed to origin/main.
- Live verification after ~90s: homepage shows "132 free tools"; all 10 new
  URLs return 200 with their tool panel present; all 10 engine JS files
  serve 200; live sitemap = 167 URLs; live ads.txt md5 =
  9e5ab8a9e3daa0f2160b3444d2113bb3 (unchanged); vendor files (gif.js,
  tesseract worker) serve 200; /new-tools-staging/ is 404 (scaffolding
  removed from the repo in this commit).
- Note: commit 08cbfef (removal job's follow-up) had swept the staging
  folder and the new vendor libs into the repo; the vendor libs were
  therefore already tracked and identical, and this deploy removed the
  staging folder from the repo.
