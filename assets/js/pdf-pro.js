"use strict";
/* ToolPixi PDF Pro suite: crop, organize, compare, unlock, protect, repair,
   pdf-to-excel. Everything runs locally in the browser. qpdf (real qpdf
   compiled to WebAssembly) is self-hosted under /assets/vendor/qpdf/ and
   lazy-loaded only by the three tools that need it. */

/* ---------------- shared helpers ---------------- */

const __tpScripts = {};
function tpLoadScriptOnce(src) {
  if (!__tpScripts[src]) {
    __tpScripts[src] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(s);
    });
  }
  return __tpScripts[src];
}

function tpPdfJsReady() {
  if (typeof pdfjsLib === "undefined") return false;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/vendor/pdf.worker.min.js";
  return true;
}

function tpEscapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* Text items of one pdf.js page, in PDF points (origin bottom-left, y up). */
async function tpPageTextItems(page) {
  const tc = await page.getTextContent();
  const items = [];
  for (const it of tc.items) {
    /* Skip whitespace-only items: some PDF generators make pdf.js emit
       " " items whose width spans the whole gap between words — keeping
       them would hide the real inter-word gaps the table builder needs. */
    if (!it.str || !it.str.trim()) continue;
    items.push({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || 0,
      size: Math.hypot(it.transform[2], it.transform[3]) || 10,
    });
  }
  return items;
}

/* Group flat items into visual lines (top of page first). */
function tpGroupLines(items) {
  const sorted = items.slice().sort((a, b) => (b.y - a.y) || (a.x - b.x));
  const lines = [];
  for (const it of sorted) {
    const tol = Math.max(2.5, it.size * 0.4);
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - it.y) <= tol) {
      last.items.push(it);
    } else {
      lines.push({ y: it.y, size: it.size, items: [it] });
    }
  }
  for (const ln of lines) ln.items.sort((a, b) => a.x - b.x);
  return lines;
}

/* Join the items of one line/cell into text, adding a space where the
   horizontal gap is wide enough to be a word break. */
function tpJoinItems(items) {
  let out = "";
  let prev = null;
  for (const it of items) {
    if (prev) {
      const gap = it.x - (prev.x + prev.w);
      const size = Math.max(it.size, prev.size);
      if (gap > size * 0.22) out += " ";
    }
    out += it.str;
    prev = it;
  }
  return out.trim();
}

/* ---- vector line extraction from the pdf.js operator list ----
   Returns { h: [{y,x1,x2}], v: [{x,y1,y2}] } in PDF points. */
