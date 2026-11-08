/* ToolPixi — Color Picker from Image: click any pixel, get HEX/RGB/HSL.
   The image is drawn to a local canvas only; it is never uploaded. */
(function () {
  var panel = document.getElementById("color-picker-from-image");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  var canvas = el("cp-canvas"), ctx = canvas.getContext("2d"),
      note = el("cp-note"), result = el("cp-result");
  var img = null;

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      return ("0" + v.toString(16)).slice(-2);
    }).join("").toUpperCase();
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0,
        l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }
  function show(r, g, b, where) {
    var hex = rgbToHex(r, g, b), hsl = rgbToHsl(r, g, b);
    el("cp-swatch").style.background = hex;
    el("cp-hex").value = hex;
    el("cp-rgb").value = "rgb(" + r + ", " + g + ", " + b + ")";
    el("cp-hsl").value = "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)";
    el("cp-where").textContent = where;
    result.classList.add("show");
  }
  function setFile(file) {
    tpHideError("cp-err");
    if (!file || !/^image\//.test(file.type)) {
      tpShowError("cp-err", "That file is not an image. Choose a JPG, PNG, WebP or other image file.");
      return;
    }
    var url = URL.createObjectURL(file);
    var im = new Image();
    im.onload = function () {
      img = im;
      canvas.width = im.naturalWidth;
      canvas.height = im.naturalHeight;
      ctx.drawImage(im, 0, 0);
      canvas.style.display = "block";
      tpFileList("cp-list", [file], function () {
        return "· " + im.naturalWidth + "×" + im.naturalHeight + " px";
      });
      note.textContent = "Now click (or tap) any point on the image to read that pixel's colour.";
      URL.revokeObjectURL(url);
    };
    im.onerror = function () {
      tpShowError("cp-err", "That image could not be opened by your browser. Try a JPG or PNG copy.");
      URL.revokeObjectURL(url);
    };
    im.src = url;
  }
  tpDropzone("cp-drop", "cp-file", { accept: "image/*",
    onFiles: function (files) { if (files.length) setFile(files[0]); } });

  canvas.addEventListener("click", function (e) {
    if (!img) return;
    var r = canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - r.left) * canvas.width / r.width);
    var y = Math.floor((e.clientY - r.top) * canvas.height / r.height);
    x = Math.min(Math.max(x, 0), canvas.width - 1);
    y = Math.min(Math.max(y, 0), canvas.height - 1);
    var d = ctx.getImageData(x, y, 1, 1).data;
    show(d[0], d[1], d[2], "Pixel at " + x + ", " + y + " of your image");
  });

  panel.querySelectorAll("[data-cp-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = el(btn.getAttribute("data-cp-copy"));
      if (f && f.value) tpCopyWithFeedback(btn, f.value);
    });
  });

  var eyeBtn = el("cp-eyedrop");
  if (eyeBtn) {
    if (!window.EyeDropper) eyeBtn.style.display = "none";
    eyeBtn.addEventListener("click", function () {
      new window.EyeDropper().open().then(function (res) {
        var hex = res.sRGBHex.replace("#", "");
        var r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        show(r, g, b, "Picked from your screen with the eyedropper");
      }).catch(function () { /* user cancelled */ });
    });
  }
})();
