/* ToolPixi — Meme Generator.
   Canvas 2D: built-in scenes are drawn in code (gradients and shapes —
   no copied template images), or use your own photo. Classic meme text
   with an outline, exported as PNG. All on-device. */
(function () {
  var panel = document.getElementById("meme-generator");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var W = 800, H = 800;
  var canvas = el("mm-canvas"), ctx = canvas.getContext("2d");
  var userImg = null;         // uploaded photo (HTMLImageElement) or null
  var scene = "sunset";       // built-in scene key when no photo is loaded

  function cover(img, w, h) {
    var s = Math.max(w / img.width, h / img.height);
    var dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  var SCENES = {
    sunset: function () {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#2b1055"); g.addColorStop(0.55, "#7597de"); g.addColorStop(0.78, "#ff9a5a"); g.addColorStop(1, "#ff6b35");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath(); ctx.arc(W / 2, H * 0.68, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1d1a2e";
      ctx.beginPath(); ctx.moveTo(0, H * 0.86);
      ctx.quadraticCurveTo(W * 0.3, H * 0.74, W * 0.55, H * 0.86);
      ctx.quadraticCurveTo(W * 0.8, H * 0.96, W, H * 0.88);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    },
    stage: function () {
      ctx.fillStyle = "#101018"; ctx.fillRect(0, 0, W, H);
      var g = ctx.createRadialGradient(W / 2, H * 0.1, 20, W / 2, H * 0.55, H * 0.75);
      g.addColorStop(0, "rgba(255,240,190,0.95)"); g.addColorStop(1, "rgba(255,240,190,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(W / 2 - 30, 0); ctx.lineTo(W / 2 + 30, 0);
      ctx.lineTo(W * 0.82, H); ctx.lineTo(W * 0.18, H); ctx.fill();
      ctx.fillStyle = "#1c1c28"; ctx.fillRect(0, H * 0.88, W, H * 0.12);
    },
    ocean: function () {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#8ed6ff"); g.addColorStop(0.45, "#3d9be9"); g.addColorStop(1, "#0b4f8a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 5;
      for (var r = 0; r < 4; r++) {
        ctx.beginPath();
        for (var x = 0; x <= W; x += 8) {
          var y = H * (0.55 + r * 0.11) + Math.sin(x / 60 + r) * 10;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
    chalk: function () {
      ctx.fillStyle = "#22392e"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 2;
      for (var i = 0; i < 26; i++) {
        ctx.beginPath();
        var y = Math.random() * H;
        ctx.moveTo(Math.random() * W * 0.4, y); ctx.lineTo(W * 0.6 + Math.random() * W * 0.4, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#c9a86a"; ctx.lineWidth = 18; ctx.strokeRect(9, 9, W - 18, H - 18);
    },
    plain: function () {
      ctx.fillStyle = "#f5f2ea"; ctx.fillRect(0, 0, W, H);
    }
  };

  function drawText(text, isTop) {
    if (!text) return;
    var size = parseInt(el("mm-size").value, 10) || 56;
    ctx.font = "900 " + size + "px 'Arial Black', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = isTop ? "top" : "bottom";
    var color = el("mm-color").value || "#ffffff";
    var maxW = W - 40;
    // Word-wrap to at most 3 lines.
    var words = text.toUpperCase().split(/\s+/), lines = [], line = "";
    words.forEach(function (w) {
      var t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    lines = lines.slice(0, 3);
    var lh = size * 1.12;
    lines.forEach(function (ln, i) {
      var y = isTop ? 18 + i * lh : H - 18 - (lines.length - 1 - i) * lh;
      ctx.lineWidth = Math.max(4, size / 7);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.lineJoin = "round";
      ctx.strokeText(ln, W / 2, y);
      ctx.fillStyle = color;
      ctx.fillText(ln, W / 2, y);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (userImg) cover(userImg, W, H);
    else (SCENES[scene] || SCENES.sunset)();
    drawText(el("mm-top").value.trim(), true);
    drawText(el("mm-bottom").value.trim(), false);
  }

  panel.querySelectorAll("[data-scene]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-scene]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      scene = chip.getAttribute("data-scene");
      userImg = null;
      el("mm-note").textContent = "Built-in scene — or drop your own photo below.";
      draw();
    });
  });

  tpDropzone("mm-drop", "mm-file", { accept: "image/*", onFiles: function (files) {
    if (!files.length) return;
    var url = URL.createObjectURL(files[0]);
    var img = new Image();
    img.onload = function () {
      userImg = img;
      panel.querySelectorAll("[data-scene]").forEach(function (c) { c.classList.remove("on"); });
      el("mm-note").textContent = "Your photo: " + files[0].name + " — cropped to fill the square.";
      tpHideError("mm-err");
      draw();
    };
    img.onerror = function () { tpShowError("mm-err", "That file could not be read as an image."); };
    img.src = url;
  }});

  ["mm-top", "mm-bottom", "mm-size", "mm-color"].forEach(function (id) {
    el(id).addEventListener("input", draw);
  });
  el("mm-download").addEventListener("click", function () {
    if (canvas.toBlob) {
      canvas.toBlob(function (b) { tpDownload(b, "meme.png"); }, "image/png");
    } else {
      var a = document.createElement("a");
      a.href = canvas.toDataURL("image/png"); a.download = "meme.png"; a.click();
    }
  });

  draw();
})();