function tpMatApply(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}
function tpMatCompose(a, b) {
  /* a after b: apply b first, then a */
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

async function tpPageGridLines(page) {
  const OPS = pdfjsLib.OPS;
  const ol = await page.getOperatorList();
  const segs = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack = [];
  let cur = null;      /* current point, page space */
  let start = null;    /* subpath start, page space */

  function addSeg(p, q) {
    if (p && q) segs.push([p[0], p[1], q[0], q[1]]);
  }
  function walkOps(ops, pts) {
    let i = 0;
    const P = () => {
      const p = tpMatApply(ctm, pts[i], pts[i + 1]);
      i += 2;
      return p;
    };
    for (const op of ops) {
      if (op === OPS.moveTo) {
        cur = P(); start = cur;
      } else if (op === OPS.lineTo) {
        const p = P(); addSeg(cur, p); cur = p;
      } else if (op === OPS.curveTo) {
        P(); P(); cur = P();
      } else if (op === OPS.curveTo2 || op === OPS.curveTo3) {
        P(); cur = P();
      } else if (op === OPS.closePath) {
        addSeg(cur, start); cur = start;
      } else if (op === OPS.rectangle) {
        const x = pts[i], y = pts[i + 1], w = pts[i + 2], h = pts[i + 3];
        i += 4;
        const c = [
          tpMatApply(ctm, x, y), tpMatApply(ctm, x + w, y),
          tpMatApply(ctm, x + w, y + h), tpMatApply(ctm, x, y + h),
        ];
        addSeg(c[0], c[1]); addSeg(c[1], c[2]); addSeg(c[2], c[3]); addSeg(c[3], c[0]);
        cur = c[0]; start = c[0];
      }
    }
  }

  for (let k = 0; k < ol.fnArray.length; k++) {
    const fn = ol.fnArray[k];
    const args = ol.argsArray[k];
    if (fn === OPS.save) stack.push(ctm.slice());
    else if (fn === OPS.restore) { if (stack.length) ctm = stack.pop(); }
    else if (fn === OPS.transform) ctm = tpMatCompose(ctm, args);
    else if (fn === OPS.constructPath) walkOps(args[0], args[1]);
    else if (fn === OPS.moveTo || fn === OPS.lineTo || fn === OPS.rectangle ||
             fn === OPS.closePath || fn === OPS.curveTo ||
             fn === OPS.curveTo2 || fn === OPS.curveTo3) {
      walkOps([fn], args);
    }
  }

  const h = [], v = [];
  for (const [x1, y1, x2, y2] of segs) {
    if (Math.abs(y2 - y1) <= 1 && Math.abs(x2 - x1) >= 15) {
      h.push({ y: (y1 + y2) / 2, x1: Math.min(x1, x2), x2: Math.max(x1, x2) });
    } else if (Math.abs(x2 - x1) <= 1 && Math.abs(y2 - y1) >= 15) {
      v.push({ x: (x1 + x2) / 2, y1: Math.min(y1, y2), y2: Math.max(y1, y2) });
    }
  }
  return { h, v };
}

/* ---------------- qpdf (WebAssembly) ---------------- */

let __qpdfPromise = null;
let __qpdfLog = [];
function tpQpdfLoad() {
  if (!__qpdfPromise) {
    __qpdfPromise = (async () => {
      await tpLoadScriptOnce("/assets/vendor/qpdf/qpdf.js");
      const factory = window.Module;
      if (typeof factory !== "function") throw new Error("qpdf engine failed to load.");
      const mod = await factory({
        locateFile: (f) => "/assets/vendor/qpdf/" + f,
        print: (t) => __qpdfLog.push(t),
        printErr: (t) => __qpdfLog.push(t),
      });
      return mod;
    })();
  }
  return __qpdfPromise;
}

/* Run qpdf with args on one input file; resolves {code, out, log}. */
async function tpQpdfRun(args, inputBytes) {
  const mod = await tpQpdfLoad();
  __qpdfLog = [];
  let code = -1;
  let out = null;
  try { mod.FS.unlink("/in.pdf"); } catch (e) {}
  try { mod.FS.unlink("/out.pdf"); } catch (e) {}
  mod.FS.writeFile("/in.pdf", inputBytes);
  try {
    code = mod.callMain(args);
  } catch (e) {
    code = -1;
    __qpdfLog.push(String(e));
  }
  try {
    out = mod.FS.readFile("/out.pdf");
  } catch (e) { out = null; }
  try { mod.FS.unlink("/in.pdf"); } catch (e) {}
  try { mod.FS.unlink("/out.pdf"); } catch (e) {}
  return { code, out, log: __qpdfLog.join("\n") };
}

function tpQpdfError(result, fallback) {
  if (/invalid password/i.test(result.log)) {
    return "That password does not match this file. Check it and try again.";
  }
  if (/no password/i.test(result.log)) {
    return "This file needs its password — enter it above and try again.";
  }
  return fallback;
}

/* ---------------- tesseract worker (shared with image-to-text) ---------------- */

async function tpTesseractCreate(onProgress) {
  const VENDOR = "/assets/vendor/tesseract";
  await tpLoadScriptOnce(VENDOR + "/tesseract.min.js");
  return Tesseract.createWorker("eng", "1", {
    workerPath: VENDOR + "/worker.min.js",
    corePath: VENDOR + "/core",
    langPath: VENDOR,
    gzip: true,
    cacheMethod: "none",
    logger: (m) => { if (onProgress) onProgress(m); },
  });
}

/* ---------------- crop-pdf ---------------- */
(function () {
  const panel = document.getElementById("crop-pdf");
  if (!panel) return;
  const err = document.getElementById("cp-error");
  const note = document.getElementById("cp-note");
  const wrap = document.getElementById("cp-preview-wrap");
  const baseCanvas = document.getElementById("cp-canvas");
  const overCanvas = document.getElementById("cp-overlay");
  const inL = document.getElementById("cp-left");
  const inT = document.getElementById("cp-top");
  const inW = document.getElementById("cp-width");
  const inH = document.getElementById("cp-height");
  const pageLabel = document.getElementById("cp-page-label");
  let pdfDoc = null;
  let fileName = "document";
  let curPage = 1;
  let pageSize = { w: 612, h: 792 };
  let scale = 1;
  const selections = {}; /* pageNum -> {left, top, width, height} in points, top-left origin */

  function showNote(t) { note.hidden = false; note.textContent = t; }
  function fail(t) { tpShowError(err.id, t); }
  function selection() {
    if (!selections[curPage]) {
      selections[curPage] = {
        left: Math.round(pageSize.w * 0.08),
        top: Math.round(pageSize.h * 0.08),
        width: Math.round(pageSize.w * 0.84),
        height: Math.round(pageSize.h * 0.84),
      };
    }
    return selections[curPage];
  }
  function clampSel(s) {
    s.left = Math.min(Math.max(0, s.left), pageSize.w - 20);
    s.top = Math.min(Math.max(0, s.top), pageSize.h - 20);
    s.width = Math.min(Math.max(20, s.width), pageSize.w - s.left);
    s.height = Math.min(Math.max(20, s.height), pageSize.h - s.top);
    return s;
  }
  function syncInputs() {
    const s = selection();
    inL.value = Math.round(s.left); inT.value = Math.round(s.top);
    inW.value = Math.round(s.width); inH.value = Math.round(s.height);
  }
  function drawOverlay() {
    const ctx = overCanvas.getContext("2d");
    const W = overCanvas.width, H = overCanvas.height;
    const s = selection();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(15, 15, 25, 0.48)";
    ctx.fillRect(0, 0, W, H);
    const x = s.left * scale, y = s.top * scale, w = s.width * scale, h = s.height * scale;
    ctx.clearRect(x, y, w, h);
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#e11d48";
    for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
    }
  }
  async function renderPage() {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(curPage);
    const vp1 = page.getViewport({ scale: 1 });
    pageSize = { w: vp1.width, h: vp1.height };
    const maxW = Math.min(wrap.clientWidth || 560, 560);
    scale = maxW / vp1.width;
    const vp = page.getViewport({ scale });
    for (const cv of [baseCanvas, overCanvas]) {
      cv.width = Math.round(vp.width);
      cv.height = Math.round(vp.height);
    }
    await page.render({ canvasContext: baseCanvas.getContext("2d"), viewport: vp }).promise;
    pageLabel.textContent = "Page " + curPage + " of " + pdfDoc.numPages;
    clampSel(selection());
    syncInputs();
    drawOverlay();
  }
  /* drag to select on the overlay */
  let drag = null;
  function evtPos(e) {
    const r = overCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (overCanvas.width / r.width) / scale,
      y: (e.clientY - r.top) * (overCanvas.height / r.height) / scale,
    };
  }
  overCanvas.addEventListener("pointerdown", (e) => {
    if (!pdfDoc) return;
    const p = evtPos(e);
    drag = { x0: p.x, y0: p.y };
    overCanvas.setPointerCapture(e.pointerId);
  });
  overCanvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = evtPos(e);
    const s = selections[curPage];
    s.left = Math.min(drag.x0, p.x);
    s.top = Math.min(drag.y0, p.y);
    s.width = Math.abs(p.x - drag.x0);
    s.height = Math.abs(p.y - drag.y0);
    syncInputs();
    drawOverlay();
  });
  overCanvas.addEventListener("pointerup", () => {
    if (!drag) return;
    drag = null;
    clampSel(selection());
    syncInputs();
    drawOverlay();
  });
  for (const [input, key] of [[inL, "left"], [inT, "top"], [inW, "width"], [inH, "height"]]) {
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      if (isNaN(v)) return;
      selection()[key] = v;
      clampSel(selection());
      drawOverlay();
    });
    input.addEventListener("change", () => { syncInputs(); });
  }
  document.getElementById("cp-prev").addEventListener("click", async () => {
    if (pdfDoc && curPage > 1) { curPage--; await renderPage(); }
  });
  document.getElementById("cp-next").addEventListener("click", async () => {
    if (pdfDoc && curPage < pdfDoc.numPages) { curPage++; await renderPage(); }
  });

  tpDropzone("cp-drop", "cp-file", {
    accept: "application/pdf",
    onFiles: async (files) => {
      tpHideError(err.id); note.hidden = true;
      if (!tpPdfJsReady()) { fail("The PDF preview engine could not load. Refresh the page and try again."); return; }
      try {
        const buf = await files[0].arrayBuffer();
        fileName = tpStripExt(files[0].name);
        pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
        curPage = 1;
        for (const k of Object.keys(selections)) delete selections[k];
        wrap.hidden = false;
        document.getElementById("cp-controls").hidden = false;
        await renderPage();
        showNote("Drag on the page to draw the crop box, or type exact values. The preview updates as you go.");
      } catch (e) {
        fail("That file could not be opened as a PDF.");
      }
    },
  });

  document.getElementById("cp-apply").addEventListener("click", async () => {
    tpHideError(err.id);
    if (!pdfDoc) { fail("Choose a PDF first."); return; }
    if (typeof PDFLib === "undefined") { fail("The PDF engine is still loading — wait a moment and try again."); return; }
    const btn = document.getElementById("cp-apply");
    btn.disabled = true;
    try {
      const srcBytes = await pdfDoc.getData();
      const doc = await PDFLib.PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const all = document.querySelector('input[name="cp-scope"]:checked').value === "all";
      const pages = doc.getPages();
      const s = selection();
      const targets = all ? pages.map((_, i) => i) : [curPage - 1];
      for (const i of targets) {
        const page = pages[i];
        const size = page.getSize();
        const w = Math.min(s.width, size.width);
        const h = Math.min(s.height, size.height);
        const x = Math.min(s.left, size.width - w);
        const y = size.height - (Math.min(s.top, size.height - h) + h);
        page.setCropBox(x, y, w, h);
        page.setMediaBox(x, y, w, h);
      }
      const out = await doc.save();
      tpDownload(new Blob([out], { type: "application/pdf" }), fileName + "-cropped.pdf");
      showNote("Done — your cropped PDF has downloaded. Everything outside the box was trimmed away.");
    } catch (e) {
      fail("Cropping failed for this file. It may be damaged or password-protected.");
    }
    btn.disabled = false;
  });
})();

