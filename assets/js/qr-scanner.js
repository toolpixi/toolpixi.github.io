/* ToolPixi — QR Code Scanner (+ 1D barcode mode).
   jsQR (self-hosted) decodes QR codes from an uploaded image or the
   camera; ZXing (self-hosted, loaded only when barcode mode is picked)
   handles EAN/UPC/Code 128 barcodes. Decoding happens on-device: the
   image is never uploaded. */
(function () {
  var panel = document.getElementById("qr-code-scanner");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var mode = "qr";            // "qr" | "barcode"
  var stream = null;          // active camera stream
  var rafId = null;
  var zxingPromise = null;
  var zxingReader = null;

  function showResult(text, kind) {
    el("qs-value").textContent = text;
    el("qs-kind").textContent = kind;
    var link = el("qs-open");
    var safe = tpSanitizeHref(text);
    if (/^https?:/i.test(safe)) {
      link.href = safe; link.style.display = "";
    } else link.style.display = "none";
    el("qs-result").style.display = "block";
  }
  function fail(msg) {
    tpShowError("qs-err", msg);
    el("qs-result").style.display = "none";
  }

  function loadZXing() {
    if (!zxingPromise) {
      zxingPromise = new Promise(function (resolve, reject) {
        if (window.ZXing) return resolve(window.ZXing);
        var s = document.createElement("script");
        s.src = "/assets/vendor/zxing.min.js";
        s.onload = function () { resolve(window.ZXing); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return zxingPromise;
  }

  function fileToImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = reject;
      img.src = url;
    });
  }

  function decodeQRFromImage(img) {
    var maxSide = 1600;
    var s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    var ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, c.width, c.height);
    var data = ctx.getImageData(0, 0, c.width, c.height);
    var code = jsQR(data.data, data.width, data.height);
    return code ? code.data : null;
  }

  function decodeBarcodeFromImage(img) {
    return loadZXing().then(function (ZXing) {
      if (!zxingReader) zxingReader = new ZXing.BrowserMultiFormatReader();
      var attempt = zxingReader.decodeFromImageElement(img);
      return Promise.resolve(attempt).then(function (r) { return r ? r.getText() : null; });
    });
  }

  tpDropzone("qs-drop", "qs-file", { accept: "image/*", onFiles: function (files) {
    if (!files.length) return;
    tpHideError("qs-err");
    el("qs-status").textContent = "Reading the image…";
    fileToImage(files[0]).then(function (r) {
      var done = function (text, kind) {
        el("qs-status").textContent = "";
        if (text) showResult(text, kind);
        else fail(mode === "qr"
          ? "No QR code could be found in that image. Try a sharper, straight-on photo with the whole code in frame."
          : "No barcode could be read in that image. Try a sharper photo with the bars horizontal and fully in frame.");
      };
      if (mode === "qr") {
        var text = null;
        try { text = decodeQRFromImage(r.img); } catch (e) { /* fall through */ }
        done(text, "QR code");
      } else {
        decodeBarcodeFromImage(r.img).then(function (t) { done(t, "Barcode"); },
          function () { done(null, "Barcode"); });
      }
    }, function () { fail("That file could not be read as an image."); });
  }});

  /* ---------------- camera ---------------- */
  var video = el("qs-video");

  function stopCamera() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    video.style.display = "none";
    el("qs-stop").style.display = "none";
    el("qs-start").style.display = "";
    el("qs-status").textContent = "";
  }

  function scanLoop() {
    if (!stream) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA && mode === "qr") {
      var c = document.createElement("canvas");
      c.width = video.videoWidth; c.height = video.videoHeight;
      var ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, c.width, c.height);
      try {
        var data = ctx.getImageData(0, 0, c.width, c.height);
        var code = jsQR(data.data, data.width, data.height);
        if (code && code.data) {
          showResult(code.data, "QR code");
          stopCamera();
          return;
        }
      } catch (e) { /* keep scanning */ }
    }
    rafId = requestAnimationFrame(scanLoop);
  }

  el("qs-start").addEventListener("click", function () {
    tpHideError("qs-err");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      fail("This browser cannot open a camera here. You can still scan any saved image above.");
      return;
    }
    if (mode === "barcode") {
      loadZXing().then(function (ZXing) {
        if (!zxingReader) zxingReader = new ZXing.BrowserMultiFormatReader();
        el("qs-status").textContent = "Opening the camera — hold the barcode in front of it…";
        video.style.display = "block";
        el("qs-stop").style.display = "";
        el("qs-start").style.display = "none";
        zxingReader.decodeFromVideoDevice(null, video, function (result) {
          if (result) {
            showResult(result.getText(), "Barcode");
            zxingReader.reset();
            video.style.display = "none";
            el("qs-stop").style.display = "none";
            el("qs-start").style.display = "";
            el("qs-status").textContent = "";
          }
        }).catch(function () {
          fail("The camera could not be opened. Check the permission prompt, or scan a saved image instead.");
          stopCamera();
        });
      });
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function (st) {
        stream = st;
        video.srcObject = st;
        video.style.display = "block";
        el("qs-stop").style.display = "";
        el("qs-start").style.display = "none";
        el("qs-status").textContent = "Point the camera at a QR code…";
        return video.play();
      })
      .then(function () { scanLoop(); })
      .catch(function () {
        fail("The camera could not be opened. Check the permission prompt, or scan a saved image instead.");
        stopCamera();
      });
  });
  el("qs-stop").addEventListener("click", function () {
    if (zxingReader) { try { zxingReader.reset(); } catch (e) {} }
    stopCamera();
  });

  panel.querySelectorAll("[data-mode]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-mode]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      mode = chip.getAttribute("data-mode");
      el("qs-drop-big").textContent = mode === "qr"
        ? "Tap to choose an image with a QR code — or drop it here"
        : "Tap to choose an image with a barcode — or drop it here";
      stopCamera();
    });
  });

  el("qs-copy").addEventListener("click", function () {
    tpCopyWithFeedback(el("qs-copy"), el("qs-value").textContent);
  });
})();
