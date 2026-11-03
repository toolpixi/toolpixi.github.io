/* ToolPixi — shared helpers */
// ==== PURE ====
function tpFormatBytes(bytes) {
  if (!isFinite(bytes) || bytes === null || bytes === undefined) return "—";
  if (bytes === 0) return "0 KB";
  var units = ["B", "KB", "MB", "GB"];
  var i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  if (i === 0) return bytes + " B";
  return String(Math.round((bytes / Math.pow(1024, i)) * 10) / 10) + " " + units[i];
}
function tpStripExt(name) { return (name || "file").replace(/\.[^.]+$/, ""); }

// ==== DOM ====
function tpDownload(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}
function tpShowError(id, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.classList.add("show");
}
function tpHideError(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove("show");
}
/* Wire a dropzone: element #dropId (click -> file input #inputId), drag/drop supported.
   opts: accept (string), multiple (bool), onFiles(FileList->array) */
function tpDropzone(dropId, inputId, opts) {
  var drop = document.getElementById(dropId), input = document.getElementById(inputId);
  if (!drop || !input) return;
  if (opts && opts.accept) input.setAttribute("accept", opts.accept);
  if (opts && opts.multiple) input.setAttribute("multiple", "");
  drop.addEventListener("click", function () { input.click(); });
  input.addEventListener("change", function () {
    if (input.files && input.files.length) opts.onFiles(Array.prototype.slice.call(input.files));
    input.value = "";
  });
  ["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("drag"); });
  });
  drop.addEventListener("drop", function (e) {
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length) opts.onFiles(Array.prototype.slice.call(files));
  });
}
function tpFileList(elId, files, extra) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = files.map(function (f, i) {
    var right = tpFormatBytes(f.size) + (extra ? " " + extra(f, i) : "");
    return '<div class="fi"><span class="nm">' + f.name.replace(/</g, "&lt;") +
      '</span><span class="sz">' + right + "</span></div>";
  }).join("");
}

/* Copy text to the clipboard with "Copied!" button feedback (newer tools). */
function tpCopyWithFeedback(btn, text) {
  function done() {
    if (!btn) return;
    var orig = btn.getAttribute("data-orig") || btn.textContent;
    btn.setAttribute("data-orig", orig);
    btn.textContent = "Copied!";
    setTimeout(function () { btn.textContent = orig; }, 1500);
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { if (document.execCommand("copy")) done(); } catch (e) {}
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else fallback();
}

/* Allow only web-safe link targets: http(s), mailto, tel, and relative/anchor
   URLs pass through; any other scheme (javascript:, data:, ...) becomes "#". */
function tpSanitizeHref(u) {
  u = String(u === null || u === undefined ? "" : u).replace(/^\s+|\s+$/g, "");
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return "#";
  return u;
}
