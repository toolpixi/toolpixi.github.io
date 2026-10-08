/* ToolPixi — image tools: exact-KB compressor + format converter (canvas based) */
// ==== PURE ====
/* Decide the next (scale, quality) attempt for target-size compression. */
function tpKbPlan(history, targetBytes) {
  // history: array of {scale, quality, size}. Returns next attempt or null when converged.
  var best = null;
  for (var i = 0; i < history.length; i++) {
    var h = history[i];
    if (h.size <= targetBytes && (!best || h.size > best.size)) best = h;
  }
  return best;
}
function tpLoadImageFromFile(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { resolve({ img: img, url: url }); };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file could not be read as an image.")); };
    img.src = url;
  });
}
function tpCanvasToBlob(canvas, type, quality) {
  return new Promise(function (resolve) { canvas.toBlob(resolve, type, quality); });
}
/* Render image to a canvas at given scale; JPEG gets a white background (no alpha). */
function tpDrawScaled(img, scale, asJpeg) {
  var w = Math.max(1, Math.round(img.naturalWidth * scale));
  var h = Math.max(1, Math.round(img.naturalHeight * scale));
  var c = document.createElement("canvas"); c.width = w; c.height = h;
  var ctx = c.getContext("2d");
  if (asJpeg) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(img, 0, 0, w, h);
  return c;
}
/* Core compressor: binary-search JPEG quality at full size; if even the lowest sensible
   quality is too big, shrink dimensions and search again. Returns {blob, meta, history}
   with the best blob at/under target, or the smallest readable result if none fits. */
async function tpCompressToKB(img, targetBytes, onProgress) {
  var history = [], bestBlob = null, bestMeta = null, scale = 1, encodes = 0;
  for (var round = 0; round < 6; round++) {
    var lo = 0.04, hi = 0.95, localBest = null, localMeta = null;
    for (var step = 0; step < 7; step++) {
      var q = (lo + hi) / 2;
      var canvas = tpDrawScaled(img, scale, true);
      var blob = await tpCanvasToBlob(canvas, "image/jpeg", q);
      encodes++;
      if (onProgress) onProgress(encodes);
      if (!blob) continue;
      history.push({ scale: scale, quality: q, size: blob.size });
      if (blob.size <= targetBytes) { localBest = blob; localMeta = history[history.length - 1]; lo = q; }
      else { hi = q; }
      if (blob.size <= targetBytes && blob.size > targetBytes * 0.92) break;
    }
    if (localBest) { bestBlob = localBest; bestMeta = localMeta; break; }
    var smallest = null;
    history.forEach(function (h) { if (!smallest || h.size < smallest.size) smallest = h; });
    if (!smallest || scale <= 0.09) break;
    var next = scale * Math.sqrt(targetBytes / Math.max(smallest.size, 1)) * 0.92;
    if (!(next < scale)) break;
    scale = next;
  }
  if (!bestBlob) {
    var minH = null;
    history.forEach(function (h) { if (!minH || h.size < minH.size) minH = h; });
    if (minH) {
      var c2 = tpDrawScaled(img, minH.scale, true);
      bestBlob = await tpCanvasToBlob(c2, "image/jpeg", minH.quality);
      bestMeta = minH;
    }
  }
  return bestBlob ? { blob: bestBlob, meta: bestMeta, history: history } : null;
}

