/* ToolPixi — PDF.js based tools: PDF to JPG + Compress PDF (image-based recompression) */
function tpPdfJsReady() { return typeof pdfjsLib !== "undefined"; }
function tpSetupPdfJs(workerUrl) {
  if (tpPdfJsReady() && !pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}
async function tpRenderPageToJpeg(page, scale, quality) {
  var viewport = page.getViewport({ scale: scale });
  var canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;
  return tpCanvasToBlob(canvas, "image/jpeg", quality);
}

// ==== DOM: PDF to JPG ====
(function () {
  var panel = document.getElementById("pdf-to-jpg");
  if (!panel) return;
  tpSetupPdfJs(panel.getAttribute("data-worker"));
  var file = null;
  tpDropzone("pj-drop", "pj-file", {
    accept: "application/pdf", multiple: false,
    onFiles: function (f) {
      tpHideError("pj-err"); file = f[0]; tpFileList("pj-list", [file]);
      document.getElementById("pj-go").disabled = false;
    }
  });
  document.getElementById("pj-go").addEventListener("click", async function () {
    tpHideError("pj-err");
    if (!tpPdfJsReady()) { tpShowError("pj-err", "The PDF engine could not be loaded. Check your connection and refresh."); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Converting…";
    var bar = document.getElementById("pj-progress"); bar.style.display = "block"; bar.value = 0;
    try {
      var buf = await file.arrayBuffer();
      var doc = await pdfjsLib.getDocument({ data: buf }).promise;
      var scale = parseFloat(document.getElementById("pj-scale").value);
      var quality = parseFloat(document.getElementById("pj-quality").value);
      for (var p = 1; p <= doc.numPages; p++) {
        var page = await doc.getPage(p);
        var blob = await tpRenderPageToJpeg(page, scale, quality);
        if (blob) tpDownload(blob, tpStripExt(file.name) + "-page-" + p + ".jpg");
        bar.value = Math.round((p / doc.numPages) * 100);
        await new Promise(function (r) { setTimeout(r, 200); });
      }
      var res = document.getElementById("pj-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = doc.numPages + " page image(s) downloaded. Your browser may ask permission for multiple downloads.";
    } catch (e) {
      tpShowError("pj-err", "This PDF could not be opened. It may be password-protected or damaged.");
    } finally {
      btn.disabled = false; btn.textContent = "Convert pages to JPG";
      setTimeout(function () { bar.style.display = "none"; }, 600);
    }
  });
})();

// ==== DOM: Compress PDF (honest label: pages re-rendered as images) ====
(function () {
  var panel = document.getElementById("compress-pdf");
  if (!panel) return;
  tpSetupPdfJs(panel.getAttribute("data-worker"));
  var file = null, targetKB = 200;
  var chips = panel.querySelectorAll("[data-kb]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      targetKB = parseInt(chip.getAttribute("data-kb"), 10);
    });
  });
  tpDropzone("cp-drop", "cp-file", {
    accept: "application/pdf", multiple: false,
    onFiles: function (f) {
      tpHideError("cp-err"); file = f[0]; tpFileList("cp-list", [file]);
      document.getElementById("cp-go").disabled = false;
    }
  });
  document.getElementById("cp-go").addEventListener("click", async function () {
    tpHideError("cp-err");
    if (!tpPdfJsReady() || typeof PDFLib === "undefined") {
      tpShowError("cp-err", "The PDF engine could not be loaded. Check your connection and refresh."); return;
    }
    var btn = this; btn.disabled = true; btn.textContent = "Compressing…";
    var bar = document.getElementById("cp-progress"); bar.style.display = "block"; bar.value = 5;
    try {
      var target = targetKB * 1024;
      var buf = await file.arrayBuffer();
      var srcDoc = await pdfjsLib.getDocument({ data: buf }).promise;
      var settings = [ // [render scale, jpeg quality] from best quality to smallest
        [2.0, 0.82], [1.6, 0.72], [1.3, 0.62], [1.0, 0.52], [0.8, 0.42], [0.65, 0.35], [0.5, 0.3]
      ];
      var bestBytes = null, bestLabel = "";
      for (var s = 0; s < settings.length; s++) {
        var out = await PDFLib.PDFDocument.create();
        for (var p = 1; p <= srcDoc.numPages; p++) {
          var page = await srcDoc.getPage(p);
          var blob = await tpRenderPageToJpeg(page, settings[s][0], settings[s][1]);
          var img = await out.embedJpg(await blob.arrayBuffer());
          var pg = out.addPage([img.width, img.height]);
          pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          bar.value = Math.min(96, 5 + ((s * srcDoc.numPages + p) / (settings.length * srcDoc.numPages)) * 90);
        }
        var bytes = await out.save();
        if (!bestBytes || bytes.length < bestBytes.length) { bestBytes = bytes; bestLabel = settings[s][0] + "x"; }
        if (bytes.length <= target) { bestBytes = bytes; break; }
      }
      bar.value = 100;
      tpDownload(new Blob([bestBytes], { type: "application/pdf" }), tpStripExt(file.name) + "-compressed.pdf");
      var res = document.getElementById("cp-result");
      res.classList.add("show");
      document.getElementById("cp-orig").textContent = tpFormatBytes(file.size);
      document.getElementById("cp-new").textContent = tpFormatBytes(bestBytes.length);
      document.getElementById("cp-note").textContent = bestBytes.length <= target
        ? "At or under your " + targetKB + " KB target. Pages were re-rendered as high-quality images, so text stays readable but is no longer selectable."
        : "This is the smallest readable result we could reach (" + tpFormatBytes(bestBytes.length) +
          "). Scanned or photo-heavy PDFs have a size floor — the " + targetKB + " KB target may need a larger limit on the form.";
    } catch (e) {
      tpShowError("cp-err", "This PDF could not be compressed. It may be password-protected or damaged.");
    } finally {
      btn.disabled = false; btn.textContent = "Compress PDF";
      setTimeout(function () { bar.style.display = "none"; }, 600);
    }
  });
})();

