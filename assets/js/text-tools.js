/* ToolPixi — word counter */
// ==== PURE ====
function tpCountText(text) {
  var t = (text || "").trim();
  var words = t ? t.split(/\s+/).filter(Boolean).length : 0;
  var chars = (text || "").length;
  var charsNoSpaces = (text || "").replace(/\s/g, "").length;
  var sentences = t ? (t.match(/[^.!?…]+[.!?…]+["')\]]*/g) || (words ? [""] : [])).length : 0;
  var paragraphs = t ? t.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length : 0;
  return {
    words: words,
    chars: chars,
    charsNoSpaces: charsNoSpaces,
    sentences: sentences,
    paragraphs: paragraphs,
    readingMinutes: words / 200,
    speakingMinutes: words / 130
  };
}
function tpFmtMinutes(m) {
  if (m <= 0) return "0 min";
  if (m < 1) return Math.max(1, Math.round(m * 60)) + " sec";
  return m.toFixed(1).replace(/\.0$/, "") + " min";
}

// ==== DOM ====
(function () {
  var panel = document.getElementById("word-counter");
  if (!panel) return;
  var ta = document.getElementById("wc-text");
  function update() {
    var c = tpCountText(ta.value);
    document.getElementById("wc-words").textContent = c.words.toLocaleString();
    document.getElementById("wc-chars").textContent = c.chars.toLocaleString();
    document.getElementById("wc-nospace").textContent = c.charsNoSpaces.toLocaleString();
    document.getElementById("wc-sent").textContent = c.sentences.toLocaleString();
    document.getElementById("wc-para").textContent = c.paragraphs.toLocaleString();
    document.getElementById("wc-read").textContent = tpFmtMinutes(c.readingMinutes);
    document.getElementById("wc-speak").textContent = tpFmtMinutes(c.speakingMinutes);
  }
  ta.addEventListener("input", update);
  document.getElementById("wc-clear").addEventListener("click", function () { ta.value = ""; update(); ta.focus(); });
  document.getElementById("wc-sample").addEventListener("click", function () {
    ta.value = "Good writing is clear thinking made visible. Paste your own text here to count its words, characters and sentences — and to see how long it takes to read aloud.";
    update();
  });
  update();
})();

/* ToolPixi — case converter + password generator */
// ==== PURE ====
function tpConvertCase(text, mode) {
  var t = String(text || "");
  function title(s) {
    return s.toLowerCase().replace(/(^|[^\p{L}])(\p{L})/gu, function (m, sep, ch) { return sep + ch.toUpperCase(); });
  }
  switch (mode) {
    case "upper": return t.toUpperCase();
    case "lower": return t.toLowerCase();
    case "title": return title(t);
    case "sentence":
      return t.toLowerCase().replace(/(^\s*\p{L})|([.!?…]\s+\p{L})/gu, function (m) { return m.toUpperCase(); });
    case "alternating":
      var out = "", up = true;
      for (var i = 0; i < t.length; i++) {
        var ch = t[i];
        if (/\p{L}/u.test(ch)) { out += up ? ch.toUpperCase() : ch.toLowerCase(); up = !up; }
        else out += ch;
      }
      return out;
    case "inverse":
      return t.replace(/\p{L}/gu, function (ch) {
        return ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase();
      });
    default: return t;
  }
}
var TP_PW_SETS = {
  lower: "abcdefghjkmnpqrstuvwxyz",       // no l/o: avoids look-alike characters
  upper: "ABCDEFGHJKMNPQRSTUVWXYZ",       // no I/O
  digits: "23456789",
  symbols: "!@#$%^&*()-_=+[]{}<>?"
};
function tpGenPassword(len, setNames) {
  var pool = "", guaranteed = [];
  setNames.forEach(function (name) {
    var set = TP_PW_SETS[name];
    if (set) { pool += set; guaranteed.push(set); }
  });
  if (!pool || len < 1) return "";
  function rand(max) {
    var arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  var chars = [];
  guaranteed.forEach(function (set) { if (chars.length < len) chars.push(set[rand(set.length)]); });
  while (chars.length < len) chars.push(pool[rand(pool.length)]);
  // Fisher-Yates shuffle so the guaranteed characters are not predictably first.
  for (var i = chars.length - 1; i > 0; i--) {
    var j = rand(i + 1), tmp = chars[i]; chars[i] = chars[j]; chars[j] = tmp;
  }
  return chars.join("");
}
function tpPasswordStrength(pw) {
  if (!pw) return "—";
  var variety = 0;
  if (/[a-z]/.test(pw)) variety++;
  if (/[A-Z]/.test(pw)) variety++;
  if (/[0-9]/.test(pw)) variety++;
  if (/[^a-zA-Z0-9]/.test(pw)) variety++;
  var score = pw.length * Math.max(1, variety);
  if (pw.length < 8 || score < 24) return "Weak — make it longer";
  if (score < 48) return "Good";
  if (score < 80) return "Strong";
  return "Very strong";
}

// ==== DOM: Case converter ====
(function () {
  var panel = document.getElementById("case-converter");
  if (!panel) return;
  var mode = "title";
  panel.querySelectorAll("[data-case]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-case]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      mode = b.getAttribute("data-case");
      run();
    });
  });
  function run() {
    var src = document.getElementById("cc-text").value;
    var out = tpConvertCase(src, mode);
    document.getElementById("cc-out").value = out;
    var c = tpCountText(out);
    document.getElementById("cc-count").textContent = c.words.toLocaleString() + " words · " + c.chars.toLocaleString() + " characters";
  }
  document.getElementById("cc-text").addEventListener("input", run);
  document.getElementById("cc-copy").addEventListener("click", function () {
    var out = document.getElementById("cc-out");
    out.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value);
    else document.execCommand("copy");
    this.textContent = "Copied!";
    var btn = this;
    setTimeout(function () { btn.textContent = "Copy result"; }, 1500);
  });
  document.getElementById("cc-clear").addEventListener("click", function () {
    document.getElementById("cc-text").value = ""; run();
    document.getElementById("cc-text").focus();
  });
  run();
})();

// ==== DOM: Password generator ====
(function () {
  var panel = document.getElementById("password-gen");
  if (!panel) return;
  function selectedSets() {
    var names = [];
    ["lower", "upper", "digits", "symbols"].forEach(function (n) {
      if (document.getElementById("pg-" + n).checked) names.push(n);
    });
    return names;
  }
  function run() {
    tpHideError("pg-err");
    var len = parseInt(document.getElementById("pg-len").value, 10);
    if (isNaN(len) || len < 4 || len > 128) {
      tpShowError("pg-err", "Choose a length between 4 and 128 characters. 16 or more is a good default.");
      return;
    }
    var sets = selectedSets();
    if (!sets.length) { tpShowError("pg-err", "Tick at least one character type."); return; }
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      tpShowError("pg-err", "This browser cannot generate secure random numbers. Try a modern browser.");
      return;
    }
    var pw = tpGenPassword(len, sets);
    document.getElementById("pg-out").value = pw;
    document.getElementById("pg-strength").textContent = tpPasswordStrength(pw) + " · " + pw.length + " characters";
  }
  document.getElementById("pg-go").addEventListener("click", run);
  ["pg-len", "pg-lower", "pg-upper", "pg-digits", "pg-symbols"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", run);
  });
  document.getElementById("pg-copy").addEventListener("click", function () {
    var out = document.getElementById("pg-out");
    if (!out.value) return;
    out.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value);
    else document.execCommand("copy");
    this.textContent = "Copied!";
    var btn = this;
    setTimeout(function () { btn.textContent = "Copy password"; }, 1500);
  });
  run();
})();
