# ToolPixi Functional Test — 2026-11-12

Scope: ChatGPT audit "Risk C" — prove the tools on https://toolpixi.com actually work, not just that pages load.
Method: scripted Playwright (Chromium headless shell) against the LIVE site. Test-only — nothing on the site was changed.

## Environment note (read first)

This sandbox reaches the internet through a TLS-intercepting egress proxy. Chromium does not trust the proxy's
certificate, so in the default browser context every request to `pagead2.googlesyndication.com` (the AdSense
script) and to `cdn.jsdelivr.net` failed with `ERR_CERT_AUTHORITY_INVALID`. That is a sandbox artifact, not a
site defect (the same URLs load normally for real visitors, and curl against the same proxy succeeds).
Tier 1 and the first Tier 2 pass ran in the default context. Flows that depend on CDN-hosted engines were then
re-run in a cert-tolerant context (`ignore_https_errors=True`), which emulates a normal visitor's valid
certificate chain; those verdicts are marked "PASS (CDN)".

## Tier 1 — all 127 tool pages: load, JS health, primary control

- **127/127 pages returned HTTP 200.** No navigation failures.
- **Uncaught JS exceptions (pageerror): 0 on all 127 pages.**
- Console errors: the only console error anywhere was `Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID`
  (149 occurrences), traced to exactly one request — the Google AdSense script — blocked by the sandbox proxy
  (see environment note). No tool code produced console errors.
- Primary control found and visible on **110/127** pages. The other **17 are display-only tools by design**
  (16 "days until" countdowns + World Clock): they have no input control, but each was verified rendering live
  numeric output (countdowns ticking down in days/hours/minutes/seconds; the World Clock advancing second by
  second, correct GMT offsets).

