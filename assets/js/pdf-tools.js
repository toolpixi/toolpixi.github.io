/* ToolPixi — PDF tools built on pdf-lib (JPG to PDF, Merge PDF, Split PDF) */
// ==== PURE ====
/* Parse "1-3, 5, 8-10" into sorted unique 0-based page indexes. total = page count. */
function tpParseRanges(text, total) {
  var pages = {}, out = [];
  String(text).split(",").forEach(function (part) {
    var m = part.trim().match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) return;
    var a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a;
    if (b < a) { var t = a; a = b; b = t; }
    for (var p = a; p <= b; p++) {
      if (p >= 1 && p <= total && !pages[p]) { pages[p] = 1; out.push(p - 1); }
    }
  });
  return out.sort(function (x, y) { return x - y; });
}
function tpLibsReady() { return typeof PDFLib !== "undefined"; }
function tpNoLib(id) {
  tpShowError(id, "The PDF engine could not be loaded. Check your internet connection and refresh the page.");
}

// ==== DOM: JPG to PDF ====
(function () {
  var panel = document.getElementById("jpg-to-pdf");
  if (!panel) return;
  var files = [];
  tpDropzone("jp-drop", "jp-file", {
    accept: "image/jpeg,image/png,image/webp", multiple: true,
    onFiles: function (f) {
      tpHideError("jp-err");
      files = files.concat(f);
      tpFileList("jp-list", files);
      document.getElementById("jp-go").disabled = files.length === 0;
    }
  });
  document.getElementById("jp-clear").addEventListener("click", function () {
    files = []; tpFileList("jp-list", []); document.getElementById("jp-go").disabled = true;
  });
  document.getElementById("jp-go").addEventListener("click", async function () {
    tpHideError("jp-err");
    if (!tpLibsReady()) { tpNoLib("jp-err"); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Building PDF…";
    try {
      var pdf = await PDFLib.PDFDocument.create();
      var sizeMode = document.getElementById("jp-size").value; // fit | a4
      for (var i = 0; i < files.length; i++) {
        var buf = await files[i].arrayBuffer();
        var img;
        if (files[i].type === "image/png") img = await pdf.embedPng(buf);
        else if (files[i].type === "image/webp") {
          // pdf-lib cannot embed WebP: re-encode to JPEG through a canvas.
          var r = await tpLoadImageFromFile(files[i]);
          var cv = tpDrawScaled(r.img, 1, true);
          var jb = await tpCanvasToBlob(cv, "image/jpeg", 0.92);
          URL.revokeObjectURL(r.url);
          img = await pdf.embedJpg(await jb.arrayBuffer());
        } else img = await pdf.embedJpg(buf);
        var page;
        if (sizeMode === "a4") {
          page = pdf.addPage(PDFLib.PageSizes.A4);
          var margin = 36, maxW = page.getWidth() - margin * 2, maxH = page.getHeight() - margin * 2;
          var s = Math.min(maxW / img.width, maxH / img.height, 1);
          var w = img.width * s, h = img.height * s;
          page.drawImage(img, { x: (page.getWidth() - w) / 2, y: (page.getHeight() - h) / 2, width: w, height: h });
        } else {
          page = pdf.addPage([img.width * 0.75, img.height * 0.75]); // px -> pt at 96dpi
          page.drawImage(img, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        }
      }
      var bytes = await pdf.save();
      tpDownload(new Blob([bytes], { type: "application/pdf" }), "images-to-pdf.pdf");
      var res = document.getElementById("jp-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = "PDF created with " + files.length +
        " page(s), " + tpFormatBytes(bytes.length) + ". It never left your device.";
    } catch (e) {
      tpShowError("jp-err", "Could not build the PDF. One of the images may be damaged — try removing it and converting again.");
    } finally { btn.disabled = false; btn.textContent = "Create PDF"; }
  });
})();

// ==== DOM: Merge PDF ====
(function () {
  var panel = document.getElementById("merge-pdf");
  if (!panel) return;
  var files = [];
  tpDropzone("mp-drop", "mp-file", {
    accept: "application/pdf", multiple: true,
    onFiles: function (f) {
      tpHideError("mp-err");
      files = files.concat(f);
      tpFileList("mp-list", files, function (x, i) { return "· file " + (i + 1); });
      document.getElementById("mp-go").disabled = files.length < 2;
      document.getElementById("mp-note").textContent = files.length < 2
        ? "Add at least two PDF files to merge." : "Files will be merged top to bottom in this order.";
    }
  });
  document.getElementById("mp-clear").addEventListener("click", function () {
    files = []; tpFileList("mp-list", []); document.getElementById("mp-go").disabled = true;
  });
  document.getElementById("mp-go").addEventListener("click", async function () {
    tpHideError("mp-err");
    if (!tpLibsReady()) { tpNoLib("mp-err"); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Merging…";
    try {
      var out = await PDFLib.PDFDocument.create();
      var total = 0;
      for (var i = 0; i < files.length; i++) {
        var src = await PDFLib.PDFDocument.load(await files[i].arrayBuffer());
        var pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach(function (p) { out.addPage(p); });
        total += src.getPageCount();
      }
      var bytes = await out.save();
      tpDownload(new Blob([bytes], { type: "application/pdf" }), "merged.pdf");
      var res = document.getElementById("mp-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = "Merged " + files.length + " files into one " +
        total + "-page PDF (" + tpFormatBytes(bytes.length) + ").";
    } catch (e) {
      tpShowError("mp-err", "One of these PDFs could not be read (it may be password-protected or damaged). Remove it and try again.");
    } finally { btn.disabled = false; btn.textContent = "Merge PDFs"; }
  });
})();

// ==== DOM: Split PDF ====
(function () {
  var panel = document.getElementById("split-pdf");
  if (!panel) return;
  var file = null, pageCount = 0;
  tpDropzone("sp-drop", "sp-file", {
    accept: "application/pdf", multiple: false,
    onFiles: async function (f) {
      tpHideError("sp-err");
      if (!tpLibsReady()) { tpNoLib("sp-err"); return; }
      file = f[0];
      tpFileList("sp-list", [file]);
      try {
        var doc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        pageCount = doc.getPageCount();
        document.getElementById("sp-info").textContent = "This PDF has " + pageCount + " page(s).";
        document.getElementById("sp-go").disabled = false;
        document.getElementById("sp-all").disabled = false;
      } catch (e) {
        tpShowError("sp-err", "This PDF could not be read. It may be password-protected or damaged.");
      }
    }
  });
  function loadSrc() { return PDFLib.PDFDocument.load(file.arrayBuffer()); }
  document.getElementById("sp-go").addEventListener("click", async function () {
    tpHideError("sp-err");
    var btn = this; btn.disabled = true; btn.textContent = "Splitting…";
    try {
      var src = await loadSrc();
      var groups = document.getElementById("sp-ranges").value.split(";").map(function (s) { return s.trim(); }).filter(Boolean);
      if (!groups.length) groups = [document.getElementById("sp-ranges").value];
      var made = 0;
      for (var g = 0; g < groups.length; g++) {
        var idx = tpParseRanges(groups[g], pageCount);
        if (!idx.length) continue;
        var out = await PDFLib.PDFDocument.create();
        var pages = await out.copyPages(src, idx);
        pages.forEach(function (p) { out.addPage(p); });
        var bytes = await out.save();
        tpDownload(new Blob([bytes], { type: "application/pdf" }),
          tpStripExt(file.name) + "-pages-" + groups[g].replace(/[^0-9-]/g, "") + ".pdf");
        made++;
        await new Promise(function (r) { setTimeout(r, 300); });
      }
      if (!made) throw new Error("No valid pages in that range. Check the page numbers and try again.");
      var res = document.getElementById("sp-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = made + " PDF file(s) downloaded. Pages are in the same order and quality as the original.";
    } catch (e) {
      tpShowError("sp-err", e.message || "Splitting failed.");
    } finally { btn.disabled = false; btn.textContent = "Split PDF"; }
  });
  document.getElementById("sp-all").addEventListener("click", async function () {
    tpHideError("sp-err");
    var btn = this; btn.disabled = true; btn.textContent = "Splitting…";
    try {
      var src = await loadSrc();
      for (var p = 0; p < pageCount; p++) {
        var out = await PDFLib.PDFDocument.create();
        var pages = await out.copyPages(src, [p]);
        out.addPage(pages[0]);
        var bytes = await out.save();
        tpDownload(new Blob([bytes], { type: "application/pdf" }),
          tpStripExt(file.name) + "-page-" + (p + 1) + ".pdf");
        await new Promise(function (r) { setTimeout(r, 300); });
      }
      var res = document.getElementById("sp-result");
      res.classList.add("show");
      res.querySelector(".note").textContent = pageCount + " single-page PDFs downloaded. Your browser may ask permission for multiple downloads.";
    } catch (e) {
      tpShowError("sp-err", "Splitting failed. The file may be password-protected.");
    } finally { btn.disabled = false; btn.textContent = "Split into single pages"; }
  });
})();
