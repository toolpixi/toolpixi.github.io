/* ToolPixi — HEIC converter (heic2any via CDN, graceful failure).
   One binding serves every HEIC page: the panel carries data-heic plus
   data-to (mime), data-ext and data-label. Without them it behaves exactly
   as the original HEIC-to-JPG page (jpeg / .jpg / "Convert to JPG"). */
(function () {
  var panel = document.querySelector("[data-heic]") || document.getElementById("heic-to-jpg");
  if (!panel) return;
  var toType = panel.getAttribute("data-to") || "image/jpeg";
  var toExt = panel.getAttribute("data-ext") || "jpg";
  var label = panel.getAttribute("data-label") || "JPG";
  tpDropzone("hc-drop", "hc-file", {
    accept: ".heic,.heif,image/heic,image/heif", multiple: true,
    onFiles: async function (files) {
      tpHideError("hc-err");
      if (typeof heic2any === "undefined") {
        tpShowError("hc-err", "The HEIC converter could not be loaded. Check your internet connection and refresh the page, then try again.");
        return;
      }
      tpFileList("hc-list", files);
      var btn = document.getElementById("hc-go");
      btn.disabled = false;
      btn.onclick = async function () {
        btn.disabled = true; btn.textContent = "Converting…";
        var done = 0, failed = 0;
        for (var i = 0; i < files.length; i++) {
          try {
            var opts = { blob: files[i], toType: toType };
            if (toType === "image/jpeg") opts.quality = 0.92;
            var out = await heic2any(opts);
            var blob = Array.isArray(out) ? out[0] : out;
            tpDownload(blob, tpStripExt(files[i].name) + "." + toExt);
            done++;
          } catch (e) { failed++; }
          await new Promise(function (r) { setTimeout(r, 250); });
        }
        btn.disabled = false; btn.textContent = "Convert to " + label;
        var res = document.getElementById("hc-result");
        res.classList.add("show");
        res.querySelector(".note").textContent = failed === 0
          ? done + " photo(s) converted to " + label + " and downloaded."
          : done + " converted, " + failed + " could not be read. Some Android or edited HEIC files use variants browsers cannot decode yet.";
      };
    }
  });
})();
