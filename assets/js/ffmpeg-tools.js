/* ToolPixi — ffmpeg.wasm tools (MP4 to MP3, Video Compressor, Discord).
   The FFmpeg core runs entirely in the browser via WebAssembly:
   media files are written to the in-memory virtual filesystem only,
   never uploaded anywhere. Loaded as a module from the tool pages.

   D-2 fix (2026-11-23 audit): the engine used to be imported from the
   jsDelivr CDN with top-level static imports — if the CDN was unreachable
   the whole module died before any code ran, leaving a dead dropzone and
   a permanently disabled button with no error. The engine is now
   SELF-HOSTED under /assets/vendor/ffmpeg/ (same pattern as JsBarcode)
   and loaded with dynamic imports inside loadFFmpeg(), so this module
   always runs, the panels always wire up, and a load failure surfaces a
   plain, retryable error message instead of silence. */
var VENDOR = "/assets/vendor/ffmpeg";
var ffmpegPromise = null;
var fetchFileImpl = null; // @ffmpeg/util fetchFile, set by loadFFmpeg()
var activeBar = null; // <progress> element of the panel currently converting

function tpLoadError() {
  var e = new Error("The conversion engine could not be loaded.");
  e.tpLoad = true;
  return e;
}

function loadFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async function () {
      var lib, util;
      try {
        lib = await import(VENDOR + "/ffmpeg/index.js");
        util = await import(VENDOR + "/util/index.js");
      } catch (e) {
        throw tpLoadError();
      }
      fetchFileImpl = util.fetchFile;
      var ffmpeg = new lib.FFmpeg();
      ffmpeg.on("progress", function (e) {
        if (activeBar && e && typeof e.progress === "number") {
          activeBar.style.display = "block";
          activeBar.value = Math.max(0, Math.min(100, Math.round(e.progress * 100)));
        }
      });
      try {
        // No classWorkerURL: the package's own worker.js sits next to the
        // vendored classes.js and, as a real same-origin module worker,
        // resolves its relative imports natively — no blob inlining needed.
        await ffmpeg.load({
          coreURL: VENDOR + "/core/ffmpeg-core.js",
          wasmURL: VENDOR + "/core/ffmpeg-core.wasm"
        });
      } catch (e) {
        throw tpLoadError();
      }
      return ffmpeg;
    })();
    ffmpegPromise.catch(function () { ffmpegPromise = null; });
  }
  return ffmpegPromise;
}

var TP_LOAD_MSG = "The conversion engine could not be loaded, so this tool cannot start. " +
  "Check your internet connection, then press the button again to retry — your file has not been touched.";

function extOf(name) {
  var m = /\.([a-z0-9]+)$/i.exec(name || "");
  return m ? "." + m[1].toLowerCase() : ".mp4";
}

/* ---------------- MP4 to MP3 ---------------- */
(function () {
  var panel = document.getElementById("mp4-to-mp3");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  var file = null;
  tpDropzone("m3-drop", "m3-file", { accept: "video/*,audio/*",
    onFiles: function (files) {
      if (!files.length) return;
      file = files[0];
      tpHideError("m3-err");
      tpFileList("m3-list", [file]);
      el("m3-go").disabled = false;
    } });
  el("m3-go").addEventListener("click", async function () {
    if (!file) { tpShowError("m3-err", "Choose a video file first."); return; }
    var btn = el("m3-go"), bar = el("m3-progress"), status = el("m3-status");
    tpHideError("m3-err");
    btn.disabled = true; activeBar = bar; bar.value = 0; bar.style.display = "block";
    try {
      status.textContent = "Loading the audio engine — a one-time download of about 30 MB, then it is cached by your browser…";
      var ffmpeg = await loadFFmpeg();
      status.textContent = "Extracting the audio on your device…";
      var inName = "input" + extOf(file.name);
      await ffmpeg.writeFile(inName, await fetchFileImpl(file));
      var q = el("m3-quality").value;
      // The select's values are bare numbers ("192"); ffmpeg reads "-b:a 192"
      // as 192 BITS/s and LAME clamps to its minimum (~65 kbps out). The "k"
      // suffix is what makes it 192 kbps. Fixed 2026-11-16.
      var code = await ffmpeg.exec(["-i", inName, "-vn", "-codec:a", "libmp3lame", "-b:a", String(q).replace(/k$/i, "") + "k", "output.mp3"]);
      if (code !== 0) throw new Error("ffmpeg exit " + code);
      var data = await ffmpeg.readFile("output.mp3");
      var blob = new Blob([data.buffer], { type: "audio/mpeg" });
      var outName = tpStripExt(file.name) + ".mp3";
      tpDownload(blob, outName);
      el("m3-done").textContent = "Done — " + outName + " downloaded (" + tpFormatBytes(blob.size) +
        " from a " + tpFormatBytes(file.size) + " video). The video never left your device.";
      el("m3-result").classList.add("show");
      status.textContent = "";
    } catch (e) {
      if (e && e.tpLoad) {
        tpShowError("m3-err", TP_LOAD_MSG);
      } else {
        tpShowError("m3-err", "Conversion failed. The file may use a codec the in-browser engine cannot read, or the tab ran out of memory on a very large file. Your original file is untouched — try a shorter or smaller video.");
      }
      status.textContent = "";
    }
    bar.style.display = "none"; activeBar = null; btn.disabled = false;
  });
})();