/* ---------------- organize-pdf ---------------- */
(function () {
  const panel = document.getElementById("organize-pdf");
  if (!panel) return;
  const err = document.getElementById("og-error");
  const note = document.getElementById("og-note");
  const grid = document.getElementById("og-grid");
  const bar = document.getElementById("og-bar");
  const summary = document.getElementById("og-summary");
  let srcBytes = null;
  let fileName = "document";
  let order = []; /* {src: pageIndex, rot: added degrees, deleted: bool} */

  function showNote(t) { note.hidden = false; note.textContent = t; }
  function fail(t) { tpShowError(err.id, t); }

  function renderCards() {
    grid.innerHTML = "";
    order.forEach((entry, i) => {
      const card = document.createElement("div");
      card.className = "og-card" + (entry.deleted ? " og-deleted" : "");
      const cv = document.createElement("canvas");
      cv.className = "og-thumb";
      if (entry.rot % 180 !== 0) cv.classList.add("og-thumb-rot");
      cv.style.transform = "rotate(" + entry.rot + "deg)";
      card.appendChild(cv);
      const lab = document.createElement("div");
      lab.className = "og-label";
      lab.textContent = "Page " + (entry.src + 1);
      card.appendChild(lab);
      const btns = document.createElement("div");
      btns.className = "og-btns";
      const mk = (txt, act, title) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = txt; b.title = title;
        b.dataset.act = act; b.dataset.idx = i;
        return b;
      };
      btns.appendChild(mk("←", "left", "Move earlier"));
      btns.appendChild(mk("→", "right", "Move later"));
      btns.appendChild(mk("⟳", "rot", "Rotate 90°"));
      btns.appendChild(mk(entry.deleted ? "↺" : "✕", "del", entry.deleted ? "Restore page" : "Delete page"));
      card.appendChild(btns);
      grid.appendChild(card);
      entry.canvas = cv;
    });
    const kept = order.filter((e) => !e.deleted).length;
    summary.textContent = order.length + " pages · " + kept + " will be in the new PDF";
    paintThumbs();
  }

  let pdfDoc = null;
  async function paintThumbs() {
    if (!pdfDoc) return;
    for (const entry of order) {
      if (!entry.canvas || entry.canvas.dataset.done) continue;
      entry.canvas.dataset.done = "1";
      const page = await pdfDoc.getPage(entry.src + 1);
      const vp1 = page.getViewport({ scale: 1 });
      const targetW = entry.rot % 180 !== 0 ? 110 : 150;
      const vp = page.getViewport({ scale: targetW / vp1.width });
      entry.canvas.width = Math.round(vp.width);
      entry.canvas.height = Math.round(vp.height);
      await page.render({ canvasContext: entry.canvas.getContext("2d"), viewport: vp }).promise;
    }
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const i = parseInt(b.dataset.idx, 10);
    const act = b.dataset.act;
    if (act === "left" && i > 0) { [order[i - 1], order[i]] = [order[i], order[i - 1]]; }
    else if (act === "right" && i < order.length - 1) { [order[i + 1], order[i]] = [order[i], order[i + 1]]; }
    else if (act === "rot") { order[i].rot = (order[i].rot + 90) % 360; }
    else if (act === "del") { order[i].deleted = !order[i].deleted; }
    renderCards();
  });

  tpDropzone("og-drop", "og-file", {
    accept: "application/pdf",
    onFiles: async (files) => {
      tpHideError(err.id); note.hidden = true;
      if (!tpPdfJsReady()) { fail("The PDF preview engine could not load. Refresh the page and try again."); return; }
      try {
        srcBytes = new Uint8Array(await files[0].arrayBuffer());
        fileName = tpStripExt(files[0].name);
        pdfDoc = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
        order = [];
        for (let i = 0; i < pdfDoc.numPages; i++) order.push({ src: i, rot: 0, deleted: false });
        grid.hidden = false;
        bar.hidden = false;
        renderCards();
        showNote("Reorder with the arrow buttons, rotate or remove pages, then build your new PDF.");
      } catch (e) {
        fail("That file could not be opened as a PDF.");
      }
    },
  });

  document.getElementById("og-build").addEventListener("click", async () => {
    tpHideError(err.id);
    if (!srcBytes) { fail("Choose a PDF first."); return; }
    if (typeof PDFLib === "undefined") { fail("The PDF engine is still loading — wait a moment and try again."); return; }
    const keep = order.filter((e) => !e.deleted);
    if (!keep.length) { fail("Every page is marked for removal — restore at least one page."); return; }
    const btn = document.getElementById("og-build");
    btn.disabled = true;
    try {
      const src = await PDFLib.PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const idx = keep.map((e) => e.src);
      const copied = await out.copyPages(src, idx);
      copied.forEach((page, k) => {
        const rot = keep[k].rot;
        if (rot) {
          const cur = page.getRotation().angle;
          page.setRotation(PDFLib.degrees((cur + rot) % 360));
        }
        out.addPage(page);
      });
      const bytes = await out.save();
      tpDownload(new Blob([bytes], { type: "application/pdf" }), fileName + "-organized.pdf");
      showNote("Done — your reorganized PDF (" + keep.length + " pages) has downloaded.");
    } catch (e) {
      fail("Building the PDF failed. The file may be damaged or password-protected.");
    }
    btn.disabled = false;
  });
})();

