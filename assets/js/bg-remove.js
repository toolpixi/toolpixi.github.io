"use strict";
/* ToolPixi Background Remover — MODNet portrait matting (Apache-2.0 model),
   run locally with ONNX Runtime Web (MIT). Runtime and model are both
   self-hosted in /assets; the photo never leaves the device. */
(function () {
  var panel = document.getElementById("bg-remover");
  if (!panel) return;
  if (typeof ort !== "undefined" && ort.env && ort.env.wasm) {
    ort.env.wasm.wasmPaths = "/assets/vendor/ort/";
    ort.env.wasm.numThreads = 1;
  }
  var goBtn = document.getElementById("bgr-go"), dlBtn = document.getElementById("bgr-download");
  var statusEl = document.getElementById("bgr-status"), resultEl = document.getElementById("bgr-result");
  var preview = document.getElementById("bgr-preview"), metaEl = document.getElementById("bgr-meta");
  var file = null, img = null, outBlob = null, session = null, busy = false;

  function status(t) { statusEl.textContent = t || ""; }
  function fail(msg) { tpShowError("bgr-err", msg); status(""); busy = false; goBtn.disabled = !img; }

  tpDropzone("bgr-drop", "bgr-file", {
    accept: "image/*",
    onFiles: function (files) {
      if (!files.length) return;
      file = files[0];
      tpHideError("bgr-err");
      tpFileList("bgr-list", [file]);
      var url = URL.createObjectURL(file);
      var im = new Image();
      im.onload = function () {
        img = im;
        goBtn.disabled = false;
        status("Ready — " + im.naturalWidth + " × " + im.naturalHeight + ". Press Remove background.");
      };
      im.onerror = function () { fail("That file could not be read as an image."); };
      im.src = url;
    }
  });

  async function ensureSession() {
    if (session) return session;
    if (typeof ort === "undefined") throw new Error("The AI runtime failed to load — check your connection and reload the page.");
    status("Downloading the AI model (about 7 MB — one time only, then it is cached)…");
    session = await ort.InferenceSession.create("/assets/models/modnet-quantized.onnx", { executionProviders: ["wasm"] });
    return session;
  }

  async function run() {
    if (busy || !img) return;
    busy = true; goBtn.disabled = true; tpHideError("bgr-err");
    try {
      var sess = await ensureSession();
      status("Removing the background — this runs on your device and can take a few seconds…");
      await new Promise(function (r) { setTimeout(r, 30); }); // let the status paint
      var S = 512;
      var c = document.createElement("canvas"); c.width = S; c.height = S;
      var cx = c.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0, S, S);
      var px = cx.getImageData(0, 0, S, S).data;
      var mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225];
      var data = new Float32Array(3 * S * S);
      for (var i = 0; i < S * S; i++)
        for (var ch = 0; ch < 3; ch++)
          data[ch * S * S + i] = (px[i * 4 + ch] / 255 - mean[ch]) / std[ch];
      var inputName = sess.inputNames[0];
      var feeds = {}; feeds[inputName] = new ort.Tensor("float32", data, [1, 3, S, S]);
      var out = await sess.run(feeds);
      var mask = out[sess.outputNames[0]].data;
      // mask -> alpha image at 512, then scaled to output size
      var mc = document.createElement("canvas"); mc.width = S; mc.height = S;
      var mx = mc.getContext("2d");
      var mid = mx.createImageData(S, S);
      for (var j = 0; j < S * S; j++) {
        var a = Math.max(0, Math.min(255, Math.round(mask[j] * 255)));
        mid.data[j * 4] = 255; mid.data[j * 4 + 1] = 255; mid.data[j * 4 + 2] = 255; mid.data[j * 4 + 3] = a;
      }
      mx.putImageData(mid, 0, 0);
      // output canvas: original photo (long edge capped at 4096), alpha from mask
      var ow = img.naturalWidth, oh = img.naturalHeight;
      var cap = 4096 / Math.max(ow, oh);
      if (cap < 1) { ow = Math.round(ow * cap); oh = Math.round(oh * cap); }
      var oc = document.createElement("canvas"); oc.width = ow; oc.height = oh;
      var ox = oc.getContext("2d", { willReadFrequently: true });
      ox.drawImage(img, 0, 0, ow, oh);
      var sc = document.createElement("canvas"); sc.width = ow; sc.height = oh;
      var sx = sc.getContext("2d", { willReadFrequently: true });
      sx.imageSmoothingEnabled = true;
      sx.drawImage(mc, 0, 0, ow, oh);
      var base = ox.getImageData(0, 0, ow, oh), alpha = sx.getImageData(0, 0, ow, oh).data;
      for (var k = 0; k < ow * oh; k++) base.data[k * 4 + 3] = alpha[k * 4 + 3];
      ox.putImageData(base, 0, 0);
      outBlob = await new Promise(function (res) { oc.toBlob(res, "image/png"); });
      if (!outBlob) throw new Error("The result could not be created — try a smaller photo.");
      preview.src = URL.createObjectURL(outBlob);
      metaEl.textContent = ow + " × " + oh + " PNG with transparency · " + tpFormatBytes(outBlob.size);
      resultEl.classList.add("show");
      status("Done — the background is transparent. Download the PNG below.");
    } catch (e) {
      fail("Background removal failed: " + (e && e.message ? e.message : e));
    }
    busy = false; goBtn.disabled = !img;
  }

  goBtn.addEventListener("click", run);
  dlBtn.addEventListener("click", function () {
    if (outBlob) tpDownload(outBlob, tpStripExt(file ? file.name : "photo") + "-no-background.png");
  });
})();
