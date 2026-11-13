/* ToolPixi — social media downloaders (server-assisted via the ToolPixi API).
   Unlike our other tools, these cannot run 100% in the browser: the pasted
   link is sent to our resolver, which reads the PUBLIC post and returns the
   media links the platform itself serves. Nothing is stored. */
(function () {
  var panel = document.getElementById("dl-panel");
  if (!panel) return;
  var API = "https://api.mythpost.com";
  var platform = panel.getAttribute("data-platform") || "";
  var kind = panel.getAttribute("data-kind") || "";
  var input = document.getElementById("dl-input");
  var go = document.getElementById("dl-go");
  var result = document.getElementById("dl-result");
  var list = document.getElementById("dl-list");
  var prev = document.getElementById("dl-preview");
  var titleEl = document.getElementById("dl-title");
  var busy = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  async function run() {
    if (busy) return;
    tpHideError("dl-err");
    result.classList.remove("show");
    var url = (input.value || "").trim();
    if (!/^https:\/\//i.test(url)) {
      tpShowError("dl-err", "Paste the full link to the public post first — it starts with https://");
      return;
    }
    busy = true;
    var label = go.textContent;
    go.textContent = "Fetching download links…";
    go.disabled = true;
    try {
      var resp = await fetch(API + "/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform, kind: kind, url: url })
      });
      var data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Something went wrong.");
      list.innerHTML = data.options.map(function (o) {
        // Proxied links (our /api/dl) download in place. Direct platform
        // links (TikTok) open in a new tab — the platform serves the file
        // to the visitor's own browser; if it plays there instead of
        // saving, right-click → "Save video as" gets the file.
        var direct = o.url.indexOf("/api/dl?") === -1;
        return '<div class="fi"><span class="nm">' + esc(o.quality || (o.type === "video" ? "Video" : "Photo")) +
          ' <span class="sz">' + esc((o.type || "").toUpperCase()) + '</span></span>' +
          '<span><a class="btn small" href="' + esc(o.url) + '"' + (direct ? ' target="_blank" rel="noopener"' : ' download') + '>Download</a></span></div>';
      }).join("");
      prev.onerror = function () { prev.style.display = "none"; };
      if (data.thumbnail) { prev.src = data.thumbnail; prev.style.display = ""; }
      else { prev.removeAttribute("src"); prev.style.display = "none"; }
      titleEl.textContent = data.title ? data.title : "";
      titleEl.style.display = data.title ? "" : "none";
      result.classList.add("show");
    } catch (e) {
      tpShowError("dl-err", e.message || "Could not fetch that post. Check the link is public and try again.");
    } finally {
      busy = false;
      go.textContent = label;
      go.disabled = false;
    }
  }
  go.addEventListener("click", run);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
})();
