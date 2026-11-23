/* ToolPixi — GIF Maker (images -> animated GIF).
   gif.js with a self-hosted worker script: frames are drawn onto a
   canvas at one shared size and encoded entirely in the browser. */
(function () {
  var panel = document.getElementById("gif-maker");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var images = [];   // [{img: HTMLImageElement, name: string}]

  function renderThumbs() {
    el("gm-frames").innerHTML = images.map(function (it, i) {
      return '<div class="gm-thumb"><img src="' + it.img.src + '" alt="">' +
        '<button type="button" data-rm="' + i + '" aria-label="Remove frame">×</button>' +
        '<span>' + (i + 1) + "</span></div>";
    }).join("");
    el("gm-count").textContent = images.length
      ? images.length + " frame" + (images.length === 1 ? "" : "s") + " — the GIF plays them in this order."
      : "No frames yet — add at least 2 images.";
    el("gm-go").disabled = images.length < 2;
    el("gm-frames").querySelectorAll("[data-rm]").forEach(function (b) {
      b.addEventListener("click", function () {
        images.splice(parseInt(b.getAttribute("data-rm"), 10), 1);
        renderThumbs();
      });
    });
  }

  tpDropzone("gm-drop", "gm-file", { accept: "image/*", multiple: true, onFiles: function (files) {
    var pending = files.length;
    files.forEach(function (f) {
      var url = URL.createObjectURL(f);
      var img = new Image();
      img.onload = function () {
        images.push({ img: img, name: f.name });
        if (--pending === 0) renderThumbs();
      };
      img.onerror = function () {
        tpShowError("gm-err", "One file could not be read as an image and was skipped.");
        if (--pending === 0) renderThumbs();
      };
      img.src = url;
    });
  }});

  el("gm-delay").addEventListener("input", function () {
    el("gm-delay-val").textContent = el("gm-delay").value + " ms per frame";
  });

  el("gm-go").addEventListener("click", function () {
    if (images.length < 2 || typeof GIF === "undefined") return;
    tpHideError("gm-err");
    var btn = el("gm-go");
    btn.disabled = true; btn.textContent = "Building your GIF…";
    el("gm-result").style.display = "none";

    var width = parseInt(el("gm-width").value, 10) || 480;
    var first = images[0].img;
    var height = Math.max(2, Math.round(width * first.height / first.width));
    var delay = parseInt(el("gm-delay").value, 10) || 400;

    var gif = new GIF({
      workers: 2,
      quality: 10,
      width: width,
      height: height,
      workerScript: "/assets/vendor/gif.worker.js",
      repeat: 0
    });
    var c = document.createElement("canvas");
    c.width = width; c.height = height;
    var ctx = c.getContext("2d");
    images.forEach(function (it) {
      var img = it.img;
      var s = Math.max(width / img.width, height / img.height);
      var dw = img.width * s, dh = img.height * s;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
      gif.addFrame(ctx, { copy: true, delay: delay });
    });
    gif.on("progress", function (p) {
      btn.textContent = "Building your GIF… " + Math.round(p * 100) + "%";
    });
    gif.on("finished", function (blob) {
      btn.disabled = false; btn.textContent = "Create GIF";
      el("gm-done").textContent = "Done — " + images.length + " frames, " + width + "×" + height +
        ", " + tpFormatBytes(blob.size) + ".";
      var prev = el("gm-preview");
      prev.src = URL.createObjectURL(blob);
      el("gm-result").style.display = "block";
      el("gm-download").onclick = function () { tpDownload(blob, "animation.gif"); };
      tpDownload(blob, "animation.gif");
    });
    gif.render();
  });

  renderThumbs();
})();