/* ---------------- compare-pdf ---------------- */
(function () {
  const panel = document.getElementById("compare-pdf");
  if (!panel) return;
  const err = document.getElementById("cm-error");
  const note = document.getElementById("cm-note");
  const result = document.getElementById("cm-result");
  const summary = document.getElementById("cm-summary");
  const colA = document.getElementById("cm-col-a");
  const colB = document.getElementById("cm-col-b");
  const files = { a: null, b: null };

  function showNote(t) { note.hidden = false; note.textContent = t; }
  function fail(t) { tpShowError(err.id, t); }

  function bindDrop(dropId, inputId, nameId, key) {
    tpDropzone(dropId, inputId, {
      accept: "application/pdf",
      onFiles: (fs) => {
        files[key] = fs[0];
        document.getElementById(nameId).textContent = fs[0].name;
        tpHideError(err.id);
      },
    });
  }
  bindDrop("cm-drop-a", "cm-file-a", "cm-name-a", "a");
  bindDrop("cm-drop-b", "cm-file-b", "cm-name-b", "b");

  async function docLines(file) {
    const buf = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const lines = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const items = await tpPageTextItems(page);
      for (const ln of tpGroupLines(items)) {
        const words = [];
        for (const it of ln.items) {
          for (const w of it.str.split(/\s+/)) if (w) words.push(w);
        }
        if (words.length) lines.push(words);
      }
    }
    return lines;
  }

  /* LCS-based diff over arrays of tokens; returns ops [{t:'eq'|'del'|'ins', v}] */
  function tpDiff(a, b) {
    const n = a.length, m = b.length;
    if (n * m > 9e6) {
      /* very large: treat as wholesale change rather than hang the tab */
      return null;
    }
    const dp = new Uint32Array((n + 1) * (m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i * (m + 1) + j] = a[i] === b[j]
          ? dp[(i + 1) * (m + 1) + j + 1] + 1
          : Math.max(dp[(i + 1) * (m + 1) + j], dp[i * (m + 1) + j + 1]);
      }
    }
    const ops = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ t: "eq", v: a[i] }); i++; j++; }
      else if (dp[(i + 1) * (m + 1) + j] >= dp[i * (m + 1) + j + 1]) { ops.push({ t: "del", v: a[i] }); i++; }
      else { ops.push({ t: "ins", v: b[j] }); j++; }
    }
    while (i < n) { ops.push({ t: "del", v: a[i] }); i++; }
    while (j < m) { ops.push({ t: "ins", v: b[j] }); j++; }
    return ops;
  }

  function lineKey(words) { return words.join(" "); }

  function renderSide(container, blocks, side) {
    container.innerHTML = "";
    for (const block of blocks) {
      const div = document.createElement("div");
      div.className = "cm-line" + (block.kind === "changed" ? " cm-line-changed" : block.kind !== "eq" ? " cm-line-" + block.kind : "");
      if (block.kind === "eq") {
        div.textContent = block.words.join(" ");
      } else if (block.kind === "changed") {
        for (const part of block.parts) {
          if (part.t === "eq") div.appendChild(document.createTextNode(part.v + " "));
          else {
            const sp = document.createElement("span");
            sp.className = side === "a" ? "cm-del" : "cm-ins";
            sp.textContent = part.v;
            div.appendChild(sp);
            div.appendChild(document.createTextNode(" "));
          }
        }
      } else {
        div.textContent = block.words.join(" ");
      }
      container.appendChild(div);
    }
  }

  document.getElementById("cm-run").addEventListener("click", async () => {
    tpHideError(err.id); note.hidden = true;
    if (!tpPdfJsReady()) { fail("The PDF engine could not load. Refresh the page and try again."); return; }
    if (!files.a || !files.b) { fail("Choose both PDFs first."); return; }
    const btn = document.getElementById("cm-run");
    btn.disabled = true;
    btn.textContent = "Comparing…";
    try {
      const linesA = await docLines(files.a);
      const linesB = await docLines(files.b);
      if (!linesA.length || !linesB.length) {
        fail("One of these PDFs has no readable text (it may be a scanned image). Scanned PDFs cannot be compared yet.");
        btn.disabled = false; btn.textContent = "Compare PDFs";
        return;
      }
      const keysA = linesA.map(lineKey);
      const keysB = linesB.map(lineKey);
      const lineOps = tpDiff(keysA, keysB);
      const blocksA = [], blocksB = [];
      let removed = 0, added = 0, changedLines = 0;
      let pendingDel = [], pendingIns = [];
      function flush() {
        const pairs = Math.min(pendingDel.length, pendingIns.length);
        for (let k = 0; k < pairs; k++) {
          const wa = linesA[pendingDel[k]], wb = linesB[pendingIns[k]];
          const wops = tpDiff(wa, wb);
          const partsA = [], partsB = [];
          if (wops) {
            for (const op of wops) {
              if (op.t === "eq") { partsA.push(op); partsB.push(op); }
              else if (op.t === "del") { partsA.push(op); removed++; }
              else { partsB.push(op); added++; }
            }
          } else {
            partsA.push(...wa.map((v) => ({ t: "del", v })));
            partsB.push(...wb.map((v) => ({ t: "ins", v })));
            removed += wa.length; added += wb.length;
          }
          blocksA.push({ kind: "changed", parts: partsA });
          blocksB.push({ kind: "changed", parts: partsB });
          changedLines++;
        }
        for (let k = pairs; k < pendingDel.length; k++) {
          blocksA.push({ kind: "del", words: linesA[pendingDel[k]] });
          removed += linesA[pendingDel[k]].length; changedLines++;
        }
        for (let k = pairs; k < pendingIns.length; k++) {
          blocksB.push({ kind: "ins", words: linesB[pendingIns[k]] });
          added += linesB[pendingIns[k]].length; changedLines++;
        }
        pendingDel = []; pendingIns = [];
      }
      if (lineOps) {
        let ia = 0, ib = 0;
        for (const op of lineOps) {
          if (op.t === "eq") {
            flush();
            blocksA.push({ kind: "eq", words: linesA[ia] });
            blocksB.push({ kind: "eq", words: linesB[ib] });
            ia++; ib++;
          } else if (op.t === "del") { pendingDel.push(ia); ia++; }
          else { pendingIns.push(ib); ib++; }
        }
        flush();
      } else {
        blocksA.push(...linesA.map((words) => ({ kind: "del", words })));
        blocksB.push(...linesB.map((words) => ({ kind: "ins", words })));
        removed = linesA.flat().length; added = linesB.flat().length;
        changedLines = linesA.length + linesB.length;
      }
      renderSide(colA, blocksA, "a");
      renderSide(colB, blocksB, "b");
      result.hidden = false;
      if (removed === 0 && added === 0) {
        summary.textContent = "No differences found — the text of both PDFs is identical.";
      } else {
        summary.textContent = removed + " word" + (removed === 1 ? "" : "s") + " removed · " +
          added + " word" + (added === 1 ? "" : "s") + " added · " +
          changedLines + " line" + (changedLines === 1 ? "" : "s") + " changed";
      }
      showNote("Red highlights on the left are text only in the first PDF; green highlights on the right are text only in the second.");
    } catch (e) {
      fail("Comparison failed. One of the files may be damaged or password-protected.");
    }
    btn.disabled = false;
    btn.textContent = "Compare PDFs";
  });
})();