// ==== DOM: Image Compressor to exact KB ====
(function () {
  var panel = document.getElementById("kb-compressor");
  if (!panel) return;
  var file = null, loaded = null, targetKB = 50;
  var outBlob = null;

  var chips = panel.querySelectorAll("[data-kb]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      var v = chip.getAttribute("data-kb");
      var custom = document.getElementById("kb-custom");
      if (v === "custom") { custom.style.display = "block"; custom.focus(); }
      else { custom.style.display = "none"; targetKB = parseInt(v, 10); }
    });
  });
  document.getElementById("kb-custom").addEventListener("input", function (e) {
    var v = parseInt(e.target.value, 10);
    if (v > 0) targetKB = v;
  });

  tpDropzone("kb-drop", "kb-file", {
    accept: "image/*", multiple: false,
    onFiles: function (files) {
      tpHideError("kb-err");
      file = files[0];
      tpFileList("kb-list", [file]);
      document.getElementById("kb-go").disabled = false;
      tpLoadImageFromFile(file).then(function (r) {
        if (loaded) URL.revokeObjectURL(loaded.url);
        loaded = r;
      }).catch(function (err) { tpShowError("kb-err", err.message); });
    }
  });

  document.getElementById("kb-go").addEventListener("click", async function () {
    tpHideError("kb-err");
    if (!file || !loaded) { tpShowError("kb-err", "Please choose an image first."); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Compressing…";
    var bar = document.getElementById("kb-progress"); bar.style.display = "block"; bar.value = 10;
    try {
      var target = targetKB * 1024;
      var packed = await tpCompressToKB(loaded.img, target, function (n) {
        bar.value = Math.min(95, 10 + n * 6);
      });
      if (!packed) throw new Error("Compression failed for this image. Try a smaller target or a different photo.");
      var bestBlob = packed.blob;
      outBlob = bestBlob;
      bar.value = 100;
      var res = document.getElementById("kb-result");
      res.classList.add("show");
      document.getElementById("kb-orig-size").textContent = tpFormatBytes(file.size);
      document.getElementById("kb-new-size").textContent = tpFormatBytes(bestBlob.size);
      document.getElementById("kb-saved").textContent =
        Math.max(0, Math.round((1 - bestBlob.size / file.size) * 100)) + "% smaller";
      var prev = document.getElementById("kb-preview");
      prev.src = URL.createObjectURL(bestBlob);
      document.getElementById("kb-note").textContent = bestBlob.size <= target
        ? "Done — your image is at or under " + targetKB + " KB, ready for upload forms."
        : "This is the smallest clean result we could reach; very detailed photos have a quality floor. Try a slightly larger target if the form allows it.";
    } catch (err) {
      tpShowError("kb-err", err.message || "Something went wrong while compressing.");
    } finally {
      btn.disabled = false; btn.textContent = "Compress image";
      setTimeout(function () { bar.style.display = "none"; }, 600);
    }
  });

  document.getElementById("kb-download").addEventListener("click", function () {
    if (outBlob) tpDownload(outBlob, tpStripExt(file.name) + "-compressed.jpg");
  });
})();

// ==== DOM: generic image format converter (page sets data-to / data-ext / data-mime) ====
(function () {
  var panel = document.getElementById("img-convert");
  if (!panel) return;
  var toMime = panel.getAttribute("data-mime"), toExt = panel.getAttribute("data-ext");
  var qualityWrap = document.getElementById("ic-quality-wrap");
  if (toMime !== "image/jpeg" && toMime !== "image/webp" && qualityWrap) qualityWrap.style.display = "none";

  tpDropzone("ic-drop", "ic-file", {
    accept: "image/*", multiple: true,
    onFiles: async function (files) {
      tpHideError("ic-err");
      tpFileList("ic-list", files);
      var btn = document.getElementById("ic-go");
      btn.disabled = false;
      btn.onclick = async function () {
        btn.disabled = true; btn.textContent = "Converting…";
        var q = parseFloat((document.getElementById("ic-quality") || {}).value || "0.92");
        var done = 0;
        for (var i = 0; i < files.length; i++) {
          try {
            var r = await tpLoadImageFromFile(files[i]);
            var canvas = tpDrawScaled(r.img, 1, toMime === "image/jpeg");
            var blob = await tpCanvasToBlob(canvas, toMime, q);
            URL.revokeObjectURL(r.url);
            if (blob) tpDownload(blob, tpStripExt(files[i].name) + "." + toExt);
            done++;
          } catch (e) { /* skip unreadable file, reported below */ }
          await new Promise(function (res) { setTimeout(res, 250); });
        }
        btn.disabled = false; btn.textContent = "Convert & download";
        var res2 = document.getElementById("ic-result");
        res2.classList.add("show");
        res2.querySelector(".note").textContent = done === files.length
          ? "All " + done + " image(s) converted and downloaded."
          : done + " of " + files.length + " images converted — the rest could not be read as images.";
      };
    }
  });
})();

// ==== PURE: image resizer maths ====
/* Target dims for a resize. If lock, the missing side follows the aspect ratio;
   a side of 0/null means "derive it". Both sides 0 -> original size. */
function tpResizeDims(origW, origH, wantW, wantH, lock) {
  wantW = wantW > 0 ? Math.round(wantW) : 0;
  wantH = wantH > 0 ? Math.round(wantH) : 0;
  if (!wantW && !wantH) return { w: origW, h: origH };
  if (lock) {
    if (wantW && !wantH) return { w: wantW, h: Math.max(1, Math.round(origH * wantW / origW)) };
    if (wantH && !wantW) return { w: Math.max(1, Math.round(origW * wantH / origH)), h: wantH };
    // Both given with lock on: fit inside the box, keep ratio.
    var s = Math.min(wantW / origW, wantH / origH);
    return { w: Math.max(1, Math.round(origW * s)), h: Math.max(1, Math.round(origH * s)) };
  }
  return { w: wantW || origW, h: wantH || origH };
}
function tpScaledDims(origW, origH, pct) {
  var s = pct / 100;
  return { w: Math.max(1, Math.round(origW * s)), h: Math.max(1, Math.round(origH * s)) };
}

