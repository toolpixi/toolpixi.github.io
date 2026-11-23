# ToolPixi Worldwide Search-Demand Audit — Batch 3 of 5 (Calculators)

**Date:** 23 Nov 2026
**Scope:** 24 calculator tools. For each: the main keyword a searcher types, its worldwide monthly Google search volume from public sources, and its 1–2 year demand pattern.

**Method / long-term basis (owner refinement applied):**
- Primary source kwstrends.com keyword reports publish a **12-month average** monthly volume plus month-by-month history and a "vs previous 12 months" comparison — i.e. figures already rest on the previous 1–2 years, not a single recent month.
- seodata.dev figures are Google Ads API **monthly averages** (the same 12-month-averaged numbers shown in Google Keyword Planner).
- Semrush figures come from its country-database keyword data as published in public website-overview snippets.
- "1–2yr pattern" key: **sustained** = meaningful searches spread across the full 12–24 month window · **seasonal** = real demand but concentrated in recurring calendar peaks · **recent blip** = demand only in the last few months · **nothing in 1–2 years** = no meaningful searches across the whole window.
- Where only a US figure is published, the cell says so — the worldwide figure will be higher, but no worldwide number was invented.

| Tool | Main keyword | Worldwide monthly searches (best figure found) | Source | 1–2yr pattern |
|---|---|---|---|---|
| age-calculator | age calculator | 4,500,000 | kwstrends (worldwide; India 60%, US 820K) | sustained |
| age-difference-calculator | age difference calculator | 9,900 (US only — no worldwide figure published; a second source, toolstationfree, lists ~9,800/mo, scope unclear) | seodata.dev (Google Ads API, US) + toolstationfree | sustained (low but steady US average; related "age gap calculator" adds 6,600 US) |
| age-on-date | age calculator on a specific date / age as of date | No published volume of its own — parent keyword "age calculator" = 4,500,000/mo worldwide | kwstrends (parent keyword); variant checked on kwstrends + seodata + web search, no figure exists | sustained (via parent keyword; the variant itself shows no measurable separate demand in 1–2 years) |
| bmi-calculator | bmi calculator | 7,000,000 | kwstrends (worldwide; US 3,300,000 / 47%) | sustained |
| calorie-calculator | calorie calculator | 2,400,000 | kwstrends (worldwide; US 1,700,000 / 71%). Note: Semrush snippets show a higher US-only figure (3,350,000) — sources disagree; kwstrends worldwide figure recorded | sustained |
| percentage-calculator | percentage calculator | 1,900,000 | kwstrends (worldwide; US 1,000,000) | sustained |
| percentage-increase-calculator | percentage increase calculator | 260,000 | kwstrends (worldwide; US 110,000) | sustained |
| mortgage-calculator | mortgage calculator | 4,800,000 | kwstrends (worldwide; US 3,700,000 / 77%) | sustained |
| loan-calculator | loan calculator | 1,900,000 | kwstrends (worldwide; US 1,200,000 / 63%) | sustained |
| auto-loan-calculator | auto loan calculator | 640,000 | kwstrends (worldwide; US 610,000 / 95%) | sustained |
| compound-interest-calculator | compound interest calculator | 2,500,000 | kwstrends (worldwide; US 1,400,000 / 56%) | sustained |
| salary-converter | salary calculator | ≈600,000 (estimate — no single worldwide figure published: US 201,000 per seodata/Google Ads API; UK database alone 368,000 per Semrush; related "salary to hourly calculator" = 70,000/mo worldwide per kwstrends) | seodata.dev + Semrush public snippets + kwstrends | seasonal (January peak — kwstrends shows the salary-conversion cluster peaking in Jan 2026 at ~2.2× its lowest month, new-year job/pay cycle) |
| tip-calculator | tip calculator | 1,000,000 | kwstrends (worldwide; US 910,000 / 91%) | sustained |
| discount-calculator | discount calculator | 60,500 (US only — no worldwide figure published) | seodata.dev (Google Ads API, US) | seasonal (shopping/sale-season driven; US average is a 12-month mean, peaks around Nov–Dec sales) |
| vat-calculator | vat calculator | 250,000 | kwstrends (UK report; UK 170,000 / 68%) | sustained |
| gpa-calculator | gpa calculator | 1,000,000 | kwstrends (worldwide; US 740,000 / 74%) | seasonal (academic-calendar peaks — term/semester ends) |
| grade-calculator | grade calculator | 790,000 | kwstrends (worldwide; US 450,000 / 57%) | seasonal (academic-calendar peaks — exam/term periods) |
| pregnancy-due-date-calculator | due date calculator | 490,000 | kwstrends (worldwide; US 300,000 / 61%; exact phrase "pregnancy due date calculator" adds 55,000 US) | sustained |
| date-calculator | date calculator | 2,100,000 | kwstrends (worldwide; India 39%, US 550,000) | sustained |
| days-between-dates | days between dates | 480,000 (global figure from a Semrush/Ahrefs-based build spec; US alone = 110,000 per seodata/Google Ads API — direction consistent, treat global figure as approximate) | GitHub free-tool-park spec (Semrush/Ahrefs ranges) + seodata.dev (US) | sustained |
| business-days-calculator | business days calculator | 52,000 | kwstrends (worldwide; US 24,000 / 46%) | sustained |
| time-duration-calculator | time duration calculator | 135,000 (US only — no worldwide figure published; kwstrends' "time calculator" report lists it as a 110,000/mo US related keyword, consistent range) | seodata.dev (Google Ads API, US) + kwstrends | sustained |
| weekday-calculator | day of week calculator (the variant people actually search; "weekday calculator" itself has no published volume) | 2,400 (US only — no worldwide figure published; related "day of date" = 12,100 US) | seodata.dev (Google Ads API, US); "weekday calculator" checked on seodata (no page) + web search | sustained (very low but present as a steady long-term average, not a blip) |
| scientific-calculator | scientific calculator | 3,300,000 | kwstrends (worldwide; India 52%, US 910,000) | sustained |

## Counts (by the tool's own main keyword, using the best figure found)

- **≥10k/mo:** 21 — age-calculator, bmi-calculator, calorie-calculator, percentage-calculator, percentage-increase-calculator, mortgage-calculator, loan-calculator, auto-loan-calculator, compound-interest-calculator, salary-converter, tip-calculator, discount-calculator, vat-calculator, gpa-calculator, grade-calculator, pregnancy-due-date-calculator, date-calculator, days-between-dates, business-days-calculator, time-duration-calculator, scientific-calculator
- **1k–10k/mo:** 2 — age-difference-calculator (9,900 US), weekday-calculator (2,400 US)
- **100–1k/mo:** 0
- **<100/mo:** 0
- **No data (own keyword):** 1 — age-on-date (no published volume anywhere after kwstrends + seodata + web-search attempts; demand exists only inside the parent "age calculator" keyword)
- **Total:** 24

## Notes for the prune decision

- No tool in this batch is a true zero: even the weakest (weekday, age-difference) show small but real, sustained 1–2 year demand in US data alone.
- age-on-date is the only tool whose own keyword has NO public data — it lives entirely off the parent "age calculator" intent.
- US-only figures (age-difference, discount, time-duration, weekday) understate worldwide demand; they were not extrapolated.
- One source conflict flagged: "calorie calculator" — kwstrends worldwide 2.4M vs Semrush US-only snippets of 3.35M. Either way it is a top-tier keyword.
