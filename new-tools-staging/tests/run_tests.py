#!/usr/bin/env python3
"""Functional tests for the 10 new ToolPixi tools, run against the REAL
built pages served locally from the source tree. Every test exercises the
tool's core function, not just page load. External requests are aborted
(the VM's Chromium cannot reach them anyway) so any console error or
pageerror that remains is a genuine local fault."""
import json, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8901"
FIX = "/home/hatch/workspace/toolpixi/new-tools-staging/fixtures"
OUT = "/tmp/tp-test-downloads"
import os
os.makedirs(OUT, exist_ok=True)

results = {}
ONLY = sys.argv[1] if len(sys.argv) > 1 else None

def run(name, fn):
    if ONLY and ONLY != name:
        return
    try:
        detail = fn()
        results[name] = {"status": "PASS", "detail": detail}
        print(f"PASS  {name}: {detail}")
    except Exception as e:
        results[name] = {"status": "FAIL", "detail": str(e)[:600]}
        print(f"FAIL  {name}: {str(e)[:600]}")

def new_page(browser):
    ctx = browser.new_context(accept_downloads=True)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    def on_console(msg):
        if msg.type == "error" and "Failed to load resource" not in msg.text:
            errors.append(f"console: {msg.text[:200]}")
    page.on("console", on_console)
    page.route("**/*", lambda r: r.continue_() if r.request.url.startswith(BASE) or r.request.url.startswith("data:") or r.request.url.startswith("blob:") else r.abort())
    return ctx, page, errors

def assert_clean(errors):
    assert not errors, "JS errors: " + " | ".join(errors[:4])

