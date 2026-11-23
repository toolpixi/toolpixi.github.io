/* Random Name Generator — ToolPixi (added 2026-11-23, SEO push Tool #10).
   Picks random names from the user's own list — with or without repeats.
   Runs entirely in the browser; nothing is uploaded or stored. */
(function () {
  var panel = document.getElementById("random-name-generator");
  if (!panel) return;

  var listEl = document.getElementById("ng-list");
  var countInput = document.getElementById("ng-count");
  var uniqueChk = document.getElementById("ng-unique");
  var goBtn = document.getElementById("ng-go");
  var copyBtn = document.getElementById("ng-copy");
  var resultEl = document.getElementById("ng-result");
  var outEl = document.getElementById("ng-out");
  var metaEl = document.getElementById("ng-meta");
  var errBox = "ng-err";

  function names() {
    return listEl.value.split("\n").map(function (s) {
      return s.trim();
    }).filter(function (s) { return s.length > 0; });
  }

  function randInt(n) {
    if (window.crypto && crypto.getRandomValues) {
      var a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  goBtn.addEventListener("click", function () {
    tpHideError(errBox);
    var list = names();
    var count = parseInt(countInput.value, 10);
    if (list.length < 2) {
      tpShowError(errBox, "Add at least 2 names — one per line — before you pick.");
      return;
    }
    if (list.length > 500) {
      tpShowError(errBox, "The list holds up to 500 names — please trim it first.");
      return;
    }
    if (isNaN(count) || count < 1 || count > 10) {
      tpShowError(errBox, "Please pick between 1 and 10 names at a time.");
      return;
    }
    var picked;
    if (uniqueChk.checked) {
      if (count > list.length) {
        tpShowError(errBox, "You asked for " + count + " unique names but the list only has " + list.length + " — add more names, or untick “No repeats”.");
        return;
      }
      picked = shuffle(list.slice()).slice(0, count);
      metaEl.textContent = count + (count === 1 ? " name" : " names") + " drawn without repeats from " + list.length + " names.";
    } else {
      picked = [];
      for (var i = 0; i < count; i++) picked.push(list[randInt(list.length)]);
      metaEl.textContent = count + (count === 1 ? " name" : " names") + " drawn from " + list.length + " names (repeats allowed).";
    }
    outEl.textContent = picked.join(", ");
    resultEl.classList.add("show");
  });

  copyBtn.addEventListener("click", function () {
    var text = outEl.textContent;
    if (!text || text === "—") return;
    function done() { copyBtn.textContent = "Copied!"; setTimeout(function () { copyBtn.textContent = "Copy names"; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }
})();
