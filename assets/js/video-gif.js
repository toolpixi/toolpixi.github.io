/* ToolPixi — Video to GIF.
   The self-hosted FFmpeg WebAssembly engine (same one the video
   compressor uses) trims a clip and re-encodes it as an animated GIF,
   entirely in the browser. Loaded as a module from the tool page. */
var VENDOR = "/assets/vendor/ffmpeg";
var ffmpegPromise = null;
var fetchFileImpl = null;
var activeBar = null;

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
      } catch (e) { throw tpLoadError(); }
      fetchFileImpl = util.fetchFile;
      var ffmpeg = new lib.FFmpeg();
      ffmpeg.on("progress", function (e) {
        if (activeBar && e && typeof e.progress === "number") {
          activeBar.style.display = "block";
          activeBar.value = Math.max(0, Math.min(100, Math.round(e.progress * 100)));
        }
      });
      try {
        await ffmpeg.load({
          coreURL: VENDOR + "/core/ffmpeg-core.js",
          wasmURL: VENDOR + "/core/ffmpeg-core.wasm"
        });
      } catch (e) { throw tpLoadError(); }
      return ffmpeg;
    })();
    ffmpegPromise.catch(function () { ffmpegPromise = null; });
  }
  return ffmpegPromise;
}

(function () {
  var panel = document.getElementById("video-to-gif");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var file = null;
  var duration = 0;   // seconds, read from the video metadata

  function updateEstimate() {
    var start = parseFloat(el("vg-start").value) || 0;
    var end = parseFloat(el("vg-end").value) || 0;
    var len = Math.max(0, end - start);
    var width = parseInt(el("vg-width").value, 10) || 480;
    // Rough rule of thumb at 10 fps with typical photo content.
    var est = len * 10 * width * width * 0.0011;
    el("vg-est").textContent = file
      ? "Clip: " + len.toFixed(1) + "s at " + width + "px wide, 10 fps — very rough size estimate: about " +
        tpFormatBytes(est) + ". Busy, detailed clips run larger; flat screen recordings run smaller."
      : "";
    el("vg-go").disabled = !file || len <= 0 || len > 15.5;
    if (file && len > 15.5) {
      el("vg-est").textContent += " GIFs are capped at 15 seconds here — shorten the range.";
    }
  }

  tpDropzone("vg-drop", "vg-file", { accept: "video/*", onFiles: function (files) {
    if (!files.length) return;
    file = files[0];
    tpHideError("vg-err");
    tpFileList("vg-list", [file]);
    var v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = function () {
      duration = v.duration || 0;
      el("vg-end").value = Math.min(5, duration || 5).toFixed(1);
      el("vg-start").value = "0";
      el("vg-meta").textContent = "Video length: " + duration.toFixed(1) + "s. Pick the slice to turn into a GIF (15s max).";
      URL.revokeObjectURL(v.src);
      updateEstimate();
    };
    v.onerror = function () {
      el("vg-meta").textContent = "Length could not be read — the defaults (first 5 seconds) will be used.";
      duration = 5;
      updateEstimate();
    };
    v.src = URL.createObjectURL(file);
    updateEstimate();
  }});

  ["vg-start", "vg-end", "vg-width"].forEach(function (id) {
    el(id).addEventListener("input", updateEstimate);
    el(id).addEventListener("change", updateEstimate);
  });

  el("vg-go").addEventListener("click", async function () {
    if (!file) return;
    var btn = el("vg-go");
    btn.disabled = true;
    tpHideError("vg-err");
    el("vg-result").style.display = "none";
    el("vg-status").textContent = "Loading the conversion engine (one-time, about 30 MB)…";
    activeBar = el("vg-progress");
    try {
      var ffmpeg = await loadFFmpeg();
      var start = Math.max(0, parseFloat(el("vg-start").value) || 0);
      var end = parseFloat(el("vg-end").value) || 0;
      var len = Math.min(15, end - start);
      var width = parseInt(el("vg-width").value, 10) || 480;
      var inName = "in" + (file.name.match(/\.[a-z0-9]+$/i) || [".mp4"])[0].toLowerCase();
      el("vg-status").textContent = "Converting — this happens on your device, so a few seconds is normal…";
      await ffmpeg.writeFile(inName, await fetchFileImpl(file));
      var code = await ffmpeg.exec([
        "-ss", String(start), "-t", String(len), "-i", inName,
        "-vf", "fps=10,scale=" + width + ":-1:flags=lanczos",
        "-loop", "0", "out.gif"
      ]);
      if (code !== 0) throw new Error("convert failed");
      var data = await ffmpeg.readFile("out.gif");
      var blob = new Blob([data.buffer], { type: "image/gif" });
      try { await ffmpeg.deleteFile(inName); await ffmpeg.deleteFile("out.gif"); } catch (e) {}
      el("vg-preview").src = URL.createObjectURL(blob);
      el("vg-done").textContent = "Done — " + len.toFixed(1) + "s GIF, " + width + "px wide, " + tpFormatBytes(blob.size) + ".";
      el("vg-download").onclick = function () { tpDownload(blob, "video.gif"); };
      el("vg-result").style.display = "block";
      el("vg-status").textContent = "";
      tpDownload(blob, "video.gif");
    } catch (e) {
      tpShowError("vg-err", e && e.tpLoad
        ? "The conversion engine could not be loaded, so this tool cannot start. Check your connection, then press the button again to retry — your file has not been touched."
        : "That clip could not be converted. A short MP4 or WebM works best; very long or unusual files can exceed browser memory.");
      el("vg-status").textContent = "";
    }
    activeBar = null;
    el("vg-progress").style.display = "none";
    btn.disabled = false;
    updateEstimate();
  });
})();
