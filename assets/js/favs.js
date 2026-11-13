/* ToolPixi — My ToolPixi Toolbox (Favourites + Recently Used).
   localStorage only (keys tp_favs / tp_recent). No account, no server, no network.
   Star controls carry [data-fav="slug"]; tool pages carry <body data-tp-slug="slug">;
   the homepage provides #favourites / #recent / #shared-toolbox sections and
   window.TP_CATALOG. A shared Toolbox arrives as /?toolbox=slug1,slug2 and is
   rendered read-only from the URL — nothing is stored unless the visitor
   stars a tool into their own Toolbox. */
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
      if (t) t.textContent = on ? "Saved in my Toolbox" : "Save to my Toolbox";
    }
  }

  function cardHtml(slug) {
    var c = window.TP_CATALOG && window.TP_CATALOG[slug];
    if (!c) return "";
    return '<a class="card" href="/' + slug + '/"><span class="ic" style="background:' + c.bg + '">' + c.ic + "</span>" +
      "<span><h3>" + c.n + "</h3><p>" + c.d + "</p></span>" +
      '<span class="fav-star" data-fav="' + slug + '" role="button" tabindex="0" aria-pressed="false" ' +
      'aria-label="Save ' + c.n + ' to my Toolbox"><span class="fs-glyph" aria-hidden="true">☆</span></span></a>';
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
    renderShared();
  }

  /* A shared Toolbox: /?toolbox=slug1,slug2 — rendered from the URL alone.
     Nothing is written to localStorage; starring a card saves it into the
     visitor's own Toolbox through the normal toggle. */
  function sharedSlugs() {
    var cat = window.TP_CATALOG;
    if (!cat) return [];
    var raw = null;
    try { raw = new URLSearchParams(location.search).get("toolbox"); } catch (e) {}
    if (!raw) return [];
    var seen = {}, out = [];
    var parts = raw.split(",");
    for (var i = 0; i < parts.length && out.length < 30; i++) {
      var s = parts[i].replace(/\s+/g, "");
      if (s && cat[s] && !seen[s]) { seen[s] = 1; out.push(s); }
    }
    return out;
  }

  function renderShared() {
    var grid = document.querySelector('[data-personal-grid="shared"]');
    if (!grid) return;
    var slugs = sharedSlugs();
    grid.innerHTML = slugs.map(cardHtml).join("");
    var sec = grid.parentNode;
    while (sec && !(sec.classList && sec.classList.contains("personal-sec"))) sec = sec.parentNode;
    if (sec) sec.hidden = slugs.length === 0 || filtering();
    paint();
  }

  function shareToolbox() {
    var favs = load(FKEY).filter(function (s) { return !!(window.TP_CATALOG && window.TP_CATALOG[s]); });
    var msg = document.getElementById("toolbox-share-msg");
    var link = document.getElementById("toolbox-share-link");
    if (!favs.length) {
      if (msg) msg.textContent = "Star a tool first — your Toolbox is empty.";
      return;
    }
    var url = location.origin + "/?toolbox=" + favs.join(",");
    function showLink(note) {
      if (link) { link.value = url; link.hidden = false; link.select(); }
      if (msg) msg.textContent = note;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        if (msg) msg.textContent = "Link copied — anyone who opens it sees this Toolbox and can save the tools as their own.";
      }, function () { showLink("Copy your Toolbox link:"); });
    } else {
      showLink("Copy your Toolbox link:");
    }
  }

  function refresh() { paint(); renderPersonal(); updateToolboxBtn(); }

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

  var shareBtn = document.getElementById("toolbox-share-btn");
  if (shareBtn) shareBtn.addEventListener("click", shareToolbox);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();

  var search = document.getElementById("tool-search");
  if (search) search.addEventListener("input", renderPersonal);
  var pills = document.querySelectorAll(".pill");
  for (var p = 0; p < pills.length; p++) {
    pills[p].addEventListener("click", function () { setTimeout(renderPersonal, 0); });
  }

  /* Header "My Toolbox" button + the mobile menu's Toolbox row: the count
     comes from the same tp_favs store as everything else, kept in sync by
     refresh() above and by cross-tab 'storage' events. Click behaviour:
     with saved tools it goes to the homepage Toolbox section (smooth
     scroll when already home); with an empty Toolbox it never dead-ends —
     it lands on the tools catalogue with a hint toast instead. */
  function updateToolboxBtn() {
    var n = load(FKEY).length;
    var counts = document.querySelectorAll(".tb-count");
    for (var i = 0; i < counts.length; i++) {
      counts[i].textContent = String(n);
      counts[i].hidden = n === 0;
    }
    var txts = document.querySelectorAll(".tb-count-txt");
    for (var j = 0; j < txts.length; j++) txts[j].textContent = n ? "· " + n + " saved" : "";
    var stars = document.querySelectorAll(".toolbox-btn .tb-star, .menu-toolbox .tb-star");
    for (var k = 0; k < stars.length; k++) stars[k].textContent = n ? "★" : "☆";
  }

  function scrollToFav() {
    var s = document.getElementById("favourites");
    if (s && !s.hidden) { s.scrollIntoView({ behavior: "smooth", block: "start" }); return true; }
    return false;
  }
  function scrollToCatalogue() {
    var t = document.querySelector(".cat") || document.getElementById("browse-family") ||
            document.getElementById("tool-search");
    if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function showHint() {
    if (document.querySelector(".tp-hint")) return;
    var d = document.createElement("div");
    d.className = "tp-hint";
    d.setAttribute("role", "status");
    d.textContent = "Tap ☆ on any tool to save it to your Toolbox — your saved tools will live here.";
    d.addEventListener("click", function () { d.remove(); });
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 6000);
  }

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest(".toolbox-btn, .menu-toolbox") : null;
    if (!b) return;
    var n = load(FKEY).length;
    var onHome = !!document.getElementById("favourites");
    if (n > 0) {
      if (onHome) { e.preventDefault(); scrollToFav(); }
      /* elsewhere: follow the /#favourites link; the arrival code below
         performs the scroll once the section is rendered. */
    } else {
      e.preventDefault();
      if (onHome) { scrollToCatalogue(); showHint(); }
      else {
        try { sessionStorage.setItem("tp_toolbox_hint", "1"); } catch (err) {}
        location.href = "/";
      }
    }
  });

  window.addEventListener("storage", function (e) {
    if (e.key === FKEY) { paint(); updateToolboxBtn(); }
  });

  /* Same-document hash jumps (in-page /#favourites links, manual hash
     edits) fire no page load, so handle them here too. */
  window.addEventListener("hashchange", function () {
    if (location.hash !== "#favourites") return;
    renderPersonal();
    if (load(FKEY).length > 0) setTimeout(scrollToFav, 60);
    else showHint();
  });

  /* Arrival handling on the homepage: a /#favourites landing scrolls to
     the (now unhidden) Toolbox section; an empty-Toolbox landing that
     came via the header button shows the hint instead of a dead anchor. */
  function arrival() {
    var hint = false;
    try { hint = sessionStorage.getItem("tp_toolbox_hint") === "1"; sessionStorage.removeItem("tp_toolbox_hint"); } catch (err) {}
    if (location.hash === "#favourites") {
      if (load(FKEY).length > 0) setTimeout(scrollToFav, 80);
      else showHint();
    } else if (hint) {
      showHint();
    }
    updateToolboxBtn();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrival);
  else arrival();
})();