/* ---------------- qpdf tools: unlock / protect / repair ---------------- */

function tpQpdfTool(cfg) {
  const panel = document.getElementById(cfg.slug);
  if (!panel) return;
  const err = document.getElementById(cfg.p + "-error");
  const note = document.getElementById(cfg.p + "-note");
  let bytes = null;
  let fileName = "document";
  function showNote(t) { note.hidden = false; note.textContent = t; }
  function fail(t) { tpShowError(err.id, t); }
  tpDropzone(cfg.p + "-drop", cfg.p + "-file", {
    accept: "application/pdf",
    onFiles: async (files) => {
      tpHideError(err.id); note.hidden = true;
      bytes = new Uint8Array(await files[0].arrayBuffer());
      fileName = tpStripExt(files[0].name);
      showNote(files[0].name + " is ready. Your file never leaves this device.");
    },
  });
  document.getElementById(cfg.p + "-run").addEventListener("click", async () => {
    tpHideError(err.id);
    if (!bytes) { fail("Choose a PDF first."); return; }
    const btn = document.getElementById(cfg.p + "-run");
    const argsOrError = cfg.buildArgs();
    if (typeof argsOrError === "string") { fail(argsOrError); return; }
    btn.disabled = true;
    const old = btn.textContent;
    btn.textContent = "Working…";
    try {
      if (cfg.probe) {
        const pre = await tpQpdfRun(cfg.probe(), bytes);
        if (pre.code === 2 || pre.code === -1) {
          fail(cfg.probeFail);
          btn.disabled = false;
          btn.textContent = old;
          return;
        }
      }
      const res = await tpQpdfRun(argsOrError, bytes);
      if (res.out && res.code !== 2 && res.code !== -1) {
        tpDownload(new Blob([res.out], { type: "application/pdf" }), fileName + cfg.suffix);
        showNote(cfg.success(res, bytes));
      } else {
        fail(tpQpdfError(res, cfg.failure));
      }
    } catch (e) {
      fail("The PDF engine could not start. Refresh the page and try again.");
    }
    btn.disabled = false;
    btn.textContent = old;
  });
}

