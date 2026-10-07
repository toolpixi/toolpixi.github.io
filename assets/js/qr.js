/* ToolPixi — QR code generator (qrcode-generator via CDN) */
(function () {
  var panel = document.getElementById("qr-gen");
  if (!panel) return;
  var lastCanvas = null;
  function draw() {
    tpHideError("qr-err");
    if (typeof qrcode === "undefined") {
      tpShowError("qr-err", "The QR engine could not be loaded. Check your internet connection and refresh the page.");
      return;
    }
    var text = document.getElementById("qr-text").value.trim();
    if (!text) { tpShowError("qr-err", "Type or paste the text or link for your QR code first."); return; }
    var size = parseInt(document.getElementById("qr-size").value, 10) || 512;
    var fg = document.getElementById("qr-fg").value || "#111111";
    var bg = document.getElementById("qr-bg").value || "#ffffff";
    try {
      var qr = qrcode(0, "M"); // type 0 = auto-fit
      qr.addData(text);
      qr.make();
      var count = qr.getModuleCount();
      var quiet = 4, cells = count + quiet * 2;
      var cell = Math.floor(size / cells);
      var px = cell * cells;
      var canvas = document.createElement("canvas");
      canvas.width = px; canvas.height = px;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, px, px);
      ctx.fillStyle = fg;
      for (var r = 0; r < count; r++) {
        for (var c = 0; c < count; c++) {
          if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
        }
      }
      lastCanvas = canvas;
      var holder = document.getElementById("qr-holder");
      holder.innerHTML = "";
      canvas.style.maxWidth = "280px"; canvas.style.width = "100%"; canvas.style.height = "auto";
      canvas.style.border = "1px solid var(--line)"; canvas.style.borderRadius = "10px";
      holder.appendChild(canvas);
      document.getElementById("qr-result").classList.add("show");
      document.getElementById("qr-dims").textContent = "Download size: " + px + " × " + px + " px PNG";
    } catch (e) {
      tpShowError("qr-err", "That text is too long for a single QR code. Shorten it and try again.");
    }
  }
  document.getElementById("qr-go").addEventListener("click", draw);
  document.getElementById("qr-text").addEventListener("keydown", function (e) { if (e.key === "Enter") draw(); });
  document.getElementById("qr-download").addEventListener("click", function () {
    if (lastCanvas) lastCanvas.toBlob(function (b) { if (b) tpDownload(b, "qr-code.png"); }, "image/png");
  });
})();
