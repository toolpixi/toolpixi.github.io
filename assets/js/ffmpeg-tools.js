/* ToolPixi — ffmpeg.wasm tools (MP4 to MP3, Video Compressor).
   The FFmpeg core runs entirely in the browser via WebAssembly:
   media files are written to the in-memory virtual filesystem only,
   never uploaded anywhere. Loaded as a module from the tool pages. */
import { FFmpeg } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js";
import { toBlobURL, fetchFile } from "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js";

var CORE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
var PKG = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm";
var ffmpegPromise = null;
var activeBar = null; // <progress> element of the panel currently converting

/* The package's worker.js imports two tiny sibling modules (const.js,
   errors.js). A worker created from a blob URL cannot resolve those
   relative imports, so fetch all three files and inline them into one
   self-contained worker script. */
function stripModule(src) {
  return src.split("\n").filter(function (line) {
    return !/^\s*import\s/.test(line);
  }).join("\n").replace(/^export\s+/gm, "");
}
async function makeClassWorkerURL() {
  var names = ["const.js", "errors.js", "worker.js"], parts = [];
  for (var i = 0; i < names.length; i++) {
    var r = await fetch(PKG + "/" + names[i]);
    if (!r.ok) throw new Error("Could not fetch the conversion engine (" + names[i] + ").");
    parts.push(stripModule(await r.text()));
  }
  return URL.createObjectURL(new Blob([parts.join("\n")], { type: "text/javascript" }));
}

function loadFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async function () {
      var ffmpeg = new FFmpeg();
      ffmpeg.on("progress", function (e) {
        if (activeBar && e && typeof e.progress === "number") {
          activeBar.style.display = "block";
          activeBar.value = Math.max(0, Math.min(100, Math.round(e.progress * 100)));
        }
      });
      var classWorkerURL = await makeClassWorkerURL();
      var coreURL = await toBlobURL(CORE + "/ffmpeg-core.js", "text/javascript");
      var wasmURL = await toBlobURL(CORE + "/ffmpeg-core.wasm", "application/wasm");
      await ffmpeg.load({ classWorkerURL: classWorkerURL, coreURL: coreURL, wasmURL: wasmURL });
      return ffmpeg;
    })();
    ffmpegPromise.catch(function () { ffmpegPromise = null; });
  }
  return ffmpegPromise;
}

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
      await ffmpeg.writeFile(inName, await fetchFile(file));
      var q = el("m3-quality").value;
      var code = await ffmpeg.exec(["-i", inName, "-vn", "-codec:a", "libmp3lame", "-b:a", q, "output.mp3"]);
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
      tpShowError("m3-err", "Conversion failed. The file may use a codec the in-browser engine cannot read, or the tab ran out of memory on a very large file. Your original file is untouched — try a shorter or smaller video.");
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
      await ffmpeg.writeFile(inName, await fetchFile(file));
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
      tpShowError("vc-err", "Compression failed. The file may use a codec the in-browser engine cannot read, or the tab ran out of memory on a very large file. Your original is untouched — try a shorter video, or the 'Much smaller' preset.");
      status.textContent = "";
    }
    bar.style.display = "none"; activeBar = null; btn.disabled = false;
  });
})();