tpQpdfTool({
  slug: "unlock-pdf", p: "un", suffix: "-unlocked.pdf",
  buildArgs: () => {
    const pw = document.getElementById("un-password").value;
    return ["--password=" + pw, "--decrypt", "/in.pdf", "/out.pdf"];
  },
  probe: () => {
    const pw = document.getElementById("un-password").value;
    return ["--password=" + pw, "--show-encryption", "/in.pdf"];
  },
  probeFail: "That password does not match this file. Check it and try again — or, if the file itself is damaged, run it through Repair PDF first.",
  success: () => "Done — the unlocked PDF has downloaded. It opens with no password and no restrictions.",
  failure: "Unlocking failed. The file may be damaged, or it uses encryption this tool cannot remove.",
});

tpQpdfTool({
  slug: "protect-pdf", p: "pr", suffix: "-protected.pdf",
  buildArgs: () => {
    const pw = document.getElementById("pr-password").value;
    if (!pw) return "Set a password first — that is what will protect the file.";
    if (pw.length < 4) return "Use at least 4 characters for the password.";
    const owner = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => "0123456789abcdefghijklmnopqrstuvwxyz"[b % 36]).join("");
    const allow = (id) => document.getElementById(id).checked;
    return [
      "--encrypt", pw, owner, "256",
      "--print=" + (allow("pr-print") ? "full" : "none"),
      "--modify=" + (allow("pr-modify") ? "all" : "none"),
      "--extract=" + (allow("pr-copy") ? "y" : "n"),
      "--annotate=" + (allow("pr-annotate") ? "y" : "n"),
      "--", "/in.pdf", "/out.pdf",
    ];
  },
  success: () => "Done — the protected PDF has downloaded. It now asks for your password before it opens, with 256-bit AES encryption.",
  failure: "Protecting failed. The file may be damaged or already encrypted with a password.",
});

tpQpdfTool({
  slug: "repair-pdf", p: "rp", suffix: "-repaired.pdf",
  buildArgs: () => ["/in.pdf", "/out.pdf"],
  success: (res, input) => {
    const headerOk = input && input[0] === 0x25 && input[1] === 0x50 && input[2] === 0x44 && input[3] === 0x46;
    return (res.code === 3 || /warning/i.test(res.log) || !headerOk)
      ? "Done — damage was found and repaired. The clean PDF has downloaded."
      : "Done — no structural damage was found, and a clean, freshly-written copy has downloaded.";
  },
  failure: "This file is too damaged to rebuild. If it opens in another reader, try printing it to PDF there first.",
});

