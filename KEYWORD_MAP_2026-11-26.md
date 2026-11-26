# ToolPixi Keyword Map — 2026-11-26

Ordered by Hamza Ali Basra (Nov 26, 2026): for every ToolPixi tool, find the keyword people actually search MOST on Google for that tool's job, and check the page title against it. **Research only — no site changes were made.**

## Method & evidence (read this first)

- **Tool list:** the 139 tools in `build.py`'s TOOLS registry (= the 139 tool pages in the live sitemap's 175 URLs; the rest are hubs, guides and policy pages, which are not tools).
- **Current titles:** read from the built HTML in this repo (what build.py currently ships).
- **Autocomplete:** fresh pulls from Google's suggest API (`suggestqueries.google.com`) on 2026-11-26 — 300+ seed queries, at least one per tool, usually the tool's core term plus its main twin/verb form. A phrase is only named a keyword here if autocomplete completes to it / it carries its own suggestion tree. That is evidence people type it — it is **not** a volume number, and no volumes are claimed anywhere in this file.
- **GSC:** real impressions/positions exist in the workspace for 8 pages (POSITION_PUSH_2026-11-25.md, 28 days to Nov 25). Those rows say 'GSC + Autocomplete' and quote the numbers; every other row is autocomplete-only, because no per-page GSC pull for them exists in the workspace.
- **Title pattern:** the site's own pattern is `Lead Phrase — Qualifier | ToolPixi`. Recommendations keep that pattern and only change the lead phrase where the evidence demands it.

## Verdict summary

- **Tools covered: 139 / 139**
- **Titles already right: 127** — the title already leads with the #1 searched keyword (including the 3 fixed in Round 1 and the 3 fixed in Round 3 earlier today).
- **Titles that must change: 12** — 7 where the searched keyword is missed or the wrong intent is targeted (Tier A), 5 minor where the phrase is present but buried or not leading (Tier B).

## Titles that MUST change — Tier A (searched keyword missed / wrong intent)

