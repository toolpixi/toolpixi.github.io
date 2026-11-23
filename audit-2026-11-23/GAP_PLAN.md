# ToolPixi gap plan — high-demand tools NOT on the site, all 100% in-browser (2026-11-23)
Detail: gap-pdf.md (20 PDF candidates), gap-new.md (new categories). Owner rule: proven very high worldwide demand + no server + fits ToolPixi. Awaiting Hamza's pick before building.

## Phase 1 — quick, full quality, high demand
- Crop PDF — 370K/mo worldwide, SMALL, KD 18, lossless (pdf.js + pdf-lib setCropBox)
- Typing Speed Test — 3.6M/mo, SMALL, pure JS (India-heavy, low CPC)
- QR Code Scanner — ~1.8M/mo global est., SMALL-MED (jsQR/ZXing; desktop + saved-image intent)
- Screen Recorder — 450K/mo, SMALL-MED (getDisplayMedia + MediaRecorder; macOS system-audio caveat stated on-page)
- GIF Maker (images→GIF) — 1.5M/mo, MEDIUM (gif.js)
- Video to GIF — 135K+90.5K US, MEDIUM (reuses self-hosted ffmpeg.wasm)
- Unlock + Protect + Repair PDF — ONE qpdf-WASM bundle, 3 tools (US clusters 40K + 12K + repair); strongest privacy story (no uploading locked file + password to a server)

## Phase 2 — medium builds, big demand
- Meme Generator — 1.83M/mo, MEDIUM (own templates only, never scrape imgflip)
- OCR engine pair: OCR PDF (~25K/mo US cluster) + Image to Text (category leader 4.9M visits/mo) — one tesseract.js engine, two tools
- Organize PDF — ~20K/mo US, SMALL-MED (pdf-lib; extends merge/split code)
- HTML to PDF — 280K/mo worldwide, SMALL (rasterised-text caveat on-page)
- Invoice Generator — 450K/mo, MEDIUM, best ad value (CPC $9-17)
- Photo Collage Maker — ~300K/mo US cluster, MEDIUM (Canvas)

## Phase 3 — the big ones
- Resume Builder — ~1.0M/mo, LARGE, highest value (CPC $5-10); differentiator: no sign-up wall
- PDF to Excel — 2.1M/mo worldwide (biggest single number), MEDIUM, caveat-class: excellent on clean digital tables, garbles scans/merged cells — honest expectations on-page

## Do NOT build (honest verdicts)
Translate PDF (needs server MT), AI PDF Summarizer (needs server LLM + cost), PDF-to-PDF/A (in-browser output fails its own validation), Internet Speed Test (no owned endpoint = theatre), AI Image Upscaler (2x/slow/poor in-browser), Redact PDF overlay version (text stays extractable — only rasterise-and-burn would be honest), Word-to-PDF complex docs degrade badly vs server LibreOffice (110K/mo US — caveat-class at best, deferred)
