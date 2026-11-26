# ToolPixi Position Push — ROUND 2 — 2026-11-26

Ordered by Hamza Ali Basra (voice call, Nov 26, 2026): implement the full striking-distance plan so clicks, CTR and positions improve. Status: **SHIPPED + LIVE-VERIFIED** (deploy commits `888b90a4ed4678fc2eb57c17defc86267d0567a4` for the content sections, directly on top of Round 1's `ee679d7`, and `b207cff7fa2aec1d14c759d0553482172e2183ca` for the Round 2b strong-page prose links — see the 2b section below).

Round 1 (Nov 25) covered titles/metas + worked sections for Age Difference, Percentage Increase and Date Calculator, and internal links for PNG to ICO. Round 2 extends the same method to what Round 1 left light or untouched: **Number to Words** (title/meta only in R1, no content sections) and **Unit Converter** (meta-only light touch in R1). Nothing Round 1 shipped was repeated or altered.

**Git-diff ground truth: exactly 2 files changed** — `number-to-words-converter/index.html` and `unit-converter/index.html`. No new pages (sitemap still 175 URLs), no design/layout changes, logo untouched, removed downloaders stay removed (R1 stubs untouched), GSC not touched, zero spend.

## Keyword evidence (Google autocomplete, suggestqueries.google.com, pulled 2026-11-26)

Every pair below returned conversion / chart / formula / calculator variants — real demand for answered pair content:

- **liters to gallons** → "…conversion", "…conversion chart", "…formula", "…calculator", "…gas price conversion"; **gallons to liters** → same family + "gas prices"
- **kg to lbs** → "…conversion", "…chart", "…formula", "…and oz", "…to stone", "…plates", "…and oz baby"
- **cm to inches** → "…conversion", "…chart", "…height", "…formula", "…fraction"
- **celsius to fahrenheit** → "…conversion", "…formula", "…chart", "…equation"
- **ounces to grams** → "…conversion", "…chart", "…formula", "…baking", "…gold"
- **cups to ml** → "…conversion", "…conversion chart", "…formula", "…water", "…uk"
- **miles to km** → "…conversion", "…per hour", "…formula", "…pace chart"
- **unit converter** → generic head terms only, plus one sharp phrase: "**unit converter mm to inches**" (mm→inches added to the answers table on that evidence)
- **number to words** → "…for check", "…calculator", "…rupees", "…indian rupees", "…in excel"; **number to words converter** → "…check", "…cheque", "…indian rupees", "…english"
- **how to write a check amount in words** → a whole family: "…cheque amount in words", "…with cents", "…with no cents", + Canada / Singapore / Philippines variants
- **1500 in words** → "1500 in words", "…for check", "…rupees", "…in bank"
- **numbers in words indian rupees** → "numbers in words indian rupees", "…indian currency", "figures to words in indian rupees"

## Changes shipped

### Number to Words Converter (`/number-to-words-converter/`, pos 42.2, 699 imp)

Two new on-page content sections (inserted after the existing "Two systems, one number" section; headings are the exact query phrases):

1. **"How to write a cheque amount in words"** — direct answer first (write the words exactly as the converter produces them, start at the left edge, line through leftover space), a 6-row worked table ($485 → "Four hundred eighty-five dollars", $999, $1,500, $2,750, $12,000, $45,600), then the cents rules the autocomplete family asks for: US fraction style ("$1,250.75 → One thousand two hundred fifty and 75/100 dollars", "and 00/100" for no cents) and the Indian "Rupees … only" ending (₹1,500 example), plus the words-govern note.
2. **"Numbers in words in the Indian system — rupees, worked examples"** — explains the Indian comma grouping (first comma after 3 digits, then every 2), then an 8-row verified table: ₹1,500 · ₹25,000 · ₹1,00,000 = One lakh rupees · ₹12,50,000 = Twelve lakh fifty thousand rupees · ₹75,00,000 · ₹5,75,340 = Five lakh seventy-five thousand three hundred forty rupees · ₹1,00,00,000 = One crore rupees · ₹2,50,00,000 = Two crore fifty lakh rupees.

FAQ top-ups (+2, via FAQ_TOPUPS): "How do you write 1,500 in words for a cheque?" (the exact "1500 in words for check" autocomplete phrase, both US and Indian formats) and "How are amounts written in words in the Indian system?" (lakh/crore with the same three anchor figures).

### Unit Converter (`/unit-converter/`, pos 29.1, 250 imp)

One new direct-answer section placed immediately under the tool (after "Popular conversions", before the how-to steps):

- **"The most-searched conversions, answered"** — a 9-row table: Conversion | Formula | Worked example. Rows: Litres→gallons (× 0.264172; 10 L = 2.64 gal), Gallons→litres (× 3.785412; 5 gal = 18.93 L), Kg→lbs (× 2.20462; 70 kg = 154.32 lbs), Cm→inches (÷ 2.54; 180 cm = 70.87 in = 5 ft 10.87 in — the "cm to inches height" intent), Celsius→Fahrenheit (× 9/5 + 32; 37 °C = 98.6 °F), Ounces→grams (× 28.3495; 8 oz = 226.80 g), Cups→ml (× 236.588; 2 cups = 473.18 ml), Miles→km (× 1.609344; 5 miles = 8.05 km, plus 60 mph = 96.56 km/h for the "miles to km per hour" intent), Mm→inches (÷ 25.4; 10 mm = 0.394 in — the "unit converter mm to inches" phrase).
- Each row's conversion name is an internal link to the dedicated pair page with the **exact query phrase as anchor text** ("Litres to gallons conversion", "Kg to lbs conversion", …) — 9 new query-phrase anchors feeding the pair pages, which are the pages that can actually rank for those pair queries.

FAQ top-ups (+2, via FAQ_TOPUPS): "How many litres are in a gallon?" (1 US gallon = 3.785412 L exactly; 5 gal = 18.93 L; 10 L = 2.64 gal) and "How do I convert mm to inches?" (÷ 25.4; 10 mm = 0.394 in).

### Internal-link audit (item 5)

A full-site scan of the built HTML checked which pages link to `/number-to-words-converter/` and `/unit-converter/`. Result: every money, calculator, converter and text page already carried both targets in **nav dropdowns and Related-tools chips** — but **no page carried an in-prose contextual link with a query-phrase anchor**. The only total non-linkers are unrelated image utilities (webp converters), event countdown pages, and redirect stubs (incl. morse-code-translator, which is a stub to /text-tools/, not a live page). Round 2's first pass therefore added no RELATED_TOPUP entries (a dated comment recording the audit sits at the end of RELATED_TOPUP in build.py) — and the prose-link gap it exposed was closed the same day by Round 2b below, per Hamza's direct emphasis that internal links from the strongest pages are a priority.

### Verification of examples

Every worked example was computed in Python before shipping: a hand-written int-to-words (international + Indian systems, American no-"and" style matching the tool's own output) generated all 14 cheque/rupee word forms, and all 11 conversion values were calculated from the exact defined factors (1 gal = 3.785411784 L, 1 lb = 0.45359237 kg, 1 in = 2.54 cm, 1 oz = 28.349523125 g, 1 US cup = 236.5882365 ml, 1 mile = 1.609344 km). All matched the shipped text.

## Deploy & verification

- Recipe followed exactly: `python3 build.py` → rsync (excludes .git/build.py/NOTES.md) → growth-batch files removed from clone → commit → `gh auth setup-git` → push. Commit: **888b90a4ed4678fc2eb57c17defc86267d0567a4**.
- **ads.txt md5 = 9e5ab8a9e3daa0f2160b3444d2113bb3** — verified in source before build, after build, and live on toolpixi.com after deploy. Unchanged.
- Pre-build backup kept outside the deploy tree: `~/workspace/toolpixi-backups/build.py.bak-2026-11-26-round2`.
- Live checks (~90 s after push, toolpixi.com): both new Number to Words sections live ✓ · cheque table + "75/100 dollars" cents format live ✓ · Indian rupees table (lakh/crore rows) live ✓ · new cheque FAQ live ✓ · "The most-searched conversions, answered" live on Unit Converter ✓ · all 9 pair-page links with query-phrase anchors live ✓ · both new Unit Converter FAQs live ✓ · worked values (96.56 km/h, 473.18 ml, 226.80 g, 70.87 inches) live ✓.

## Round 2b — strong-page prose internal links (Hamza's emphasis, same day)

Deploy commit **`b207cff7fa2aec1d14c759d0553482172e2183ca`** (git-diff ground truth: exactly the 8 donor pages changed). Each donor gained a short prose section whose link anchor is the **exact query phrase users type** — not the title-case tool name the nav/chips use. All 8 verified live on toolpixi.com after deploy; ads.txt md5 unchanged again (source → build → live).

### Strong-page donor list — → Number to Words Converter (anchor: "number to words converter")

| Donor page | Why it's strong / sensible | Prose context |
|---|---|---|
| **Percentage Increase Calculator** (pos 14.2) | Striking-distance page from Round 1; salary-rise intent | "The new figure in words" — the raised salary written in words in the offer letter/contract, millions or lakh/crore |
| **Invoice Generator** | Money-document tool; invoices state totals in words (standard in India) | "The total in words" — run the invoice total through the converter, same wording a cheque carries |
| **Salary Converter** | Pay figures → contracts/offer letters state salary in words | "The figure in words, for the contract" |
| **Loan Calculator** | Loan agreements state the amount in words; words govern on disagreement | "The amount in words, on the agreement" |

### Strong-page donor list — → Unit Converter (anchor: "unit converter")

| Donor page | Why it's strong / sensible | Prose context |
|---|---|---|
| **Number to Words Converter** (699 imp — the site's #3 page) | The other Round 2 target donating across; converter-family bridge | Closing line of the new Indian-system section: measurements rather than money — litres/kg/cm → gallons/pounds/inches |
| **BMI Calculator** | Health cluster; users constantly arrive with ft/in, stone, cm | "Working in the other units" — metric↔imperial flips with the formula shown |
| **Calorie Calculator** | Health cluster; scales read lb/stone, heights in ft/in | "Pounds, stone and centimetres" |
| **Currency Converter** | The money converter; the natural "not money?" bridge | "Not money? Measurements live next door" — cm→inches, kg→lbs, litres→gallons with exact factors |

Plus, from Round 2 proper: the **Unit Converter itself** donates 9 query-phrase anchors down to the pair pages ("Litres to gallons conversion", "Kg to lbs conversion", …), and the **Calculators hub** already carried prose links to both targets ("Unit Converter" / "Numbers in Words" anchors) — left as-is.

### Named strong pages deliberately NOT used as donors to these two targets

Per Hamza's own qualifier ("wherever topically sensible, not just any related page"):

- **Date Calculator** (1,376 imp — the site's strongest page) and **Age Difference Calculator** (467 imp, pos 10.6): date/age intent has no honest bridge to a words/units converter. Their link strength already works inside the date cluster — Date Calculator and the date hub link Age Difference (Round 1), and Age Difference is itself a striking-distance target being fed, not a donor to unrelated tools. A forced converter link on the site's #1 page would be off-topic noise for exactly the users Google sends there.
- **The PNG-to-ICO donor network** (17+ image pages): image-format intent → unit/words converters is not a real user path. That network's equity already feeds PNG to ICO (Round 1, 9.2% CTR winner); diluting those pages with converter links would weaken the one proven click-winner pattern on the site.

If Hamza wants those pages used anyway, the links can be added in one build — but the recommendation stands: topical donors only.

## What to watch at the Dec 2 checkpoint (same checkpoint as Round 1)

Number to Words is the long shot (pos 42.2): the cheque + Indian-rupees sections now give it real content depth for its two proven intent families — watch whether impressions on "…for check / cheque / indian rupees" queries grow and position starts moving toward the 20s. Unit Converter (29.1) should benefit modestly itself, but the bigger expected effect is the pair pages (litres↔gallons, kg↔lbs, cm↔inches…) gaining topical support from a pos-29 page with exact-phrase anchors. Compare everything against the Nov 25 baseline: 33 clicks / 4,944 imp / CTR 0.7% / avg pos 34.5.