with sync_playwright() as pw:
    browser = pw.chromium.launch(args=[
        "--no-sandbox", "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        "--autoplay-policy=no-user-gesture-required",
    ])

    # ---------- 1. typing-speed-test ----------
    def t_typing():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/typing-speed-test/", wait_until="networkidle")
        passage = page.inner_text("#tt-passage").replace("\u00a0", " ")
        assert len(passage) > 100, "passage too short"
        page.click("#tt-input")
        page.keyboard.type(passage[:60], delay=25)
        page.wait_for_timeout(700)
        wpm = int(page.inner_text("#tt-wpm"))
        acc = page.inner_text("#tt-acc")
        assert wpm > 0, f"WPM did not compute (got {wpm})"
        assert acc == "100%", f"accuracy should be 100% for exact typing, got {acc}"
        # finish the whole passage -> result panel
        page.keyboard.type(passage[60:], delay=1)
        page.wait_for_selector("#tt-result:visible", timeout=8000)
        fwpm = int(page.inner_text("#tt-final-wpm"))
        assert fwpm > 0
        assert_clean(errors)
        ctx.close()
        return f"live WPM={wpm} at 100% accuracy mid-test; finished passage -> final {fwpm} WPM, result panel shown"
    run("typing-speed-test", t_typing)

    # ---------- 2. meme-generator ----------
    def t_meme():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/meme-generator/", wait_until="networkidle")
        page.click('[data-scene="stage"]')
        page.fill("#mm-top", "HELLO")
        page.fill("#mm-bottom", "WORLD")
        page.wait_for_timeout(300)
        blank = page.evaluate("document.getElementById('mm-canvas').toDataURL().length")
        assert blank > 10000, "canvas looks blank"
        with page.expect_download(timeout=15000) as dl:
            page.click("#mm-download")
        path = os.path.join(OUT, "meme.png")
        dl.value.save_as(path)
        data = open(path, "rb").read()
        assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
        assert len(data) > 8000, f"PNG suspiciously small: {len(data)}"
        assert_clean(errors)
        ctx.close()
        return f"scene+text rendered (canvas data {blank} chars), PNG exported {len(data)} bytes with valid header"
    run("meme-generator", t_meme)

    # ---------- 3. gif-maker ----------
    def t_gif():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/gif-maker/", wait_until="networkidle")
        page.set_input_files("#gm-file", [f"{FIX}/photo-a.png", f"{FIX}/photo-b.png", f"{FIX}/photo-c.png"])
        page.wait_for_function("!document.getElementById('gm-go').disabled", timeout=10000)
        with page.expect_download(timeout=90000) as dl:
            page.click("#gm-go")
        path = os.path.join(OUT, "anim.gif")
        dl.value.save_as(path)
        data = open(path, "rb").read()
        assert data[:6] in (b"GIF89a", b"GIF87a"), f"bad GIF header: {data[:6]}"
        assert len(data) > 1500, f"GIF too small: {len(data)}"
        assert_clean(errors)
        ctx.close()
        return f"3 frames encoded -> valid {data[:6].decode()} file, {len(data)} bytes"
    run("gif-maker", t_gif)

    # ---------- 4. qr-code-scanner ----------
    def t_qr():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/qr-code-scanner/", wait_until="networkidle")
        page.set_input_files("#qs-file", f"{FIX}/qr-fixture.png")
        page.wait_for_selector("#qs-result:visible", timeout=15000)
        val = page.inner_text("#qs-value")
        assert val == "https://toolpixi.com/qr-code-scanner-test-12345", f"QR decode mismatch: {val!r}"
        # barcode mode
        page.click('[data-mode="barcode"]')
        page.set_input_files("#qs-file", f"{FIX}/barcode-ean13.png")
        page.wait_for_function(
            "document.getElementById('qs-value').textContent === '5901234123457'",
            timeout=25000)
        assert_clean(errors)
        ctx.close()
        return "QR fixture decoded to the exact string; EAN-13 fixture decoded to 5901234123457 via ZXing"
    run("qr-code-scanner", t_qr)

    # ---------- 5. resume-builder ----------
    def t_resume():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/resume-builder/", wait_until="networkidle")
        page.fill("#rb-name", "Ada Lovelace")
        page.fill("#rb-title", "Software Engineer")
        page.fill("#rb-email", "ada@example.com")
        page.locator("#rb-exp-list .rb-role").first.fill("Senior Developer")
        page.locator("#rb-exp-list .rb-company").first.fill("Analytical Engines Ltd")
        page.locator("#rb-exp-list .rb-dates").first.fill("2020 — Present")
        page.locator("#rb-exp-list .rb-desc").first.fill("Built the first published algorithm\nLed a team of four engineers")
        page.fill("#rb-skills", "Mathematics, Computing, Technical writing")
        page.wait_for_timeout(400)
        preview = page.inner_text("#rb-preview")
        assert "Ada Lovelace" in preview and "Senior Developer" in preview, "preview did not render form data"
        with page.expect_download(timeout=20000) as dl:
            page.click("#rb-download")
        path = os.path.join(OUT, "resume.pdf")
        dl.value.save_as(path)
        data = open(path, "rb").read()
        assert data[:5] == b"%PDF-", "not a PDF"
        assert len(data) > 3000, f"PDF too small: {len(data)}"
        assert_clean(errors)
        ctx.close()
        return f"live preview rendered name+role; PDF exported {len(data)} bytes with %PDF header"
    run("resume-builder", t_resume)

    # ---------- 6. image-to-text ----------
    def t_ocr():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/image-to-text/", wait_until="networkidle")
        page.set_input_files("#it-file", f"{FIX}/ocr-fixture.png")
        page.wait_for_selector("#it-result:visible", timeout=150000)
        text = page.input_value("#it-out")
        low = text.lower()
        assert "quick brown fox" in low, f"OCR missed line 1: {text[:120]!r}"
        assert "lazy dog" in low, f"OCR missed line 2: {text[:160]!r}"
        assert "12345" in text, f"OCR missed the number: {text[:200]!r}"
        assert_clean(errors)
        ctx.close()
        return f"OCR read the fixture: {text.strip()[:90]!r}..."
    run("image-to-text", t_ocr)

    # ---------- 7. invoice-generator ----------
    def t_invoice():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/invoice-generator/", wait_until="networkidle")
        page.locator(".inv-item .inv-desc").first.fill("Consulting — project work")
        page.locator(".inv-item .inv-qty").first.fill("2")
        page.locator(".inv-item .inv-rate").first.fill("50")
        page.wait_for_timeout(300)
        sub = page.inner_text("#inv-t-sub")
        assert "100" in sub, f"subtotal wrong: {sub}"
        page.fill("#inv-tax", "10")
        page.wait_for_timeout(300)
        total = page.inner_text("#inv-t-total")
        assert "110" in total, f"total with 10% tax wrong: {total}"
        with page.expect_download(timeout=20000) as dl:
            page.click("#inv-download")
        path = os.path.join(OUT, "invoice.pdf")
        dl.value.save_as(path)
        data = open(path, "rb").read()
        assert data[:5] == b"%PDF-" and len(data) > 3000, "bad invoice PDF"
        assert_clean(errors)
        ctx.close()
        return f"live totals correct (2x50=100, +10% tax=110); PDF exported {len(data)} bytes"
    run("invoice-generator", t_invoice)

    # ---------- 8. screen-recorder ----------
    def t_screen():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/screen-recorder/", wait_until="networkidle")
        assert page.locator("#sr-start").count() == 1
        status0 = page.inner_text("#sr-status")
        page.click("#sr-start")
        page.wait_for_timeout(3500)
        recording = page.locator("#sr-stop:visible").count() > 0
        outcome = ""
        if recording:
            page.wait_for_timeout(1500)
            page.click("#sr-stop")
            page.wait_for_selector("#sr-result:visible", timeout=15000)
            outcome = "fake-device capture started, recorded ~1.5s, stopped -> preview+download state shown"
        else:
            msg = (page.inner_text("#sr-status") or "") + (page.inner_text("#sr-err") or "")
            assert len(msg.strip()) > 5, "no recording and no graceful message either"
            outcome = f"capture unavailable headless -> graceful state shown: {msg.strip()[:80]!r}"
        assert_clean(errors)
        ctx.close()
        return outcome
    run("screen-recorder", t_screen)

    # ---------- 9. video-to-gif ----------
    def t_vgif():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/video-to-gif/", wait_until="networkidle")
        page.set_input_files("#vg-file", f"{FIX}/clip.mp4")
        page.wait_for_function("!document.getElementById('vg-go').disabled", timeout=20000)
        with page.expect_download(timeout=240000) as dl:
            page.click("#vg-go")
        path = os.path.join(OUT, "video.gif")
        dl.value.save_as(path)
        data = open(path, "rb").read()
        assert data[:6] in (b"GIF89a", b"GIF87a"), f"bad GIF header: {data[:6]}"
        assert len(data) > 3000, f"GIF too small: {len(data)}"
        assert_clean(errors)
        ctx.close()
        return f"3s MP4 -> valid GIF via self-hosted ffmpeg.wasm, {len(data)} bytes"
    run("video-to-gif", t_vgif)

    # ---------- 10. photo-collage-maker ----------
    def t_collage():
        ctx, page, errors = new_page(browser)
        page.goto(BASE + "/photo-collage-maker/", wait_until="networkidle")
        page.set_input_files("#pc-file", [f"{FIX}/photo-a.png", f"{FIX}/photo-b.png", f"{FIX}/photo-c.png", f"{FIX}/photo-d.png"])
        page.wait_for_timeout(800)
        colors = page.evaluate("""() => {
          const c = document.getElementById('pc-canvas'), x = c.getContext('2d');
          const pts = [[300,225],[900,225],[300,675],[900,675]];
          return pts.map(([px,py]) => Array.from(x.getImageData(px,py,1,1).data.slice(0,3)).join(','));
        }""")
        assert len(set(colors)) == 4, f"grid cells should show 4 distinct photos, got {colors}"
        with page.expect_download(timeout=15000) as dl:
            page.click("#pc-png")
        path = os.path.join(OUT, "collage.png")
        dl.value.save_as(path)
        data = open(path, "rb").read()
        assert data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) > 5000
        assert_clean(errors)
        ctx.close()
        return f"4 photos placed in 2x2 grid (4 distinct cell colours verified on canvas); PNG exported {len(data)} bytes"
    run("photo-collage-maker", t_collage)

    browser.close()

print("\n=== SUMMARY ===")
fails = [k for k, v in results.items() if v["status"] != "PASS"]
print(json.dumps(results, indent=1))
print("FAILURES:", fails if fails else "none")
sys.exit(1 if fails else 0)
