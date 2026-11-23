/* ToolPixi — Screen Recorder.
   getDisplayMedia + MediaRecorder: the browser itself captures the
   screen, tab or window you pick; the recording is assembled in
   memory and downloaded as WebM. Nothing is uploaded — there is no
   server in this tool at all. */
(function () {
  var panel = document.getElementById("screen-recorder");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var recorder = null;
  var chunks = [];
  var stream = null;
  var startedAt = null;
  var timerInt = null;

  var supported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia && window.MediaRecorder);
  if (!supported) {
    el("sr-unsupported").style.display = "block";
    el("sr-start").disabled = true;
    el("sr-status").textContent = "Screen capture is not available in this browser.";
  }

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    return (m < 10 ? "0" : "") + m + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
  }

  function pickMime() {
    var candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
    }
    return "";
  }

  function cleanup() {
    if (timerInt) clearInterval(timerInt);
    timerInt = null;
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    el("sr-start").style.display = "";
    el("sr-stop").style.display = "none";
    el("sr-dot").style.display = "none";
  }

  el("sr-start").addEventListener("click", function () {
    if (!supported) return;
    tpHideError("sr-err");
    el("sr-result").style.display = "none";
    var wantMic = el("sr-mic").checked;
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: el("sr-sysa").checked })
      .then(function (display) {
        stream = display;
        var tracks = display.getVideoTracks().slice();
        display.getAudioTracks().forEach(function (t) { tracks.push(t); });
        if (!wantMic) return new MediaStream(tracks);
        return navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function (mic) {
            mic.getAudioTracks().forEach(function (t) { tracks.push(t); });
            // Keep the mic stream alive by hanging it on the display stream object.
            display.__mic = mic;
            return new MediaStream(tracks);
          })
          .catch(function () { return new MediaStream(tracks); });
      })
      .then(function (combined) {
        chunks = [];
        var mime = pickMime();
        recorder = mime ? new MediaRecorder(combined, { mimeType: mime }) : new MediaRecorder(combined);
        recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.onstop = function () {
          var type = recorder.mimeType || "video/webm";
          var blob = new Blob(chunks, { type: type });
          var ext = type.indexOf("mp4") >= 0 ? "mp4" : "webm";
          var url = URL.createObjectURL(blob);
          el("sr-preview").src = url;
          el("sr-meta").textContent = "Recording ready — " + tpFormatBytes(blob.size) +
            ", " + fmtTime(Date.now() - startedAt) + " long.";
          el("sr-download").onclick = function () { tpDownload(blob, "screen-recording." + ext); };
          el("sr-result").style.display = "block";
          el("sr-status").textContent = "Recording stopped.";
          if (stream && stream.__mic) stream.__mic.getTracks().forEach(function (t) { t.stop(); });
          cleanup();
        };
        // If the user stops sharing from the browser's own bar, wrap up.
        combined.getVideoTracks().forEach(function (t) {
          t.addEventListener("ended", function () {
            if (recorder && recorder.state === "recording") recorder.stop();
          });
        });
        recorder.start(1000);
        startedAt = Date.now();
        el("sr-start").style.display = "none";
        el("sr-stop").style.display = "";
        el("sr-dot").style.display = "";
        el("sr-status").textContent = "Recording… 00:00";
        timerInt = setInterval(function () {
          el("sr-status").textContent = "Recording… " + fmtTime(Date.now() - startedAt);
        }, 500);
      })
      .catch(function (err) {
        cleanup();
        if (err && err.name === "NotAllowedError") {
          el("sr-status").textContent = "Recording cancelled — no screen was shared.";
        } else {
          tpShowError("sr-err", "The screen could not be captured (" + (err && err.name || "error") +
            "). Try Chrome or Edge on a computer, and pick a screen, tab or window when asked.");
          el("sr-status").textContent = "";
        }
      });
  });

  el("sr-stop").addEventListener("click", function () {
    if (recorder && recorder.state === "recording") recorder.stop();
  });
})();