// ==== DOM: PDF to PNG (transparent background preserved) ====
async function tpRenderPageToPng(page, scale) {
  var viewport = page.getViewport({ scale: scale });
  var canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
  var ctx = canvas.getContext("2d");
  // No white fill on purpose: PNG keeps a transparent background where the page has none.
  // pdf.js paints an opaque WHITE background by default, so the transparent
  // background has to be requested explicitly. Fixed 2026-11-16.
  await page.render({ canvasContext: ctx, viewport: viewport, background: "rgba(0, 0, 0, 0)" }).promise;
  return tpCanvasToBlob(canvas, "image/png");
}
(function () {
  var panel = document.getElementById("pdf-to-png");
  if (!panel) return;
  tpSetupPdfJs(panel.getAttribute("data-worker"));
  var file = null;
  tpDropzone("pn-drop", "pn-file", {
    accept: "application/pdf", multiple: false,
    onFiles: function (f) {
      tpHideError("pn-err"); file = f[0]; tpFileList("pn-list", [file]);
      document.getElementById("pn-go").disabled = false;
    }
  });
  document.getElementById("pn-go").addEventListener("click", async function () {
    tpHideError("pn-err");
    if (!tpPdfJsReady()) { tpShowError("pn-err", "The PDF engine could not be loaded. Check your connection and refresh."); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Converting…";
    var bar = document.getElementById("pn-progress"); bar.style.display = "block"; bar.value = 0;
    try {
      var buf = await file.arrayBuffer();
      var doc = await pdfjsLib.getDocument({ data: buf }).promise;
      var scale = parseFloat(document.getElementById("pn-scale").value);
      for (var p = 1; p <= doc.numPages; p++) {
        var page = await doc.getPage(p);
        var blob = await tpRenderPageToPng(page, scale);
        if (blob) tpDownload(blob, tpStripExt(file.name) + "-page-" + p + ".png");
        bar.value = Math.round((p / doc.numPages) * 100);
        await new Promise(function (r) { setTimeout(r, 200); });
      }
      var res = document.getElementById("pn-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = doc.numPages + " page image(s) downloaded as PNG. Your browser may ask permission for multiple downloads.";
    } catch (e) {
      tpShowError("pn-err", "This PDF could not be opened. It may be password-protected or damaged.");
    } finally {
      btn.disabled = false; btn.textContent = "Convert pages to PNG";
      setTimeout(function () { bar.style.display = "none"; }, 600);
    }
  });
})();

// ==== DOM: PDF to WebP (transparent background preserved, lossy quality setting) ====
async function tpRenderPageToWebp(page, scale, quality) {
  var viewport = page.getViewport({ scale: scale });
  var canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
  var ctx = canvas.getContext("2d");
  // No white fill on purpose: WebP keeps a transparent background where the page has none.
  // pdf.js paints an opaque WHITE background by default — request transparency
  // explicitly (same fix as PDF to PNG, 2026-11-16).
  await page.render({ canvasContext: ctx, viewport: viewport, background: "rgba(0, 0, 0, 0)" }).promise;
  return tpCanvasToBlob(canvas, "image/webp", quality);
}
(function () {
  var panel = document.getElementById("pdf-to-webp");
  if (!panel) return;
  tpSetupPdfJs(panel.getAttribute("data-worker"));
  var file = null;
  tpDropzone("pw-drop", "pw-file", {
    accept: "application/pdf", multiple: false,
    onFiles: function (f) {
      tpHideError("pw-err"); file = f[0]; tpFileList("pw-list", [file]);
      document.getElementById("pw-go").disabled = false;
    }
  });
  document.getElementById("pw-go").addEventListener("click", async function () {
    tpHideError("pw-err");
    if (!tpPdfJsReady()) { tpShowError("pw-err", "The PDF engine could not be loaded. Check your connection and refresh."); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Converting…";
    var bar = document.getElementById("pw-progress"); bar.style.display = "block"; bar.value = 0;
    try {
      var buf = await file.arrayBuffer();
      var doc = await pdfjsLib.getDocument({ data: buf }).promise;
      var scale = parseFloat(document.getElementById("pw-scale").value);
      var quality = parseFloat(document.getElementById("pw-quality").value);
      for (var p = 1; p <= doc.numPages; p++) {
        var page = await doc.getPage(p);
        var blob = await tpRenderPageToWebp(page, scale, quality);
        if (blob) tpDownload(blob, tpStripExt(file.name) + "-page-" + p + ".webp");
        bar.value = Math.round((p / doc.numPages) * 100);
        await new Promise(function (r) { setTimeout(r, 200); });
      }
      var res = document.getElementById("pw-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = doc.numPages + " page image(s) downloaded as WebP. Your browser may ask permission for multiple downloads.";
    } catch (e) {
      tpShowError("pw-err", "This PDF could not be opened. It may be password-protected or damaged.");
    } finally {
      btn.disabled = false; btn.textContent = "Convert pages to WebP";
      setTimeout(function () { bar.style.display = "none"; }, 600);
    }
  });
})();

(function () {
  var panel = document.getElementById("pdf-to-text");
  if (!panel) return;

  var file = null;
  var goBtn = document.getElementById("pt-go");
  var errEl = document.getElementById("pt-err");
  var resultEl = document.getElementById("pt-result");
  var countEl = document.getElementById("pt-count");
  var outputEl = document.getElementById("pt-output");
  var copyBtn = document.getElementById("pt-copy");
  var downloadBtn = document.getElementById("pt-download");
  var MAX_PAGES = 200;

  tpDropzone("pt-drop", "pt-file", {
    accept: "application/pdf",
    multiple: false,
    onFiles: function (files) {
      file = files && files[0] ? files[0] : null;
      tpFileList("pt-list", file ? [file] : []);
      tpHideError("pt-err");
      resultEl.classList.remove("show");
      if (goBtn) goBtn.disabled = !file;
    }
  });

  if (goBtn) goBtn.addEventListener("click", function () {
    if (!file) return;
    tpHideError("pt-err");
    resultEl.classList.remove("show");
    goBtn.disabled = true;
    goBtn.textContent = "Extracting…";

    if (!tpPdfJsReady()) {
      tpShowError("pt-err", "The PDF engine did not load. Check your connection and try again.");
      goBtn.disabled = false;
      goBtn.textContent = "Extract text";
      return;
    }

    file.arrayBuffer().then(function (buf) {
      tpSetupPdfJs(panel.getAttribute("data-worker"));
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var total = pdf.numPages;
      var count = Math.min(total, MAX_PAGES);
      var truncated = total > MAX_PAGES;
      var pages = [];
      var chain = Promise.resolve();
      for (var n = 1; n <= count; n++) {
        (function (pageNum) {
          chain = chain.then(function () {
            return pdf.getPage(pageNum).then(function (page) {
              return page.getTextContent().then(function (content) {
                var strs = [];
                for (var i = 0; i < content.items.length; i++) {
                  if (content.items[i].str) strs.push(content.items[i].str);
                }
                pages.push(strs.join(" "));
              });
            });
          });
        })(n);
      }
      return chain.then(function () {
        return { pages: pages, total: total, truncated: truncated };
      });
    }).then(function (res) {
      var text = res.pages.join("\n\n");
      if (!text.replace(/\s/g, "")) {
        tpShowError("pt-err", "No extractable text found — this looks like a scanned-image PDF, which needs OCR (not offered here).");
      } else {
        var words = text.replace(/\s+/g, " ").replace(/^\s|\s$/g, "").split(" ").length;
        countEl.textContent = res.pages.length + " pages · " + words + " words · " + text.length + " characters" +
          (res.truncated ? " · truncated at 200 pages of " + res.total : "");
        outputEl.value = text;
        resultEl.classList.add("show");
      }
    }).catch(function (err) {
      tpShowError("pt-err", "Could not read that PDF. It may be corrupted or password-protected.");
    }).then(function () {
      goBtn.disabled = false;
      goBtn.textContent = "Extract text";
    });
  });

  if (copyBtn) copyBtn.addEventListener("click", function () {
    var text = outputEl.value;
    var done = function () {
      copyBtn.textContent = "Copied!";
      setTimeout(function () { copyBtn.textContent = "Copy text"; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        outputEl.select();
        document.execCommand("copy");
        done();
      });
    } else {
      outputEl.select();
      document.execCommand("copy");
      done();
    }
  });

  if (downloadBtn) downloadBtn.addEventListener("click", function () {
    if (!file) return;
    var blob = new Blob([outputEl.value], { type: "text/plain" });
    tpDownload(blob, tpStripExt(file.name) + ".txt");
  });
})();

// ==== DOM: Add Text to PDF (click-to-place overlay; pdf.js preview + pdf-lib stamp) ====
(function () {
  var panel = document.getElementById("add-text-to-pdf");
  if (!panel) return;
  tpSetupPdfJs(panel.getAttribute("data-worker"));
  function el(id) { return document.getElementById(id); }
  var file = null, pdfBytes = null, pdfName = "", pdfDoc = null, pageCount = 0, curPage = 1,
      pageW = 0, pageH = 0, items = [], pending = null, rendering = false;
  var canvas = el("at-preview"), ctx = canvas.getContext("2d");
  function hexRgb(hex) {
    var n = parseInt(String(hex).replace("#", ""), 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }
  function drawItems() {
    items.forEach(function (it) {
      if (it.page !== curPage) return;
      var sx = canvas.width / pageW, sy = canvas.height / pageH;
      var px = it.x * sx, py = (pageH - it.y) * sy, fs = it.size * sy;
      ctx.font = fs + "px Helvetica, Arial, sans-serif";
      if (it.whiteout) {
        var tw = ctx.measureText(it.text).width;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px - 4, py - fs * 1.05, tw + 8, fs * 1.35);
      }
      ctx.fillStyle = it.color;
      ctx.fillText(it.text, px, py);
    });
    if (pending) {
      var sx = canvas.width / pageW, sy = canvas.height / pageH;
      var px = pending.x * sx, py = (pageH - pending.y) * sy;
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px - 8, py); ctx.lineTo(px + 8, py);
      ctx.moveTo(px, py - 8); ctx.lineTo(px, py + 8); ctx.stroke();
    }
  }
  async function renderPage(n) {
    if (!pdfDoc || rendering) return;
    rendering = true;
    try {
      var page = await pdfDoc.getPage(n);
      var vp1 = page.getViewport({ scale: 1 });
      pageW = vp1.width; pageH = vp1.height;
      var scale = Math.min(1.5, 900 / vp1.width);
      var vp = page.getViewport({ scale: scale });
      canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      drawItems();
      el("at-page-label").textContent = "Page " + n + " of " + pageCount;
      el("at-page").value = n;
    } catch (e) {
      tpShowError("at-err", "That page could not be rendered.");
    }
    rendering = false;
  }
  function refreshItems() {
    var box = el("at-items");
    if (!items.length) { box.innerHTML = "<p class=\"note\">No text placed yet — click on the preview, type the text, and press Add text.</p>"; return; }
    box.innerHTML = items.map(function (it, i) {
      return '<div class="fi"><span class="nm">Page ' + it.page + ': &ldquo;' + it.text.replace(/</g, "&lt;") +
        '&rdquo; (' + it.size + "pt" + (it.whiteout ? ", whiteout" : "") + ')</span>' +
        '<button class="btn ghost" type="button" data-at-del="' + i + '">Remove</button></div>';
    }).join("");
    box.querySelectorAll("[data-at-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        items.splice(parseInt(b.getAttribute("data-at-del"), 10), 1);
        refreshItems(); renderPage(curPage);
      });
    });
  }
  tpDropzone("at-drop", "at-file", {
    accept: "application/pdf", multiple: false,
    onFiles: function (files) {
      tpHideError("at-err");
      file = files[0];
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        tpShowError("at-err", "That file is not a PDF. Choose a .pdf document."); return;
      }
      if (!tpPdfJsReady()) { tpShowError("at-err", "The PDF engine could not be loaded. Check your connection and refresh."); return; }
      file.arrayBuffer().then(function (buf) {
        // Copy the bytes: pdf.js takes ownership of `buf` (transfers it to
        // its worker, detaching the original), and pdf-lib needs its own copy.
        pdfBytes = new Uint8Array(buf.slice(0));
        pdfName = file.name;
        return pdfjsLib.getDocument({ data: buf }).promise;
      }).then(function (doc) {
        pdfDoc = doc; pageCount = doc.numPages; curPage = 1;
        items = []; pending = null;
        tpFileList("at-list", [file], function () { return "· " + pageCount + (pageCount === 1 ? " page" : " pages"); });
        el("at-page").max = pageCount; el("at-page").value = 1;
        el("at-preview-wrap").style.display = "";
        el("at-controls").style.display = "";
        refreshItems();
        renderPage(1);
      }).catch(function () {
        tpShowError("at-err", "That PDF could not be read — it may be encrypted or damaged. Try an unprotected copy.");
      });
    }
  });
  canvas.addEventListener("click", function (e) {
    if (!pdfDoc) return;
    var r = canvas.getBoundingClientRect();
    var cx = (e.clientX - r.left) * canvas.width / r.width;
    var cy = (e.clientY - r.top) * canvas.height / r.height;
    pending = { x: cx * pageW / canvas.width, y: pageH - cy * pageH / canvas.height };
    el("at-pos").textContent = "Text will start here — page " + curPage +
      ", " + Math.round(pending.x) + "pt from the left, " + Math.round(pending.y) + "pt up from the bottom. Type the text below and press Add text.";
    renderPage(curPage);
  });
  el("at-prev").addEventListener("click", function () {
    if (curPage > 1) { curPage--; pending = null; renderPage(curPage); }
  });
  el("at-next").addEventListener("click", function () {
    if (curPage < pageCount) { curPage++; pending = null; renderPage(curPage); }
  });
  el("at-page").addEventListener("change", function () {
    var n = Math.min(Math.max(parseInt(el("at-page").value, 10) || 1, 1), pageCount);
    curPage = n; pending = null; renderPage(curPage);
  });
  el("at-add").addEventListener("click", function () {
    tpHideError("at-err");
    if (!pdfDoc) { tpShowError("at-err", "Choose a PDF first."); return; }
    if (!pending) { tpShowError("at-err", "Click on the preview first — that is where the text will start."); return; }
    var text = el("at-text").value.replace(/^\s+|\s+$/g, "");
    if (!text) { tpShowError("at-err", "Type the text to add first."); return; }
    items.push({ page: curPage, x: pending.x, y: pending.y, text: text,
      size: parseInt(el("at-size").value, 10) || 18,
      color: el("at-color").value, whiteout: el("at-whiteout").checked });
    pending = null;
    el("at-pos").textContent = "Placed. Click another spot to add more text, or download the finished PDF.";
    el("at-text").value = "";
    refreshItems(); renderPage(curPage);
  });
  el("at-go").addEventListener("click", function () {
    tpHideError("at-err");
    if (!pdfDoc) { tpShowError("at-err", "Choose a PDF first."); return; }
    if (!items.length) { tpShowError("at-err", "Place at least one piece of text first — click on the preview, then Add text."); return; }
    if (typeof PDFLib === "undefined") {
      tpShowError("at-err", "The PDF engine could not be loaded. Check your connection and refresh."); return;
    }
    var btn = this; btn.disabled = true; btn.textContent = "Adding text…";
    PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true }).then(function (doc) {
      return doc.embedFont(PDFLib.StandardFonts.Helvetica).then(function (font) {
        items.forEach(function (it) {
          var page = doc.getPage(it.page - 1);
          var c = hexRgb(it.color);
          if (it.whiteout) {
            var tw = font.widthOfTextAtSize(it.text, it.size);
            page.drawRectangle({ x: it.x - 4, y: it.y - it.size * 0.3,
              width: tw + 8, height: it.size * 1.35, color: PDFLib.rgb(1, 1, 1) });
          }
          page.drawText(it.text, { x: it.x, y: it.y, size: it.size, font: font,
            color: PDFLib.rgb(c.r, c.g, c.b) });
        });
        return doc.save();
      });
    }).then(function (outBytes) {
      tpDownload(new Blob([outBytes], { type: "application/pdf" }), tpStripExt(pdfName) + "-with-text.pdf");
      el("at-done").textContent = "Downloaded: " + tpStripExt(pdfName) + "-with-text.pdf — " +
        items.length + " piece(s) of text added. Your original file is untouched.";
      el("at-result").classList.add("show");
    }).catch(function () {
      tpShowError("at-err", "Adding the text failed — the PDF may use a structure this tool cannot edit. Your original file is untouched.");
    }).then(function () {
      btn.disabled = false; btn.textContent = "Add text & download PDF";
    });
  });
})();
