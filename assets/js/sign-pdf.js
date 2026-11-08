/* ToolPixi — Sign PDF: draw or type a signature, stamp it onto a PDF page.
   Everything runs locally with pdf-lib; the document never leaves the device. */
(function () {
  var panel = document.getElementById("sign-pdf");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  var drop = el("sp-drop"), fileIn = el("sp-file"), list = el("sp-list"),
      err = el("sp-err"), goBtn = el("sp-go"), result = el("sp-result"),
      pageIn = el("sp-page"), posSel = el("sp-pos"), sizeIn = el("sp-size"),
      sizeVal = el("sp-size-val"), nameIn = el("sp-name"),
      pad = el("sp-pad");
  var pdfBytes = null, pdfName = "", pageCount = 0, mode = "draw";

  // ---------- file picking ----------
  function setFile(file) {
    tpHideError("sp-err");
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
      tpShowError("sp-err", "That file is not a PDF. Choose a .pdf document to sign.");
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      pdfBytes = new Uint8Array(reader.result);
      pdfName = file.name;
      PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true }).then(function (doc) {
        pageCount = doc.getPageCount();
        pageIn.max = pageCount;
        pageIn.value = pageCount; // signatures usually go on the last page
        tpFileList("sp-list", [file], function () {
          return "· " + pageCount + (pageCount === 1 ? " page" : " pages");
        });
        goBtn.disabled = false;
      }).catch(function () {
        pdfBytes = null;
        tpShowError("sp-err", "That PDF could not be read — it may be encrypted or damaged. Try an unprotected copy.");
      });
    };
    reader.readAsArrayBuffer(file);
  }
  tpDropzone("sp-drop", "sp-file", { accept: "application/pdf",
    onFiles: function (files) { if (files.length) setFile(files[0]); } });

  // ---------- signature mode tabs ----------
  panel.querySelectorAll("[data-sp-mode]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      mode = btn.getAttribute("data-sp-mode");
      panel.querySelectorAll("[data-sp-mode]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      el("sp-draw-wrap").style.display = mode === "draw" ? "" : "none";
      el("sp-type-wrap").style.display = mode === "type" ? "" : "none";
    });
  });

  // ---------- drawing pad ----------
  var ctx = pad.getContext("2d"), drawing = false, hasInk = false, last = null;
  ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = "#1a237e";
  function padPos(e) {
    var r = pad.getBoundingClientRect();
    return { x: (e.clientX - r.left) * pad.width / r.width,
             y: (e.clientY - r.top) * pad.height / r.height };
  }
  pad.addEventListener("pointerdown", function (e) {
    drawing = true; last = padPos(e); pad.setPointerCapture(e.pointerId);
    ctx.beginPath(); ctx.moveTo(last.x, last.y);
    ctx.lineTo(last.x + 0.1, last.y + 0.1); ctx.stroke(); hasInk = true;
  });
  pad.addEventListener("pointermove", function (e) {
    if (!drawing) return;
    var p = padPos(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p; hasInk = true;
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
    pad.addEventListener(ev, function () { drawing = false; });
  });
  el("sp-clear").addEventListener("click", function () {
    ctx.clearRect(0, 0, pad.width, pad.height); hasInk = false;
  });

  // ---------- signature image ----------
  function trimmedCanvas(src) {
    var c = src.getContext("2d"), w = src.width, h = src.height;
    var data = c.getImageData(0, 0, w, h).data;
    var minX = w, minY = h, maxX = -1, maxY = -1;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null;
    var padPx = 6;
    minX = Math.max(0, minX - padPx); minY = Math.max(0, minY - padPx);
    maxX = Math.min(w - 1, maxX + padPx); maxY = Math.min(h - 1, maxY + padPx);
    var out = document.createElement("canvas");
    out.width = maxX - minX + 1; out.height = maxY - minY + 1;
    out.getContext("2d").drawImage(src, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }
  function signatureCanvas() {
    if (mode === "draw") {
      if (!hasInk) return null;
      return trimmedCanvas(pad);
    }
    var name = nameIn.value.replace(/^\s+|\s+$/g, "");
    if (!name) return null;
    var c = document.createElement("canvas");
    c.width = 1000; c.height = 300;
    var x = c.getContext("2d");
    x.font = "italic 600 150px 'Segoe Script', 'Brush Script MT', 'Snell Roundhand', cursive";
    x.fillStyle = "#1a237e"; x.textBaseline = "middle";
    x.fillText(name, 20, 160);
    return trimmedCanvas(c);
  }

  sizeIn.addEventListener("input", function () { sizeVal.textContent = sizeIn.value + "%"; });

  // ---------- sign ----------
  goBtn.addEventListener("click", function () {
    tpHideError("sp-err");
    if (!pdfBytes) { tpShowError("sp-err", "Choose a PDF first."); return; }
    var sig = signatureCanvas();
    if (!sig) {
      tpShowError("sp-err", mode === "draw" ? "Draw your signature in the box first." : "Type your name first.");
      return;
    }
    goBtn.disabled = true; goBtn.textContent = "Signing…";
    var pngUrl = sig.toDataURL("image/png");
    fetch(pngUrl).then(function (r) { return r.arrayBuffer(); }).then(function (pngBytes) {
      return PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true }).then(function (doc) {
        return doc.embedPng(pngBytes).then(function (img) { return { doc: doc, img: img }; });
      });
    }).then(function (bundle) {
      var doc = bundle.doc, img = bundle.img;
      var pNum = Math.min(Math.max(parseInt(pageIn.value, 10) || pageCount, 1), pageCount);
      var page = doc.getPage(pNum - 1);
      var size = page.getSize();
      var targetW = size.width * (parseInt(sizeIn.value, 10) || 25) / 100;
      var scale = targetW / img.width;
      var w = targetW, h = img.height * scale, margin = 36, x, y;
      var pos = posSel.value;
      if (pos === "bottom-right") { x = size.width - w - margin; y = margin; }
      else if (pos === "bottom-left") { x = margin; y = margin; }
      else if (pos === "top-right") { x = size.width - w - margin; y = size.height - h - margin; }
      else if (pos === "top-left") { x = margin; y = size.height - h - margin; }
      else { x = (size.width - w) / 2; y = (size.height - h) / 2; }
      page.drawImage(img, { x: x, y: y, width: w, height: h });
      return doc.save();
    }).then(function (outBytes) {
      var blob = new Blob([outBytes], { type: "application/pdf" });
      var outName = pdfName.replace(/\.pdf$/i, "") + "-signed.pdf";
      tpDownload(blob, outName);
      result.classList.add("show");
      el("sp-done").textContent = "Signed copy downloaded: " + outName +
        " — signature stamped on page " + (parseInt(pageIn.value, 10) || pageCount) + " of " + pageCount + ".";
      goBtn.disabled = false; goBtn.textContent = "Sign PDF & Download";
    }).catch(function () {
      tpShowError("sp-err", "Signing failed — the PDF may use a structure this tool cannot edit. Your original file is untouched.");
      goBtn.disabled = false; goBtn.textContent = "Sign PDF & Download";
    });
  });
})();