| Tool | HTTP | JS exceptions | Primary control (as rendered) | Verdict |
|---|---|---|---|---|
| [add-page-numbers-to-pdf](https://toolpixi.com/add-page-numbers-to-pdf/) | 200 | None | file upload (dropzone visible); 2 input field(s); dropdown; button(s): Add page numbers | PASS |
| [age-calculator](https://toolpixi.com/age-calculator/) | 200 | None | 2 input field(s); button(s): Calculate age | PASS |
| [age-difference-calculator](https://toolpixi.com/age-difference-calculator/) | 200 | None | 2 input field(s); button(s): Calculate the age gap | PASS |
| [age-on-date](https://toolpixi.com/age-on-date/) | 200 | None | 2 input field(s); button(s): Calculate age on that date | PASS |
| [avif-to-jpg](https://toolpixi.com/avif-to-jpg/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [avif-to-png](https://toolpixi.com/avif-to-png/) | 200 | None | file upload (dropzone visible); button(s): Convert & download | PASS |
| [avif-to-webp](https://toolpixi.com/avif-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [background-remover](https://toolpixi.com/background-remover/) | 200 | None | file upload (dropzone visible); button(s): Remove background | PASS |
| [base64-encoder-decoder](https://toolpixi.com/base64-encoder-decoder/) | 200 | None | textarea; 1 input field(s); button(s): Encode to Base64, Decode from Base64 | PASS |
| [base64-to-image](https://toolpixi.com/base64-to-image/) | 200 | None | textarea; button(s): Decode to image | PASS |
| [binary-converter](https://toolpixi.com/binary-converter/) | 200 | None | 1 input field(s); dropdown; button(s): Convert | PASS |
| [bmi-calculator](https://toolpixi.com/bmi-calculator/) | 200 | None | 2 input field(s); button(s): Metric (kg, cm), Imperial (lb, ft/in) | PASS |
| [bmp-to-jpg](https://toolpixi.com/bmp-to-jpg/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [bmp-to-png](https://toolpixi.com/bmp-to-png/) | 200 | None | file upload (dropzone visible); button(s): Convert & download | PASS |
| [bmp-to-webp](https://toolpixi.com/bmp-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [business-days-calculator](https://toolpixi.com/business-days-calculator/) | 200 | None | 3 input field(s); button(s): Count business days | PASS |
| [calorie-calculator](https://toolpixi.com/calorie-calculator/) | 200 | None | 3 input field(s); dropdown; button(s): Metric (kg, cm), Imperial (lb, ft/in) | PASS |
| [case-converter](https://toolpixi.com/case-converter/) | 200 | None | textarea; button(s): UPPERCASE, lowercase | PASS |
| [celsius-to-fahrenheit](https://toolpixi.com/celsius-to-fahrenheit/) | 200 | None | 2 input field(s) | PASS |
| [character-counter](https://toolpixi.com/character-counter/) | 200 | None | textarea; dropdown; button(s): Clear | PASS |
| [cm-to-inches](https://toolpixi.com/cm-to-inches/) | 200 | None | 2 input field(s) | PASS |
| [color-converter](https://toolpixi.com/color-converter/) | 200 | None | 10 input field(s); button(s): Copy, Copy | PASS |
| [color-picker-from-image](https://toolpixi.com/color-picker-from-image/) | 200 | None | file upload (dropzone visible); button(s): Pick from screen instead | PASS |
| [compound-interest-calculator](https://toolpixi.com/compound-interest-calculator/) | 200 | None | 4 input field(s); dropdown; button(s): Calculate growth | PASS |
| [compress-pdf](https://toolpixi.com/compress-pdf/) | 200 | None | file upload (dropzone visible); button(s): 500 KB, 200 KB | PASS |
| [csv-to-json](https://toolpixi.com/csv-to-json/) | 200 | None | file upload (dropzone visible); textarea; 1 input field(s); button(s): Convert to JSON, Copy JSON | PASS |
| [date-calculator](https://toolpixi.com/date-calculator/) | 200 | None | 2 input field(s); button(s): Add days (future), Subtract days (past) | PASS |
| [days-between-dates](https://toolpixi.com/days-between-dates/) | 200 | None | 3 input field(s); button(s): Count the days | PASS |
| [days-until](https://toolpixi.com/days-until/) | 200 | None | 2 input field(s); button(s): Start countdown | PASS |
| [days-until-black-friday](https://toolpixi.com/days-until-black-friday/) | 200 | None | Display-only — live countdown rendered ("14 DAYS 14 HOURS 22 MINUTES 23 SECONDS") | PASS (display-only) |
| [days-until-christmas](https://toolpixi.com/days-until-christmas/) | 200 | None | Display-only — live countdown rendered ("42 DAYS 14 HOURS 22 MINUTES 20 SECONDS") | PASS (display-only) |
| [days-until-diwali](https://toolpixi.com/days-until-diwali/) | 200 | None | Display-only — live countdown rendered ("350 DAYS 14 HOURS 22 MINUTES 18 SECONDS") | PASS (display-only) |
| [days-until-easter](https://toolpixi.com/days-until-easter/) | 200 | None | Display-only — live countdown rendered ("135 DAYS 14 HOURS 22 MINUTES 16 SECONDS") | PASS (display-only) |
| [days-until-eid](https://toolpixi.com/days-until-eid/) | 200 | None | Display-only — live countdown rendered ("116 DAYS 14 HOURS 22 MINUTES 13 SECONDS") | PASS (display-only) |
| [days-until-eid-al-adha](https://toolpixi.com/days-until-eid-al-adha/) | 200 | None | Display-only — live countdown rendered ("184 DAYS 14 HOURS 22 MINUTES 11 SECONDS") | PASS (display-only) |
| [days-until-fathers-day](https://toolpixi.com/days-until-fathers-day/) | 200 | None | Display-only — live countdown rendered ("219 DAYS 14 HOURS 22 MINUTES 3 SECONDS") | PASS (display-only) |
| [days-until-halloween](https://toolpixi.com/days-until-halloween/) | 200 | None | Display-only — live countdown rendered ("352 DAYS 14 HOURS 22 MINUTES 8 SECONDS") | PASS (display-only) |
| [days-until-hanukkah](https://toolpixi.com/days-until-hanukkah/) | 200 | None | Display-only — live countdown rendered ("21 DAYS 14 HOURS 22 MINUTES 6 SECONDS") | PASS (display-only) |
| [days-until-independence-day](https://toolpixi.com/days-until-independence-day/) | 200 | None | Display-only — live countdown rendered ("233 DAYS 14 HOURS 22 MINUTES 1 SECONDS") | PASS (display-only) |
| [days-until-mothers-day](https://toolpixi.com/days-until-mothers-day/) | 200 | None | Display-only — live countdown rendered ("177 DAYS 14 HOURS 21 MINUTES 58 SECONDS") | PASS (display-only) |
| [days-until-new-year](https://toolpixi.com/days-until-new-year/) | 200 | None | Display-only — live countdown rendered ("49 DAYS 14 HOURS 21 MINUTES 56 SECONDS") | PASS (display-only) |
| [days-until-ramadan](https://toolpixi.com/days-until-ramadan/) | 200 | None | Display-only — live countdown rendered ("86 DAYS 14 HOURS 21 MINUTES 54 SECONDS") | PASS (display-only) |
| [days-until-st-patricks-day](https://toolpixi.com/days-until-st-patricks-day/) | 200 | None | Display-only — live countdown rendered ("124 DAYS 14 HOURS 21 MINUTES 51 SECONDS") | PASS (display-only) |
| [days-until-thanksgiving](https://toolpixi.com/days-until-thanksgiving/) | 200 | None | Display-only — live countdown rendered ("13 DAYS 14 HOURS 21 MINUTES 49 SECONDS") | PASS (display-only) |
| [days-until-valentines-day](https://toolpixi.com/days-until-valentines-day/) | 200 | None | Display-only — live countdown rendered ("93 DAYS 14 HOURS 21 MINUTES 46 SECONDS") | PASS (display-only) |
| [dice-roller](https://toolpixi.com/dice-roller/) | 200 | None | 2 input field(s); button(s): d4, d6 | PASS |
| [discount-calculator](https://toolpixi.com/discount-calculator/) | 200 | None | 3 input field(s) | PASS |
| [fahrenheit-to-celsius](https://toolpixi.com/fahrenheit-to-celsius/) | 200 | None | 2 input field(s) | PASS |
| [favicon-generator](https://toolpixi.com/favicon-generator/) | 200 | None | file upload (dropzone visible); button(s): Generate favicon.ico | PASS |
| [gif-to-jpg](https://toolpixi.com/gif-to-jpg/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [gif-to-png](https://toolpixi.com/gif-to-png/) | 200 | None | file upload (dropzone visible); button(s): Convert & download | PASS |
| [gif-to-webp](https://toolpixi.com/gif-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [grade-calculator](https://toolpixi.com/grade-calculator/) | 200 | None | 12 input field(s); button(s): Remove, Remove | PASS |
| [hash-generator](https://toolpixi.com/hash-generator/) | 200 | None | textarea; 4 input field(s); button(s): Copy, Copy | PASS |
| [heic-to-jpg](https://toolpixi.com/heic-to-jpg/) | 200 | None | file upload (dropzone visible); button(s): Convert to JPG | PASS |
| [heic-to-png](https://toolpixi.com/heic-to-png/) | 200 | None | file upload (dropzone visible); button(s): Convert to PNG | PASS |
| [heic-to-webp](https://toolpixi.com/heic-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert to WebP | PASS |
| [hex-converter](https://toolpixi.com/hex-converter/) | 200 | None | 3 input field(s); button(s): Convert | PASS |
| [image-compressor](https://toolpixi.com/image-compressor/) | 200 | None | file upload (dropzone visible); button(s): 20 KB, 50 KB | PASS |
| [image-cropper](https://toolpixi.com/image-cropper/) | 200 | None | file upload (dropzone visible); 4 input field(s); dropdown; button(s): Full photo, Square 1:1 | PASS |
| [image-resizer](https://toolpixi.com/image-resizer/) | 200 | None | file upload (dropzone visible); 4 input field(s); dropdown; button(s): Resize image | PASS |
| [image-to-base64](https://toolpixi.com/image-to-base64/) | 200 | None | file upload (dropzone visible) | PASS |
| [image-watermark](https://toolpixi.com/image-watermark/) | 200 | None | file upload (dropzone visible) | PASS |
| [inches-to-cm](https://toolpixi.com/inches-to-cm/) | 200 | None | 2 input field(s) | PASS |
| [jpg-to-pdf](https://toolpixi.com/jpg-to-pdf/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Clear list, Create PDF | PASS |
| [jpg-to-png](https://toolpixi.com/jpg-to-png/) | 200 | None | file upload (dropzone visible); button(s): Convert & download | PASS |
| [jpg-to-webp](https://toolpixi.com/jpg-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [json-formatter](https://toolpixi.com/json-formatter/) | 200 | None | textarea; button(s): Validate, Pretty-print | PASS |
| [json-minifier](https://toolpixi.com/json-minifier/) | 200 | None | textarea; button(s): Minify JSON, Load sample | PASS |
| [json-to-csv](https://toolpixi.com/json-to-csv/) | 200 | None | textarea; button(s): Convert to CSV, Download .csv | PASS |
| [kg-to-lbs](https://toolpixi.com/kg-to-lbs/) | 200 | None | 2 input field(s) | PASS |
| [lbs-to-kg](https://toolpixi.com/lbs-to-kg/) | 200 | None | 2 input field(s) | PASS |
| [loan-calculator](https://toolpixi.com/loan-calculator/) | 200 | None | 3 input field(s); button(s): Calculate monthly payment | PASS |
| [lorem-ipsum-generator](https://toolpixi.com/lorem-ipsum-generator/) | 200 | None | textarea; 2 input field(s); button(s): Paragraphs, Sentences | PASS |
| [markdown-to-html](https://toolpixi.com/markdown-to-html/) | 200 | None | textarea; button(s): Load sample, Clear | PASS |
| [merge-pdf](https://toolpixi.com/merge-pdf/) | 200 | None | file upload (dropzone visible); button(s): Merge PDFs, Clear list | PASS |
| [morse-code-translator](https://toolpixi.com/morse-code-translator/) | 200 | None | textarea; button(s): ▶ Play the Morse, Copy Morse | PASS |
| [mp4-to-mp3](https://toolpixi.com/mp4-to-mp3/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert to MP3 | PASS |
| [number-to-words-converter](https://toolpixi.com/number-to-words-converter/) | 200 | None | 1 input field(s); dropdown; button(s): Write it in words, Copy the words | PASS |
| [password-generator](https://toolpixi.com/password-generator/) | 200 | None | 6 input field(s); button(s): Generate password, Copy password | PASS |
| [pdf-to-jpg](https://toolpixi.com/pdf-to-jpg/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert pages to JPG | PASS |
| [pdf-to-png](https://toolpixi.com/pdf-to-png/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert pages to PNG | PASS |
| [pdf-to-text](https://toolpixi.com/pdf-to-text/) | 200 | None | file upload (dropzone visible); button(s): Extract text | PASS |
| [pdf-to-webp](https://toolpixi.com/pdf-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert pages to WebP | PASS |
| [pdf-to-word](https://toolpixi.com/pdf-to-word/) | 200 | None | file upload (dropzone visible); button(s): Convert PDF to Word | PASS |
| [percentage-calculator](https://toolpixi.com/percentage-calculator/) | 200 | None | 6 input field(s); button(s): Calculate, Calculate | PASS |
| [percentage-increase-calculator](https://toolpixi.com/percentage-increase-calculator/) | 200 | None | 4 input field(s); button(s): Calculate % change, Work out the new value | PASS |
| [png-to-ico](https://toolpixi.com/png-to-ico/) | 200 | None | file upload (dropzone visible); button(s): All three, 16 px | PASS |
| [png-to-jpg](https://toolpixi.com/png-to-jpg/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [png-to-webp](https://toolpixi.com/png-to-webp/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [pregnancy-due-date-calculator](https://toolpixi.com/pregnancy-due-date-calculator/) | 200 | None | 1 input field(s); button(s): Estimate due date | PASS |
| [qr-code-generator](https://toolpixi.com/qr-code-generator/) | 200 | None | 3 input field(s); dropdown; button(s): Create QR code | PASS |
| [random-number-generator](https://toolpixi.com/random-number-generator/) | 200 | None | 5 input field(s); button(s): Generate numbers | PASS |
| [reading-time-calculator](https://toolpixi.com/reading-time-calculator/) | 200 | None | textarea; button(s): Clear | PASS |
| [remove-duplicate-lines](https://toolpixi.com/remove-duplicate-lines/) | 200 | None | textarea; 1 input field(s); button(s): Remove duplicates, Copy result | PASS |
| [reverse-text](https://toolpixi.com/reverse-text/) | 200 | None | textarea; button(s): Reverse characters, Reverse words | PASS |
| [roman-numeral-converter](https://toolpixi.com/roman-numeral-converter/) | 200 | None | 2 input field(s) | PASS |
| [rotate-pdf](https://toolpixi.com/rotate-pdf/) | 200 | None | file upload (dropzone visible); button(s): 90° clockwise, 180° (upside down) | PASS |
| [salary-converter](https://toolpixi.com/salary-converter/) | 200 | None | 3 input field(s); dropdown; button(s): Convert pay | PASS |
| [sign-pdf](https://toolpixi.com/sign-pdf/) | 200 | None | file upload (dropzone visible); 2 input field(s); dropdown; button(s): Draw signature, Type signature | PASS |
| [slug-generator](https://toolpixi.com/slug-generator/) | 200 | None | 3 input field(s); dropdown; button(s): Copy | PASS |
| [sort-lines](https://toolpixi.com/sort-lines/) | 200 | None | textarea; 1 input field(s); button(s): A → Z, Z → A | PASS |
| [split-pdf](https://toolpixi.com/split-pdf/) | 200 | None | file upload (dropzone visible); 1 input field(s); button(s): Split PDF, Split into single pages | PASS |
| [stopwatch](https://toolpixi.com/stopwatch/) | 200 | None | button(s): Start, Lap | PASS |
| [sunrise-sunset-calculator](https://toolpixi.com/sunrise-sunset-calculator/) | 200 | None | 3 input field(s); dropdown; button(s): Show sunrise & sunset | PASS |
| [svg-to-jpg](https://toolpixi.com/svg-to-jpg/) | 200 | None | file upload (dropzone visible); 2 input field(s); button(s): Convert to JPG | PASS |
| [svg-to-png](https://toolpixi.com/svg-to-png/) | 200 | None | file upload (dropzone visible); 2 input field(s); button(s): Convert to PNG | PASS |
| [svg-to-webp](https://toolpixi.com/svg-to-webp/) | 200 | None | file upload (dropzone visible); 2 input field(s); button(s): Convert to WebP | PASS |
| [text-diff-checker](https://toolpixi.com/text-diff-checker/) | 200 | None | textarea; button(s): Compare texts, Clear | PASS |
| [text-to-speech](https://toolpixi.com/text-to-speech/) | 200 | None | textarea; 2 input field(s); dropdown; button(s): ▶ Speak, Pause | PASS |
| [time-duration-calculator](https://toolpixi.com/time-duration-calculator/) | 200 | None | 6 input field(s); button(s): Add, Subtract | PASS |
| [time-zone-converter](https://toolpixi.com/time-zone-converter/) | 200 | None | 1 input field(s); dropdown; button(s): Convert time, Swap zones | PASS |
| [timer](https://toolpixi.com/timer/) | 200 | None | 3 input field(s); button(s): 1 min, 5 min | PASS |
| [tip-calculator](https://toolpixi.com/tip-calculator/) | 200 | None | 2 input field(s); button(s): 10%, 15% | PASS |
| [unit-converter](https://toolpixi.com/unit-converter/) | 200 | None | 1 input field(s); dropdown; button(s): ⇄ Swap | PASS |
| [unix-timestamp-converter](https://toolpixi.com/unix-timestamp-converter/) | 200 | None | 2 input field(s) | PASS |
| [url-encoder-decoder](https://toolpixi.com/url-encoder-decoder/) | 200 | None | textarea; button(s): Component mode (a value), Full-URL mode (a whole link) | PASS |
| [uuid-generator](https://toolpixi.com/uuid-generator/) | 200 | None | textarea; 1 input field(s); button(s): Generate UUIDs, Copy all | PASS |
| [vat-calculator](https://toolpixi.com/vat-calculator/) | 200 | None | 1 input field(s); button(s): Add VAT, Remove VAT | PASS |
| [video-compressor](https://toolpixi.com/video-compressor/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Compress Video | PASS |
| [webp-to-jpg](https://toolpixi.com/webp-to-jpg/) | 200 | None | file upload (dropzone visible); dropdown; button(s): Convert & download | PASS |
| [webp-to-png](https://toolpixi.com/webp-to-png/) | 200 | None | file upload (dropzone visible); button(s): Convert & download | PASS |
| [weekday-calculator](https://toolpixi.com/weekday-calculator/) | 200 | None | 1 input field(s); button(s): Find the weekday | PASS |
| [word-counter](https://toolpixi.com/word-counter/) | 200 | None | textarea; button(s): Try a sample, Clear | PASS |
| [world-clock](https://toolpixi.com/world-clock/) | 200 | None | Display-only — live clock rendered (01:38:15, ticking: True) | PASS (display-only) |
| [youtube-thumbnail-downloader](https://toolpixi.com/youtube-thumbnail-downloader/) | 200 | None | 1 input field(s); button(s): Get thumbnails | PASS |
| [zodiac-sign-calculator](https://toolpixi.com/zodiac-sign-calculator/) | 200 | None | 1 input field(s); button(s): Find my sign | PASS |

## Tier 2 — real functional flows (12 named tools + the two-date check)

| Tool | Verdict | Evidence |
|---|---|---|
| Image Compressor | PASS | photo.jpg 387,905 B in -> 49,860 B out at the 50 KB target chip; output is a valid JPEG (downloaded and re-opened). |
| Image Resizer | PASS | photo.png 1000x750 in, width set to 500 (height auto-filled 375) -> downloaded PNG is exactly 500x375. |
| JPG to PDF | PASS (CDN) | 2 images (JPG + PNG) in -> one PDF out, 2 pages, 1,146,054 B (page count verified with pypdf). Engine: pdf-lib via cdn.jsdelivr.net. |
| PDF to JPG | PASS (CDN) | 2-page PDF in -> auto-downloaded doc2-page-1.jpg and doc2-page-2.jpg, both valid JPEGs, 1192x1686 px; result panel shown. Engine: pdfjs-dist via cdn.jsdelivr.net. |
| Merge PDF | PASS (CDN) | doc2.pdf (2 pages) + docB.pdf (1 page) -> one PDF, 3 pages, 39,271 B (verified with pypdf). Engine: pdf-lib. |
| Compress PDF | PASS (CDN) | photo.pdf 134,383 B in, 100 KB target -> 43,952 B out, still 1 page (verified with pypdf). Engines: pdfjs-dist + pdf-lib. |
| WebP to JPG | PASS | photo.webp in -> valid JPEG out, 1000x750, 71,265 B. (Canvas-based; passed even in the default context.) |
| HEIC to JPG | PASS (CDN) | Real HEIC sample (libheif reference file, ftyp/mif1, 718,114 B) -> valid JPEG, 1280x854, 465,256 B. Engine: heic2any via cdn.jsdelivr.net. |
| Word Counter | PASS | Typed a known 17-word / 85-character text -> page showed Words 17, Characters 85, Characters (no spaces) 69, Sentences 2 — all exact. |
| Date Calculator | PASS | 2026-01-01 + 45 days -> page result "February 15, 2026" (arithmetically correct). Note: this page is add/subtract-days; the two-date difference check from the brief lives on Days Between Dates (next row). |
| Days Between Dates | PASS | 2026-01-01 to 2026-03-02 -> "60 days", "8.6 weeks", "1,440 hours" — all correct (2026 is not a leap year). |
| Percentage Calculator | PASS | All three modes correct: 20% of 150 = 30; 45 of 180 = 25%; 80 -> 100 = 25% increase. |
| QR Code Generator | PASS (CDN) | Entered "https://toolpixi.com" -> PNG downloaded (7,771 B) and independently decoded with OpenCV: content is exactly "https://toolpixi.com". Minor note: with the 512 px size option the PNG came out 495x495 — the generator fits whole QR modules, so output can be slightly under the nominal size. Engine: qrcode-generator via cdn.jsdelivr.net. |

## Error-case behaviour (wrong file type)

| Case | Verdict | Evidence |
|---|---|---|
| .txt file into Image Compressor | PASS | The .txt was not accepted as an image; clicking "Compress image" produced the clear inline message "Please choose an image first." No crash, no download offered. |
| .txt file into PDF to JPG | PASS | With the PDF engine loaded, clicking "Convert pages to JPG" produced the clear inline error "This PDF could not be opened. It may be password-protected or damaged." |

## Findings worth the owner's attention

1. **Six tools hard-depend on cdn.jsdelivr.net at runtime** — JPG to PDF, Merge PDF, Compress PDF (pdf-lib
   1.17.1; pdfjs-dist 3.11.174 + worker), PDF to JPG (pdfjs-dist), HEIC to JPG (heic2any 0.0.4),
   QR Code Generator (qrcode-generator 1.4.4). All six work when the CDN is reachable. When it is not
   (blocked network, CDN outage), the tools cannot run — verified directly: with the CDN blocked, PDF to JPG
   shows the visible error "The PDF engine could not be loaded. Check your connection and refresh." on
   Convert, i.e. they degrade with a clear message rather than failing silently. Self-hosting these libraries
   would remove the dependency entirely.
2. **Two live tools are missing from sitemap.xml**: /days-until-diwali/ and /days-until-valentines-day/
   both return HTTP 200 and render working countdowns, but are absent from the sitemap (the sitemap lists
   125 of the 127 tools). Harmless for users; a small SEO/indexing gap.
3. **QR PNG size is approximate**: the downloaded PNG can be a few percent smaller than the size selected
   in the dropdown (495x495 for the 512 option) because the generator snaps to whole QR modules. The code
   itself decodes perfectly.
4. No genuinely broken tool was found. Every flow that could be driven to completion produced a correct
   result; no page threw an uncaught JavaScript exception.

Raw data + test scripts + downloaded outputs: ~/workspace/tp-func-test-scratch/ (tier1.json, tier2.json,
debug3.json, probe.json, out/). This scratch folder can be deleted once this report is accepted.
