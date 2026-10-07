/* ToolPixi — HEIC to JPG (heic2any via CDN, graceful failure) */
(function () {
  var panel = document.getElementById("heic-to-jpg");
  if (!panel) return;
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
            var out = await heic2any({ blob: files[i], toType: "image/jpeg", quality: 0.92 });
            var blob = Array.isArray(out) ? out[0] : out;
            tpDownload(blob, tpStripExt(files[i].name) + ".jpg");
            done++;
          } catch (e) { failed++; }
          await new Promise(function (r) { setTimeout(r, 250); });
        }
        btn.disabled = false; btn.textContent = "Convert to JPG";
        var res = document.getElementById("hc-result");
        res.classList.add("show");
        res.querySelector(".note").textContent = failed === 0
          ? done + " photo(s) converted to JPG and downloaded."
          : done + " converted, " + failed + " could not be read. Some Android or edited HEIC files use variants browsers cannot decode yet.";
      };
    }
  });
})();