/* ---------------- pdf-to-excel ---------------- */
(function () {
  const panel = document.getElementById("pdf-to-excel");
  if (!panel) return;
  const err = document.getElementById("px-error");
  const note = document.getElementById("px-note");
  const bar = document.getElementById("px-progress");
  const barFill = document.getElementById("px-progress-fill");
  const status = document.getElementById("px-status");
  let file = null;

  function showNote(t) { note.hidden = false; note.textContent = t; }
  function fail(t) { tpShowError(err.id, t); bar.hidden = true; }
  function progress(pct, text) {
    bar.hidden = false;
    barFill.style.width = Math.round(pct) + "%";
    if (text) status.textContent = text;
  }

  tpDropzone("px-drop", "px-file", {
    accept: "application/pdf",
    onFiles: (files) => {
      file = files[0];
      tpHideError(err.id); note.hidden = true; bar.hidden = true;
      showNote(file.name + " is ready. Conversion happens entirely in your browser.");
    },
  });

  /* cluster numeric values within tol of each other -> sorted centers */
  function cluster1d(vals, tol) {
    const sorted = vals.slice().sort((a, b) => a - b);
    const out = [];
    for (const v of sorted) {
      const last = out[out.length - 1];
      if (last && Math.abs(v - last.c) <= tol) {
        last.sum += v; last.n++;
        last.c = last.sum / last.n;
      } else {
        out.push({ c: v, sum: v, n: 1 });
      }
    }
    return out.map((o) => o.c);
  }

  /* Build a 2D string grid from positioned items (+ optional grid lines). */
  function buildGrid(items, grid) {
    if (!items.length) return [];
    /* ---- row bands ---- */
    let rowBands = null; /* array of [yLow, yHigh], top first */
    if (grid && grid.h.length >= 2) {
      const ys = cluster1d(grid.h.filter((l) => (l.x2 - l.x1) >= 40).map((l) => l.y), 2);
      if (ys.length >= 2) {
        rowBands = [];
        for (let i = ys.length - 1; i > 0; i--) rowBands.push([ys[i - 1], ys[i]]);
      }
    }
    /* ---- column bands ---- */
    let colBands = null; /* array of [xLow, xHigh], left first */
    if (grid && grid.v.length >= 2) {
      const xs = cluster1d(grid.v.filter((l) => (l.y2 - l.y1) >= 24).map((l) => l.x), 2);
      if (xs.length >= 2) {
        colBands = [];
        for (let i = 0; i < xs.length - 1; i++) colBands.push([xs[i], xs[i + 1]]);
      }
    }

    const lines0 = tpGroupLines(items);
    let lines = lines0;

    if (!colBands) {
      /* fallback: column separators from wide horizontal gaps between items */
      const mids = [];
      let supportLines = 0;
      for (const ln of lines) {
        if (ln.items.length < 2) continue;
        supportLines++;
        for (let i = 0; i < ln.items.length - 1; i++) {
          const a = ln.items[i], b = ln.items[i + 1];
          const gap = b.x - (a.x + a.w);
          if (gap > Math.max(9, Math.max(a.size, b.size) * 0.9)) {
            mids.push({ x: (a.x + a.w + b.x) / 2, line: ln });
          }
        }
      }
      const clusters = [];
      for (const m of mids) {
        let cl = clusters.find((c) => Math.abs(c.c - m.x) <= 10);
        if (!cl) { cl = { c: m.x, lines: new Set() }; clusters.push(cl); }
        cl.lines.add(m.line);
      }
      const need = Math.max(2, Math.ceil(supportLines * 0.3));
      const seps = clusters.filter((c) => c.lines.size >= need).map((c) => c.c).sort((a, b) => a - b);
      if (seps.length) {
        colBands = [];
        let prev = -Infinity;
        for (const s of seps) { colBands.push([prev, s]); prev = s; }
        colBands.push([prev, Infinity]);
      } else {
        colBands = [[-Infinity, Infinity]];
      }
      /* Merge items on a line that sit closer than the column-break
         threshold: they are one phrase (a title, a two-word header),
         and merging stops a long phrase that straddles a separator
         from being split across two cells. */
      lines = lines0.map((ln) => {
        const merged = [];
        for (const it of ln.items) {
          const last = merged[merged.length - 1];
          if (last && it.x - (last.x + last.w) <= Math.max(9, Math.max(last.size, it.size) * 0.9)) {
            last.str = last.str + " " + it.str;
            last.w = it.x + it.w - last.x;
          } else {
            merged.push({ str: it.str, x: it.x, y: it.y, w: it.w, size: it.size });
          }
        }
        return { y: ln.y, size: ln.size, items: merged };
      });
    }

    function colOf(item) {
      const cx = item.x + item.w / 2;
      for (let i = 0; i < colBands.length; i++) {
        if (cx >= colBands[i][0] - 1 && cx < colBands[i][1] + 1) return i;
      }
      return cx < colBands[0][0] ? 0 : colBands.length - 1;
    }

    /* rows: bands if we have them, else text lines; keep vertical order */
    const rowGroups = [];
    if (rowBands) {
      const inBand = new Set();
      for (const [lo, hi] of rowBands) {
        const cellItems = items.filter((it) => {
          const cy = it.y + it.size * 0.35;
          return cy >= lo - 2 && cy <= hi + 2;
        });
        cellItems.forEach((it) => inBand.add(it));
        rowGroups.push(cellItems);
      }
      /* items outside every band (titles, footnotes) become their own lines,
         re-inserted in vertical order */
      const outside = items.filter((it) => !inBand.has(it));
      const extra = tpGroupLines(outside).map((ln) => ({ line: ln }));
      const merged = rowGroups.map((g, i) => ({
        items: g,
        sortY: g.length ? Math.max(...g.map((it) => it.y)) : (rowBands[i][1]),
      }));
      for (const e of extra) merged.push({ items: e.line.items, sortY: e.line.y });
      merged.sort((a, b) => b.sortY - a.sortY);
      rowGroups.length = 0;
      rowGroups.push(...merged.map((m) => m.items));
    } else {
      for (const ln of lines) rowGroups.push(ln.items);
    }

    const nCols = colBands.length;
    const gridOut = [];
    for (const rowItems of rowGroups) {
      if (!rowItems.length) { gridOut.push(new Array(nCols).fill("")); continue; }
      const cells = Array.from({ length: nCols }, () => []);
      for (const it of rowItems) cells[colOf(it)].push(it);
      gridOut.push(cells.map((cellItems) => {
        if (!cellItems.length) return "";
        const sub = tpGroupLines(cellItems);
        return sub.map((ln) => tpJoinItems(ln.items)).join(" ");
      }));
    }
    /* trim empty edge rows/cols */
    while (gridOut.length && gridOut[0].every((c) => c === "")) gridOut.shift();
    while (gridOut.length && gridOut[gridOut.length - 1].every((c) => c === "")) gridOut.pop();
    return gridOut;
  }

  /* Type a cell: numbers (incl. $1,234.56 and 12%) become real numbers. */
  function typeCell(s) {
    const t = String(s).trim();
    if (!t) return "";
    let m = t.match(/^([-+]?[\d,]*\d(?:\.\d+)?)%$/);
    if (m) return parseFloat(m[1].replace(/,/g, "")) / 100;
    m = t.match(/^[-+]?[$€£]?\s?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)$/);
    if (m) return parseFloat(m[1].replace(/,/g, ""));
    return t;
  }

  /* OCR one rendered page -> positioned items in PDF points.
     Tesseract is scale-sensitive in a way that is hard to predict: the
     same page can read perfectly at one render scale and lose whole
     blocks at another. So read at several scale/PSM combinations and
     keep the pass that finds the most words — a bad pass always shows
     up as missing words. */
  async function ocrPage(page, vp1, pageNum, totalPages) {
    const worker = await tpTesseractCreate((m) => {
      if (m.status === "recognizing text") {
        const base = ((pageNum - 1) / totalPages) * 100;
        progress(base + m.progress * (100 / totalPages),
          "Page " + pageNum + " of " + totalPages + " is a scan — running OCR (" + Math.round(m.progress * 100) + "%).");
      }
    });
    try {
      const canvases = {};
      async function renderAt(scale) {
        if (!canvases[scale]) {
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(vp.width);
          canvas.height = Math.round(vp.height);
          await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
          canvases[scale] = canvas;
        }
        return canvases[scale];
      }
      let best = null;
      async function tryRead(scale, psm) {
        await worker.setParameters({ tessedit_pageseg_mode: psm });
        const r = await worker.recognize(await renderAt(scale));
        const words = (r.data.words || []).filter((w) => w.text && w.text.trim() && w.bbox);
        if (!best || words.length > best.words.length) best = { words, scale };
      }
      await tryRead(2, "3");
      if (!best || best.words.length < 25) await tryRead(2, "4");
      if (!best || best.words.length < 25) await tryRead(3, "3");
      if (!best || best.words.length < 25) await tryRead(3, "4");
      if (!best || best.words.length < 25) await tryRead(2, "11");
      if (!best || best.words.length < 25) await tryRead(3, "11");
      const H = vp1.height;
      const scale = best.scale;
      return best.words.map((w) => {
        const x = w.bbox.x0 / scale;
        const wPt = (w.bbox.x1 - w.bbox.x0) / scale;
        const hPt = (w.bbox.y1 - w.bbox.y0) / scale;
        /* the word baseline groups more reliably than the bbox bottom,
           which wobbles with descenders */
        const basePx = (w.baseline && w.baseline.has_baseline) ? w.baseline.y1 : w.bbox.y1;
        return {
          str: w.text,
          x,
          y: H - basePx / scale,
          w: wPt,
          size: Math.max(6, hPt * 0.9),
        };
      });
    } finally {
      await worker.terminate();
    }
  }

  document.getElementById("px-run").addEventListener("click", async () => {
    tpHideError(err.id); note.hidden = true;
    if (!file) { fail("Choose a PDF first."); return; }
    if (!tpPdfJsReady()) { fail("The PDF engine could not load. Refresh the page and try again."); return; }
    if (typeof XLSX === "undefined") { fail("The spreadsheet engine is still loading — wait a moment and try again."); return; }
    const btn = document.getElementById("px-run");
    btn.disabled = true;
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const wb = XLSX.utils.book_new();
      let sheets = 0;
      let ocrPages = 0;
      for (let p = 1; p <= pdf.numPages; p++) {
        progress(((p - 1) / pdf.numPages) * 100, "Reading page " + p + " of " + pdf.numPages + "…");
        const page = await pdf.getPage(p);
        const vp1 = page.getViewport({ scale: 1 });
        let items = await tpPageTextItems(page);
        const charCount = items.reduce((n, it) => n + it.str.trim().length, 0);
        let grid = null;
        if (charCount >= 20) {
          try { grid = await tpPageGridLines(page); } catch (e) { grid = null; }
        } else {
          ocrPages++;
          items = await ocrPage(page, vp1, p, pdf.numPages);
        }
        const rows = buildGrid(items, grid);
        if (!rows.length) continue;
        const typed = rows.map((row) => row.map(typeCell));
        const ws = XLSX.utils.aoa_to_sheet(typed);
        XLSX.utils.book_append_sheet(wb, ws, pdf.numPages === 1 ? "Sheet1" : "Page " + p);
        sheets++;
      }
      if (!sheets) {
        fail("No table or text content could be found in this PDF.");
        btn.disabled = false;
        return;
      }
      progress(100, "Building your Excel file…");
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      tpDownload(
        new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        tpStripExt(file.name) + ".xlsx"
      );
      bar.hidden = true;
      showNote("Done — your Excel file has downloaded (" + sheets + " sheet" + (sheets === 1 ? "" : "s") +
        (ocrPages ? ", " + ocrPages + " scanned page" + (ocrPages === 1 ? "" : "s") + " read with OCR" : "") +
        "). Numbers are stored as real numbers, so totals and formulas work.");
    } catch (e) {
      fail("Conversion failed. The file may be damaged or password-protected.");
    }
    btn.disabled = false;
  });
})();
