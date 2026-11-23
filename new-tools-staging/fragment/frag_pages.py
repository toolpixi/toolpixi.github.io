# ---------------------------------------------------------------------------
# High-demand gap batch 2026-11-23 (owner-approved): 10 tools from the
# worldwide demand audit (audit-2026-11-23/GAP_PLAN.md). Engines live in
# assets/js/, libraries self-hosted under assets/vendor/ — no server, no
# external runtime dependency, same as every other ToolPixi tool.
# ---------------------------------------------------------------------------

PAGES.append(dict(
    slug="typing-speed-test",
    title="Typing Speed Test — Free Online WPM Test (30s & 60s) | ToolPixi",
    desc="Free typing speed test: type for 30 or 60 seconds and get your WPM and accuracy live as you type. No sign-up, no scores uploaded — the test runs entirely in your browser.",
    scripts=["/assets/js/common.js", "/assets/js/typing.js"],
    faqs=[
        ("How is my typing speed (WPM) calculated?", "The standard formula: every five characters you type correctly count as one “word”, divided by the minutes you spent typing. Only correct characters count toward your WPM here — mashing keys fast and wrong will not inflate the score, which is how a typing speed should be measured."),
        ("What is a good typing speed?", "Around 40 WPM is the average for everyday typing. 60–80 WPM is fast, professional territory — most office and data-entry roles ask for something in that range. Touch typists who use all ten fingers regularly pass 90 WPM, and the very fastest exceed 120."),
        ("Is 30 seconds or 60 seconds better?", "Thirty seconds is a quick snapshot and kinder to beginners. Sixty seconds is the fairer measurement: it smooths out a lucky or unlucky first line and is closer to the number an employer-style test would give you. Take the 60-second test when you want a score you can compare week to week."),
        ("How can I type faster?", "Accuracy first — speed is a by-product of not stopping to fix mistakes. Keep your fingers on the home row (ASDF / JKL;), look at the passage instead of the keyboard, and practise in short daily bursts rather than rare long sessions. Most people gain 5–10 WPM in a few weeks of ten minutes a day."),
        ("Are my results saved or uploaded?", "No. The test runs in your browser and your score exists only on this screen. There is no account, no leaderboard upload and nothing stored — close the tab and the score is gone."),
        ("Can I use this on a phone or tablet?", "Yes — tap the typing box and your on-screen keyboard appears. Just know that phone scores are not comparable to physical-keyboard scores; the test measures whatever you are typing on."),
    ],
    body=page_head("Typing Speed Test",
                   "Thirty or sixty seconds, one passage, and your words-per-minute counted live as you type — only correct characters count.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="typing-speed-test">
  <style>
    #tt-passage{font-size:20px;line-height:1.85;background:#f8fafc;border:1px solid #dbe3ec;border-radius:10px;padding:16px 18px;cursor:text;user-select:none}
    .tt-ch{color:#98a2b3}.tt-ch.ok{color:#166534}.tt-ch.bad{color:#b91c1c;background:#fee2e2;border-radius:3px}
    .tt-ch.cur{border-bottom:3px solid #0d7377}
    #tt-input{margin-top:12px}
    .tt-stats{display:flex;gap:26px;flex-wrap:wrap;margin-top:14px;font-size:17px}
    .tt-stats b{font-size:22px}
  </style>
  <div class="field"><label>Test length</label>
    <div class="chip-row">
      <button class="chip on" data-dur="30">30 seconds</button>
      <button class="chip" data-dur="60">60 seconds</button>
    </div></div>
  <div id="tt-passage" title="The passage to type"></div>
  <input type="text" id="tt-input" placeholder="Click here and start typing — the clock starts on your first letter"
         autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
  <div class="tt-stats">
    <span>Time<br><b id="tt-time">30s</b></span>
    <span>Speed<br><b id="tt-wpm">0</b> WPM</span>
    <span>Accuracy<br><b id="tt-acc">100%</b></span>
  </div>
  <button class="btn" id="tt-restart" style="margin-top:14px">Restart with new text</button>
  <div class="result" id="tt-result" style="display:none">
    <div class="big-num"><span id="tt-final-wpm">0</span> WPM</div>
    <p class="note">Accuracy <span id="tt-final-acc">—</span> · Correct characters <span id="tt-final-chars">—</span></p>
    <p id="tt-verdict"></p>
    <button class="btn" id="tt-again">Type again</button>
  </div>
</div>
""" + steps([
        "<strong>Pick 30 or 60 seconds.</strong> Sixty is the fairer score; thirty is the quick check.",
        "<strong>Click the typing box and type the passage.</strong> The clock starts on your first letter, and the passage lights up green or red as you go.",
        "<strong>Read your score.</strong> When the time runs out — or you finish the passage — your WPM, accuracy and correct characters are shown."])
    + """<section class="section"><h2>What your WPM actually means</h2>
<p>Words per minute is a stranger unit than it looks. A “word” in typing tests is not a word at all — it is any five characters, spaces included, which is why a passage of short words and a passage of long ones can be compared fairly. This test counts only the characters you got right, so the number is your <em>net</em> speed: the pace at which you produce correct text, which is the only pace that has ever mattered to an employer, an exam board or a deadline.</p>
<p>Context helps. The average person types around 40 WPM; hunt-and-peck typists sit near 25–30; trained touch typists cruise at 65–80; and competitive typists pass 120 on short bursts. If your score surprises you, the likeliest cause is not slow fingers — it is looking down. Every glance at the keyboard costs more time than any single keystroke, which is why the fastest improvement most people ever make comes from two weeks of deliberately not looking.</p></section>
<section class="section"><h2>Why this test never uploads anything</h2>
<p>Plenty of typing sites turn a speed test into an account funnel: sign up to see your result, get ranked, get emailed. Here the whole test — passage, timer, scoring — is a small script running in your browser tab. Your keystrokes are compared against the passage on your own device and forgotten when the tab closes. Take the test fifty times in a row; nobody will ever know, including us.</p></section>
""" + faq_html([
        ("How is my typing speed (WPM) calculated?", "The standard formula: every five characters you type correctly count as one “word”, divided by the minutes you spent typing. Only correct characters count toward your WPM here — mashing keys fast and wrong will not inflate the score, which is how a typing speed should be measured."),
        ("What is a good typing speed?", "Around 40 WPM is the average for everyday typing. 60–80 WPM is fast, professional territory — most office and data-entry roles ask for something in that range. Touch typists who use all ten fingers regularly pass 90 WPM, and the very fastest exceed 120."),
        ("Is 30 seconds or 60 seconds better?", "Thirty seconds is a quick snapshot and kinder to beginners. Sixty seconds is the fairer measurement: it smooths out a lucky or unlucky first line and is closer to the number an employer-style test would give you. Take the 60-second test when you want a score you can compare week to week."),
        ("How can I type faster?", "Accuracy first — speed is a by-product of not stopping to fix mistakes. Keep your fingers on the home row (ASDF / JKL;), look at the passage instead of the keyboard, and practise in short daily bursts rather than rare long sessions. Most people gain 5–10 WPM in a few weeks of ten minutes a day."),
        ("Are my results saved or uploaded?", "No. The test runs in your browser and your score exists only on this screen. There is no account, no leaderboard upload and nothing stored — close the tab and the score is gone."),
        ("Can I use this on a phone or tablet?", "Yes — tap the typing box and your on-screen keyboard appears. Just know that phone scores are not comparable to physical-keyboard scores; the test measures whatever you are typing on."),
    ])
    + related_html(["word-counter", "character-counter", "text-to-speech", "spin-the-wheel"], "typing-speed-test")))

PAGES.append(dict(
    slug="meme-generator",
    title="Meme Generator — Make Memes Online Free, No Watermark | ToolPixi",
    desc="Free meme generator: add your photo or pick a built-in scene, write bold top and bottom text, and download a clean PNG. No watermark, no sign-up — made in your browser.",
    scripts=["/assets/js/common.js", "/assets/js/meme.js"],
    faqs=[
        ("Is this meme generator really free — and is there a watermark?", "Yes, and no watermark. The meme is drawn on a canvas in your browser and the PNG you download is the full, clean image. There is no premium tier holding the unwatermarked version hostage."),
        ("Where do the template scenes come from?", "They are drawn in code — gradients, a sunset, a stage spotlight, the sea, a chalkboard — so they are original artwork, not copied template images scraped from meme sites. Or skip them entirely and drop in your own photo, which is what most memes are made from anyway."),
        ("Can I use my own photo?", "Yes — drop any image into the box and it fills the square (centre-cropped). Add your text and download. The photo never leaves your device."),
        ("What size is the downloaded meme?", "800 × 800 pixels — the square format that posts cleanly to every social platform, group chat and forum."),
        ("Can I change the text colour and size?", "Yes. There is a size slider and a colour picker under the canvas. White text with the automatic black outline is the classic meme look and stays readable on any photo; the colour picker is there for when you want something else."),
        ("Are the memes I make uploaded or stored?", "No. The image, the text and the finished meme all live in your browser tab. Nothing is sent to a server, so nothing about your meme exists anywhere but your download."),
    ],
    body=page_head("Meme Generator",
                   "Your photo or a built-in scene, bold text top and bottom, and a clean PNG download — no watermark, no sign-up.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="meme-generator">
  <div style="text-align:center">
    <canvas id="mm-canvas" width="800" height="800" style="width:100%;max-width:440px;height:auto;border-radius:10px;border:1px solid #dbe3ec" role="img" aria-label="Meme preview"></canvas>
  </div>
  <div class="field" style="margin-top:14px"><label>Scene</label>
    <div class="chip-row">
      <button class="chip on" data-scene="sunset">Sunset</button>
      <button class="chip" data-scene="stage">Spotlight</button>
      <button class="chip" data-scene="ocean">Ocean</button>
      <button class="chip" data-scene="chalk">Chalkboard</button>
      <button class="chip" data-scene="plain">Plain</button>
    </div></div>
  <div class="drop" id="mm-drop"><div class="big">Tap to use your own photo — or drop it here</div>
  <div class="small">JPG, PNG, WebP — cropped to fill the square</div></div>
  <input type="file" class="hidden" id="mm-file">
  <p class="note" id="mm-note">Built-in scene — or drop your own photo below.</p>
  <div class="field"><label>Top text</label>
  <input type="text" id="mm-top" placeholder="e.g. WHEN THE WIFI DROPS" maxlength="90"></div>
  <div class="field"><label>Bottom text</label>
  <input type="text" id="mm-bottom" placeholder="e.g. DURING THE FINAL" maxlength="90"></div>
  <div class="row">
    <div class="field"><label>Text size</label>
      <input type="range" id="mm-size" min="30" max="96" value="56"></div>
    <div class="field"><label>Text colour</label><input type="color" id="mm-color" value="#ffffff"></div>
  </div>
  <div class="err" id="mm-err"></div>
  <button class="btn" id="mm-download">Download meme (PNG)</button>
</div>
""" + steps([
        "<strong>Pick a scene or drop in a photo.</strong> The built-in scenes are drawn in code; your own photo is centre-cropped to the square.",
        "<strong>Write the top and bottom text.</strong> Short and loud wins — the text is outlined automatically so it reads on any picture.",
        "<strong>Download the PNG.</strong> 800 × 800, clean, ready to post anywhere."])
    + """<section class="section"><h2>Why the classic meme format still works</h2>
<p>Top text, bottom text, one expressive picture: the format is twenty years old and still carries most of the internet's jokes because it asks almost nothing of the reader. The top line sets the scene, the picture does the acting, and the bottom line lands the punchline — three beats, half a second. The craft is in the compression. A meme caption that needs a second read has already failed, which is why the best ones use the fewest possible words and let the image carry the emotion.</p>
<p>Two habits separate the memes that travel from the ones that stall. First, contrast: white text with a black outline survives any photograph, which is why it became the standard — this generator draws that outline automatically. Second, cropping: a face or subject lost in a wide shot reads as nothing at phone size. Dropping your own photo in and letting it fill the square keeps the subject big, which is where the reaction lives.</p></section>
<section class="section"><h2>Your photo stays yours</h2>
<p>Most meme sites work by uploading your picture to their server — sometimes to a gallery you never asked to join. This generator never receives your photo at all: the canvas in your browser does the drawing, and the only copy of the finished meme is the file you download. Make something with a family photo, a screenshot, a picture of your own product — it is assembled on your device and exists nowhere else.</p></section>
""" + faq_html([
        ("Is this meme generator really free — and is there a watermark?", "Yes, and no watermark. The meme is drawn on a canvas in your browser and the PNG you download is the full, clean image. There is no premium tier holding the unwatermarked version hostage."),
        ("Where do the template scenes come from?", "They are drawn in code — gradients, a sunset, a stage spotlight, the sea, a chalkboard — so they are original artwork, not copied template images scraped from meme sites. Or skip them entirely and drop in your own photo, which is what most memes are made from anyway."),
        ("Can I use my own photo?", "Yes — drop any image into the box and it fills the square (centre-cropped). Add your text and download. The photo never leaves your device."),
        ("What size is the downloaded meme?", "800 × 800 pixels — the square format that posts cleanly to every social platform, group chat and forum."),
        ("Can I change the text colour and size?", "Yes. There is a size slider and a colour picker under the canvas. White text with the automatic black outline is the classic meme look and stays readable on any photo; the colour picker is there for when you want something else."),
        ("Are the memes I make uploaded or stored?", "No. The image, the text and the finished meme all live in your browser tab. Nothing is sent to a server, so nothing about your meme exists anywhere but your download."),
    ])
    + related_html(["image-watermark", "background-remover", "photo-collage-maker", "image-compressor"], "meme-generator")))

PAGES.append(dict(
    slug="gif-maker",
    title="GIF Maker — Make a GIF from Images Online Free | ToolPixi",
    desc="Free GIF maker: drop in your photos, set the frame timing and size, and download an animated GIF. No upload, no watermark, no sign-up — the GIF is built in your browser.",
    scripts=["/assets/js/common.js", CDN["gifjs"], "/assets/js/gif-maker.js"],
    faqs=[
        ("How do I make a GIF from images?", "Drop in two or more images — they become frames in the order you added them. Set how long each frame shows and the width, press Create GIF, and the animated file downloads. Remove a frame with the × on its thumbnail."),
        ("What frame delay should I use?", "400 ms per frame is a calm slideshow pace. 150–250 ms feels like motion; 700–1000 ms suits before-and-after comparisons where each frame needs reading time. Real video-like smoothness needs many frames at 40–80 ms — for that, turning a video clip into a GIF is the better tool."),
        ("Why is my GIF file so large?", "A GIF stores every frame as a full picture, so size grows with width, frame count and detail. Halving the width quarters the pixels. If a GIF comes out heavy, drop the width to 320px or trim a few frames — most chat platforms prefer GIFs under a few megabytes anyway."),
        ("Are my images uploaded to make the GIF?", "No. The encoder (gif.js) runs in your browser with a self-hosted worker script; your images are drawn onto a canvas on your device and the finished GIF downloads from your own tab."),
        ("Can I reorder the frames?", "Frames play in the order you added them. To change the order, remove frames with the × and re-add them in the sequence you want."),
        ("GIF or video — which should I send?", "GIFs autoplay silently and loop everywhere, including old chat apps — that is their whole charm. But a video of the same clip is usually ten times smaller. If file size matters more than the loop-everywhere behaviour, keep the video."),
    ],
    body=page_head("GIF Maker",
                   "Drop in a set of photos, choose the timing and size, and download an animated GIF — built on your device, never uploaded.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="gif-maker">
  <style>
    .gm-thumb{position:relative;display:inline-block;margin:5px}
    .gm-thumb img{width:88px;height:66px;object-fit:cover;border-radius:7px;border:1px solid #dbe3ec;display:block}
    .gm-thumb button{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;border:none;background:#b91c1c;color:#fff;cursor:pointer;line-height:1;font-size:13px}
    .gm-thumb span{position:absolute;left:5px;bottom:5px;background:rgba(0,0,0,.62);color:#fff;font-size:11px;padding:1px 6px;border-radius:8px}
  </style>
  <div class="drop" id="gm-drop"><div class="big">Tap to choose images — or drop them here</div>
  <div class="small">JPG, PNG, WebP — at least 2 images make an animation</div></div>
  <input type="file" class="hidden" id="gm-file">
  <div id="gm-frames" style="margin-top:10px"></div>
  <p class="note" id="gm-count">No frames yet — add at least 2 images.</p>
  <div class="row">
    <div class="field"><label>Frame timing — <span id="gm-delay-val">400 ms per frame</span></label>
      <input type="range" id="gm-delay" min="60" max="1200" step="20" value="400"></div>
    <div class="field"><label>GIF width</label>
      <select id="gm-width">
        <option value="320">320px — light, for chats</option>
        <option value="480" selected>480px — balanced</option>
        <option value="640">640px — large</option>
      </select></div>
  </div>
  <div class="err" id="gm-err"></div>
  <button class="btn" id="gm-go" disabled>Create GIF</button>
  <div class="result" id="gm-result" style="display:none">
    <img id="gm-preview" alt="Your animated GIF" style="max-width:100%;border-radius:8px;border:1px solid #dbe3ec">
    <p class="note" id="gm-done"></p>
    <button class="btn" id="gm-download">Download GIF again</button>
  </div>
</div>
""" + steps([
        "<strong>Add your images.</strong> They become frames in the order you add them — thumbnails show the sequence, × removes one.",
        "<strong>Set timing and width.</strong> 400 ms per frame is a slideshow; 150–250 ms feels like motion. Smaller width, smaller file.",
        "<strong>Create and download.</strong> The GIF is encoded in your browser and downloads the moment it is ready."])
    + """<section class="section"><h2>The honest trade-offs of the GIF format</h2>
<p>A GIF is a flip-book, not a video: every frame is stored as a complete picture, limited to 256 colours. That is why GIFs of photographs can look grainy and why a ten-second GIF can outweigh the video it came from by ten to one. It is also why the format refuses to die — a GIF needs no play button, no sound decision, no player support. It just loops, everywhere, including in apps older than some of their users.</p>
<p>Making a good one is mostly restraint. Fewer, wider-spaced frames read as a deliberate slideshow; many frames at a small width read as motion. Photographs with big flat areas — skies, walls, product shots on plain backgrounds — compress kindly; confetti and crowds do not. If the result is heavier than the platform you are sending it to allows, width is the lever: halving it quarters the pixels and usually the megabytes with it.</p></section>
<section class="section"><h2>Made here, not uploaded there</h2>
<p>The usual GIF-maker bargain is your images on someone else's server in exchange for an animation. This one runs the encoder — the open-source gif.js library — inside your browser, with its worker script served from this site. Your photos are drawn onto a canvas on your device, the frames are encoded there, and the GIF downloads from your own tab. Nothing to sign up for, nothing to delete afterwards.</p></section>
""" + faq_html([
        ("How do I make a GIF from images?", "Drop in two or more images — they become frames in the order you added them. Set how long each frame shows and the width, press Create GIF, and the animated file downloads. Remove a frame with the × on its thumbnail."),
        ("What frame delay should I use?", "400 ms per frame is a calm slideshow pace. 150–250 ms feels like motion; 700–1000 ms suits before-and-after comparisons where each frame needs reading time. Real video-like smoothness needs many frames at 40–80 ms — for that, turning a video clip into a GIF is the better tool."),
        ("Why is my GIF file so large?", "A GIF stores every frame as a full picture, so size grows with width, frame count and detail. Halving the width quarters the pixels. If a GIF comes out heavy, drop the width to 320px or trim a few frames — most chat platforms prefer GIFs under a few megabytes anyway."),
        ("Are my images uploaded to make the GIF?", "No. The encoder (gif.js) runs in your browser with a self-hosted worker script; your images are drawn onto a canvas on your device and the finished GIF downloads from your own tab."),
        ("Can I reorder the frames?", "Frames play in the order you added them. To change the order, remove frames with the × and re-add them in the sequence you want."),
        ("GIF or video — which should I send?", "GIFs autoplay silently and loop everywhere, including old chat apps — that is their whole charm. But a video of the same clip is usually ten times smaller. If file size matters more than the loop-everywhere behaviour, keep the video."),
    ])
    + related_html(["video-to-gif", "video-compressor", "image-compressor", "gif-to-jpg"], "gif-maker")))

PAGES.append(dict(
    slug="qr-code-scanner",
    title="QR Code Scanner — Scan QR Codes & Barcodes Online Free | ToolPixi",
    desc="Free QR code scanner: scan a QR code or barcode from an image or your camera and read what it says. Decoded on your device — the image is never uploaded.",
    scripts=["/assets/js/common.js", CDN["jsqr"], "/assets/js/qr-scanner.js"],
    faqs=[
        ("How do I scan a QR code from an image or screenshot?", "Choose “QR code” above, drop the image or screenshot into the box, and the decoded text appears instantly — a link, Wi-Fi details, payment text, whatever the code holds. This is the way to scan a code that is already on your own screen, where pointing a camera at it is impossible."),
        ("Can I scan a barcode instead of a QR code?", "Yes — switch the mode to “Barcode”. EAN-13, UPC, Code 128 and most other retail and warehouse barcodes are read from an image or the camera. Keep the bars horizontal, sharp and fully in frame."),
        ("Why scan a code on a computer at all?", "Because codes arrive on computers constantly: in emails, PDFs, slides, product listings and screenshots. Your phone can scan a poster, but it cannot scan its own screen — and sending a screenshot to your phone just to scan it back is a silly loop. This closes it."),
        ("Is the image I scan uploaded anywhere?", "No. The decoder (jsQR, and ZXing for barcodes) runs in your browser from this site's own files. The image is read into a canvas on your device, decoded there, and never transmitted."),
        ("The scan says no code was found — what helps?", "Use the sharpest version of the image you have, crop closer to the code, and make sure the whole code — including its quiet white border — is in frame. A straight-on shot beats an angled one; a screenshot beats a photo of a screen."),
        ("Is it safe to open what a QR code contains?", "Treat an unknown QR code like an unknown link: read what it says first — this tool shows you the text before you go anywhere — and only open it if it is the address you expected. Codes from strangers that lead to login or payment pages deserve suspicion."),
    ],
    body=page_head("QR Code Scanner",
                   "Scan a QR code or barcode from an image, a screenshot, or your camera — and read what it actually says before you open anything.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="qr-code-scanner">
  <div class="field"><label>What are you scanning?</label>
    <div class="chip-row">
      <button class="chip on" data-mode="qr">QR code</button>
      <button class="chip" data-mode="barcode">Barcode (EAN, UPC, Code 128…)</button>
    </div></div>
  <div class="drop" id="qs-drop"><div class="big" id="qs-drop-big">Tap to choose an image with a QR code — or drop it here</div>
  <div class="small">Screenshots work perfectly — the code never leaves your device</div></div>
  <input type="file" class="hidden" id="qs-file">
  <div style="margin-top:14px">
    <button class="btn" id="qs-start">Scan with camera</button>
    <button class="btn" id="qs-stop" style="display:none">Stop camera</button>
  </div>
  <video id="qs-video" style="display:none;width:100%;max-width:440px;border-radius:10px;margin-top:12px" playsinline muted></video>
  <p class="note" id="qs-status"></p>
  <div class="err" id="qs-err"></div>
  <div class="result" id="qs-result" style="display:none">
    <p class="note"><span id="qs-kind">QR code</span> says:</p>
    <div class="big-num" id="qs-value" style="word-break:break-all;font-size:20px"></div>
    <div style="margin-top:10px">
      <button class="btn" id="qs-copy">Copy</button>
      <a class="btn" id="qs-open" href="#" target="_blank" rel="noopener" style="display:none;text-decoration:none">Open link</a>
    </div>
  </div>
</div>
""" + steps([
        "<strong>Choose QR code or barcode.</strong> QR is the default; barcode mode reads EAN, UPC and Code 128 labels.",
        "<strong>Drop in an image — or open the camera.</strong> Screenshots, photos of packaging, codes inside PDFs: if it is a picture of a code, it scans.",
        "<strong>Read the result first.</strong> The decoded text shows in full, with a copy button — and an open button only when it is a web link."])
    + """<section class="section"><h2>The scan your phone cannot do</h2>
<p>Phone cameras made QR scanning effortless — except for the one code you look at most: the one on the screen in front of you. It arrives in an email, sits in a PDF invoice, appears in a slide deck or a product listing, and the camera on the back of your phone is no help at all. The usual workaround — photograph one screen with another device — is absurd, and it is the entire reason this tool exists: drop the screenshot in, read the code, done.</p>
<p>There is a safety habit worth building here, too. A QR code is a link you cannot read with your eyes, and that opacity is exactly what makes codes useful to scammers on posters and parking meters. Scanning with a tool that <em>shows you the destination before opening it</em> — as this one does — turns a blind leap into a checked step. If the text is not the address you expected, do not open it.</p></section>
<section class="section"><h2>Decoded here, not harvested there</h2>
<p>Many online scanners upload your image to a server to decode it — a strange price for reading a pattern of squares, especially when the image is a screenshot containing other things. This scanner decodes with the open-source jsQR and ZXing libraries running in your browser, served from this site's own files. Your image is drawn onto a canvas on your device, read there, and never sent anywhere.</p></section>
""" + faq_html([
        ("How do I scan a QR code from an image or screenshot?", "Choose “QR code” above, drop the image or screenshot into the box, and the decoded text appears instantly — a link, Wi-Fi details, payment text, whatever the code holds. This is the way to scan a code that is already on your own screen, where pointing a camera at it is impossible."),
        ("Can I scan a barcode instead of a QR code?", "Yes — switch the mode to “Barcode”. EAN-13, UPC, Code 128 and most other retail and warehouse barcodes are read from an image or the camera. Keep the bars horizontal, sharp and fully in frame."),
        ("Why scan a code on a computer at all?", "Because codes arrive on computers constantly: in emails, PDFs, slides, product listings and screenshots. Your phone can scan a poster, but it cannot scan its own screen — and sending a screenshot to your phone just to scan it back is a silly loop. This closes it."),
        ("Is the image I scan uploaded anywhere?", "No. The decoder (jsQR, and ZXing for barcodes) runs in your browser from this site's own files. The image is read into a canvas on your device, decoded there, and never transmitted."),
        ("The scan says no code was found — what helps?", "Use the sharpest version of the image you have, crop closer to the code, and make sure the whole code — including its quiet white border — is in frame. A straight-on shot beats an angled one; a screenshot beats a photo of a screen."),
        ("Is it safe to open what a QR code contains?", "Treat an unknown QR code like an unknown link: read what it says first — this tool shows you the text before you go anywhere — and only open it if it is the address you expected. Codes from strangers that lead to login or payment pages deserve suspicion."),
    ])
    + related_html(["qr-code-generator", "barcode-generator", "password-generator", "image-to-text"], "qr-code-scanner")))

PAGES.append(dict(
    slug="resume-builder",
    title="Resume Builder — Free CV Maker, Download PDF, No Sign-Up | ToolPixi",
    desc="Free resume builder: fill in your details, watch a clean A4 resume build itself in three templates, and download the PDF. No sign-up, no watermark, nothing uploaded.",
    scripts=["/assets/js/common.js", CDN["jspdf"], "/assets/js/resume.js"],
    faqs=[
        ("Is this resume builder really free — including the download?", "Yes, including the download. Many builders let you design for free and charge at the exact moment you need the file. Here the PDF is generated in your browser, so there is no paywall moment at all: build it, download it, apply."),
        ("Do I need to create an account?", "No account, no email address, no sign-up of any kind. The form lives in your browser tab; your details are never sent to a server, which also means they cannot be leaked, sold or spammed."),
        ("Which template should I choose?", "Modern (the coloured header band) suits sales, tech, design and most private-sector roles. Classic (serif, centred) reads as formal and safe for law, finance, academia and government. Minimal suits creative and senior roles where restraint signals confidence. When in doubt, Modern is the most widely accepted."),
        ("What should I write in each job's description?", "Achievements, not duties — one per line, with numbers wherever you honestly can. “Grew territory sales 24% in a year” beats “Responsible for sales”. Start each line with a strong verb: grew, cut, built, trained, launched, saved. Three to five lines per job is plenty."),
        ("How long should my resume be?", "One page for under ten years of experience; two pages is acceptable beyond that. Recruiters skim for seconds, not minutes — the preview here is a true A4 page, so what you see is the length they get."),
        ("What file do I get, and can I edit it later?", "A standard PDF — the format every application portal and email inbox accepts. Your entries stay in the tab while you work; if you close it, come back and re-type, or keep the downloaded PDF as your record. Nothing is stored on our side to come back to."),
    ],
    body=page_head("Resume Builder",
                   "Fill in the form and watch a clean, professional resume build itself beside it — then download the PDF. No sign-up, no watermark, no paywall at the download button.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="resume-builder">
  <style>
    .rb-entry{border:1px solid #dbe3ec;border-radius:10px;padding:12px 14px;margin:10px 0;background:#fbfcfe}
    .rb-rm{background:none;border:none;color:#b91c1c;cursor:pointer;font-size:13px;padding:2px 0}
    .rb-cols{display:grid;grid-template-columns:1fr;gap:18px}
    @media(min-width:900px){.rb-cols{grid-template-columns:1fr 1fr}}
  </style>
  <div class="rb-cols">
    <div>
      <div class="row">
        <div class="field"><label>Full name</label><input type="text" id="rb-name" placeholder="e.g. Ayesha Khan"></div>
        <div class="field"><label>Job title</label><input type="text" id="rb-title" placeholder="e.g. Sales Manager"></div>
      </div>
      <div class="row">
        <div class="field"><label>Email</label><input type="text" id="rb-email" placeholder="you@example.com"></div>
        <div class="field"><label>Phone</label><input type="text" id="rb-phone" placeholder="+1 555 010 2233"></div>
      </div>
      <div class="row">
        <div class="field"><label>Location</label><input type="text" id="rb-location" placeholder="City, Country"></div>
        <div class="field"><label>Website / LinkedIn</label><input type="text" id="rb-web" placeholder="linkedin.com/in/you"></div>
      </div>
      <div class="field"><label>Professional summary</label>
      <textarea id="rb-summary" rows="3" placeholder="Two or three sentences: your experience, your strongest skills, what you are looking for."></textarea></div>
      <h3 style="margin:16px 0 4px">Experience</h3>
      <div id="rb-exp-list"></div>
      <button class="btn" id="rb-add-exp" type="button">+ Add a job</button>
      <div class="field" style="margin-top:16px"><label>Skills (comma separated)</label>
      <input type="text" id="rb-skills" placeholder="e.g. Team leadership, Excel, Customer service, Negotiation"></div>
      <h3 style="margin:16px 0 4px">Education</h3>
      <div id="rb-edu-list"></div>
      <button class="btn" id="rb-add-edu" type="button">+ Add education</button>
      <div class="row" style="margin-top:16px">
        <div class="field"><label>Template</label>
          <select id="rb-template">
            <option value="modern" selected>Modern — coloured header band</option>
            <option value="classic">Classic — formal serif</option>
            <option value="minimal">Minimal — light and spare</option>
          </select></div>
        <div class="field"><label>Accent colour</label><input type="color" id="rb-accent" value="#0d7377"></div>
      </div>
      <div class="err" id="rb-err"></div>
      <button class="btn" id="rb-download">Download resume (PDF)</button>
    </div>
    <div>
      <p class="note" style="margin-top:0">Live preview — a true A4 page:</p>
      <div style="overflow:auto;border:1px solid #d7dce3;border-radius:8px;background:#e9edf1;padding:10px">
        <div id="rb-preview" style="aspect-ratio:1/1.294;max-width:620px;margin:0 auto;background:#fff;box-shadow:0 1px 6px rgba(0,0,0,.18)"></div>
      </div>
    </div>
  </div>
</div>
""" + steps([
        "<strong>Fill in your details.</strong> Name, title, contact, a two-sentence summary, then your jobs — achievements with numbers, one per line.",
        "<strong>Pick a template and accent.</strong> The preview is a true A4 page and updates as you type, so length surprises are impossible.",
        "<strong>Download the PDF.</strong> It is rendered on your device and is yours — no account, no watermark, no charge."])
    + """<section class="section"><h2>The download button is where most builders charge you</h2>
<p>The free resume builder business model is well known: the design is free, the templates are free, the advice is free — and the PDF costs money, because that is the one moment you cannot walk away from. This builder is built the other way. The PDF is rendered by an open-source library (jsPDF) running in your own browser, from details that never leave your device. There is no server storing your career history, no account to create, and no step at which a price can be attached.</p>
<p>That privacy point is worth more than it first looks. A resume is a dense little dossier — full name, phone, email, employers, dates — and the typical builder keeps a copy of all of it. Here, closing the tab erases everything. If you want a record, the PDF on your own device is the record.</p></section>
<section class="section"><h2>What recruiters actually read</h2>
<p>Studies of recruiter behaviour keep landing on the same uncomfortable number: the first look at a resume lasts seconds. What survives that look is structure — a clear name and title, a summary that says what you are, job entries whose first lines carry numbers. Duties describe the job you had; achievements describe the value you added, and only one of those gets interviews. “Responsible for a team” is a duty. “Trained a team of six; error rate fell 30%” is an achievement, and it fits in the same line.</p>
<p>Length discipline matters just as much. One page forces the choices that make a resume sharp: the recent and relevant stay, the distant and generic go. The live A4 preview beside the form exists for exactly this — you can see the page filling up as you type, and decide what earns its space while there is still space to decide in.</p></section>
""" + faq_html([
        ("Is this resume builder really free — including the download?", "Yes, including the download. Many builders let you design for free and charge at the exact moment you need the file. Here the PDF is generated in your browser, so there is no paywall moment at all: build it, download it, apply."),
        ("Do I need to create an account?", "No account, no email address, no sign-up of any kind. The form lives in your browser tab; your details are never sent to a server, which also means they cannot be leaked, sold or spammed."),
        ("Which template should I choose?", "Modern (the coloured header band) suits sales, tech, design and most private-sector roles. Classic (serif, centred) reads as formal and safe for law, finance, academia and government. Minimal suits creative and senior roles where restraint signals confidence. When in doubt, Modern is the most widely accepted."),
        ("What should I write in each job's description?", "Achievements, not duties — one per line, with numbers wherever you honestly can. “Grew territory sales 24% in a year” beats “Responsible for sales”. Start each line with a strong verb: grew, cut, built, trained, launched, saved. Three to five lines per job is plenty."),
        ("How long should my resume be?", "One page for under ten years of experience; two pages is acceptable beyond that. Recruiters skim for seconds, not minutes — the preview here is a true A4 page, so what you see is the length they get."),
        ("What file do I get, and can I edit it later?", "A standard PDF — the format every application portal and email inbox accepts. Your entries stay in the tab while you work; if you close it, come back and re-type, or keep the downloaded PDF as your record. Nothing is stored on our side to come back to."),
    ])
    + related_html(["invoice-generator", "number-to-words-converter", "pdf-to-word", "word-counter"], "resume-builder")))

PAGES.append(dict(
    slug="image-to-text",
    title="Image to Text (OCR) — Extract Text from Images Free | ToolPixi",
    desc="Free image to text converter with OCR: drop in a photo or screenshot and get the words out — copy them or download a text file. The image never leaves your device.",
    scripts=["/assets/js/common.js", "/assets/js/ocr.js"],
    faqs=[
        ("How does image to text (OCR) work here?", "OCR — optical character recognition — reads the shapes of letters in your image and turns them back into real, editable text. This page runs the open-source Tesseract OCR engine inside your browser: the first use loads the engine once (about 10 MB, from this site), after which recognition happens entirely on your device."),
        ("What kinds of images work best?", "Screenshots and documents with crisp, upright, dark text on a light background read almost perfectly. Handwriting, curved or rotated text, low light and busy backgrounds all reduce accuracy — straightening and cropping the image first helps more than anything."),
        ("Which languages are supported?", "English. The engine and its English language data are self-hosted on this site so the tool works without sending your image anywhere; other languages would each need their own data file."),
        ("Is my image uploaded for processing?", "No — and that is the point of running OCR in the browser. Documents people OCR are often private: letters, invoices, ID pages, screenshots of chats. Your image is read on your own device and never transmitted."),
        ("Can I OCR a PDF instead?", "For a text-based PDF, use the PDF to Text tool — it extracts the embedded text exactly, with no recognition errors. OCR is for images and scans, where no text is embedded to extract."),
        ("The result has mistakes — what can I do?", "Check the source image first: most OCR errors trace back to blur, glare, skew or tiny text. A cleaner, larger, straightened version usually fixes them. For a quick result, correcting a few characters in the box above is faster than re-scanning."),
    ],
    body=page_head("Image to Text (OCR)",
                   "Drop in a photo or screenshot and pull the words out of it — to copy, edit or download. The OCR engine runs on your device; the image is never uploaded.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="image-to-text">
  <div class="drop" id="it-drop"><div class="big">Tap to choose an image — or drop it here</div>
  <div class="small">Photos, screenshots, scans — JPG, PNG, WebP</div></div>
  <input type="file" class="hidden" id="it-file">
  <img id="it-thumb" alt="The image being read" style="display:none;max-width:100%;max-height:220px;border-radius:8px;border:1px solid #dbe3ec;margin-top:12px">
  <p class="note" id="it-status"></p>
  <progress id="it-progress" max="100" value="0" style="display:none;width:100%"></progress>
  <div class="err" id="it-err"></div>
  <div class="result" id="it-result" style="display:none">
    <div class="field"><label>Extracted text</label>
    <textarea id="it-out" rows="10" style="width:100%"></textarea></div>
    <p class="note" id="it-meta"></p>
    <button class="btn" id="it-copy">Copy text</button>
    <button class="btn" id="it-download">Download .txt</button>
  </div>
</div>
<div class="warn"><strong>Honest limits:</strong> OCR reads print, not handwriting — and blurry, angled or low-contrast photos produce mistakes. The engine loads once (about 10 MB) the first time you use the tool; after that it is quick.</div>
""" + steps([
        "<strong>Drop in your image.</strong> A screenshot, a photo of a document, a scan — anything with printed words in it.",
        "<strong>Wait a few seconds.</strong> The first run loads the OCR engine once; recognition itself happens on your device.",
        "<strong>Copy or download the text.</strong> Edit it right in the box first if a character or two needs correcting."])
    + """<section class="section"><h2>When OCR is the right tool — and when it is not</h2>
<p>OCR earns its keep wherever text exists only as a picture: the photo of a whiteboard, the screenshot of an error message you want to search, the scanned letter, the receipt, the sign. In all of those, retyping is the alternative, and retyping a page is nobody's idea of a good use of an hour. Recognition is not perfect — it is a reading, not a copy — so figures, names and anything legal deserve a proofread against the image.</p>
<p>One distinction saves real frustration: if your source is a PDF that was made on a computer, its text is usually embedded already, and the PDF to Text tool lifts it out exactly, character for character. OCR is for the other kind of document — scans and photos — where the words are only shapes of ink or pixels, and a reading engine is the only way back to editable text.</p></section>
<section class="section"><h2>Private documents stay private</h2>
<p>The things people most often need OCR for are the things they least want on a stranger's server: invoices, statements, ID documents, medical letters, screenshots of private conversations. Server-based OCR means uploading exactly those files. This tool takes the other route — the Tesseract engine, its worker and its English language data are all served from this site and run in your browser, so the image is read on your device and exists nowhere else, even briefly.</p></section>
""" + faq_html([
        ("How does image to text (OCR) work here?", "OCR — optical character recognition — reads the shapes of letters in your image and turns them back into real, editable text. This page runs the open-source Tesseract OCR engine inside your browser: the first use loads the engine once (about 10 MB, from this site), after which recognition happens entirely on your device."),
        ("What kinds of images work best?", "Screenshots and documents with crisp, upright, dark text on a light background read almost perfectly. Handwriting, curved or rotated text, low light and busy backgrounds all reduce accuracy — straightening and cropping the image first helps more than anything."),
        ("Which languages are supported?", "English. The engine and its English language data are self-hosted on this site so the tool works without sending your image anywhere; other languages would each need their own data file."),
        ("Is my image uploaded for processing?", "No — and that is the point of running OCR in the browser. Documents people OCR are often private: letters, invoices, ID pages, screenshots of chats. Your image is read on your own device and never transmitted."),
        ("Can I OCR a PDF instead?", "For a text-based PDF, use the PDF to Text tool — it extracts the embedded text exactly, with no recognition errors. OCR is for images and scans, where no text is embedded to extract."),
        ("The result has mistakes — what can I do?", "Check the source image first: most OCR errors trace back to blur, glare, skew or tiny text. A cleaner, larger, straightened version usually fixes them. For a quick result, correcting a few characters in the box above is faster than re-scanning."),
    ])
    + related_html(["pdf-to-text", "qr-code-scanner", "image-compressor", "word-counter"], "image-to-text")))

PAGES.append(dict(
    slug="invoice-generator",
    title="Invoice Generator — Free PDF Invoice Maker, No Sign-Up | ToolPixi",
    desc="Free invoice generator: add your details and items, see totals with tax worked out live, and download a professional PDF invoice. No sign-up, nothing uploaded.",
    scripts=["/assets/js/common.js", CDN["jspdf"], "/assets/js/invoice.js"],
    faqs=[
        ("Is this invoice generator free — really?", "Yes. The invoice is rendered in your browser with the open-source jsPDF library, so there is no server cost and no reason for a paywall: fill the form, download the PDF, send it to your client."),
        ("What should a proper invoice include?", "Your name or business and contact details, the client's details, a unique invoice number, the issue date and a due date, an itemised list of what was supplied with quantities and prices, any tax shown separately, and the total due. This form covers all of them — and payment details belong in the notes field."),
        ("How is the total calculated?", "Subtotal first (quantity × rate for every row), then your discount percentage comes off, then tax is charged on the discounted amount — the standard order in most countries. Totals update live as you type, so the number on the PDF is never a surprise."),
        ("Which currencies can I use?", "Dollars, euros, pounds, Indian rupees, Pakistani rupees, UAE dirhams, and Australian and Canadian dollars. The symbol prints on the PDF; the arithmetic is identical either way."),
        ("Are my invoice details stored anywhere?", "No. The form and the PDF both live in your browser tab. Client names, prices and totals are never sent to a server — closing the tab erases them, so keep the downloaded PDF as your copy."),
        ("Can I add my logo or brand colours?", "This version keeps a clean, standard layout with a teal header — the format clients and accountants process without a second look. For most freelancers and small businesses, a clear conventional invoice gets paid faster than a decorated one."),
    ],
    body=page_head("Invoice Generator",
                   "Fill in the form, watch the totals work themselves out, and download a professional PDF invoice — free, with no sign-up and nothing uploaded.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="invoice-generator">
  <style>
    .inv-item{display:grid;grid-template-columns:1fr 64px 84px 84px 28px;gap:7px;align-items:center;margin-bottom:8px}
    .inv-item input{width:100%}
    .inv-amt{text-align:right;font-weight:600}
    .inv-rm{width:26px;height:26px;border-radius:50%;border:none;background:#fee2e2;color:#b91c1c;cursor:pointer;font-size:14px;line-height:1}
    .inv-totals{max-width:340px;margin:14px 0 0 auto}
    .inv-totals .trow{display:flex;justify-content:space-between;padding:3px 0}
    .inv-totals .grand{border-top:2px solid #0d7377;font-weight:800;font-size:18px;margin-top:5px;padding-top:7px}
    @media(max-width:560px){.inv-item{grid-template-columns:1fr 52px 68px 68px 26px}}
  </style>
  <div class="row">
    <div class="field"><label>From (you / your business)</label>
    <textarea id="inv-from" rows="3" placeholder="Your name or business&#10;Address line&#10;email@example.com"></textarea></div>
    <div class="field"><label>Bill to (your client)</label>
    <textarea id="inv-to" rows="3" placeholder="Client name&#10;Address line&#10;email@example.com"></textarea></div>
  </div>
  <div class="row">
    <div class="field"><label>Invoice number</label><input type="text" id="inv-number" value="INV-001"></div>
    <div class="field"><label>Issue date</label><input type="date" id="inv-date"></div>
    <div class="field"><label>Due date</label><input type="date" id="inv-due"></div>
    <div class="field"><label>Currency</label>
      <select id="inv-currency">
        <option value="USD" selected>USD — $</option>
        <option value="EUR">EUR — €</option>
        <option value="GBP">GBP — £</option>
        <option value="INR">INR — ₹</option>
        <option value="PKR">PKR — Rs</option>
        <option value="AED">AED — د.إ</option>
        <option value="AUD">AUD — A$</option>
        <option value="CAD">CAD — C$</option>
      </select></div>
  </div>
  <h3 style="margin:16px 0 8px">Items</h3>
  <div id="inv-items"></div>
  <button class="btn" id="inv-add" type="button">+ Add item</button>
  <div class="row" style="margin-top:14px">
    <div class="field"><label>Discount %</label><input type="number" id="inv-discount" min="0" max="100" step="any" value="0"></div>
    <div class="field"><label>Tax %</label><input type="number" id="inv-tax" min="0" step="any" value="0"></div>
  </div>
  <div class="inv-totals">
    <div class="trow"><span>Subtotal</span><span id="inv-t-sub">$0.00</span></div>
    <div class="trow"><span>Discount</span><span id="inv-t-disc">−$0.00</span></div>
    <div class="trow"><span>Tax</span><span id="inv-t-tax">$0.00</span></div>
    <div class="trow grand"><span>Total due</span><span id="inv-t-total">$0.00</span></div>
  </div>
  <div class="field" style="margin-top:14px"><label>Notes (payment details, terms, a thank-you)</label>
  <textarea id="inv-notes" rows="3" placeholder="e.g. Payment by bank transfer to … — due within 14 days. Thank you for your business."></textarea></div>
  <div class="err" id="inv-err"></div>
  <button class="btn" id="inv-download">Download invoice (PDF)</button>
</div>
""" + steps([
        "<strong>Add who it is from and who it is for.</strong> Include contact details both ways — invoices get queried, and the answer should be on the page.",
        "<strong>Itemise the work.</strong> One row per item with quantity and rate; discount and tax are percentages, and the total updates as you type.",
        "<strong>Download and send the PDF.</strong> Put your payment details in the notes so the client can pay without emailing you to ask."])
    + """<section class="section"><h2>A clear invoice is a payment tool, not paperwork</h2>
<p>Invoices that get paid late usually share the same flaws: no due date, a single vague line (“services — $800”), or payment details missing entirely, so paying requires an email exchange before it can even start. Each flaw hands the client a reason to set the invoice aside, and set-aside invoices age badly. The form above is shaped against all three: a due date sits next to the issue date, items are itemised by default, and the notes field is there for bank details and terms.</p>
<p>The arithmetic order matters too, and this generator follows the standard one: discount comes off the subtotal first, then tax is charged on what remains. It is the order accountants expect, the order most tax rules assume, and the order that keeps the number on your invoice equal to the number in your books.</p></section>
<section class="section"><h2>Your prices stay off other people's servers</h2>
<p>An invoice is a small bundle of commercially sensitive facts — your clients, your rates, your revenue, one PDF at a time. Account-based invoice services keep all of it, forever, as the price of convenience. This generator keeps nothing: the form, the arithmetic and the PDF rendering all happen in your browser, and the only copy of the finished invoice is the file you download and send.</p></section>
""" + faq_html([
        ("Is this invoice generator free — really?", "Yes. The invoice is rendered in your browser with the open-source jsPDF library, so there is no server cost and no reason for a paywall: fill the form, download the PDF, send it to your client."),
        ("What should a proper invoice include?", "Your name or business and contact details, the client's details, a unique invoice number, the issue date and a due date, an itemised list of what was supplied with quantities and prices, any tax shown separately, and the total due. This form covers all of them — and payment details belong in the notes field."),
        ("How is the total calculated?", "Subtotal first (quantity × rate for every row), then your discount percentage comes off, then tax is charged on the discounted amount — the standard order in most countries. Totals update live as you type, so the number on the PDF is never a surprise."),
        ("Which currencies can I use?", "Dollars, euros, pounds, Indian rupees, Pakistani rupees, UAE dirhams, and Australian and Canadian dollars. The symbol prints on the PDF; the arithmetic is identical either way."),
        ("Are my invoice details stored anywhere?", "No. The form and the PDF both live in your browser tab. Client names, prices and totals are never sent to a server — closing the tab erases them, so keep the downloaded PDF as your copy."),
        ("Can I add my logo or brand colours?", "This version keeps a clean, standard layout with a teal header — the format clients and accountants process without a second look. For most freelancers and small businesses, a clear conventional invoice gets paid faster than a decorated one."),
    ])
    + related_html(["resume-builder", "number-to-words-converter", "currency-converter", "percentage-calculator"], "invoice-generator")))

PAGES.append(dict(
    slug="screen-recorder",
    title="Screen Recorder — Record Your Screen Online Free, No Install | ToolPixi",
    desc="Free screen recorder that runs in your browser: record a screen, tab or window with optional microphone, and download the WebM video. No install, nothing uploaded.",
    scripts=["/assets/js/common.js", "/assets/js/screen-recorder.js"],
    faqs=[
        ("How does a screen recorder work in a browser?", "Your browser itself does the capturing — the same built-in ability video calls use to share your screen. Press Start, pick the screen, browser tab or window to record, and the browser hands this page the picture. The page assembles it into a video file in memory and downloads it. Nothing is installed and nothing is uploaded."),
        ("What format is the recording, and how do I play it?", "WebM in Chrome, Edge and Firefox — it plays in any modern browser and uploads directly to YouTube and most platforms. Safari on newer Macs may produce an MP4 instead. If you need an MP4 from a WebM, any video converter handles it."),
        ("Can it record sound?", "Tick “microphone” to narrate over the recording — your mic is mixed in live. Tick “system / tab audio” and, when you share a browser tab in Chrome, that tab's own sound is captured too. Honest limit: macOS does not let browsers capture whole-system audio, so sounds from other apps on a Mac cannot be recorded by any web tool."),
        ("Is there a time or size limit?", "No tool-side limit — but the recording is held in your browser's memory until you stop, so very long recordings (hours) can strain a modest computer. For a long session, record in parts. A few minutes to half an hour is comfortable territory."),
        ("Is my recording uploaded or stored anywhere?", "No. There is no server in this tool at all: the video exists only in your tab's memory and in the file you download. Screen recordings often contain exactly the things you would never upload — this one never leaves your machine."),
        ("Which browser should I use?", "Chrome or Edge on a computer give the smoothest result, including tab audio. Firefox works well for video. On phones, browsers generally do not offer screen capture to web pages — use the phone's built-in screen recorder instead."),
    ],
    body=page_head("Screen Recorder",
                   "Record your whole screen, one window, or a single browser tab — right here, with no install — and download the video.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="screen-recorder">
  <div class="warn" id="sr-unsupported" style="display:none"><strong>This browser cannot record the screen.</strong> Screen capture needs Chrome, Edge or Firefox on a computer. Nothing is broken — the ability simply is not offered to web pages here (notably on phones).</div>
  <div class="field"><label><input type="checkbox" id="sr-mic" style="width:auto"> Record my microphone too (narration)</label></div>
  <div class="field"><label><input type="checkbox" id="sr-sysa" checked style="width:auto"> Ask for tab/system audio (Chrome offers it when you share a tab)</label></div>
  <div>
    <span id="sr-dot" style="display:none;color:#dc2626;font-size:20px;vertical-align:middle">●</span>
    <button class="btn" id="sr-start">Start recording</button>
    <button class="btn" id="sr-stop" style="display:none">Stop recording</button>
  </div>
  <p class="note" id="sr-status">You will be asked which screen, tab or window to share — the recording starts when you choose.</p>
  <div class="err" id="sr-err"></div>
  <div class="result" id="sr-result" style="display:none">
    <video id="sr-preview" controls style="width:100%;max-width:560px;border-radius:10px;border:1px solid #dbe3ec"></video>
    <p class="note" id="sr-meta"></p>
    <button class="btn" id="sr-download">Download recording</button>
  </div>
</div>
<div class="warn"><strong>Honest limits:</strong> recordings are WebM in most browsers (MP4 in newer Safari); macOS does not let any browser capture whole-system audio; and the video is held in memory until you stop, so record long sessions in parts.</div>
""" + steps([
        "<strong>Choose your sound.</strong> Microphone for narration; tab audio is offered by Chrome when you share a tab.",
        "<strong>Press Start and pick what to share.</strong> A whole screen, one window, or a single tab — you choose in the browser's own picker, and can stop from there too.",
        "<strong>Stop, preview, download.</strong> Watch the recording back on this page, then save the WebM file."])
    + """<section class="section"><h2>Why record in a browser at all?</h2>
<p>The classic route to a screen recording is installing an app — which means trusting an installer with the one permission that sees everything on your screen. The browser route inverts that trust: capture is a built-in browser ability, fenced by the picker you see when you press Start. You choose exactly which screen, window or tab is shared, a sharing indicator stays visible the whole time, and the page only ever receives what you picked. When you stop, the permission ends with it.</p>
<p>For the everyday jobs — showing a bug to a developer, recording a how-to for a colleague, saving a webinar clip, capturing a game moment — that is the whole requirement: press start, do the thing, download the video. Tutorials and bug reports in particular benefit from the microphone option: thirty seconds of narration replaces three paragraphs of “then I clicked the thing next to the other thing”.</p></section>
<section class="section"><h2>Nothing to upload because there is nowhere to upload to</h2>
<p>Most “online” screen recorders quietly send the video to a server for processing — screen contents included. This one cannot: the recording is assembled by your browser's own MediaRecorder in your tab's memory, and the download comes straight from there. Record a private document, a work system, your own desktop — the only copy that ever exists is the file on your device.</p></section>
""" + faq_html([
        ("How does a screen recorder work in a browser?", "Your browser itself does the capturing — the same built-in ability video calls use to share your screen. Press Start, pick the screen, browser tab or window to record, and the browser hands this page the picture. The page assembles it into a video file in memory and downloads it. Nothing is installed and nothing is uploaded."),
        ("What format is the recording, and how do I play it?", "WebM in Chrome, Edge and Firefox — it plays in any modern browser and uploads directly to YouTube and most platforms. Safari on newer Macs may produce an MP4 instead. If you need an MP4 from a WebM, any video converter handles it."),
        ("Can it record sound?", "Tick “microphone” to narrate over the recording — your mic is mixed in live. Tick “system / tab audio” and, when you share a browser tab in Chrome, that tab's own sound is captured too. Honest limit: macOS does not let browsers capture whole-system audio, so sounds from other apps on a Mac cannot be recorded by any web tool."),
        ("Is there a time or size limit?", "No tool-side limit — but the recording is held in your browser's memory until you stop, so very long recordings (hours) can strain a modest computer. For a long session, record in parts. A few minutes to half an hour is comfortable territory."),
        ("Is my recording uploaded or stored anywhere?", "No. There is no server in this tool at all: the video exists only in your tab's memory and in the file you download. Screen recordings often contain exactly the things you would never upload — this one never leaves your machine."),
        ("Which browser should I use?", "Chrome or Edge on a computer give the smoothest result, including tab audio. Firefox works well for video. On phones, browsers generally do not offer screen capture to web pages — use the phone's built-in screen recorder instead."),
    ])
    + related_html(["video-compressor", "video-to-gif", "mp4-to-mp3", "compress-video-for-discord"], "screen-recorder")))

PAGES.append(dict(
    slug="video-to-gif",
    title="Video to GIF — Convert Video to Animated GIF Free Online | ToolPixi",
    desc="Free video to GIF converter: trim the best seconds of any clip, pick the size, and download an animated GIF. Runs in your browser — the video never leaves your device.",
    scripts=["/assets/js/common.js"],
    faqs=[
        ("How do I convert a video to a GIF?", "Drop in your video, set the start and end of the slice you want (up to 15 seconds), pick a width, and press Convert. The clip is re-encoded as an animated GIF in your browser and downloads when ready."),
        ("Why is there a 15-second cap?", "A GIF stores every frame as a full picture — at 10 frames per second, 15 seconds is 150 pictures in one file. Longer slices produce files so large that chats and forums reject them, and the conversion would strain a phone's memory. The cap keeps the result usable; trim to the moment that matters."),
        ("What width should I choose?", "480px is the sweet spot for sharing — clear on phones, reasonable file size. 360px for group chats and forums where size limits bite; 240px for the lightest possible file, at visibly softer quality."),
        ("Why does the GIF have no sound?", "The GIF format has never carried sound — it is a picture format from 1987 that happens to move. If the sound matters, send the video; if the loop matters, send the GIF."),
        ("Is my video uploaded for conversion?", "No. The conversion engine is the open-source FFmpeg, running as WebAssembly inside your browser from files hosted on this site. Your video is processed on your device and never transmitted — which is why the engine (about 30 MB) loads once, on first use."),
        ("The result is bigger than I expected — what helps?", "Shorten the slice first — every second costs ten frames. Then drop a width step. Busy, detailed footage (crowds, confetti, rain) always produces heavier GIFs than calm footage at the same settings."),
    ],
    body=page_head("Video to GIF",
                   "Take the best seconds of a clip and turn them into a looping GIF — trimmed, sized and encoded on your device.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="video-to-gif">
  <div class="drop" id="vg-drop"><div class="big">Tap to choose a video — or drop it here</div>
  <div class="small">MP4, WebM, MOV — short clips work best</div></div>
  <input type="file" class="hidden" id="vg-file">
  <div class="file-list" id="vg-list"></div>
  <p class="note" id="vg-meta"></p>
  <div class="row">
    <div class="field"><label>Start (seconds)</label><input type="number" id="vg-start" min="0" step="0.1" value="0"></div>
    <div class="field"><label>End (seconds)</label><input type="number" id="vg-end" min="0" step="0.1" value="5"></div>
    <div class="field"><label>Width</label>
      <select id="vg-width">
        <option value="480" selected>480px — balanced</option>
        <option value="360">360px — lighter</option>
        <option value="240">240px — lightest</option>
      </select></div>
  </div>
  <p class="note" id="vg-est"></p>
  <button class="btn" id="vg-go" disabled>Convert to GIF</button>
  <p class="note" id="vg-status"></p>
  <progress id="vg-progress" max="100" value="0" style="display:none;width:100%"></progress>
  <div class="err" id="vg-err"></div>
  <div class="result" id="vg-result" style="display:none">
    <img id="vg-preview" alt="Your GIF" style="max-width:100%;border-radius:8px;border:1px solid #dbe3ec">
    <p class="note" id="vg-done"></p>
    <button class="btn" id="vg-download">Download GIF again</button>
  </div>
</div>
<div class="warn"><strong>Honest limits:</strong> slices are capped at 15 seconds and the engine (about 30 MB) downloads once on first use. GIFs have no sound — that is the format, not a fault.</div>
<script type="module" src="/assets/js/video-gif.js"></script>
""" + steps([
        "<strong>Choose your video.</strong> Its length is read automatically and the first five seconds are pre-selected.",
        "<strong>Trim and size it.</strong> Set the start and end of the moment (15 seconds max) and a width — the estimate updates as you go.",
        "<strong>Convert and download.</strong> The FFmpeg engine in your browser re-encodes the slice as a looping GIF."])
    + """<section class="section"><h2>Picking the slice is the whole craft</h2>
<p>A GIF is a moment, not a summary. The clips that work as GIFs share a shape: something changes — a reaction, a reveal, a before becoming an after — and the loop lands back at the start without a visible seam. When you trim, hunt for that shape: start a breath before the action, end a breath after it, and let the loop do the repeating. Fifteen seconds is the cap here, but most great GIFs live between two and six.</p>
<p>Size is the other half of the craft, and it is unforgiving arithmetic: ten frames a second, each a full picture. Width is the strongest lever you have — a 480px GIF carries four times the pixels of a 240px one. Send the 480 to a friend on a good connection; drop to 360 or 240 for the forum with a 2 MB limit and no sense of humour.</p></section>
<section class="section"><h2>Converted on your device, not on a server queue</h2>
<p>Upload-based converters make you wait in line and hand over the clip. This page loads the open-source FFmpeg engine into your browser — the same engine professionals use, compiled to WebAssembly and served from this site — and the conversion happens on your own hardware. A family clip, a screen recording, an unreleased draft: it is processed where it sits and the GIF downloads from your tab.</p></section>
""" + faq_html([
        ("How do I convert a video to a GIF?", "Drop in your video, set the start and end of the slice you want (up to 15 seconds), pick a width, and press Convert. The clip is re-encoded as an animated GIF in your browser and downloads when ready."),
        ("Why is there a 15-second cap?", "A GIF stores every frame as a full picture — at 10 frames per second, 15 seconds is 150 pictures in one file. Longer slices produce files so large that chats and forums reject them, and the conversion would strain a phone's memory. The cap keeps the result usable; trim to the moment that matters."),
        ("What width should I choose?", "480px is the sweet spot for sharing — clear on phones, reasonable file size. 360px for group chats and forums where size limits bite; 240px for the lightest possible file, at visibly softer quality."),
        ("Why does the GIF have no sound?", "The GIF format has never carried sound — it is a picture format from 1987 that happens to move. If the sound matters, send the video; if the loop matters, send the GIF."),
        ("Is my video uploaded for conversion?", "No. The conversion engine is the open-source FFmpeg, running as WebAssembly inside your browser from files hosted on this site. Your video is processed on your device and never transmitted — which is why the engine (about 30 MB) loads once, on first use."),
        ("The result is bigger than I expected — what helps?", "Shorten the slice first — every second costs ten frames. Then drop a width step. Busy, detailed footage (crowds, confetti, rain) always produces heavier GIFs than calm footage at the same settings."),
    ])
    + related_html(["gif-maker", "video-compressor", "compress-video-for-discord", "mp4-to-mp3"], "video-to-gif")))

PAGES.append(dict(
    slug="photo-collage-maker",
    title="Photo Collage Maker — Make a Collage Online Free | ToolPixi",
    desc="Free photo collage maker: pick a grid, drop in your photos, adjust the spacing, and download a clean PNG or JPG collage. No sign-up — made in your browser.",
    scripts=["/assets/js/common.js", "/assets/js/collage.js"],
    faqs=[
        ("How do I make a photo collage?", "Pick a layout, drop in your photos — they fill the grid cells in order — then set the gap between them and the background colour, and download the collage as PNG or JPG. Photos are centre-cropped to fit their cells, so faces near an edge can be trimmed: leave a little room around your subjects when you shoot."),
        ("Which layout should I choose?", "Four-grid (2×2) is the all-rounder for comparisons and round-ups. Hero puts one big photo beside two small ones — right for a main shot with details. Side-by-side suits before-and-after. The strips make banners and tall phone-shaped sets."),
        ("PNG or JPG — which download?", "JPG for sharing: smaller file, opens everywhere, and a collage is a photograph so it loses nothing visible. PNG if the collage will be edited further or printed and you want every pixel kept."),
        ("What size is the finished collage?", "1200 × 900 pixels — big enough for social posts, slides, listings and small prints, and small enough to send anywhere without a resize step."),
        ("Can I rearrange the photos?", "Photos fill the cells in the order you added them. To rearrange, press Clear photos and add them again in the order you want — or switch layouts: extra photos you added are kept and appear when a layout has more cells."),
        ("Are my photos uploaded?", "No. The collage is drawn on a canvas in your browser; your photos are read on your device and the finished image downloads from your own tab."),
    ],
    body=page_head("Photo Collage Maker",
                   "Pick a grid, drop in your photos, tune the spacing, and download a finished collage — no sign-up, no upload.")
    + PRIVACY_BADGE + """
<div class="tool-panel" id="photo-collage-maker">
  <div class="field"><label>Layout</label>
    <div class="chip-row">
      <button class="chip on" data-layout="grid4">Four grid</button>
      <button class="chip" data-layout="hero">Hero + two</button>
      <button class="chip" data-layout="side2">Side by side</button>
      <button class="chip" data-layout="trio">One + two</button>
      <button class="chip" data-layout="stripv">Rows</button>
      <button class="chip" data-layout="striph">Columns</button>
    </div></div>
  <div class="drop" id="pc-drop"><div class="big">Tap to choose photos — or drop them here</div>
  <div class="small">They fill the grid in the order you add them</div></div>
  <input type="file" class="hidden" id="pc-file">
  <div style="text-align:center;margin-top:14px">
    <canvas id="pc-canvas" width="1200" height="900" style="width:100%;max-width:560px;height:auto;border-radius:10px;border:1px solid #dbe3ec" role="img" aria-label="Collage preview"></canvas>
  </div>
  <p class="note" id="pc-count">No photos yet — add some above and they will fill the grid in order.</p>
  <div class="row">
    <div class="field"><label>Gap — <span id="pc-gap-val">12 px</span></label>
      <input type="range" id="pc-gap" min="0" max="48" value="12"></div>
    <div class="field"><label>Background / gap colour</label><input type="color" id="pc-bg" value="#ffffff"></div>
  </div>
  <div class="err" id="pc-err"></div>
  <button class="btn" id="pc-png">Download PNG</button>
  <button class="btn" id="pc-jpg">Download JPG</button>
  <button class="btn" id="pc-clear">Clear photos</button>
</div>
""" + steps([
        "<strong>Pick a layout.</strong> Four photos in a grid, a hero with two details, side-by-side for before-and-after — six shapes cover most jobs.",
        "<strong>Add your photos.</strong> They fill the cells in order, centre-cropped to fit. Tune the gap and its colour to taste.",
        "<strong>Download PNG or JPG.</strong> A finished 1200 × 900 collage, ready for posts, slides and listings."])
    + """<section class="section"><h2>A collage is an argument made of pictures</h2>
<p>One photo says “this”. A collage says “these, together” — the product and its details, the room before and after, the four dishes from one menu, the year in four seasons. That togetherness is the whole point, and it is why the layout matters more than any filter: the grid tells the reader how the pictures relate before a single one is examined. Equal cells say “compare these”; a hero cell says “start here, then look closer”; a strip says “follow along”.</p>
<p>The centre-crop deserves one warning. Each photo is scaled to fill its cell and trimmed at the edges, which is what makes mixed photos sit neatly together — but a face or a product touching the photo's edge can be trimmed with it. If a collage cuts something that matters, the fix is the photo, not the tool: re-add a version with a little more room around the subject.</p></section>
<section class="section"><h2>Assembled on your device</h2>
<p>Collage apps are notorious for two things: watermarks on the free tier, and your photo library on their servers. This maker does neither — the collage is drawn on a canvas in your browser, your photos are read locally, and the finished PNG or JPG downloads from your own tab. Family photos, product shots, listing pictures: assembled where they live, going nowhere.</p></section>
""" + faq_html([
        ("How do I make a photo collage?", "Pick a layout, drop in your photos — they fill the grid cells in order — then set the gap between them and the background colour, and download the collage as PNG or JPG. Photos are centre-cropped to fit their cells, so faces near an edge can be trimmed: leave a little room around your subjects when you shoot."),
        ("Which layout should I choose?", "Four-grid (2×2) is the all-rounder for comparisons and round-ups. Hero puts one big photo beside two small ones — right for a main shot with details. Side-by-side suits before-and-after. The strips make banners and tall phone-shaped sets."),
        ("PNG or JPG — which download?", "JPG for sharing: smaller file, opens everywhere, and a collage is a photograph so it loses nothing visible. PNG if the collage will be edited further or printed and you want every pixel kept."),
        ("What size is the finished collage?", "1200 × 900 pixels — big enough for social posts, slides, listings and small prints, and small enough to send anywhere without a resize step."),
        ("Can I rearrange the photos?", "Photos fill the cells in the order you added them. To rearrange, press Clear photos and add them again in the order you want — or switch layouts: extra photos you added are kept and appear when a layout has more cells."),
        ("Are my photos uploaded?", "No. The collage is drawn on a canvas in your browser; your photos are read on your device and the finished image downloads from your own tab."),
    ])
    + related_html(["meme-generator", "image-resizer", "image-cropper", "passport-photo-maker"], "photo-collage-maker")))
