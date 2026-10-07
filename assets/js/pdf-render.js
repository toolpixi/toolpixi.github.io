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