/* ---------------- Video Compressor ---------------- */
(function () {
  var panel = document.getElementById("video-compressor");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  var file = null, duration = 0;
  tpDropzone("vc-drop", "vc-file", { accept: "video/*",
    onFiles: function (files) {
      if (!files.length) return;
      file = files[0];
      tpHideError("vc-err");
      tpFileList("vc-list", [file]);
      el("vc-go").disabled = false;
      var url = URL.createObjectURL(file);
      var v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = function () { duration = v.duration || 0; URL.revokeObjectURL(url); };
      v.onerror = function () { duration = 0; URL.revokeObjectURL(url); };
      v.src = url;
    } });
  el("vc-go").addEventListener("click", async function () {
    if (!file) { tpShowError("vc-err", "Choose a video file first."); return; }
    var btn = el("vc-go"), bar = el("vc-progress"), status = el("vc-status");
    tpHideError("vc-err");
    btn.disabled = true; activeBar = bar; bar.value = 0; bar.style.display = "block";
    try {
      status.textContent = "Loading the video engine — a one-time download of about 30 MB, then it is cached by your browser…";
      var ffmpeg = await loadFFmpeg();
      status.textContent = "Compressing on your device — video re-encoding is slow work, keep this tab open…";
      var inName = "input" + extOf(file.name);
      await ffmpeg.writeFile(inName, await fetchFileImpl(file));
      var preset = el("vc-preset").value, args;
      if (preset === "discord" && duration > 0) {
        var totalBits = 10 * 1024 * 1024 * 8; // aim: about 10 MB
        var vb = Math.floor(totalBits / duration) - 96000;
        if (vb < 80000) vb = 80000;
        args = ["-i", inName, "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264",
                "-preset", "veryfast", "-b:v", vb + "", "-maxrate", vb + "",
                "-bufsize", (vb * 2) + "", "-c:a", "aac", "-b:a", "96k",
                "-movflags", "+faststart", "output.mp4"];
      } else if (preset === "small") {
        args = ["-i", inName, "-vf", "scale='min(854,iw)':-2", "-c:v", "libx264",
                "-preset", "veryfast", "-crf", "32", "-c:a", "aac", "-b:a", "64k",
                "-movflags", "+faststart", "output.mp4"];
      } else {
        args = ["-i", inName, "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264",
                "-preset", "veryfast", "-crf", "28", "-c:a", "aac", "-b:a", "96k",
                "-movflags", "+faststart", "output.mp4"];
      }
      var code = await ffmpeg.exec(args);
      if (code !== 0) throw new Error("ffmpeg exit " + code);
      var data = await ffmpeg.readFile("output.mp4");
      var blob = new Blob([data.buffer], { type: "video/mp4" });
      var outName = tpStripExt(file.name) + "-compressed.mp4";
      tpDownload(blob, outName);
      var pct = Math.round((1 - blob.size / file.size) * 100);
      el("vc-done").textContent = "Done — " + outName + " downloaded: " + tpFormatBytes(file.size) +
        " → " + tpFormatBytes(blob.size) + (pct > 0 ? " (" + pct + "% smaller)" : "") +
        ". The video never left your device.";
      el("vc-result").classList.add("show");
      status.textContent = "";
    } catch (e) {
      if (e && e.tpLoad) {
        tpShowError("vc-err", TP_LOAD_MSG);
      } else {
        tpShowError("vc-err", "Compression failed. The file may use a codec the in-browser engine cannot read, or the tab ran out of memory on a very large file. Your original is untouched — try a shorter video, or the 'Much smaller' preset.");
      }
      status.textContent = "";
    }
    bar.style.display = "none"; activeBar = null; btn.disabled = false;
  });
})();
