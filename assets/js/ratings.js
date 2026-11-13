/* ToolPixi — anonymous tool ratings, backed by the ToolPixi API.
   Only the tool's slug and the star count are sent. No account, no cookie,
   no personal data. A browser-local note remembers that you voted so the
   widget can say thanks instead of asking again. */
(function () {
  var host = document.querySelector(".tp-rating");
  if (!host) return;
  var API = "https://api.mythpost.com";
  var slug = host.getAttribute("data-tool");
  if (!slug) return;
  var starsEl = host.querySelector(".tp-stars");
  var metaEl = host.querySelector(".tp-rating-meta");
  var votedKey = "tp_rated_" + slug;
  var myVote = 0;
  try { myVote = parseInt(localStorage.getItem(votedKey) || "0", 10) || 0; } catch (e) { /* private mode */ }

  function paint(hover) {
    var lit = hover || myVote;
    starsEl.querySelectorAll("button").forEach(function (b, i) {
      b.classList.toggle("on", i < lit);
      b.setAttribute("aria-checked", myVote === i + 1 ? "true" : "false");
    });
  }
  function showMeta(count, average) {
    if (count > 0 && average) {
      metaEl.textContent = "Rated " + average.toFixed(1) + " / 5 by " + count + (count === 1 ? " person" : " people");
    } else {
      metaEl.textContent = myVote ? "Thanks for rating!" : "No ratings yet — be the first.";
    }
    if (myVote && count > 0) metaEl.textContent += " · You rated it " + myVote + "★";
  }
  for (var i = 1; i <= 5; i++) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = "★";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", "Rate " + i + " out of 5 stars");
    b.setAttribute("data-stars", String(i));
    starsEl.appendChild(b);
  }
  paint(0);
  starsEl.querySelectorAll("button").forEach(function (btn) {
    var n = parseInt(btn.getAttribute("data-stars"), 10);
    btn.addEventListener("mouseenter", function () { paint(n); });
    btn.addEventListener("mouseleave", function () { paint(0); });
    btn.addEventListener("click", async function () {
      try {
        var resp = await fetch(API + "/api/rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: slug, stars: n })
        });
        var data = await resp.json();
        if (data && data.count) {
          myVote = n;
          try { localStorage.setItem(votedKey, String(n)); } catch (e) { /* ignore */ }
          paint(0);
          showMeta(data.count, data.average);
        }
      } catch (e) { /* ratings are a bonus — fail silently */ }
    });
  });
  fetch(API + "/api/ratings?tool=" + encodeURIComponent(slug))
    .then(function (r) { return r.json(); })
    .then(function (data) { showMeta(data.count || 0, data.average); paint(0); })
    .catch(function () { showMeta(0, null); });
})();
