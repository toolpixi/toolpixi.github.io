/* ToolPixi — Image to Text (OCR).
   Tesseract.js runs fully in the browser: engine, worker and English
   language data are all self-hosted under /assets/vendor/tesseract/
   and loaded lazily — only when the first image is dropped in. The
   image itself never leaves the device. */
(function () {
  var panel = document.getElementById("image-to-text");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var VENDOR = "/assets/vendor/tesseract";
  var workerPromise = null;

  function loadEngine() {
    if (!workerPromise) {
      workerPromise = new Promise(function (resolve, reject) {
        function start() {
          Tesseract.createWorker("eng", "1", {
            workerPath: VENDOR + "/worker.min.js",
            corePath: VENDOR + "/core",
            langPath: VENDOR,
            gzip: true,
            cacheMethod: "none",
            logger: function (m) {
              if (m.status === "recognizing text") {
                el("it-progress").style.display = "block";
                el("it-progress").value = Math.round((m.progress || 0) * 100);
                el("it-status").textContent = "Reading the text… " + Math.round((m.progress || 0) * 100) + "%";
              } else if (m.status) {
                el("it-status").textContent = "Loading the OCR engine… (" + m.status + ")";
              }
            }
          }).then(resolve, reject);
        }
        if (window.Tesseract) return start();
        var s = document.createElement("script");
        s.src = VENDOR + "/tesseract.min.js";
        s.onload = start;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      workerPromise.catch(function () { workerPromise = null; });
    }
    return workerPromise;
  }

  tpDropzone("it-drop", "it-file", { accept: "image/*", onFiles: function (files) {
    if (!files.length) return;
    var file = files[0];
    tpHideError("it-err");
    el("it-result").style.display = "none";
    el("it-progress").style.display = "none";
    el("it-status").textContent = "Loading the OCR engine — the first run downloads it once (about 10 MB)…";
    var thumb = el("it-thumb");
    thumb.src = URL.createObjectURL(file);
    thumb.style.display = "block";

    loadEngine().then(function (worker) {
      el("it-status").textContent = "Reading the text…";
      return worker.recognize(file);
    }).then(function (res) {
      var text = (res && res.data && res.data.text || "").trim();
      el("it-progress").style.display = "none";
      if (!text) {
        el("it-status").textContent = "";
        tpShowError("it-err", "No readable text was found in that image. Clear, upright, high-contrast text works best.");
        return;
      }
      el("it-out").value = text;
      var words = text.split(/\s+/).filter(Boolean).length;
      el("it-meta").textContent = words + " words · " + text.length + " characters — read entirely on your device.";
      el("it-status").textContent = "";
      el("it-result").style.display = "block";
    }).catch(function () {
      el("it-progress").style.display = "none";
      el("it-status").textContent = "";
      tpShowError("it-err", "The OCR engine could not run. Check your connection (the engine loads once from this site) and try again.");
    });
  }});

  el("it-copy").addEventListener("click", function () {
    tpCopyWithFeedback(el("it-copy"), el("it-out").value);
  });
  el("it-download").addEventListener("click", function () {
    tpDownload(new Blob([el("it-out").value], { type: "text/plain" }), "extracted-text.txt");
  });
})();
