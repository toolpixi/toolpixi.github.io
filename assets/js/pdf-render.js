/* ToolPixi — PDF.js based tools: PDF to JPG + Compress PDF (embedded-image recompression) */
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

// ==== Compress PDF helpers: recompress embedded images, keep the document ====
// The compressor below never re-renders pages. It walks each page's
// resources (including form XObjects), decodes every embedded image it can
// safely handle (JPEG / DCTDecode — including JPEGs wrapped in an ICCBased
// colorspace, which the browser decodes through the embedded profile — and
// raw FlateDecode DeviceRGB / DeviceGray at 8 bits per component),
// re-encodes it as a JPEG at a capped resolution, and swaps the image
// stream inside the original PDF with pdf-lib. Content streams, the text
// layer, links and page boxes are never touched.

function cpIsRef(o) {
  return !!o && typeof o === "object" && typeof o.objectNumber === "number" &&
         typeof o.generationNumber === "number";
}
function cpRes(ctx, o) {
  if (cpIsRef(o)) { var v = ctx.lookup(o); return v === undefined ? o : v; }
  return o;
}
function cpIsArray(o) { return !!o && typeof o.asArray === "function" && typeof o.get === "function"; }
function cpNameOf(o) {
  if (!o) return null;
  if (typeof o.decodeText === "function") { try { return o.decodeText(); } catch (e) {} }
  if (typeof o.asString === "function") { var s = o.asString(); return s && s.charAt(0) === "/" ? s.slice(1) : s; }
  return null;
}
function cpNum(o, dflt) {
  if (o && typeof o.asNumber === "function") return o.asNumber();
  if (o && typeof o.asBoolean === "function") return o.asBoolean() ? 1 : 0;
  return dflt;
}
function cpDictGet(doc, dict, key) {
  if (!dict || typeof dict.get !== "function") return undefined;
  return cpRes(doc.context, dict.get(PDFLib.PDFName.of(key)));
}
function cpFilterChain(doc, dict) {
  // [{name, parms}] in stream order, or null when the filter list is unreadable.
  var f = cpDictGet(doc, dict, "Filter");
  var parmsRaw = cpDictGet(doc, dict, "DecodeParms");
  if (parmsRaw === undefined) parmsRaw = cpDictGet(doc, dict, "DP");
  if (!f) return [];
  var names = [];
  if (cpIsArray(f)) {
    for (var i = 0; i < f.size(); i++) names.push(cpNameOf(cpRes(doc.context, f.get(i))));
  } else names.push(cpNameOf(f));
  var parmsList = [];
  if (parmsRaw) {
    if (cpIsArray(parmsRaw)) {
      for (var j = 0; j < parmsRaw.size(); j++) parmsList.push(cpRes(doc.context, parmsRaw.get(j)));
    } else parmsList.push(parmsRaw);
  }
  var out = [];
  for (var k = 0; k < names.length; k++) {
    if (!names[k]) return null;
    out.push({ name: names[k], parms: parmsList[k] || null });
  }
  return out;
}
function cpAscii85Decode(bytes) {
  var out = [];
  var group = [];
  function flush(full) {
    var n = group.length;
    if (!n) return;
    var v = 0;
    for (var i = 0; i < 5; i++) v = v * 85 + (i < n ? group[i] : 84);
    var b = [0, 0, 0, 0];
    for (var j = 3; j >= 0; j--) { b[j] = v % 256; v = Math.floor(v / 256); }
    var take = full ? 4 : n - 1;
    for (var t = 0; t < take; t++) out.push(b[t]);
    group = [];
  }
  for (var i = 0; i < bytes.length; i++) {
    var c = bytes[i];
    if (c === 126) break; // '~' starts the ~> end-of-data marker ('>' itself is in digit range!)
    if (c === 122 && group.length === 0) { out.push(0, 0, 0, 0); continue; } // 'z'
    if (c < 33 || c > 117) continue; // whitespace and delimiters
    group.push(c - 33);
    if (group.length === 5) flush(true);
  }
  if (group.length) flush(false);
  return new Uint8Array(out);
}
async function cpInflate(bytes) {
  if (typeof DecompressionStream === "undefined") throw new Error("no inflater");
  var ds = new DecompressionStream("deflate");
  var buf = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
  return new Uint8Array(buf);
}
function cpUnpredict(data, parms, doc, colors, columns) {
  if (!parms || typeof parms.get !== "function") return data;
  var predictor = cpNum(cpRes(doc.context, parms.get(PDFLib.PDFName.of("Predictor"))), 1);
  var rowLen = columns * colors; // 8 bits per component
  if (rowLen <= 0) return data;
  if (predictor === 2) { // TIFF: each value is a delta from the same component to the left
    var out2 = new Uint8Array(data);
    for (var r = 0; r + rowLen <= out2.length; r += rowLen) {
      for (var i = colors; i < rowLen; i++) out2[r + i] = (out2[r + i] + out2[r + i - colors]) & 255;
    }
    return out2;
  }
  if (predictor >= 10) { // PNG predictors: one filter byte per row
    var stride = rowLen + 1;
    var rows = Math.floor(data.length / stride);
    var outp = new Uint8Array(rows * rowLen);
    var prev = new Uint8Array(rowLen);
    for (var y = 0; y < rows; y++) {
      var f = data[y * stride];
      var row = outp.subarray(y * rowLen, (y + 1) * rowLen);
      for (var x = 0; x < rowLen; x++) {
        var raw = data[y * stride + 1 + x];
        var a = x >= colors ? row[x - colors] : 0;
        var b = prev[x];
        var c = x >= colors ? prev[x - colors] : 0;
        var v;
        if (f === 0) v = raw;
        else if (f === 1) v = raw + a;
        else if (f === 2) v = raw + b;
        else if (f === 3) v = raw + Math.floor((a + b) / 2);
        else if (f === 4) {
          var p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        } else v = raw;
        row[x] = v & 255;
      }
      prev = row;
    }
    return outp;
  }
  return data;
}
async function cpDecodePayload(doc, stream, chain, colors, columns) {
  // Undo the stream's filters. Returns {kind:"jpeg",bytes} (DCTDecode payload),
  // {kind:"raw",bytes} (uncompressed samples) or null when a filter is not
  // one this engine handles.
  var bytes = stream.getContents();
  var kind = null, flateParms = null;
  for (var i = 0; i < chain.length; i++) {
    var fname = chain[i].name;
    if (fname === "DCTDecode" || fname === "DCT") {
      if (i !== chain.length - 1) return null;
      kind = "jpeg";
    } else if (fname === "ASCII85Decode" || fname === "A85") {
      if (kind) return null;
      bytes = cpAscii85Decode(bytes);
    } else if (fname === "FlateDecode" || fname === "Fl") {
      if (kind) return null;
      bytes = await cpInflate(bytes);
      flateParms = chain[i].parms;
    } else return null;
  }
  if (!kind) {
    kind = "raw";
    if (flateParms) bytes = cpUnpredict(bytes, flateParms, doc, colors, columns);
  }
  return { kind: kind, bytes: bytes };
}
async function cpBitmapFromJpeg(bytes) {
  var blob = new Blob([bytes], { type: "image/jpeg" });
  if (typeof createImageBitmap !== "undefined") return await createImageBitmap(blob);
  var url = URL.createObjectURL(blob);
  var img = await new Promise(function (res, rej) {
    var im = new Image();
    im.onload = function () { res(im); };
    im.onerror = function () { rej(new Error("jpeg decode failed")); };
    im.src = url;
  });
  setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  return img;
}
function cpCanvasFromRaw(bytes, w, h, colors) {
  if (bytes.length < w * h * colors) return null;
  var canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext("2d");
  var imgData = ctx.createImageData(w, h);
  var px = imgData.data;
  if (colors === 3) {
    for (var i = 0, j = 0; j < px.length; i += 3, j += 4) {
      px[j] = bytes[i]; px[j + 1] = bytes[i + 1]; px[j + 2] = bytes[i + 2]; px[j + 3] = 255;
    }
  } else {
    for (var i = 0, j = 0; j < px.length; i++, j += 4) {
      px[j] = bytes[i]; px[j + 1] = bytes[i]; px[j + 2] = bytes[i]; px[j + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
async function cpReencodeToJpeg(source, targetW, targetH, quality) {
  var canvas = document.createElement("canvas");
  canvas.width = targetW; canvas.height = targetH;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, targetW, targetH);
  var blob = await tpCanvasToBlob(canvas, "image/jpeg", quality);
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}
function cpMultiply(m, n) { // transformation applying n first, then m
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5]
  ];
}
async function cpPagePlacements(doc, pageDict, imageNames) {
  // Best-effort: parse the page content stream and record the largest drawn
  // size (in points) for each named image XObject, so downscaling can target
  // an effective DPI instead of guessing. Any failure returns what we have.
  var out = {};
  try {
    var contents = cpDictGet(doc, pageDict, "Contents");
    if (!contents) return out;
    var streams = [];
    if (cpIsArray(contents)) {
      for (var i = 0; i < contents.size(); i++) streams.push(cpRes(doc.context, contents.get(i)));
    } else streams.push(contents);
    var text = "";
    for (var s = 0; s < streams.length; s++) {
      var st = streams[s];
      if (!st || typeof st.getContents !== "function") continue;
      var chain = cpFilterChain(doc, st.dict);
      if (!chain) continue;
      var data = st.getContents(), ok = true;
      for (var k = 0; k < chain.length; k++) {
        if (chain[k].name === "FlateDecode" || chain[k].name === "Fl") data = await cpInflate(data);
        else if (chain[k].name === "ASCII85Decode" || chain[k].name === "A85") data = cpAscii85Decode(data);
        else { ok = false; break; }
      }
      if (!ok) continue;
      for (var b = 0; b < data.length; b += 8192) {
        text += String.fromCharCode.apply(null, data.subarray(b, Math.min(b + 8192, data.length)));
      }
      text += "\n";
    }
    var re = /\((?:\\.|[^()\\])*\)|<<|>>|<[^>]*>|\[[^\]]*\]|\/[^\s\/\[\]<>(){}%]+|[^\s\/\[\]<>(){}%]+|%[^\r\n]*/g;
    var stack = [], ctm = [1, 0, 0, 1, 0, 0], ctmStack = [], m;
    while ((m = re.exec(text)) !== null) {
      var tok = m[0], c0 = tok.charAt(0);
      if (c0 === "%") continue;
      if (c0 === "/") { stack.push({ name: tok.slice(1) }); continue; }
      if (/^-?(\d|\.\d)/.test(tok)) { stack.push(parseFloat(tok)); continue; }
      if (c0 === "(" || c0 === "[" || c0 === "<") { stack.push(null); continue; }
      if (tok === "q") ctmStack.push(ctm.slice());
      else if (tok === "Q") { if (ctmStack.length) ctm = ctmStack.pop(); }
      else if (tok === "cm") {
        var nums = [], okc = stack.length >= 6;
        if (okc) {
          for (var t = stack.length - 6; t < stack.length; t++) {
            if (typeof stack[t] !== "number") { okc = false; break; }
            nums.push(stack[t]);
          }
        }
        if (okc) ctm = cpMultiply(ctm, nums);
      } else if (tok === "Do") {
        var op = stack[stack.length - 1];
        if (op && op.name && imageNames[op.name]) {
          var wpt = Math.hypot(ctm[0], ctm[1]), hpt = Math.hypot(ctm[2], ctm[3]);
          var prev = out[op.name];
          if (wpt > 0 && hpt > 0 && (!prev || wpt * hpt > prev.w * prev.h)) out[op.name] = { w: wpt, h: hpt };
        }
      }
      stack = [];
    }
  } catch (e) { /* placements are an optimisation; fall through with what we have */ }
  return out;
}
function cpPageResources(doc, pageDict) {
  var node = pageDict, guard = 0;
  while (node && guard++ < 10) {
    var res = cpDictGet(doc, node, "Resources");
    if (res) return res;
    node = cpDictGet(doc, node, "Parent");
  }
  return null;
}
function cpWalkResources(doc, resources, pageW, pageH, found, byRef, nameMap, depth, visitedForms) {
  var xobjs = cpDictGet(doc, resources, "XObject");
  if (!xobjs || typeof xobjs.entries !== "function") return;
  var entries = xobjs.entries();
  for (var i = 0; i < entries.length; i++) {
    var name = cpNameOf(entries[i][0]);
    var ref = entries[i][1];
    var obj = cpRes(doc.context, ref);
    if (!obj || typeof obj.getContents !== "function" || !obj.dict) continue;
    var subtype = cpNameOf(cpDictGet(doc, obj.dict, "Subtype"));
    if (subtype === "Image") {
      var tag = cpIsRef(ref) ? ref.objectNumber + ":" + ref.generationNumber : "direct:" + found.length;
      if (nameMap && name) nameMap[name] = tag;
      if (!byRef[tag]) {
        var entry = { tag: tag, stream: obj, dict: obj.dict, pageW: pageW, pageH: pageH, placement: null };
        byRef[tag] = entry;
        found.push(entry);
      }
    } else if (subtype === "Form" && depth < 4) {
      var ftag = cpIsRef(ref) ? ref.objectNumber + ":" + ref.generationNumber : null;
      if (ftag && visitedForms[ftag]) continue;
      if (ftag) visitedForms[ftag] = true;
      var fres = cpDictGet(doc, obj.dict, "Resources");
      if (fres) cpWalkResources(doc, fres, pageW, pageH, found, byRef, null, depth + 1, visitedForms);
    }
  }
}
async function cpCollectImages(doc) {
  var found = [], byRef = {};
  var pages = doc.getPages();
  var jobs = [];
  for (var pi = 0; pi < pages.length; pi++) {
    (function (page) {
      var size = page.getSize();
      var resources = cpPageResources(doc, page.node);
      if (!resources) return;
      var nameMap = {};
      cpWalkResources(doc, resources, size.width, size.height, found, byRef, nameMap, 0, {});
      var names = Object.keys(nameMap);
      if (!names.length) return;
      var nameSet = {};
      names.forEach(function (n) { nameSet[n] = true; });
      jobs.push(cpPagePlacements(doc, page.node, nameSet).then(function (placements) {
        names.forEach(function (n) {
          var p = placements[n], entry = byRef[nameMap[n]];
          if (p && entry && (!entry.placement || p.w * p.h > entry.placement.w * entry.placement.h)) {
            entry.placement = p;
          }
        });
      }));
    })(pages[pi]);
  }
  await Promise.all(jobs);
  return found;
}
function cpTargetSize(W, H, entry, dpiCap) {
  var maxW, maxH;
  if (entry.placement && entry.placement.w > 0 && entry.placement.h > 0) {
    maxW = entry.placement.w / 72 * dpiCap;
    maxH = entry.placement.h / 72 * dpiCap;
  } else { // fallback: the image could be drawn up to the full page size
    maxW = entry.pageW / 72 * dpiCap;
    maxH = entry.pageH / 72 * dpiCap;
  }
  var scale = Math.min(1, maxW / W, maxH / H);
  return { w: Math.max(1, Math.round(W * scale)), h: Math.max(1, Math.round(H * scale)) };
}
function cpSetStreamContents(stream, bytes) {
  try {
    if (typeof stream.updateContents === "function") stream.updateContents(bytes);
    else stream.contents = bytes;
    var now = stream.getContents();
    return !!now && now.length === bytes.length;
  } catch (e) { return false; }
}
async function cpProcessImage(doc, entry, dpiCap, quality) {
  var dict = entry.dict, N = PDFLib.PDFName;
  var W = cpNum(cpDictGet(doc, dict, "Width"), 0);
  var H = cpNum(cpDictGet(doc, dict, "Height"), 0);
  if (!W || !H) return false;
  if (cpDictGet(doc, dict, "SMask")) return false;      // transparency mask: leave alone
  if (cpDictGet(doc, dict, "Mask")) return false;       // explicit mask: leave alone
  var im = cpDictGet(doc, dict, "ImageMask");
  if (im === true || cpNum(im, 0) === 1) return false;  // stencil mask: leave alone
  if (cpNum(cpDictGet(doc, dict, "BitsPerComponent"), 0) !== 8) return false;
  var chain = cpFilterChain(doc, dict);
  if (!chain) return false;
  // Payload kind from the filter chain alone, mirroring cpDecodePayload's
  // rules: "jpeg" when DCTDecode is the final filter (earlier filters may
  // only store the JPEG bytes, e.g. ASCII85 or Flate), "raw" when there is
  // no DCTDecode at all, null for anything else (JPXDecode, LZW, ...).
  var chainKind = "raw";
  for (var ci = 0; ci < chain.length; ci++) {
    var fn = chain[ci].name;
    if (fn === "DCTDecode" || fn === "DCT") {
      if (ci !== chain.length - 1) { chainKind = null; break; }
      chainKind = "jpeg";
    } else if (fn !== "ASCII85Decode" && fn !== "A85" && fn !== "FlateDecode" && fn !== "Fl") {
      chainKind = null; break;
    }
  }
  if (!chainKind) return false;
  // Colorspace. Named DeviceRGB / DeviceGray are always fine. A JPEG that
  // omits its colorspace is fine too: the browser decodes it to display
  // pixels either way. An ARRAY colorspace is acceptable only for such a
  // self-contained JPEG whose colorspace is [/ICCBased <profile>] with a
  // 1- or 3-component profile (Chrome print-to-PDF and PyMuPDF wrap even
  // plain sRGB JPEGs this way): the browser applies the profile while
  // decoding, so re-encoding the decoded pixels as DeviceRGB preserves
  // the appearance. Raw samples under an array colorspace are interpreted
  // THROUGH that colorspace, so they stay untouched — as do Indexed /
  // CalRGB / Lab / Separation / DeviceN arrays, a 4-component (CMYK) ICC
  // profile, DeviceCMYK and Pattern: those are never re-encoded.
  var csObj = cpDictGet(doc, dict, "ColorSpace");
  var csName = cpNameOf(csObj);
  var colors = 0;
  if (csName === "DeviceRGB") colors = 3;
  else if (csName === "DeviceGray") colors = 1;
  else if (!csObj) {
    if (chainKind === "jpeg") colors = 3; // JPEGs often omit it; canvas decode gives display pixels
    else return false;                    // raw samples with no colorspace: unknowable, leave alone
  } else if (cpIsArray(csObj)) {
    if (chainKind !== "jpeg") return false; // raw + array colorspace: leave alone
    var csHead = cpNameOf(cpRes(doc.context, csObj.get(0)));
    if (csHead !== "ICCBased" || csObj.size() < 2) return false;
    var prof = cpRes(doc.context, csObj.get(1));
    var profN = prof && prof.dict ? cpNum(cpDictGet(doc, prof.dict, "N"), 0) : 0;
    if (profN === 3) colors = 3;
    else if (profN === 1) colors = 1;
    else return false; // CMYK (N=4) or unreadable profile: leave alone
  } else return false; // DeviceCMYK / Pattern / any other named colorspace
  var decode = cpDictGet(doc, dict, "Decode");
  if (decode && cpIsArray(decode)) { // only the identity Decode array is safe to re-encode
    var def = colors === 3 ? [0, 1, 0, 1, 0, 1] : [0, 1];
    if (decode.size() !== def.length) return false;
    for (var di = 0; di < def.length; di++) {
      if (cpNum(cpRes(doc.context, decode.get(di)), -1) !== def[di]) return false;
    }
  } else if (decode) return false;
  var payload = await cpDecodePayload(doc, entry.stream, chain, colors, W);
  if (!payload) return false;
  var source;
  if (payload.kind === "jpeg") {
    source = await cpBitmapFromJpeg(payload.bytes);
  } else {
    source = cpCanvasFromRaw(payload.bytes, W, H, colors);
    if (!source) return false;
  }
  var tgt = cpTargetSize(W, H, entry, dpiCap);
  var jpeg = await cpReencodeToJpeg(source, tgt.w, tgt.h, quality);
  if (source && typeof source.close === "function") { try { source.close(); } catch (e) {} }
  if (!jpeg || jpeg.length >= payload.bytes.length) return false; // never grow an image
  if (!cpSetStreamContents(entry.stream, jpeg)) return false;
  dict.set(N.of("Width"), PDFLib.PDFNumber.of(tgt.w));
  dict.set(N.of("Height"), PDFLib.PDFNumber.of(tgt.h));
  dict.set(N.of("Filter"), N.of("DCTDecode"));
  dict.set(N.of("ColorSpace"), N.of("DeviceRGB"));
  dict.set(N.of("BitsPerComponent"), PDFLib.PDFNumber.of(8));
  dict.set(N.of("Length"), PDFLib.PDFNumber.of(jpeg.length));
  dict.delete(N.of("DecodeParms")); dict.delete(N.of("DP"));
  dict.delete(N.of("Decode"));
  dict.delete(N.of("F")); dict.delete(N.of("FFilter")); dict.delete(N.of("FDecodeParms"));
  return true;
}
function cpStripMetadata(doc) {
  try {
    var infoRef = doc.context.trailerInfo && doc.context.trailerInfo.Info;
    var info = infoRef ? cpRes(doc.context, infoRef) : null;
    if (info && typeof info.delete === "function") {
      ["Title", "Author", "Subject", "Keywords", "Creator"].forEach(function (k) {
        info.delete(PDFLib.PDFName.of(k));
      });
    }
  } catch (e) {}
}
async function cpCompressPass(buf, dpiCap, quality, onProgress) {
  var doc = await PDFLib.PDFDocument.load(buf);
  var images = await cpCollectImages(doc);
  var replaced = 0;
  for (var i = 0; i < images.length; i++) {
    try {
      if (await cpProcessImage(doc, images[i], dpiCap, quality)) replaced++;
    } catch (e) { /* a single bad image must not sink the whole file */ }
    if (onProgress) onProgress(i + 1, Math.max(images.length, 1));
  }
  cpStripMetadata(doc);
  var bytes = await doc.save({ useObjectStreams: true });
  return { bytes: bytes, replaced: replaced, images: images.length };
}

