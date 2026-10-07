/* ToolPixi — YouTube thumbnail downloader (pure client-side via i.ytimg.com) */
// ==== PURE ====
function tpYouTubeId(input) {
  var s = (input || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  var pats = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /\/live\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/v\/([A-Za-z0-9_-]{11})/
  ];
  for (var i = 0; i < pats.length; i++) {
    var m = s.match(pats[i]);
    if (m) return m[1];
  }
  return null;
}
var TP_THUMB_SIZES = [
  { key: "maxresdefault", label: "Maximum resolution", dims: "1280 × 720" },
  { key: "sddefault", label: "Standard", dims: "640 × 480" },
  { key: "hqdefault", label: "High quality", dims: "480 × 360" },
  { key: "mqdefault", label: "Medium", dims: "320 × 180" },
  { key: "default", label: "Small", dims: "120 × 90" }
];
function tpThumbUrl(id, key) { return "https://i.ytimg.com/vi/" + id + "/" + key + ".jpg"; }

// ==== DOM ====
(function () {
  var panel = document.getElementById("yt-thumb");
  if (!panel) return;
  var currentId = null;
  function run() {
    tpHideError("yt-err");
    var id = tpYouTubeId(document.getElementById("yt-input").value);
    if (!id) { tpShowError("yt-err", "That does not look like a YouTube link. Paste a full video URL (or an 11-character video ID) and try again."); return; }
    currentId = id;
    var holder = document.getElementById("yt-list");
    holder.innerHTML = TP_THUMB_SIZES.map(function (sz) {
      var url = tpThumbUrl(id, sz.key);
      return '<div class="fi"><span class="nm">' + sz.label + ' <span class="sz">' + sz.dims + '</span></span>' +
        '<span><a class="btn ghost small" href="' + url + '" target="_blank" rel="noopener">Open</a> ' +
        '<button class="btn small" data-dl="' + url + '" data-key="' + sz.key + '">Download</button></span></div>';
    }).join("");
    var prev = document.getElementById("yt-preview");
    prev.src = tpThumbUrl(id, "hqdefault");
    prev.alt = "Thumbnail preview";
    document.getElementById("yt-video-id").textContent = "Video ID: " + id;
    document.getElementById("yt-result").classList.add("show");
    holder.querySelectorAll("[data-dl]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var url = btn.getAttribute("data-dl"), key = btn.getAttribute("data-key");
        try {
          var resp = await fetch(url);
          if (!resp.ok) throw new Error("bad");
          var blob = await resp.blob();
          tpDownload(blob, "youtube-thumbnail-" + key + ".jpg");
        } catch (e) {
          window.open(url, "_blank", "noopener");
        }
      });
    });
  }
  document.getElementById("yt-go").addEventListener("click", run);
  document.getElementById("yt-input").addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
})();
