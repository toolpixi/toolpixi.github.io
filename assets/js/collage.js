/* ToolPixi — Photo Collage Maker.
   Canvas 2D: pick a grid, drop in photos, each is cover-cropped into
   its cell, and the finished collage exports as PNG or JPG. Photos
   never leave the device. */
(function () {
  var panel = document.getElementById("photo-collage-maker");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var W = 1200, H = 900;
  var canvas = el("pc-canvas"), ctx = canvas.getContext("2d");
  var photos = [];        // HTMLImageElements, in order
  var layout = "grid4";   // layout key

  // Each layout returns a list of cells [x, y, w, h] in unit space.
  var LAYOUTS = {
    side2: function () { return [[0, 0, .5, 1], [.5, 0, .5, 1]]; },
    trio: function () { return [[0, 0, .5, 1], [.5, 0, .5, .5], [.5, .5, .5, .5]]; },
    grid4: function () { return [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]]; },
    stripv: function () { return [[0, 0, 1, .34], [0, .34, 1, .33], [0, .67, 1, .33]]; },
    striph: function () { return [[0, 0, .34, 1], [.34, 0, .33, 1], [.67, 0, .33, 1]]; },
    hero: function () { return [[0, 0, .66, 1], [.66, 0, .34, .5], [.66, .5, .34, .5]]; }
  };

  function draw() {
    var gap = parseInt(el("pc-gap").value, 10) || 0;
    ctx.fillStyle = el("pc-bg").value || "#ffffff";
    ctx.fillRect(0, 0, W, H);
    var cells = LAYOUTS[layout]();
    cells.forEach(function (cell, i) {
      var x = cell[0] * W + gap / 2, y = cell[1] * H + gap / 2;
      var w = cell[2] * W - gap, h = cell[3] * H - gap;
      var img = photos[i];
      if (img) {
        var s = Math.max(w / img.width, h / img.height);
        var dw = img.width * s, dh = img.height * s;
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = "rgba(120,130,150,0.16)";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(90,100,120,0.75)";
        ctx.font = "600 30px Arial, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("Photo " + (i + 1), x + w / 2, y + h / 2);
      }
    });
    el("pc-count").textContent = photos.length
      ? photos.length + " photo" + (photos.length === 1 ? "" : "s") + " placed — extra photos beyond the grid are kept for when you switch layouts."
      : "No photos yet — add some above and they will fill the grid in order.";
  }

  tpDropzone("pc-drop", "pc-file", { accept: "image/*", multiple: true, onFiles: function (files) {
    var pending = files.length;
    files.forEach(function (f) {
      var url = URL.createObjectURL(f);
      var img = new Image();
      img.onload = function () { photos.push(img); if (--pending === 0) draw(); };
      img.onerror = function () {
        tpShowError("pc-err", "One file could not be read as an image and was skipped.");
        if (--pending === 0) draw();
      };
      img.src = url;
    });
  }});

  panel.querySelectorAll("[data-layout]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-layout]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      layout = chip.getAttribute("data-layout");
      draw();
    });
  });
  el("pc-gap").addEventListener("input", function () {
    el("pc-gap-val").textContent = el("pc-gap").value + " px";
    draw();
  });
  el("pc-bg").addEventListener("input", draw);
  el("pc-clear").addEventListener("click", function () { photos = []; draw(); });

  el("pc-png").addEventListener("click", function () {
    canvas.toBlob(function (b) { tpDownload(b, "collage.png"); }, "image/png");
  });
  el("pc-jpg").addEventListener("click", function () {
    canvas.toBlob(function (b) { tpDownload(b, "collage.jpg"); }, "image/jpeg", 0.92);
  });

  draw();
})();