### Image Watermark — `/image-watermark/`
- Current title: Image Watermark — Add a Watermark to Photos Free Online | ToolPixi
- #1 searched keyword: **add watermark to image**
- Recommended title: **Add Watermark to Image — Free Online Watermark Maker | ToolPixi**
- Why: INTENT CONFLICT: the head term 'image watermark' autocompletes to REMOVER phrases first ('image watermark remover' is suggestion #1) — this tool ADDS watermarks. The add-phrase has its own full tree ('add watermark to image free / online free'). Current title leads with the bare ambiguous term and misses the searched add-phrase entirely.

### Image to Text (OCR) — `/image-to-text/`
- Current title: Image to Text (OCR) — Extract Text from Images Free | ToolPixi
- #1 searched keyword: **image to text converter**
- Recommended title: **Image to Text Converter (OCR) — Extract Text from Images Free | ToolPixi**
- Why: The standalone 'image to text converter' seed returns a full 10-suggestion tree and 'ocr online' another; the current lead 'Image to Text (OCR)' drops the word people complete to — Converter.

### Compare PDF — `/compare-pdf/`
- Current title: Compare PDF — Find Text Differences Between Two PDFs Free | ToolPixi
- #1 searched keyword: **compare pdfs**
- Recommended title: **Compare PDFs — Find Differences Between Two PDF Files Free | ToolPixi**
- Why: People search the PLURAL: seed 'compare pdf' completes to 'compare pdfs' first, and 'compare pdfs' has its own tree ('…for differences', '…online', '…free'). Title leads with the singular form nobody completes to.

### Age on a Specific Date — `/age-on-date/`
- Current title: Age on a Specific Date — Free Age Calculator | ToolPixi
- #1 searched keyword: **age calculator on a specific date**
- Recommended title: **Age Calculator on a Specific Date — How Old on Any Date | ToolPixi**
- Why: The searched wording is 'age calculator on a specific date' (full tree) and 'age on a certain date calculator'; the current lead 'Age on a Specific Date' is a coined form with a much thinner tree. Niche term — evidence is autocomplete only.

### Random Name Generator — `/random-name-generator/`
- Current title: Random Name Generator — Pick Random Names from Your List | ToolPixi
- #1 searched keyword: **name picker**
- Recommended title: **Random Name Generator & Name Picker — Pick a Name from Your List | ToolPixi**
- Why: INTENT SPLIT: the bare head term 'random name generator' mostly means inventing fake names (fantasy, dnd, girl names) — this tool picks from the user's own list. The phrases matching its real function are 'name picker', 'name picker wheel' and 'random name generator from list'; the current title contains none of them.

### Salary Converter — `/salary-converter/`
- Current title: Salary Converter — Salary to Hourly & Hourly to Salary | ToolPixi
- #1 searched keyword: **salary to hourly calculator**
- Recommended title: **Salary to Hourly Calculator — Salary Converter, Hourly to Salary | ToolPixi**
- Why: The dominant tree is 'salary to hourly calculator' (a full standalone tree, heavily searched); 'salary converter' is the weaker twin and its own tree still completes to '…to hourly'. The current title leads with the weaker term.

### Color Converter — `/color-converter/`
- Current title: Color Picker & Converter — HEX to RGB & HSL Online | ToolPixi
- #1 searched keyword: **color converter**
- Recommended title: **Color Converter — HEX to RGB, RGBA & HSL | ToolPixi**
- Why: Title leads with 'Color Picker & Converter' — neither searched head phrase leads. 'color converter' and 'hex to rgb converter' both have full trees; 'Color Picker' also collides with the separate Color Picker from Image tool.

## Titles that should change — Tier B (minor: phrase present but not leading)

### PDF to Text — `/pdf-to-text/`
- Current title: PDF to Text — Extract Text from PDF Free Online | ToolPixi
- #1 searched keyword: **pdf to text converter**
- Recommended title: **PDF to Text Converter — Extract Text from PDF Free Online | ToolPixi**
- Why: Minor: bare 'pdf to text' is itself suggestion #1, so the current title is defensible; adding 'Converter' aligns it with the site's dominant title pattern and the #2 completion.

### Pregnancy Due Date — `/pregnancy-due-date-calculator/`
- Current title: Pregnancy Due Date Calculator — Due Date from Last Period | ToolPixi
- #1 searched keyword: **due date calculator**
- Recommended title: **Due Date Calculator — Pregnancy Due Date from Last Period | ToolPixi**
- Why: Minor: 'due date calculator' is the shorter head term with the bigger tree ('…based on last period', '…from conception'); the current title leads with the longer 'Pregnancy Due Date Calculator', which is also a real searched phrase — a lead swap, not a rescue.

### Word Counter — `/word-counter/`
- Current title: Free Online Word Counter — Words, Characters & Reading Time | ToolPixi
- #1 searched keyword: **word counter**
- Recommended title: **Word Counter — Free Online Word & Character Counter | ToolPixi**
- Why: Minor: the exact phrase sits third in the title after 'Free Online'; every comparable page on the site leads with the phrase itself.

### Barcode Generator — `/barcode-generator/`
- Current title: Free Barcode Generator — Make Barcodes Online (UPC, EAN-13, Code 128) | ToolPixi
- #1 searched keyword: **barcode generator**
- Recommended title: **Barcode Generator — Free Online Barcode Maker (UPC, EAN-13, Code 128) | ToolPixi**
- Why: Minor: title leads with 'Free'; the exact phrase should lead. 'barcode generator 128' branch already covered by the title's Code 128.

### Password Generator — `/password-generator/`
- Current title: Free Password Generator — Strong, Secure Passwords | ToolPixi
- #1 searched keyword: **password generator**
- Recommended title: **Password Generator — Free, Strong & Secure | ToolPixi**
- Why: Minor: title leads with 'Free'; exact phrase should lead. Length branches ('12 characters') dominate the tree.

## Titles already right

127 tools need no title change — each is listed in the full map below with its keyword and evidence. Notable ones to NOT touch: **PNG to ICO** (the site's proven click-winner: 174 imp, 16 clicks, 9.2% CTR in GSC), **Date Calculator** (1,376 GSC impressions; its specific-date queries already sit at pos 9.2–9.8), and the three Round 3 fixes from earlier today (scientific-calculator, auto-loan-calculator, organize-pdf).

---

## Full keyword map (all 139 tools)

### Image Tools (37 tools)

| Tool | Current title | #1 searched keyword | Secondary searched variants | Evidence | Recommended title |
|---|---|---|---|---|---|
| [Image Compressor to KB](https://toolpixi.com/image-compressor/) | Image Compressor to 20KB, 50KB, 100KB, 200KB or 1MB — Free Online | ToolPixi | **image compressor** | image compressor free; image compressor online free; image compressor for discord | GSC (28d to Nov 25): pos 67.4 + Autocomplete | — keep — |
| ↳ note | GSC: pos 67.4 — head term held by giant sites; title's KB-size lead matches the strong 'image compressor to 20kb/100kb/1mb' autocomplete branch. | | | | |
| [PNG to JPG](https://toolpixi.com/png-to-jpg/) | PNG to JPG Converter — Free Online | ToolPixi | **png to jpg converter** | png to jpg; png to jpg converter free; png to jpg free | Autocomplete (2026-11-26) | — keep — |
| [JPG to PNG](https://toolpixi.com/jpg-to-png/) | JPG to PNG Converter — Free Online | ToolPixi | **jpg to png converter** | jpg to png; jpg to png converter free; jpg to png transparent | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Secondary intent: transparent background. | | | | |
| [WebP to JPG](https://toolpixi.com/webp-to-jpg/) | WebP to JPG Converter — Free Online | ToolPixi | **webp to jpg converter** | webp to jpg; webp to jpg converter free; webp to jpg online free | GSC (28d to Nov 25): pos 72.2 + Autocomplete | — keep — |
| ↳ note | GSC: pos 72.2 — giant-held head term. | | | | |
| [WebP to PNG](https://toolpixi.com/webp-to-png/) | WebP to PNG Converter — Free Online, Keep Transparency | ToolPixi | **webp to png converter** | webp to png; webp to png converter free; webp to png free | Autocomplete (2026-11-26) | — keep — |
| [JPG to WebP](https://toolpixi.com/jpg-to-webp/) | JPG to WebP Converter — Smaller Files, Free Online | ToolPixi | **jpg to webp converter** | jpg to webp; jpg to webp converter free; jpg to webp free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Bulk branch present in tree. | | | | |
| [HEIC to JPG](https://toolpixi.com/heic-to-jpg/) | HEIC to JPG Converter — Free iPhone Photo Converter | ToolPixi | **heic to jpg converter** | heic to jpg; heic to jpg converter free; heic to jpg free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Device branches: 'on iphone', 'on mac'. | | | | |
| [PNG to WebP](https://toolpixi.com/png-to-webp/) | PNG to WebP Converter — Free Online, Smaller Web Files | ToolPixi | **png to webp converter** | png to webp; png to webp converter free; png to webp free | Autocomplete (2026-11-26) | — keep — |
| [HEIC to PNG](https://toolpixi.com/heic-to-png/) | HEIC to PNG Converter — Free iPhone Photo Converter | ToolPixi | **heic to png converter** | heic to png; heic to png converter free; heic to png free | Autocomplete (2026-11-26) | — keep — |
| [Image Resizer](https://toolpixi.com/image-resizer/) | Image Resizer — Resize Image Online Free | ToolPixi | **image resizer** | image resizer free; image resizer online; image resizer free online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin verb phrase 'resize image' also has a full tree; title carries both. | | | | |
| [SVG to PNG](https://toolpixi.com/svg-to-png/) | SVG to PNG Converter — Free Online | ToolPixi | **svg to png converter** | svg to png; svg to png converter free; svg to png with transparent background | Autocomplete (2026-11-26) | — keep — |
| [Favicon Generator](https://toolpixi.com/favicon-generator/) | Favicon Generator — PNG to ICO, Free Online | ToolPixi | **favicon generator** | favicon generator free; favicon generator from png; favicon generator from image | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'favicon maker' is the twin term; title's 'PNG to ICO' matches the 'from png/from image' branch. | | | | |
| [SVG to JPG](https://toolpixi.com/svg-to-jpg/) | SVG to JPG Converter — Free Online | ToolPixi | **svg to jpg converter** | svg to jpg; svg to jpg converter free; svg to jpg free | Autocomplete (2026-11-26) | — keep — |
| [GIF to JPG](https://toolpixi.com/gif-to-jpg/) | GIF to JPG Converter — Free Online | ToolPixi | **gif to jpg converter** | gif to jpg; gif to jpg converter free; gif to jpg frames | Autocomplete (2026-11-26) | — keep — |
| [PNG to ICO](https://toolpixi.com/png-to-ico/) | PNG to ICO Converter — Make Windows Icons Free | ToolPixi | **png to ico converter** | png to ico; png to icon; png to icon converter | GSC (28d to Nov 25): 174 imp, pos 51.1, 16 clicks (9.2% CTR) + Autocomplete | — keep — |
| ↳ note | GSC-PROVEN WINNER: 174 imp, 16 clicks, 9.2% CTR — do not touch this title. | | | | |
| [AVIF to JPG](https://toolpixi.com/avif-to-jpg/) | AVIF to JPG Converter — Free Online | ToolPixi | **avif to jpg converter** | avif to jpg; avif to jpg converter free; avif to jpg converter free online | Autocomplete (2026-11-26) | — keep — |
| [GIF to PNG](https://toolpixi.com/gif-to-png/) | GIF to PNG Converter — Free Online | ToolPixi | **gif to png converter** | gif to png; gif to png sequence; gif to png frames | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Sequence/frames branch is the real secondary intent. | | | | |
| [AVIF to PNG](https://toolpixi.com/avif-to-png/) | AVIF to PNG Converter — Free Online | ToolPixi | **avif to png converter** | avif to png; avif to png converter free; avif to png free | Autocomplete (2026-11-26) | — keep — |
| [BMP to JPG](https://toolpixi.com/bmp-to-jpg/) | BMP to JPG Converter — Free Online | ToolPixi | **bmp to jpg converter** | bmp to jpg; bmp to jpg converter free; bmp to jpg converter online free | Autocomplete (2026-11-26) | — keep — |
| [BMP to PNG](https://toolpixi.com/bmp-to-png/) | BMP to PNG Converter — Free Online | ToolPixi | **bmp to png converter** | bmp to png; bmp to png converter free; bmp to png transparent | Autocomplete (2026-11-26) | — keep — |
| [Image Cropper](https://toolpixi.com/image-cropper/) | Image Cropper — Crop Photos to Any Size, Free Online | ToolPixi | **image cropper** | image cropper online; image cropper free; image cropper by pixel | Autocomplete (2026-11-26) | — keep — |
| [Image Watermark](https://toolpixi.com/image-watermark/) | Image Watermark — Add a Watermark to Photos Free Online | ToolPixi | **add watermark to image** | image watermark remover; image watermark remover free; image watermark | Autocomplete (2026-11-26) | Add Watermark to Image — Free Online Watermark Maker | ToolPixi |
| ↳ note | INTENT CONFLICT: the head term 'image watermark' autocompletes to REMOVER phrases first ('image watermark remover' is suggestion #1) — this tool ADDS watermarks. The add-phrase has its own full tree ('add watermark to image free / online free'). Current title leads with the bare ambiguous term and misses the searched add-phrase entirely. | | | | |
| [Background Remover](https://toolpixi.com/background-remover/) | Background Remover — Remove Image Background Free Online | ToolPixi | **background remover** | background remover free; background remover online free; background remover png | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin verb phrase 'remove background from image' also fully treed; title leads with the head noun phrase. | | | | |
| [Color Picker from Image](https://toolpixi.com/color-picker-from-image/) | Color Picker from Image — Get HEX, RGB & HSL from Any Pixel | ToolPixi | **color picker from image** | color picker from image with name; color picker from image online; color picker from image free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'image color picker' also treed; title leads with the fuller phrase. | | | | |
| [MP4 to MP3](https://toolpixi.com/mp4-to-mp3/) | MP4 to MP3 Converter — Extract Audio from Video Free Online | ToolPixi | **mp4 to mp3 converter** | mp4 to mp3; mp4 to mp3 converter free; mp4 to mp3 converter online free | Autocomplete (2026-11-26) | — keep — |
| [Video Compressor](https://toolpixi.com/video-compressor/) | Video Compressor — Compress MP4 Free Online, Shrink Video for Discord | ToolPixi | **video compressor** | video compressor for discord; video compressor free; video compressor online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Discord branch is the top modifier — title already carries it. | | | | |
| [Passport Photo Maker](https://toolpixi.com/passport-photo-maker/) | Passport Photo Maker — Exact Passport Photo Sizes, Free Online | ToolPixi | **passport photo maker** | passport photo maker free; passport photo maker online free; passport photo maker online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'passport size photo maker' also treed. | | | | |
| [Compress Image to 50KB](https://toolpixi.com/compress-image-to-50kb/) | Compress Image to 50KB — Free Online Photo Compressor | ToolPixi | **compress image to 50kb** | compress image to 50kb free; compress image to 50kb online; compress image to 50kb jpg | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Exact-phrase page; title is the exact searched phrase. | | | | |
| [Compress Image to 100KB](https://toolpixi.com/compress-image-to-100kb/) | Compress Image to 100KB — Free Online Photo Compressor | ToolPixi | **compress image to 100kb** | compress image to 100kb online; compress image to 100kb to 200kb; compress image to 100kb jpg | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Exact-phrase page; title is the exact searched phrase. | | | | |
| [Compress JPG to 100KB](https://toolpixi.com/compress-jpg-to-100kb/) | Compress JPG to 100KB — Free Online Photo Compressor | ToolPixi | **compress jpg to 100kb** | compress jpg to 100kb free online; compress jpg to 100kb pdf; compress jpg to 100kb without losing quality | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Exact-phrase page; title is the exact searched phrase. | | | | |
| [Compress Video for Discord](https://toolpixi.com/compress-video-for-discord/) | Compress Video for Discord — Free, Shrink Video to Fit Discord's Limit | ToolPixi | **compress video for discord** | compress video for discord without losing quality; compress video for discord 10mb; compress video for discord free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'video compressor for discord' equally treed; title leads with one exact form. | | | | |
| [Meme Generator](https://toolpixi.com/meme-generator/) | Meme Generator — Make Memes Online Free, No Watermark | ToolPixi | **meme generator** | meme generator gif; meme generator ai; meme generator free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'meme maker'; title's 'No Watermark' matches the 'meme maker no watermark' branch. | | | | |
| [GIF Maker](https://toolpixi.com/gif-maker/) | GIF Maker — Make a GIF from Images Online Free | ToolPixi | **gif maker** | gif maker from video; gif maker from images; gif maker free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Note: 'gif maker from video' ranks high in the tree but this tool builds from images — title honestly says 'from Images'; do not chase the video phrase. | | | | |
| [Image to Text (OCR)](https://toolpixi.com/image-to-text/) | Image to Text (OCR) — Extract Text from Images Free | ToolPixi | **image to text converter** | image to text; image to text converter free; image to text art | Autocomplete (2026-11-26) | Image to Text Converter (OCR) — Extract Text from Images Free | ToolPixi |
| ↳ note | The standalone 'image to text converter' seed returns a full 10-suggestion tree and 'ocr online' another; the current lead 'Image to Text (OCR)' drops the word people complete to — Converter. | | | | |
| [Screen Recorder](https://toolpixi.com/screen-recorder/) | Screen Recorder — Record Your Screen Online Free, No Install | ToolPixi | **screen recorder** | screen recorder windows; screen recorder mac; screen recorder android | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'screen recorder online free / no download' branch matches the title's promise. | | | | |
| [Video to GIF](https://toolpixi.com/video-to-gif/) | Video to GIF — Convert Video to Animated GIF Free Online | ToolPixi | **video to gif converter** | video to gif; video to gif maker; video to gif converter free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'mp4 to gif' fully treed; 'high quality' is the top modifier. | | | | |
| [Photo Collage Maker](https://toolpixi.com/photo-collage-maker/) | Photo Collage Maker — Make a Collage Online Free | ToolPixi | **photo collage maker** | collage maker; collage maker free; collage maker online free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'collage maker' also treed. | | | | |

### PDF Tools (20 tools)

| Tool | Current title | #1 searched keyword | Secondary searched variants | Evidence | Recommended title |
|---|---|---|---|---|---|
| [JPG to PDF](https://toolpixi.com/jpg-to-pdf/) | JPG to PDF Converter — Free Online, No Sign-Up | ToolPixi | **jpg to pdf converter** | jpg to pdf; jpg to pdf converter free; jpg to pdf free | Autocomplete (2026-11-26) | — keep — |
| [Merge PDF](https://toolpixi.com/merge-pdf/) | Merge PDF — Combine PDF Files Free Online | ToolPixi | **merge pdf** | merge pdf free; merge pdf files; merge pdf online free | Autocomplete (2026-11-26) | — keep — |
| [Split PDF](https://toolpixi.com/split-pdf/) | Split PDF — Extract Pages Free Online | ToolPixi | **split pdf** | split pdf online free; split pdf free; split pdf pages | Autocomplete (2026-11-26) | — keep — |
| [PDF to JPG](https://toolpixi.com/pdf-to-jpg/) | PDF to JPG Converter — Free Online | ToolPixi | **pdf to jpg converter** | pdf to jpg; pdf to jpg converter free; pdf to jpg free | Autocomplete (2026-11-26) | — keep — |
| [Compress PDF](https://toolpixi.com/compress-pdf/) | Compress PDF to 200KB or 100KB — Free Online | ToolPixi | **compress pdf** | compress pdf free; compress pdf file; compress pdf file size | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title's KB lead matches the size-reduction intent. | | | | |
| [PDF to PNG](https://toolpixi.com/pdf-to-png/) | PDF to PNG Converter — Free Online | ToolPixi | **pdf to png converter** | pdf to png; pdf to png converter free; pdf to png free | Autocomplete (2026-11-26) | — keep — |
| [Rotate PDF](https://toolpixi.com/rotate-pdf/) | Rotate PDF — Turn Pages 90°, 180° or 270° Free Online | ToolPixi | **rotate pdf** | rotate pdf free; rotate pdf firefox; rotate pdf in google drive | Autocomplete (2026-11-26) | — keep — |
| [PDF to Text](https://toolpixi.com/pdf-to-text/) | PDF to Text — Extract Text from PDF Free Online | ToolPixi | **pdf to text converter** | pdf to text; pdf to text converter free; pdf to text file | Autocomplete (2026-11-26) | PDF to Text Converter — Extract Text from PDF Free Online | ToolPixi |
| ↳ note | Minor: bare 'pdf to text' is itself suggestion #1, so the current title is defensible; adding 'Converter' aligns it with the site's dominant title pattern and the #2 completion. | | | | |
| [Add Page Numbers to PDF](https://toolpixi.com/add-page-numbers-to-pdf/) | Add Page Numbers to PDF — Free Online | ToolPixi | **add page numbers to pdf** | add page numbers to pdf mac; add page numbers to pdf when printing; add page numbers to pdf free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Exact searched phrase is the title lead. | | | | |
| [Sign PDF](https://toolpixi.com/sign-pdf/) | Sign PDF Online Free — Add Your Signature to a PDF | ToolPixi | **sign pdf** | sign pdf online free; sign pdf online; sign pdf free | Autocomplete (2026-11-26) | — keep — |
| [PDF to Word](https://toolpixi.com/pdf-to-word/) | PDF to Word Converter — Convert PDF to Docx Free Online | ToolPixi | **pdf to word converter** | pdf to word; pdf to word converter free; pdf to word free | Autocomplete (2026-11-26) | — keep — |
| [Crop PDF](https://toolpixi.com/crop-pdf/) | Crop PDF — Trim PDF Pages Online Free | ToolPixi | **crop pdf** | crop pdf online; crop pdf free; crop pdf online free | Autocomplete (2026-11-26) | — keep — |
| [Organize PDF](https://toolpixi.com/organize-pdf/) | Organize PDF — Rearrange, Rotate & Delete PDF Pages Free | ToolPixi | **organize pdf** | organize pdf pages; organize pdf pages free; organize pdf free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Round 3 (2026-11-26) already fixed this title: 'rearrange pdf pages' has its own full autocomplete tree and now sits in the title. | | | | |
| [Compare PDF](https://toolpixi.com/compare-pdf/) | Compare PDF — Find Text Differences Between Two PDFs Free | ToolPixi | **compare pdfs** | compare pdf and word document; compare pdf documents for differences; compare pdf tool | Autocomplete (2026-11-26) | Compare PDFs — Find Differences Between Two PDF Files Free | ToolPixi |
| ↳ note | People search the PLURAL: seed 'compare pdf' completes to 'compare pdfs' first, and 'compare pdfs' has its own tree ('…for differences', '…online', '…free'). Title leads with the singular form nobody completes to. | | | | |
| [Unlock PDF](https://toolpixi.com/unlock-pdf/) | Unlock PDF — Remove PDF Password Online Free | ToolPixi | **unlock pdf** | unlock pdf free; unlock pdf without password; unlock pdf online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'without password' branch noted; page honestly requires the password. | | | | |
| [Protect PDF](https://toolpixi.com/protect-pdf/) | Protect PDF — Add a Password to a PDF Online Free | ToolPixi | **protect pdf** | protect pdf with password; protect pdf from editing; protect pdf free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'from editing / from copying' branches covered in page content (Round 3). | | | | |
| [Repair PDF](https://toolpixi.com/repair-pdf/) | Repair PDF — Fix a Corrupted PDF Online Free | ToolPixi | **repair pdf** | repair pdf file; repair pdf online; repair pdf online free | Autocomplete (2026-11-26) | — keep — |
| [PDF to Excel](https://toolpixi.com/pdf-to-excel/) | PDF to Excel — Convert PDF Tables to XLSX Online Free | ToolPixi | **pdf to excel converter** | — | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Bare 'pdf to excel' is suggestion #1 of its tree; title leads with it. | | | | |
| [Add Text to PDF](https://toolpixi.com/add-text-to-pdf/) | Add Text to PDF Online Free — Type on Any PDF Page | ToolPixi | **add text to pdf** | add text to pdf free; add text to pdf online free; add text to pdf android | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Exact searched phrase is the title lead. | | | | |
| [Add Watermark to PDF](https://toolpixi.com/add-watermark-to-pdf/) | Add Watermark to PDF Online Free — Text Watermark on Every Page | ToolPixi | **add watermark to pdf** | add watermark to pdf free; add watermark to pdf mac; add watermark to pdf document | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Exact searched phrase is the title lead — the correct pattern the image watermark page should copy. | | | | |

### Date & Time Tools (20 tools)

| Tool | Current title | #1 searched keyword | Secondary searched variants | Evidence | Recommended title |
|---|---|---|---|---|---|
| [Age Calculator](https://toolpixi.com/age-calculator/) | Age Calculator — Exact Age from Date of Birth | ToolPixi | **age calculator** | age calculator by date of birth; age calculator from date to date; age calculator online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Top modifier: 'by date of birth' — title carries 'from Date of Birth'. | | | | |
| [Age on a Specific Date](https://toolpixi.com/age-on-date/) | Age on a Specific Date — Free Age Calculator | ToolPixi | **age calculator on a specific date** | age calculator on a particular date; age calculator on a given date; age calculator till specific date | Autocomplete (2026-11-26) | Age Calculator on a Specific Date — How Old on Any Date | ToolPixi |
| ↳ note | The searched wording is 'age calculator on a specific date' (full tree) and 'age on a certain date calculator'; the current lead 'Age on a Specific Date' is a coined form with a much thinner tree. Niche term — evidence is autocomplete only. | | | | |
| [Days Between Dates](https://toolpixi.com/days-between-dates/) | Days Between Dates Calculator — Free Online | ToolPixi | **days between dates calculator** | days between dates; days between dates calendar; days between dates counter | Autocomplete (2026-11-26) | — keep — |
| [Days Until Christmas](https://toolpixi.com/days-until-christmas/) | How Many Days Until Christmas? Live Countdown | ToolPixi | **how many days until christmas** | days until christmas; days until christmas 2026; days until christmas eve | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title leads with the exact question form. | | | | |
| [Christmas Countdown](https://toolpixi.com/christmas-countdown/) | Christmas Countdown 2026 — How Many Days Until Christmas? | ToolPixi | **christmas countdown** | christmas countdown 2026; christmas countdown calendar; christmas countdown decor | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title carries both head forms. | | | | |
| [Days Until Any Date](https://toolpixi.com/days-until/) | Days Until Any Date — Free Countdown Calculator | ToolPixi | **how many days until a certain date** | days until christmas; days until halloween; days until thanksgiving | Autocomplete — WEAK EVIDENCE (see note) | — keep — |
| ↳ note | WEAK EVIDENCE: the generic 'days until' tree is dominated by named events (christmas, halloween, gta 6); the tool-intent phrase 'how many days until a certain date' appears inside the 'days until any date' tree. Title's coined 'Days Until Any Date' has a small tree of its own. | | | | |
| [Online Timer & Stopwatch](https://toolpixi.com/timer/) | Online Timer & Stopwatch — Free Timer with Alarm | ToolPixi | **online timer** | timer; timer clock; timer 10 minutes | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Bare 'timer' tree is preset-led ('timer 10 minutes'); title leads with the tool phrase. | | | | |
| [Date Calculator](https://toolpixi.com/date-calculator/) | Date Calculator — Add or Subtract Days & Days Between Dates | ToolPixi | **date calculator** | date calculator between two dates; date calculator between 2 dates; date calculator add days | GSC (28d to Nov 25): 1,376 imp, pos 20.9; queries '90 days from 8/18/26' pos 9.2 (32 imp), '90 days from 8/18/2026' pos 9.8 (22 imp) + Autocomplete | — keep — |
| ↳ note | GSC STAR: 1,376 imp (28% of the whole site). Proven queries: '90 days from 8/18/26' pos 9.2 (32 imp), '90 days from 8/18/2026' pos 9.8. Title already carries 'add or subtract days' + 'days between dates'. | | | | |
| [Age Difference Calculator](https://toolpixi.com/age-difference-calculator/) | Age Difference Calculator — Age Gap by Date of Birth | ToolPixi | **age difference calculator** | age difference calculator by birthday and age; age difference calculator by date of birth; age difference calculator in months | GSC (28d to Nov 25): 467 imp, pos 10.6 + Autocomplete | — keep — |
| ↳ note | GSC: 467 imp, pos 10.6. Title fixed in Round 1 to carry 'by date of birth', the top autocomplete modifier. | | | | |
| [World Clock](https://toolpixi.com/world-clock/) | World Clock Online — Live Time in New York, London, Dubai, Tokyo | ToolPixi | **world clock** | world clock with seconds; world clock live; world clock texas | Autocomplete (2026-11-26) | — keep — |
| [Days Until Thanksgiving](https://toolpixi.com/days-until-thanksgiving/) | Days Until Thanksgiving 2026 — Countdown to Thursday, Nov 26 | ToolPixi | **days until thanksgiving** | days until thanksgiving 2026; days until thanksgiving break; days until thanksgiving and christmas | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title carries the exact phrase + year. | | | | |
| [Sunrise & Sunset Times](https://toolpixi.com/sunrise-sunset-calculator/) | Sunrise & Sunset Calculator — Free, for Any Place & Date | ToolPixi | **sunrise sunset calculator** | sunrise sunset calculator latitude longitude; sunrise sunset calculator noaa; sunset sunrise calculator map | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Second intent is location-led ('sunset time today near me') — not title material. | | | | |
| [Weekday Calculator](https://toolpixi.com/weekday-calculator/) | Weekday Calculator — What Day of the Week Was Any Date? | ToolPixi | **weekday calculator** | weekday calculator between two dates; weekday calculator formula; weekday calculator calendar | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title also carries the question form people use. | | | | |
| [Business Days Calculator](https://toolpixi.com/business-days-calculator/) | Business Days Calculator — Working Days Between Dates | ToolPixi | **business days calculator** | business days calculator – count workdays; business days calculator usa; business days calculator between two dates | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'working days calculator' has an equally full tree; title leads with one exact form. | | | | |
| [Pregnancy Due Date](https://toolpixi.com/pregnancy-due-date-calculator/) | Pregnancy Due Date Calculator — Due Date from Last Period | ToolPixi | **due date calculator** | due date calculator from conception; due date calculator ivf; due date calculator based on last period | Autocomplete (2026-11-26) | Due Date Calculator — Pregnancy Due Date from Last Period | ToolPixi |
| ↳ note | Minor: 'due date calculator' is the shorter head term with the bigger tree ('…based on last period', '…from conception'); the current title leads with the longer 'Pregnancy Due Date Calculator', which is also a real searched phrase — a lead swap, not a rescue. | | | | |
| [Zodiac Sign](https://toolpixi.com/zodiac-sign-calculator/) | Zodiac Sign Calculator — What Is My Star Sign? | ToolPixi | **zodiac sign calculator** | zodiac signs; zodiac signs dates; zodiac signs in order | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title also carries the 'what is my…' question intent. | | | | |
| [Time Zone Converter](https://toolpixi.com/time-zone-converter/) | Time Zone Converter — Convert Time Between Zones | ToolPixi | **time zone converter** | time zone converter – time difference calculator; time zone converter discord; time zone converter google | Autocomplete (2026-11-26) | — keep — |
| [Time Duration Calculator](https://toolpixi.com/time-duration-calculator/) | Time Duration Calculator — Hours Between Two Times | ToolPixi | **time duration calculator** | time duration calculator hours; time duration calculator with breaks; time duration calculator between dates | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'hours calculator' (payroll-led) also treed. | | | | |
| [Online Stopwatch](https://toolpixi.com/stopwatch/) | Online Stopwatch — With Laps & Milliseconds | ToolPixi | **online stopwatch** | stopwatch; stopwatch timer; stopwatch google | Autocomplete (2026-11-26) | — keep — |
| [Unix Timestamp Converter](https://toolpixi.com/unix-timestamp-converter/) | Unix Timestamp Converter — Epoch Time to Date & Back | ToolPixi | **unix timestamp converter** | timestamp converter; timestamp converter discord; timestamp converter online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twins 'epoch converter' and 'timestamp converter' both treed. | | | | |

### Text & Generator Tools (19 tools)

| Tool | Current title | #1 searched keyword | Secondary searched variants | Evidence | Recommended title |
|---|---|---|---|---|---|
| [Word Counter](https://toolpixi.com/word-counter/) | Free Online Word Counter — Words, Characters & Reading Time | ToolPixi | **word counter** | word count; word count checker; word counter free | Autocomplete (2026-11-26) | Word Counter — Free Online Word & Character Counter | ToolPixi |
| ↳ note | Minor: the exact phrase sits third in the title after 'Free Online'; every comparable page on the site leads with the phrase itself. | | | | |
| [QR Code Generator](https://toolpixi.com/qr-code-generator/) | QR Code Generator — Free, No Expiration, No Sign-Up | ToolPixi | **qr code generator** | qr code generator free; qr code generator free no expiration; qr code generator google | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title carries the two proven modifiers: 'free no expiration', 'no sign-up'. | | | | |
| [Barcode Generator](https://toolpixi.com/barcode-generator/) | Free Barcode Generator — Make Barcodes Online (UPC, EAN-13, Code 128) | ToolPixi | **barcode generator** | barcode generator free; barcode generator online; barcode generator 128 | Autocomplete (2026-11-26) | Barcode Generator — Free Online Barcode Maker (UPC, EAN-13, Code 128) | ToolPixi |
| ↳ note | Minor: title leads with 'Free'; the exact phrase should lead. 'barcode generator 128' branch already covered by the title's Code 128. | | | | |
| [Random Number Generator](https://toolpixi.com/random-number-generator/) | Random Number Generator — Pick Random Numbers Free | ToolPixi | **random number generator** | random number generator 1-100; random number generator 1-10; random number generator wheel | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Range branches ('1-100', '1-10') dominate the tree — covered by the tool, not the title. | | | | |
| [Case Converter](https://toolpixi.com/case-converter/) | Case Converter — UPPERCASE, lowercase & Title Case, Free Online | ToolPixi | **case converter** | case converter tool; case converter online; case converter free | Autocomplete (2026-11-26) | — keep — |
| [Password Generator](https://toolpixi.com/password-generator/) | Free Password Generator — Strong, Secure Passwords | ToolPixi | **password generator** | password generator 12 characters; password generator 15 characters; password generator free | Autocomplete (2026-11-26) | Password Generator — Free, Strong & Secure | ToolPixi |
| ↳ note | Minor: title leads with 'Free'; exact phrase should lead. Length branches ('12 characters') dominate the tree. | | | | |
| [JSON Formatter](https://toolpixi.com/json-formatter/) | JSON Formatter & Validator — Free Online Tool | ToolPixi | **json formatter** | json formatter online; json formatter and validator; json formatter online free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Title carries the 'and validator' completion. | | | | |
| [Lorem Ipsum Generator](https://toolpixi.com/lorem-ipsum-generator/) | Lorem Ipsum Generator — Free Placeholder Text | ToolPixi | **lorem ipsum generator** | lorem ipsum; lorem ipsum dolor sit amet consectetur adipiscing elit translate to english; lorem ipsum dolor sit amet consectetuer adipiscing elit | Autocomplete (2026-11-26) | — keep — |
| [Base64 Encoder & Decoder](https://toolpixi.com/base64-encoder-decoder/) | Base64 Encoder & Decoder — Free Online | ToolPixi | **base64 encoder decoder** | base64 encode; base64 encode online; base64 encode decode | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Both directions ('base64 encode', 'base64 decode') have their own trees; one page serves both. | | | | |
| [UUID Generator](https://toolpixi.com/uuid-generator/) | UUID Generator — Free Online Random UUID (v4) Generator | ToolPixi | **uuid generator** | uuid generator v4; uuid generator online; uuid generator minecraft bedrock | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'guid generator' also treed. | | | | |
| [Hash Generator](https://toolpixi.com/hash-generator/) | Hash Generator — MD5, SHA-1, SHA-256 & SHA-512 Online | ToolPixi | **hash generator** | hash generator sha256; hash generator online; hash generator md5 | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Algorithm branches (md5, sha256) already named in the title. | | | | |
| [Markdown to HTML](https://toolpixi.com/markdown-to-html/) | Markdown to HTML Converter — Live Preview, Free Online | ToolPixi | **markdown to html converter** | markdown to html; markdown to html online; markdown to html js | Autocomplete (2026-11-26) | — keep — |
| [Text to Speech](https://toolpixi.com/text-to-speech/) | Text to Speech Online — Free Voice Reader | ToolPixi | **text to speech** | text to speech free; text to speech reader; text to speech ai | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'online free unlimited' is the loudest modifier branch; title leads with 'Text to Speech Online'. | | | | |
| [Character Counter](https://toolpixi.com/character-counter/) | Character Counter — Count Characters, Words & Spaces Free | ToolPixi | **character counter** | character counter tool; character counter with spaces; character counter including spaces | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'letter counter' also treed. | | | | |
| [Spin the Wheel](https://toolpixi.com/spin-the-wheel/) | Spin the Wheel — Custom Wheel Spinner for Names & Choices | ToolPixi | **spin the wheel** | spin the wheel custom; spin the wheel generator; spin the wheel names | Autocomplete (2026-11-26) | — keep — |
| ↳ note | NOTE: 'wheel of names' is effectively a competitor's brand name — do not title-chase it; the generic 'spin the wheel' + 'random wheel' phrases are the honest targets and the title leads with one. | | | | |
| [Random Name Generator](https://toolpixi.com/random-name-generator/) | Random Name Generator — Pick Random Names from Your List | ToolPixi | **name picker** | name picker wheel; name picker generator; name picker random | Autocomplete (2026-11-26) | Random Name Generator & Name Picker — Pick a Name from Your List | ToolPixi |
| ↳ note | INTENT SPLIT: the bare head term 'random name generator' mostly means inventing fake names (fantasy, dnd, girl names) — this tool picks from the user's own list. The phrases matching its real function are 'name picker', 'name picker wheel' and 'random name generator from list'; the current title contains none of them. | | | | |
| [Typing Speed Test](https://toolpixi.com/typing-speed-test/) | Typing Speed Test — Free Online WPM Test (30s & 60s) | ToolPixi | **typing speed test** | typing speed test free; typing speed test online; typing speed test game | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'typing test' has an equally full tree ('typing test wpm'); title carries WPM. | | | | |
| [QR Code Scanner](https://toolpixi.com/qr-code-scanner/) | QR Code Scanner — Scan QR Codes & Barcodes Online Free | ToolPixi | **qr code scanner** | qr code scanner from image; qr code scanner online; qr code scanner for pc | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'from image' and 'for pc' branches match the page's angle (Round 3 evidence agrees). | | | | |
| [Resume Builder](https://toolpixi.com/resume-builder/) | Resume Builder — Free CV Maker, Download PDF, No Sign-Up | ToolPixi | **resume builder** | resume builder free; resume builder ai; resume builder ai free | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twins 'cv maker' and 'resume maker' both treed; title carries 'Free CV Maker'. | | | | |

### Converters & Calculators (43 tools)

| Tool | Current title | #1 searched keyword | Secondary searched variants | Evidence | Recommended title |
|---|---|---|---|---|---|
| [Unit Converter](https://toolpixi.com/unit-converter/) | Unit Converter — cm to Inches, kg to lbs, °C to °F, km to Miles | ToolPixi | **unit converter** | unit converter calculator; unit converter weight; unit converter money | GSC (28d to Nov 25): 250 imp, pos 29.1 + Autocomplete | — keep — |
| ↳ note | GSC: 250 imp, pos 29.1. Autocomplete is generic only (weight/length/temperature branches) — no sharper phrase exists (Round 1 finding, confirmed today). | | | | |
| [BMI Calculator](https://toolpixi.com/bmi-calculator/) | BMI Calculator — Metric & Imperial (kg/cm and lb/feet) | ToolPixi | **bmi calculator** | bmi calculator women; bmi calculator men; bmi calculator male | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Audience branches (women/men/kids) — tool serves all; not title material. | | | | |
| [Percentage Calculator](https://toolpixi.com/percentage-calculator/) | Percentage Calculator — What Is X% of Y? % Change & More | ToolPixi | **percentage calculator** | percentage calculator increase; percentage calculator money; percentage calculator difference | Autocomplete (2026-11-26) | — keep — |
| [Tip Calculator](https://toolpixi.com/tip-calculator/) | Tip Calculator — Split the Bill Fairly | ToolPixi | **tip calculator** | tip calculator texas; tip calculator google; tip calculator for hair | Autocomplete (2026-11-26) | — keep — |
| [Discount Calculator](https://toolpixi.com/discount-calculator/) | Discount Calculator — Sale Price After % Off, Savings & Tax | ToolPixi | **discount calculator** | discount calculator with tax; discount calculator online; discount calculator percentage | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'with tax' is the top modifier — title already carries Tax. | | | | |
| [Loan Calculator](https://toolpixi.com/loan-calculator/) | Loan Calculator — Monthly Payment (EMI), Total Interest & Cost | ToolPixi | **loan calculator** | loan calculator car; loan calculator auto; loan calculator personal | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'emi calculator' (India-led) also treed; title carries '(EMI)'. | | | | |
| [Calorie Calculator](https://toolpixi.com/calorie-calculator/) | Calorie Calculator — Daily Calorie Needs (BMR & TDEE) | ToolPixi | **calorie calculator** | calorie calculator for weight loss; calorie calculator to lose weight; calorie calculator for recipes | Autocomplete (2026-11-26) | — keep — |
| [Grade Calculator](https://toolpixi.com/grade-calculator/) | Grade Calculator — Weighted Grades & What You Need on the Final | ToolPixi | **grade calculator** | grade calculator college; grade calculator with weights; grade calculator points | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'final' and 'with weights' branches both carried in the title. | | | | |
| [Binary Converter](https://toolpixi.com/binary-converter/) | Binary Converter — Binary to Decimal, Hex, with Steps | ToolPixi | **binary converter** | binary converter to text; binary converter to number; binary converter to decimal | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'binary to decimal' is the top directional branch — carried in the title. | | | | |
| [Hex Converter](https://toolpixi.com/hex-converter/) | Hex Converter — Hex to Decimal, Text, Binary & RGB Colours | ToolPixi | **hex converter** | hex converter to text; hex converter to decimal; hex converter to ascii | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'hex to decimal' branch carried in the title. | | | | |
| [Compound Interest Calculator](https://toolpixi.com/compound-interest-calculator/) | Compound Interest Calculator — Free Online | ToolPixi | **compound interest calculator** | compound interest calculator monthly; compound interest calculator investor.gov; compound interest calculator roth ira | Autocomplete (2026-11-26) | — keep — |
| [Salary Converter](https://toolpixi.com/salary-converter/) | Salary Converter — Salary to Hourly & Hourly to Salary | ToolPixi | **salary to hourly calculator** | salary to hourly calculator california; salary to hourly calculator texas; salary to hourly calculator ohio | Autocomplete (2026-11-26) | Salary to Hourly Calculator — Salary Converter, Hourly to Salary | ToolPixi |
| ↳ note | The dominant tree is 'salary to hourly calculator' (a full standalone tree, heavily searched); 'salary converter' is the weaker twin and its own tree still completes to '…to hourly'. The current title leads with the weaker term. | | | | |
| [VAT Calculator](https://toolpixi.com/vat-calculator/) | VAT Calculator — Add or Remove VAT, Free Online | ToolPixi | **vat calculator** | vat calculator france; vat calculator usa; vat calculator ireland | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Tree is country-led (france/ireland/spain) — no title change helps. | | | | |
| [Color Converter](https://toolpixi.com/color-converter/) | Color Picker & Converter — HEX to RGB & HSL Online | ToolPixi | **color converter** | color converter image; color converter hex to rgb; color converter online | Autocomplete (2026-11-26) | Color Converter — HEX to RGB, RGBA & HSL | ToolPixi |
| ↳ note | Title leads with 'Color Picker & Converter' — neither searched head phrase leads. 'color converter' and 'hex to rgb converter' both have full trees; 'Color Picker' also collides with the separate Color Picker from Image tool. | | | | |
| [Roman Numeral Converter](https://toolpixi.com/roman-numeral-converter/) | Roman Numeral Converter — Numbers to Roman Numerals & Back | ToolPixi | **roman numeral converter** | roman numerals; roman numerals chart; roman numerals 1-10 | Autocomplete (2026-11-26) | — keep — |
| [Number to Words Converter](https://toolpixi.com/number-to-words-converter/) | Number to Words Converter — Write Any Number in Words | ToolPixi | **number to words converter** | number to words; number to words for check; number to words calculator | GSC (28d to Nov 25): 699 imp, pos 42.2 + Autocomplete | — keep — |
| ↳ note | GSC: 699 imp, pos 42.2. Cheque/check + indian rupees branches are the proven modifiers; title fixed in Round 1. | | | | |
| [Celsius to Fahrenheit](https://toolpixi.com/celsius-to-fahrenheit/) | Celsius to Fahrenheit Converter — °C to °F, Free Online | ToolPixi | **celsius to fahrenheit converter** | celsius to fahrenheit; celsius to fahrenheit conversion; celsius to fahrenheit formula | Autocomplete (2026-11-26) | — keep — |
| [Fahrenheit to Celsius](https://toolpixi.com/fahrenheit-to-celsius/) | Fahrenheit to Celsius Converter — °F to °C, Free Online | ToolPixi | **fahrenheit to celsius converter** | fahrenheit to celsius; fahrenheit to celsius conversion; fahrenheit to celsius formula in c | Autocomplete (2026-11-26) | — keep — |
| [Kg to Lbs](https://toolpixi.com/kg-to-lbs/) | Kg to Lbs Converter — Kilograms to Pounds, Free Online | ToolPixi | **kg to lbs converter** | kg to lbs conversion; kg to lbs; kg to lbs and oz | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Branch: 'kg to lbs and oz'. | | | | |
| [Lbs to Kg](https://toolpixi.com/lbs-to-kg/) | Lbs to Kg Converter — Pounds to Kilograms, Free Online | ToolPixi | **lbs to kg converter** | lbs to kgs; lbs to kg conversion; lbs to kg calculator | Autocomplete (2026-11-26) | — keep — |
| [Cm to Inches](https://toolpixi.com/cm-to-inches/) | Cm to Inches Converter — Centimetres to Inches, Free Online | ToolPixi | **cm to inches converter** | cm to inches; cm to inches conversion; cm to inches calculator | Autocomplete (2026-11-26) | — keep — |
| [Inches to Cm](https://toolpixi.com/inches-to-cm/) | Inches to Cm Converter — Inches to Centimetres, Free Online | ToolPixi | **inches to cm converter** | inches to cm; inches to cm conversion; inches to cm calculator | Autocomplete (2026-11-26) | — keep — |
| [Percentage Increase Calculator](https://toolpixi.com/percentage-increase-calculator/) | Percentage Increase Calculator — % Increase Between Two Numbers | ToolPixi | **percentage increase calculator** | percentage increase calculator between two numbers; percentage increase calculator formula; percentage increase calculator salary | GSC (28d to Nov 25): 229 imp, pos 14.2, 1 click + Autocomplete | — keep — |
| ↳ note | GSC: 229 imp, pos 14.2, 1 click. Title fixed in Round 1 to carry 'between two numbers', the top modifier. | | | | |
| [Mm to Inches](https://toolpixi.com/mm-to-inches/) | Mm to Inches Converter — Millimetres to Inches, Free Online | ToolPixi | **mm to inches converter** | mm to inches; mm to inches conversion; mm to inches fraction | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Branch: 'mm to inches fraction' — the fraction chart is the real secondary demand. | | | | |
| [Inches to Mm](https://toolpixi.com/inches-to-mm/) | Inches to Mm Converter — Inches to Millimetres, Free Online | ToolPixi | **inches to mm converter** | inches to mm; inches to mm conversion; inches to mm calculator | Autocomplete (2026-11-26) | — keep — |
| [Meters to Feet](https://toolpixi.com/meters-to-feet/) | Meters to Feet Converter — Metres to Feet, Free Online | ToolPixi | **meters to feet converter** | meters to feet; meters to feet conversion; meters to feet and inches | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Branch: 'meters to feet and inches'. | | | | |
| [Feet to Meters](https://toolpixi.com/feet-to-meters/) | Feet to Meters Converter — Feet to Metres, Free Online | ToolPixi | **feet to meters converter** | feet to meters; feet to meters conversion; feet to meters calculator | Autocomplete (2026-11-26) | — keep — |
| [Mortgage Calculator](https://toolpixi.com/mortgage-calculator/) | Mortgage Calculator — Monthly Payment with Tax, Insurance & PMI | ToolPixi | **mortgage calculator** | mortgage calculator free; mortgage calculator with extra payments; mortgage calculator florida | Autocomplete (2026-11-26) | — keep — |
| ↳ note | 'with extra payments' is the top content branch (Round 3 added the FAQ/example). | | | | |
| [Currency Converter](https://toolpixi.com/currency-converter/) | Currency Converter — Live Exchange Rates for 30+ Currencies | ToolPixi | **currency converter** | currency converter calculator; currency converter euro to usd; currency converter gbp to usd | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Pair-led tree (euro to usd, pounds to dollars) — answered in page content (Round 3), not the title. | | | | |
| [GPA Calculator](https://toolpixi.com/gpa-calculator/) | GPA Calculator — Semester & Cumulative GPA on the 4.0 Scale | ToolPixi | **gpa calculator** | gpa calculator college; gpa calculator high school; gpa calculator from percentage | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Branches: college / high school / from percentage. | | | | |
| [Scientific Calculator](https://toolpixi.com/scientific-calculator/) | Scientific Calculator Online — Trig, Logs, Powers & Roots | ToolPixi | **scientific calculator online** | scientific calculator; scientific calculator texas; scientific calculator florida | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Round 3 (2026-11-26) already fixed this title: 'scientific calculator online' is suggestion #2 of the head tree and now leads the title. | | | | |
| [Auto Loan Calculator](https://toolpixi.com/auto-loan-calculator/) | Auto Loan Calculator — Car Loan Payment with Tax & Trade-In | ToolPixi | **auto loan calculator** | auto loan calculator texas; auto loan calculator payment; auto loan calculator with extra payments | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'car loan calculator' has an equal tree; Round 3 title fix put 'Car Loan Payment' in the title — both head terms now covered. | | | | |
| [Km to Miles](https://toolpixi.com/km-to-miles/) | Km to Miles Converter — Kilometres to Miles, Free Online | ToolPixi | **km to miles converter** | km to miles conversion; km to miles per hour; km to miles | Autocomplete (2026-11-26) | — keep — |
| [Miles to Km](https://toolpixi.com/miles-to-km/) | Miles to Km Converter — Miles to Kilometres, Free Online | ToolPixi | **miles to km converter** | miles to km; miles to km conversion; miles to km per hour | Autocomplete (2026-11-26) | — keep — |
| [Ounces to Grams](https://toolpixi.com/ounces-to-grams/) | Ounces to Grams Converter — Oz to g, Free Online | ToolPixi | **ounces to grams converter** | ounces to grams; ounces to grams conversion; ounces to grams calculator | Autocomplete (2026-11-26) | — keep — |
| [Grams to Ounces](https://toolpixi.com/grams-to-ounces/) | Grams to Ounces Converter — g to Oz, Free Online | ToolPixi | **grams to ounces converter** | grams to ounces; grams to ounces conversion; grams to ounces calculator | Autocomplete (2026-11-26) | — keep — |
| [Liters to Gallons](https://toolpixi.com/liters-to-gallons/) | Liters to Gallons Converter — L to US Gallons, Free Online | ToolPixi | **liters to gallons converter** | liters to gallons; liters to gallons conversion; liters to gallons calculator | Autocomplete (2026-11-26) | — keep — |
| [Gallons to Liters](https://toolpixi.com/gallons-to-liters/) | Gallons to Liters Converter — US Gallons to L, Free Online | ToolPixi | **gallons to liters converter** | gallons to liters; gallons to liters conversion; gallons to liters calculator | Autocomplete (2026-11-26) | — keep — |
| [Yards to Meters](https://toolpixi.com/yards-to-meters/) | Yards to Meters Converter — Yards to Metres, Free Online | ToolPixi | **yards to meters converter** | yards to meters; yards to meters conversion; yards to meters swim conversion | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Swim-conversion branch dominates the tail of the tree. | | | | |
| [Meters to Yards](https://toolpixi.com/meters-to-yards/) | Meters to Yards Converter — Metres to Yards, Free Online | ToolPixi | **meters to yards converter** | meters to yards; meters to yards conversion; meters to yards to feet | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Swim-conversion branch present. | | | | |
| [Cups to Ml](https://toolpixi.com/cups-to-ml/) | Cups to Ml Converter — US Cups to Millilitres, Free Online | ToolPixi | **cups to ml converter** | cups to ml; cups to ml conversion; cups to ml water | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Ingredient branches (water, milk) — the chart answers them. | | | | |
| [Ml to Cups](https://toolpixi.com/ml-to-cups/) | Ml to Cups Converter — Millilitres to US Cups, Free Online | ToolPixi | **ml to cups converter** | ml to cups; ml to cups conversion; ml to cups water | Autocomplete (2026-11-26) | — keep — |
| [Invoice Generator](https://toolpixi.com/invoice-generator/) | Invoice Generator — Free PDF Invoice Maker, No Sign-Up | ToolPixi | **invoice generator** | invoice generator free; invoice generator online free; invoice generator online | Autocomplete (2026-11-26) | — keep — |
| ↳ note | Twin 'invoice maker' also treed. | | | | |

---

## Honesty notes

- Autocomplete proves a phrase is typed often enough for Google to suggest it; it does not rank phrases by exact volume. Where two twin terms both carry full trees (e.g. 'auto loan calculator' / 'car loan calculator', 'business days calculator' / 'working days calculator'), the map says so instead of pretending one winner.
- Rows marked weak evidence: **days-until** (generic tree is event-dominated). **age-on-date** is a genuine but niche term — its trees are real, just small.
- Three intent traps found and flagged in the map: image-watermark (head term = remover intent, tool adds), random-name-generator (head term = inventing names, tool picks from a list), spin-the-wheel ('wheel of names' is a competitor brand — not chased).
- Google answers most unit-pair queries itself (autocomplete literally returns its own '= 2.54 centimeters' answer). The pair pages' titles are all correct; their battle is the answer box, not the title.
- No search volumes were invented anywhere in this file. The only hard numbers quoted are the workspace's own GSC figures for 8 pages.
