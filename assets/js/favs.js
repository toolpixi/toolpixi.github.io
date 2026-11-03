/* ToolPixi — Favourites + Recently Used.
   localStorage only (keys tp_favs / tp_recent). No account, no server, no network.
   Star controls carry [data-fav="slug"]; tool pages carry <body data-tp-slug="slug">;
   the homepage provides #favourites / #recent sections and window.TP_CATALOG. */
(function () {
  "use strict";
  var FKEY = "tp_favs", RKEY = "tp_recent", RMAX = 8;

  function load(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || "[]");
      return Object.prototype.toString.call(v) === "[object Array]" ? v : [];
    } catch (e) { return []; }
  }
  function save(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
  }
  function toggleFav(slug) {
    var favs = load(FKEY), i = favs.indexOf(slug);
    if (i >= 0) favs.splice(i, 1); else favs.push(slug);
    save(FKEY, favs);
    refresh();
  }
  function recordRecent(slug) {
    var r = load(RKEY).filter(function (s) { return s !== slug; });
    r.unshift(slug);
    save(RKEY, r.slice(0, RMAX));
  }

  function paint() {
    var favs = load(FKEY);
    var els = document.querySelectorAll("[data-fav]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], on = favs.indexOf(el.getAttribute("data-fav")) >= 0;
      el.setAttribute("aria-pressed", on ? "true" : "false");
      el.classList.toggle("on", on);
      var g = el.querySelector(".fs-glyph");
      if (g) g.textContent = on ? "★" : "☆";
      var t = el.querySelector(".fs-text");
      if (t) t.textContent = on ? "Saved to favourites" : "Save to favourites";
    }
  }

  function cardHtml(slug) {
    var c = window.TP_CATALOG && window.TP_CATALOG[slug];
    if (!c) return "";
    return '<a class="card" href="/' + slug + '/"><span class="ic" style="background:' + c.bg + '">' + c.ic + "</span>" +
      "<span><h3>" + c.n + "</h3><p>" + c.d + "</p></span>" +
      '<span class="fav-star" data-fav="' + slug + '" role="button" tabindex="0" aria-pressed="false" ' +
      'aria-label="Save ' + c.n + ' to favourites"><span class="fs-glyph" aria-hidden="true">☆</span></span></a>';
  }

  function filtering() {
    var q = document.getElementById("tool-search");
    if (q && q.value.replace(/\s+/g, "") !== "") return true;
    var on = document.querySelector(".pill.on");
    return !!(on && on.getAttribute("data-cat") !== "all");
  }

  function renderPersonal() {
    var cat = window.TP_CATALOG;
    if (!cat) return;
    var lists = [["favs", load(FKEY)], ["recent", load(RKEY)]];
    for (var i = 0; i < lists.length; i++) {
      var grid = document.querySelector('[data-personal-grid="' + lists[i][0] + '"]');
      if (!grid) continue;
      var slugs = lists[i][1].filter(function (s) { return !!cat[s]; });
      grid.innerHTML = slugs.map(cardHtml).join("");
      var sec = grid.parentNode;
      while (sec && !(sec.classList && sec.classList.contains("personal-sec"))) sec = sec.parentNode;
      if (sec) sec.hidden = slugs.length === 0 || filtering();
    }
    paint();
  }

  function refresh() { paint(); renderPersonal(); }

  /* One delegated handler covers homepage card stars, the stars inside the
     personal sections, and the tool-page toggle button. The star lives inside
     a card <a>, so its click must never reach the link. */
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-fav]") : null;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFav(el.getAttribute("data-fav"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target && e.target.closest ? e.target.closest("[data-fav]") : null;
    if (!el || el.tagName === "BUTTON") return; /* buttons fire click natively */
    e.preventDefault();
    toggleFav(el.getAttribute("data-fav"));
  });

  var slug = document.body ? document.body.getAttribute("data-tp-slug") : null;
  if (slug) recordRecent(slug);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();

  var search = document.getElementById("tool-search");
  if (search) search.addEventListener("input", renderPersonal);
  var pills = document.querySelectorAll(".pill");
  for (var p = 0; p < pills.length; p++) {
    pills[p].addEventListener("click", function () { setTimeout(renderPersonal, 0); });
  }
})();