// ==== DOM: Compress PDF (recompresses embedded images; text & layout preserved) ====
(function () {
  var panel = document.getElementById("compress-pdf");
  if (!panel) return;
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
    if (typeof PDFLib === "undefined") {
      tpShowError("cp-err", "The PDF engine could not be loaded. Check your connection and refresh."); return;
    }
    var btn = this; btn.disabled = true; btn.textContent = "Compressing…";
    var bar = document.getElementById("cp-progress"); bar.style.display = "block"; bar.value = 5;
    try {
      var target = targetKB * 1024;
      var original = new Uint8Array(await file.arrayBuffer());
      var ladder = [ // gentlest first; stronger passes only if the target is missed
        { dpi: 150, q: 0.82 }, { dpi: 125, q: 0.65 }, { dpi: 100, q: 0.5 }
      ];
      var best = null, bestInfo = null;
      for (var s = 0; s < ladder.length; s++) {
        var pass = await cpCompressPass(original, ladder[s].dpi, ladder[s].q, function (done, total) {
          bar.value = Math.min(96, 5 + ((s + done / total) / ladder.length) * 90);
        });
        if (!best || pass.bytes.length < best.length) { best = pass.bytes; bestInfo = pass; }
        if (pass.bytes.length <= target) break;
        if (pass.replaced === 0) break; // nothing recompressible: later passes would be identical
      }
      var usedOriginal = false;
      if (!best || best.length >= original.length) { best = original; usedOriginal = true; }
      bar.value = 100;
      tpDownload(new Blob([best], { type: "application/pdf" }), tpStripExt(file.name) + "-compressed.pdf");
      var res = document.getElementById("cp-result");
      res.classList.add("show");
      document.getElementById("cp-orig").textContent = tpFormatBytes(file.size);
      document.getElementById("cp-new").textContent = tpFormatBytes(best.length);
      var note;
      if (usedOriginal) {
        note = "This file is already as small as this method can make it, so your original was returned unchanged." +
          (original.length <= target ? " It is already under your " + targetKB + " KB target." : "");
      } else {
        if (bestInfo && bestInfo.replaced > 0) {
          note = "Compressed by recompressing the " + bestInfo.replaced + " embedded image" +
            (bestInfo.replaced === 1 ? "" : "s") + " inside the PDF. Your text, links and page layout are " +
            "untouched — text stays selectable and searchable, and pages keep their exact size.";
        } else {
          note = "This PDF has no images we can recompress, so we re-saved it with a tighter internal " +
            "structure instead. Its content, text and page layout are unchanged.";
        }
        note += best.length <= target
          ? " The result is under your " + targetKB + " KB target."
          : " This is the smallest result we could reach (" + tpFormatBytes(best.length) + ") — the images " +
            "in this file set a size floor above the " + targetKB + " KB target.";
      }
      document.getElementById("cp-note").textContent = note;
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
