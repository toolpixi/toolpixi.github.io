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