// ==== DOM: Image Resizer (exact pixels or percentage) ====
(function () {
  var panel = document.getElementById("image-resizer");
  if (!panel) return;
  var file = null, loaded = null, outBlob = null, outName = "";
  var wIn = document.getElementById("rs-w"), hIn = document.getElementById("rs-h"),
      pctIn = document.getElementById("rs-pct"), lockIn = document.getElementById("rs-lock");

  function syncFromW() {
    if (!loaded || !lockIn.checked) return;
    var w = parseFloat(wIn.value);
    if (w > 0) hIn.value = Math.max(1, Math.round(loaded.img.naturalHeight * w / loaded.img.naturalWidth));
  }
  function syncFromH() {
    if (!loaded || !lockIn.checked) return;
    var h = parseFloat(hIn.value);
    if (h > 0) wIn.value = Math.max(1, Math.round(loaded.img.naturalWidth * h / loaded.img.naturalHeight));
  }
  wIn.addEventListener("input", function () { pctIn.value = ""; syncFromW(); });
  hIn.addEventListener("input", function () { pctIn.value = ""; syncFromH(); });
  pctIn.addEventListener("input", function () {
    if (!loaded) return;
    var p = parseFloat(pctIn.value);
    if (p > 0) {
      var d = tpScaledDims(loaded.img.naturalWidth, loaded.img.naturalHeight, p);
      wIn.value = d.w; hIn.value = d.h;
    }
  });

  tpDropzone("rs-drop", "rs-file", {
    accept: "image/*", multiple: false,
    onFiles: function (files) {
      tpHideError("rs-err");
      file = files[0];
      tpFileList("rs-list", [file]);
      document.getElementById("rs-go").disabled = false;
      tpLoadImageFromFile(file).then(function (r) {
        if (loaded) URL.revokeObjectURL(loaded.url);
        loaded = r;
        document.getElementById("rs-orig").textContent =
          "Original: " + r.img.naturalWidth + " × " + r.img.naturalHeight + " px · " + tpFormatBytes(file.size);
        if (!wIn.value) { wIn.value = r.img.naturalWidth; hIn.value = r.img.naturalHeight; pctIn.value = 100; }
      }).catch(function (err) { tpShowError("rs-err", err.message); });
    }
  });

  document.getElementById("rs-go").addEventListener("click", async function () {
    tpHideError("rs-err");
    if (!file || !loaded) { tpShowError("rs-err", "Please choose an image first."); return; }
    var btn = this; btn.disabled = true; btn.textContent = "Resizing…";
    try {
      var ow = loaded.img.naturalWidth, oh = loaded.img.naturalHeight;
      var p = parseFloat(pctIn.value);
      var dims = (p > 0 && !wIn.value && !hIn.value)
        ? tpScaledDims(ow, oh, p)
        : tpResizeDims(ow, oh, parseFloat(wIn.value) || 0, parseFloat(hIn.value) || 0, lockIn.checked);
      var canvas = document.createElement("canvas");
      canvas.width = dims.w; canvas.height = dims.h;
      var ctx = canvas.getContext("2d");
      var fmt = document.getElementById("rs-fmt").value;
      var mime = fmt || (["image/jpeg", "image/png", "image/webp"].indexOf(file.type) >= 0 ? file.type : "image/png");
      if (mime === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, dims.w, dims.h); }
      ctx.drawImage(loaded.img, 0, 0, dims.w, dims.h);
      var ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
      var blob = await tpCanvasToBlob(canvas, mime, 0.92);
      if (!blob) throw new Error("Resize failed for this image. Try a different photo.");
      outBlob = blob;
      outName = tpStripExt(file.name) + "-" + dims.w + "x" + dims.h + "." + ext;
      var res = document.getElementById("rs-result");
      res.classList.add("show");
      document.getElementById("rs-new").textContent =
        "New size: " + dims.w + " × " + dims.h + " px · " + tpFormatBytes(blob.size) + " (" + ext.toUpperCase() + ")";
      var prev = document.getElementById("rs-preview");
      prev.src = URL.createObjectURL(blob);
    } catch (err) {
      tpShowError("rs-err", err.message || "Something went wrong while resizing.");
    } finally {
      btn.disabled = false; btn.textContent = "Resize image";
    }
  });

  document.getElementById("rs-download").addEventListener("click", function () {
    if (outBlob) tpDownload(outBlob, outName);
  });
})();
