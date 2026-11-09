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

/* ToolPixi — text diff checker + JSON formatter */
// ==== PURE ====
function tpEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
/* LCS-based line diff -> [{type:'same'|'del'|'add', text}]. */
function tpDiffLines(aLines, bLines) {
  var a = aLines, b = bLines, n = a.length, m = b.length;
  var cap = 600; // keep the DP table bounded on phones
  if (n > cap || m > cap) return null;
  var dp = [];
  for (var i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
  for (i = n - 1; i >= 0; i--)
    for (var j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  var out = []; i = 0; j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: "same", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: "del", text: a[i] }); i++; }
    else { out.push({ type: "add", text: b[j] }); j++; }
  }
  while (i < n) { out.push({ type: "del", text: a[i] }); i++; }
  while (j < m) { out.push({ type: "add", text: b[j] }); j++; }
  return out;
}
/* Word-level diff between one removed and one added line (returns escaped HTML). */
function tpDiffWords(a, b) {
  var ta = a.match(/\S+|\s+/g) || [], tb = b.match(/\S+|\s+/g) || [];
  var n = ta.length, m = tb.length;
  if (n * m > 40000) { // too big for word-level: plain lines
    return { del: tpEsc(a), add: tpEsc(b) };
  }
  var dp = [];
  for (var i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
  for (i = n - 1; i >= 0; i--)
    for (var j = m - 1; j >= 0; j--)
      dp[i][j] = ta[i] === tb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  var hd = "", ha = ""; i = 0; j = 0;
  while (i < n && j < m) {
    if (ta[i] === tb[j]) { hd += tpEsc(ta[i]); ha += tpEsc(tb[j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { hd += '<span class="wdel">' + tpEsc(ta[i]) + "</span>"; i++; }
    else { ha += '<span class="wadd">' + tpEsc(tb[j]) + "</span>"; j++; }
  }
  while (i < n) { hd += '<span class="wdel">' + tpEsc(ta[i]) + "</span>"; i++; }
  while (j < m) { ha += '<span class="wadd">' + tpEsc(tb[j]) + "</span>"; j++; }
  return { del: hd, add: ha };
}
function tpJsonPosFromMsg(msg) {
  var m = /at position (\d+)/.exec(msg);
  if (m) return parseInt(m[1], 10);
  m = /at line (\d+) column (\d+)/.exec(msg);
  if (m) return { line: +m[1], col: +m[2] };
  return null;
}
/* Last-resort: V8's echo-style errors ("Unexpected token '}', "..." is not valid
   JSON") carry no position. Take the reported token and find its last occurrence
   in the (echoed) source — the parser chokes on the token closest to the end.
   Marked approximate; close enough to point the user at the problem. */
function tpJsonApproxPos(err, text) {
  var m = /Unexpected token '((?:[^'\\]|\\.)*)'/.exec(err.message);
  if (!m || !m[1]) return -1;
  var tok = m[1], src = text;
  var em = /,\s*"((?:[^"\\]|\\.)*)" is not valid JSON/.exec(err.message);
  if (em) { try { src = JSON.parse('"' + em[1] + '"'); } catch (e2) { /* keep text */ } }
  return src.lastIndexOf(tok);
}
function tpJsonErrorPos(err, text) {
  var p = tpJsonPosFromMsg(err.message);
  var idx = (p && typeof p === "number") ? p : -1;
  var approx = false;
  if (idx < 0 && !(p && p.line)) { idx = tpJsonApproxPos(err, text); approx = idx >= 0; }
  if (idx < 0) {
    if (p && p.line) return { line: p.line, col: p.col, idx: -1, approx: false };
    return { line: -1, col: -1, idx: -1, approx: false };
  }
  var line = 1, col = idx + 1;
  for (var i = 0; i < idx && i < text.length; i++) if (text[i] === "\n") { line++; col = idx - i; }
  return { line: line, col: col, idx: idx, approx: approx };
}

// ==== DOM: text diff checker ====
(function () {
  var panel = document.getElementById("text-diff");
  if (!panel) return;
  function run() {
    tpHideError("td-err");
    var a = document.getElementById("td-a").value;
    var b = document.getElementById("td-b").value;
    var out = document.getElementById("td-out");
    if (!a && !b) { out.innerHTML = '<p class="note">Paste the two texts you want to compare, then press Compare.</p>'; return; }
    var diff = tpDiffLines(a.split("\n"), b.split("\n"));
    if (!diff) { tpShowError("td-err", "The texts are too long to compare on this device — try shorter texts."); return; }
    var html = "", dels = 0, adds = 0;
    for (var k = 0; k < diff.length; k++) {
      var row = diff[k];
      if (row.type === "same") {
        html += '<div class="dl-line dl-same"><span class="dl-g"> </span><span>' + tpEsc(row.text || " ") + "</span></div>";
      } else if (row.type === "del") {
        // If a changed pair follows, show word-level highlighting.
        var words = null;
        if (k + 1 < diff.length && diff[k + 1].type === "add") {
          words = tpDiffWords(row.text, diff[k + 1].text); k++;
        }
        html += '<div class="dl-line dl-del"><span class="dl-g">−</span><span>' + (words ? words.del : tpEsc(row.text || " ")) + "</span></div>";
        html += '<div class="dl-line dl-add"><span class="dl-g">+</span><span>' + (words ? words.add : tpEsc(diff[k].text || " ")) + "</span></div>";
        dels++; adds++;
      }
    }
    document.getElementById("td-meta").textContent =
      dels === 0 && adds === 0 ? "The two texts are identical." :
      dels + " changed line" + (dels === 1 ? "" : "s") + " shown.";
    out.innerHTML = html;
  }
  document.getElementById("td-go").addEventListener("click", run);
  document.getElementById("td-clear").addEventListener("click", function () {
    document.getElementById("td-a").value = ""; document.getElementById("td-b").value = "";
    document.getElementById("td-out").innerHTML = "";
    document.getElementById("td-meta").textContent = "";
    tpHideError("td-err");
  });
})();

// ==== DOM: JSON formatter ====
(function () {
  var panel = document.getElementById("json-formatter");
  if (!panel) return;
  var out = document.getElementById("jf-out");
  function showError(err, text) {
    tpHideError("jf-err");
    var pos = tpJsonErrorPos(err, text);
    var where = pos.line > 0 ? " — " + (pos.approx ? "near " : "") + "line " + pos.line + ", column " + pos.col : "";
    tpShowError("jf-err", "Invalid JSON" + where + ": " + err.message.replace(/\s+at (position|line).*/, ""));
    if (pos.idx >= 0) {
      var start = Math.max(0, pos.idx - 30), end = Math.min(text.length, pos.idx + 30);
      var snippet = text.slice(start, pos.idx) + "▶" + text.slice(pos.idx, end);
      out.textContent = "…" + snippet + "…";
      out.classList.add("show");
    }
  }
  function parse() {
    var text = document.getElementById("jf-in").value;
    if (!text.trim()) { tpShowError("jf-err", "Paste some JSON first."); return null; }
    try { return JSON.parse(text); }
    catch (err) { showError(err, text); return undefined; }
  }
  document.getElementById("jf-validate").addEventListener("click", function () {
    tpHideError("jf-err");
    var v = parse();
    if (v === undefined) return;
    out.textContent = "Valid JSON — parsed successfully.";
    out.classList.add("show");
  });
  document.getElementById("jf-pretty").addEventListener("click", function () {
    var v = parse();
    if (v === undefined) return;
    tpHideError("jf-err");
    out.textContent = JSON.stringify(v, null, 2);
    out.classList.add("show");
  });
  document.getElementById("jf-minify").addEventListener("click", function () {
    var v = parse();
    if (v === undefined) return;
    tpHideError("jf-err");
    out.textContent = JSON.stringify(v);
    out.classList.add("show");
  });
  document.getElementById("jf-sample").addEventListener("click", function () {
    document.getElementById("jf-in").value = '{\n  "name": "ToolPixi",\n  "free": true,\n  "tools": ["word counter", "age calculator"],\n  "owner": { "role": "founder" }\n}';
    tpHideError("jf-err");
  });
  document.getElementById("jf-clear").addEventListener("click", function () {
    document.getElementById("jf-in").value = ""; out.textContent = ""; out.classList.remove("show");
    tpHideError("jf-err");
  });
  document.getElementById("jf-copy").addEventListener("click", function () {
    if (!out.textContent) return;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.textContent);
    var btn = this; btn.textContent = "Copied!";
    setTimeout(function () { btn.textContent = "Copy result"; }, 1500);
  });
})();

function tpRollDie(sides) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    var arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return (arr[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

function tpRollDice(sides, count) {
  var out = [];
  for (var i = 0; i < count; i++) {
    out.push(tpRollDie(sides));
  }
  return out;
}

(function () {
  var panel = document.getElementById("dice-roller");
  if (!panel) return;

  var sides = 6;
  var diceChips = document.getElementById("dr-dice");
  var countInput = document.getElementById("dr-count");
  var modInput = document.getElementById("dr-mod");
  var rollBtn = document.getElementById("dr-roll");
  var errBox = "dr-err";
  var totalEl = document.getElementById("dr-total");
  var labelEl = document.getElementById("dr-label");
  var rollsEl = document.getElementById("dr-rolls");
  var historyEl = document.getElementById("dr-history");
  var clearBtn = document.getElementById("dr-clear");

  function selectChip(btn) {
    var chips = diceChips.getElementsByClassName("chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.remove("on");
    }
    btn.classList.add("on");
    sides = parseInt(btn.getAttribute("data-die"), 10);
  }

  function fmtLabel(count, die, mod) {
    var label = count + "d" + die;
    if (mod > 0) label += "+" + mod;
    if (mod < 0) label += mod;
    return label;
  }

  function addHistory(text) {
    var li = document.createElement("li");
    li.textContent = text;
    historyEl.insertBefore(li, historyEl.firstChild);
    while (historyEl.children.length > 20) {
      historyEl.removeChild(historyEl.lastChild);
    }
  }

  diceChips.addEventListener("click", function (e) {
    var btn = e.target;
    if (btn && btn.classList && btn.classList.contains("chip")) {
      selectChip(btn);
    }
  });

  rollBtn.addEventListener("click", function () {
    tpHideError(errBox);
    var count = parseInt(countInput.value, 10);
    var mod = parseInt(modInput.value, 10) || 0;
    if (isNaN(count) || count < 1 || count > 20) {
      tpShowError(errBox, "Please enter a number of dice between 1 and 20.");
      return;
    }
    if (isNaN(mod) || mod < -99 || mod > 99) {
      tpShowError(errBox, "Please enter a modifier between -99 and 99.");
      return;
    }

    var rolls = tpRollDice(sides, count);
    var sum = 0;
    for (var i = 0; i < rolls.length; i++) {
      sum += rolls[i];
    }
    var total = sum + mod;

    rollsEl.innerHTML = "";
    for (var j = 0; j < rolls.length; j++) {
      var die = document.createElement("span");
      die.className = "die";
      die.textContent = rolls[j];
      rollsEl.appendChild(die);
    }

    totalEl.textContent = tpFmtNum(total);
    var label = fmtLabel(count, sides, mod);
    labelEl.textContent = label;
    addHistory(label + " → " + total + " (" + rolls.join(", ") + ")");
  });

  clearBtn.addEventListener("click", function () {
    historyEl.innerHTML = "";
    tpHideError(errBox);
  });
})();

var tpLoremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum"
];

function tpLoremWord() {
  var i = Math.floor(Math.random() * tpLoremWords.length);
  return tpLoremWords[i];
}

function tpLoremSentence() {
  var len = 8 + Math.floor(Math.random() * 8); // 8-15 words
  var words = [];
  for (var i = 0; i < len; i++) {
    words.push(tpLoremWord());
  }
  var s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function tpLoremParagraph() {
  var len = 4 + Math.floor(Math.random() * 4); // 4-7 sentences
  var sentences = [];
  for (var i = 0; i < len; i++) {
    sentences.push(tpLoremSentence());
  }
  return sentences.join(" ");
}

function tpLorem(n, type, classicStart) {
  var parts = [];
  if (type === "sentences") {
    for (var i = 0; i < n; i++) {
      parts.push(tpLoremSentence());
    }
  } else if (type === "words") {
    var words = [];
    for (var j = 0; j < n; j++) {
      words.push(tpLoremWord());
    }
    return words.join(" ");
  } else {
    for (var k = 0; k < n; k++) {
      parts.push(tpLoremParagraph());
    }
  }
  var text = type === "paragraphs" ? parts.join("\n\n") : parts.join(" ");
  if (classicStart && parts.length > 0) {
    var classic = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    if (type === "paragraphs") {
      parts[0] = classic + " " + parts[0];
      text = parts.join("\n\n");
    } else {
      text = classic + " " + text;
    }
  }
  return text;
}

(function () {
  var panel = document.getElementById("lorem-gen");
  if (!panel) return;

  var type = "paragraphs";
  var typeChips = document.getElementById("li-type");
  var countInput = document.getElementById("li-count");
  var classicBox = document.getElementById("li-classic");
  var genBtn = document.getElementById("li-generate");
  var errBox = "li-err";
  var resultEl = document.getElementById("li-result");
  var outputEl = document.getElementById("li-output");
  var noteEl = document.getElementById("li-count-note");
  var copyBtn = document.getElementById("li-copy");
  var downloadBtn = document.getElementById("li-download");
  var currentText = "";

  function selectChip(btn) {
    var chips = typeChips.getElementsByClassName("chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.remove("on");
    }
    btn.classList.add("on");
    type = btn.getAttribute("data-lt");
  }

  function typeWord(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  function generate() {
    tpHideError(errBox);
    var count = parseInt(countInput.value, 10);
    if (isNaN(count) || count < 1 || count > 50) {
      tpShowError(errBox, "Please enter a number between 1 and 50.");
      return;
    }
    var classic = classicBox.checked;
    currentText = tpLorem(count, type, classic);
    outputEl.value = currentText;
    resultEl.classList.add("show");

    var wordCount = currentText.split(/\s+/).filter(function (w) {
      return w.length > 0;
    }).length;
    var unit = typeWord(count, type === "words" ? "word" : (type === "sentences" ? "sentence" : "paragraph"));
    noteEl.textContent = unit + " · " + tpFmtNum(wordCount) + " words";
  }

  typeChips.addEventListener("click", function (e) {
    var btn = e.target;
    if (btn && btn.classList && btn.classList.contains("chip")) {
      selectChip(btn);
    }
  });

  genBtn.addEventListener("click", generate);

  copyBtn.addEventListener("click", function () {
    function done() {
      copyBtn.textContent = "Copied!";
      setTimeout(function () {
        copyBtn.textContent = "Copy text";
      }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentText).then(done, function () {
        outputEl.select();
        document.execCommand("copy");
        done();
      });
    } else {
      outputEl.select();
      document.execCommand("copy");
      done();
    }
  });

  downloadBtn.addEventListener("click", function () {
    tpDownload(new Blob([currentText], { type: "text/plain" }), "lorem-ipsum.txt");
  });

  generate();
})();

/* ToolPixi — Base64 encoder & decoder (UTF-8 safe) */
// ==== PURE ====
function tpB64EncodeText(text, urlSafe) {
  var bytes = new TextEncoder().encode(String(text || ""));
  var bin = "";
  var CHUNK = 0x8000;
  for (var i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  var out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return out;
}
function tpB64DecodeText(str, urlSafe) {
  var s = String(str || "").replace(/\s/g, "");
  if (!s) return "";
  if (urlSafe) s = s.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/=]+$/.test(s)) throw new Error("invalid-chars");
  s = s.replace(/=+$/, "");
  if (s.length % 4 === 1) throw new Error("invalid-length");
  s += "=".repeat((4 - (s.length % 4)) % 4);
  var bin = atob(s);
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

// ==== DOM: Base64 tool ====
(function () {
  var panel = document.getElementById("base64-tool");
  if (!panel) return;
  var mode = "encode";
  function run() {
    tpHideError("b64-err");
    var src = document.getElementById("b64-text").value;
    var outEl = document.getElementById("b64-out");
    if (!src) { outEl.value = ""; document.getElementById("b64-count").textContent = "0 characters"; return; }
    try {
      var out = mode === "encode"
        ? tpB64EncodeText(src, document.getElementById("b64-urlsafe").checked)
        : tpB64DecodeText(src, document.getElementById("b64-urlsafe").checked);
      outEl.value = out;
      document.getElementById("b64-count").textContent = out.length.toLocaleString() + " characters";
    } catch (e) {
      outEl.value = "";
      document.getElementById("b64-count").textContent = "0 characters";
      tpShowError("b64-err", mode === "decode"
        ? "That does not look like valid Base64 — check for a missing or extra character, or characters outside the Base64 alphabet."
        : "That text could not be encoded. Please try again.");
    }
  }
  document.getElementById("b64-encode").addEventListener("click", function () { mode = "encode"; run(); });
  document.getElementById("b64-decode").addEventListener("click", function () { mode = "decode"; run(); });
  document.getElementById("b64-text").addEventListener("input", run);
  document.getElementById("b64-urlsafe").addEventListener("change", run);
  document.getElementById("b64-copy").addEventListener("click", function () {
    var out = document.getElementById("b64-out");
    out.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value);
    else document.execCommand("copy");
    this.textContent = "Copied!";
    var btn = this;
    setTimeout(function () { btn.textContent = "Copy result"; }, 1500);
  });
  document.getElementById("b64-download").addEventListener("click", function () {
    tpDownload(new Blob([document.getElementById("b64-out").value], { type: "text/plain" }), "base64-output.txt");
  });
  document.getElementById("b64-clear").addEventListener("click", function () {
    document.getElementById("b64-text").value = ""; run();
    document.getElementById("b64-text").focus();
  });
  run();
})();

/* ToolPixi — URL encoder & decoder */
// ==== PURE ====
function tpUrlEncodeText(text, mode) {
  return mode === "full" ? encodeURI(String(text || "")) : encodeURIComponent(String(text || ""));
}
function tpUrlDecodeText(text, mode) {
  return mode === "full" ? decodeURI(String(text || "")) : decodeURIComponent(String(text || ""));
}

// ==== DOM: URL tool ====
(function () {
  var panel = document.getElementById("url-tool");
  if (!panel) return;
  var action = "encode", urlMode = "component";
  panel.querySelectorAll("[data-urlmode]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-urlmode]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      urlMode = b.getAttribute("data-urlmode");
      run();
    });
  });
  function run() {
    tpHideError("url-err");
    var src = document.getElementById("url-text").value;
    var outEl = document.getElementById("url-out");
    if (!src) { outEl.value = ""; document.getElementById("url-count").textContent = "0 characters"; return; }
    try {
      var out = action === "encode" ? tpUrlEncodeText(src, urlMode) : tpUrlDecodeText(src, urlMode);
      outEl.value = out;
      document.getElementById("url-count").textContent = out.length.toLocaleString() + " characters";
    } catch (e) {
      outEl.value = "";
      document.getElementById("url-count").textContent = "0 characters";
      tpShowError("url-err", "That text contains a broken % sequence — a % must be followed by exactly two hex digits (like %20 for a space). Fix the sequence and try again.");
    }
  }
  document.getElementById("url-encode").addEventListener("click", function () { action = "encode"; run(); });
  document.getElementById("url-decode").addEventListener("click", function () { action = "decode"; run(); });
  document.getElementById("url-text").addEventListener("input", run);
  document.getElementById("url-copy").addEventListener("click", function () {
    var out = document.getElementById("url-out");
    out.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out.value);
    else document.execCommand("copy");
    this.textContent = "Copied!";
    var btn = this;
    setTimeout(function () { btn.textContent = "Copy result"; }, 1500);
  });
  document.getElementById("url-download").addEventListener("click", function () {
    tpDownload(new Blob([document.getElementById("url-out").value], { type: "text/plain" }), "url-output.txt");
  });
  document.getElementById("url-clear").addEventListener("click", function () {
    document.getElementById("url-text").value = ""; run();
    document.getElementById("url-text").focus();
  });
  run();
})();

/* ---- MD5 (compact RFC 1321 implementation; WebCrypto has no MD5) ---- */
function tpMd5(input) {
  function rl(v, c) { return (v << c) | (v >>> (32 - c)); }
  function add() { var s = 0; for (var i = 0; i < arguments.length; i++) s += arguments[i]; return s | 0; }
  function f(x, y, z) { return (x & y) | (~x & z); }
  function g(x, y, z) { return (x & z) | (y & ~z); }
  function h(x, y, z) { return x ^ y ^ z; }
  function ii(x, y, z) { return y ^ (x | ~z); }
  var S = [[7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]];
  var bytes = new TextEncoder().encode(input);
  var bitLen = bytes.length * 8;
  var padded = new Uint8Array((((bytes.length + 8) >> 6) + 1) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  var dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bitLen >>> 0, true);
  dv.setUint32(padded.length - 4, Math.floor(bitLen / 4294967296), true);
  var a0 = 0x67452301 | 0, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476 | 0;
  var M = new Int32Array(16);
  for (var off = 0; off < padded.length; off += 64) {
    for (var j = 0; j < 16; j++) M[j] = dv.getInt32(off + j * 4, true);
    var A = a0, B = b0, C = c0, D = d0;
    for (var i = 0; i < 64; i++) {
      var round = i >> 4, fn, idx;
      if (round === 0) { fn = f(B, C, D); idx = i; }
      else if (round === 1) { fn = g(B, C, D); idx = (5 * i + 1) % 16; }
      else if (round === 2) { fn = h(B, C, D); idx = (3 * i + 5) % 16; }
      else { fn = ii(B, C, D); idx = (7 * i) % 16; }
      var K = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
      var tmp = D; D = C; C = B;
      B = add(B, rl(add(A, fn, K, M[idx]), S[round][i % 4]));
      A = tmp;
    }
    a0 = add(a0, A); b0 = add(b0, B); c0 = add(c0, C); d0 = add(d0, D);
  }
  function hexle(w) {
    var s = "";
    for (var b = 0; b < 4; b++) { var v = (w >>> (b * 8)) & 255; s += (v < 16 ? "0" : "") + v.toString(16); }
    return s;
  }
  return hexle(a0) + hexle(b0) + hexle(c0) + hexle(d0);
}

/* ---- UUID Generator ---- */
(function () {
  var panel = document.getElementById("uuid-gen");
  if (!panel) return;
  var countEl = document.getElementById("uuid-count"),
      out = document.getElementById("uuid-out"),
      meta = document.getElementById("uuid-meta");
  function uuidV4() {
    var b = new Uint8Array(16), i;
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b);
    else for (i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    b[6] = (b[6] & 15) | 64;
    b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  function run() {
    var n = parseInt(countEl.value, 10);
    if (isNaN(n) || n < 1 || n > 100) { tpShowError("uuid-err", "Choose a number between 1 and 100."); return; }
    tpHideError("uuid-err");
    var list = [];
    for (var i = 0; i < n; i++) list.push(uuidV4());
    out.value = list.join("\n");
    meta.textContent = n + " UUID" + (n > 1 ? "s" : "") + " — version 4, lowercase";
  }
  document.getElementById("uuid-go").addEventListener("click", run);
  document.getElementById("uuid-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  document.getElementById("uuid-download").addEventListener("click", function () {
    if (out.value) tpDownload(new Blob([out.value], { type: "text/plain" }), "uuids.txt");
  });
  run();
})();

/* ---- Hash Generator ---- */
(function () {
  var panel = document.getElementById("hash-gen");
  if (!panel) return;
  var inp = document.getElementById("hash-text");
  function setHex(id, val) { document.getElementById(id).value = val; }
  function sha(algo, text) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve("");
    return crypto.subtle.digest(algo, new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    }).catch(function () { return ""; });
  }
  var runToken = 0;
  function run() {
    var text = inp.value, my = ++runToken;
    if (!text) {
      setHex("hash-md5", ""); setHex("hash-sha1", ""); setHex("hash-sha256", ""); setHex("hash-sha512", "");
      return;
    }
    setHex("hash-md5", tpMd5(text));
    sha("SHA-1", text).then(function (v) { if (my === runToken) setHex("hash-sha1", v); });
    sha("SHA-256", text).then(function (v) { if (my === runToken) setHex("hash-sha256", v); });
    sha("SHA-512", text).then(function (v) { if (my === runToken) setHex("hash-sha512", v); });
  }
  inp.addEventListener("input", run);
  panel.querySelectorAll("[data-hash-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var field = document.getElementById(btn.getAttribute("data-hash-copy"));
      if (field && field.value) tpCopyWithFeedback(btn, field.value);
    });
  });
  run();
})();

/* ---- Slug Generator ---- */
(function () {
  var panel = document.getElementById("slug-gen");
  if (!panel) return;
  var inp = document.getElementById("slug-text"),
      sep = document.getElementById("slug-sep"),
      lower = document.getElementById("slug-lower"),
      out = document.getElementById("slug-out");
  function run() {
    var s = inp.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lower.checked) s = s.toLowerCase();
    s = s.replace(/[^a-zA-Z0-9]+/g, sep.value);
    out.value = s.split(sep.value).filter(function (p) { return p !== ""; }).join(sep.value);
  }
  inp.addEventListener("input", run);
  sep.addEventListener("change", run);
  lower.addEventListener("change", run);
  document.getElementById("slug-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  run();
})();

/* ---- Remove Duplicate Lines ---- */
(function () {
  var panel = document.getElementById("dedup-lines");
  if (!panel) return;
  var inp = document.getElementById("dd-in"), out = document.getElementById("dd-out"),
      caseEl = document.getElementById("dd-case"), count = document.getElementById("dd-count");
  function run() {
    var seen = {}, kept = [], total = 0;
    inp.value.split("\n").forEach(function (line) {
      var t = line.replace(/^\s+|\s+$/g, "");
      if (!t) return;
      total++;
      var key = caseEl.checked ? t : t.toLowerCase();
      if (seen[key]) return;
      seen[key] = 1;
      kept.push(t);
    });
    out.value = kept.join("\n");
    count.textContent = total ? total + " lines in → " + kept.length + " unique (" + (total - kept.length) + " duplicates removed)" : "";
  }
  inp.addEventListener("input", run);
  caseEl.addEventListener("change", run);
  document.getElementById("dd-go").addEventListener("click", run);
  document.getElementById("dd-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  run();
})();

/* ---- Sort Lines ---- */
(function () {
  var panel = document.getElementById("sort-lines");
  if (!panel) return;
  var inp = document.getElementById("sl-in"), out = document.getElementById("sl-out"),
      caseEl = document.getElementById("sl-case"), count = document.getElementById("sl-count");
  var mode = "az";
  function cmp(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: caseEl.checked ? "variant" : "base" });
  }
  function run() {
    var arr = inp.value.split("\n").map(function (s) { return s.replace(/^\s+|\s+$/g, ""); })
      .filter(function (s) { return s !== ""; });
    if (mode === "az") arr.sort(cmp);
    else if (mode === "za") arr.sort(function (a, b) { return cmp(b, a); });
    else if (mode === "len") arr.sort(function (a, b) { return (a.length - b.length) || cmp(a, b); });
    else if (mode === "shuffle") {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = arr[i];
        arr[i] = arr[j]; arr[j] = t;
      }
    }
    out.value = arr.join("\n");
    count.textContent = arr.length ? arr.length + " lines" : "";
  }
  panel.querySelectorAll("[data-smode]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-smode]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      mode = chip.getAttribute("data-smode");
      run();
    });
  });
  inp.addEventListener("input", run);
  caseEl.addEventListener("change", run);
  document.getElementById("sl-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  document.getElementById("sl-download").addEventListener("click", function () {
    if (out.value) tpDownload(new Blob([out.value], { type: "text/plain" }), "sorted-lines.txt");
  });
  run();
})();

/* ---- Reverse Text ---- */
(function () {
  var panel = document.getElementById("reverse-text");
  if (!panel) return;
  var inp = document.getElementById("rv-in"), out = document.getElementById("rv-out");
  var mode = "chars";
  function run() {
    var t = inp.value;
    if (mode === "chars") out.value = Array.from(t).reverse().join("");
    else if (mode === "words") out.value = t.replace(/^\s+|\s+$/g, "") ? t.replace(/^\s+|\s+$/g, "").split(/\s+/).reverse().join(" ") : "";
    else out.value = t.split("\n").reverse().join("\n");
  }
  panel.querySelectorAll("[data-rmode]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-rmode]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      mode = chip.getAttribute("data-rmode");
      run();
    });
  });
  inp.addEventListener("input", run);
  document.getElementById("rv-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  run();
})();

/* ---- JSON Minifier ---- */
(function () {
  var panel = document.getElementById("json-min");
  if (!panel) return;
  var inp = document.getElementById("jm-in"), out = document.getElementById("jm-out"),
      meta = document.getElementById("jm-meta");
  function run() {
    tpHideError("jm-err");
    var text = inp.value.replace(/^\s+|\s+$/g, "");
    if (!text) {
      tpShowError("jm-err", "Paste some JSON first.");
      out.value = ""; meta.textContent = "";
      return;
    }
    try {
      var min = JSON.stringify(JSON.parse(text));
      out.value = min;
      meta.textContent = "valid JSON · " + text.length + " → " + min.length + " characters (" +
        Math.max(0, Math.round((1 - min.length / text.length) * 100)) + "% smaller)";
    } catch (e) {
      out.value = ""; meta.textContent = "";
      tpShowError("jm-err", "Invalid JSON: " + e.message + tpJsonErrorPos(text, e));
    }
  }
  document.getElementById("jm-go").addEventListener("click", run);
  document.getElementById("jm-sample").addEventListener("click", function () {
    inp.value = "{\n  \"site\": \"ToolPixi\",\n  \"tools\": [\n    \"json-formatter\",\n    \"csv-to-json\"\n  ],\n  \"private\": true\n}";
    run();
  });
  document.getElementById("jm-clear").addEventListener("click", function () {
    inp.value = ""; out.value = ""; meta.textContent = "";
    tpHideError("jm-err");
  });
  document.getElementById("jm-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
})();

/* ---- CSV parser (quoted fields, "" escapes, delimiter auto-detect) ---- */
function tpParseCsv(text) {
  text = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var firstLine = text.split("\n")[0] || "", counts = { ",": 0, ";": 0, "\t": 0 }, inQ2 = false, i, ch;
  for (i = 0; i < firstLine.length; i++) {
    ch = firstLine[i];
    if (ch === '"') inQ2 = !inQ2;
    else if (!inQ2 && counts.hasOwnProperty(ch)) counts[ch]++;
  }
  var delim = ",";
  if (counts[";"] > counts[","]) delim = ";";
  if (counts["\t"] > counts[delim]) delim = "\t";
  var rows = [], row = [], field = "", inQ = false;
  for (i = 0; i < text.length; i++) {
    ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += ch;
    } else if (ch === '"' && field === "") inQ = true;
    else if (ch === '"') field += ch;
    else if (ch === delim) { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); field = ""; rows.push(row); row = []; }
    else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter(function (r) { return !(r.length === 1 && r[0].replace(/^\s+|\s+$/g, "") === ""); });
}

/* ---- CSV to JSON ---- */
(function () {
  var panel = document.getElementById("csv-json");
  if (!panel) return;
  var inp = document.getElementById("cj-in"), out = document.getElementById("cj-out"),
      meta = document.getElementById("cj-meta"), headEl = document.getElementById("cj-headers");
  function run() {
    tpHideError("cj-err");
    var text = inp.value.replace(/^\s+|\s+$/g, "");
    if (!text) { tpShowError("cj-err", "Paste some CSV first, or open a .csv file."); return; }
    var rows = tpParseCsv(text);
    if (!rows.length) { tpShowError("cj-err", "No rows found in that CSV."); return; }
    var headers, data = rows;
    if (headEl.checked) {
      headers = rows[0].map(function (h, i) { return h.replace(/^\s+|\s+$/g, "") || ("col" + (i + 1)); });
      data = rows.slice(1);
    } else {
      headers = rows[0].map(function (_, i) { return "col" + (i + 1); });
    }
    var objs = data.map(function (r) {
      var o = {};
      headers.forEach(function (h, i) { o[h] = r[i] !== undefined ? r[i] : ""; });
      return o;
    });
    out.value = JSON.stringify(objs, null, 2);
    meta.textContent = objs.length + " rows × " + headers.length + " columns";
  }
  document.getElementById("cj-go").addEventListener("click", run);
  document.getElementById("cj-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  document.getElementById("cj-download").addEventListener("click", function () {
    if (out.value) tpDownload(new Blob([out.value], { type: "application/json" }), "converted.json");
  });
  document.getElementById("cj-file").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () { inp.value = String(reader.result || ""); run(); };
    reader.onerror = function () { tpShowError("cj-err", "That file could not be read."); };
    reader.readAsText(f);
  });
})();

/* ---- JSON to CSV ---- */
function tpCsvCell(v) {
  if (v === null || v === undefined) return "";
  var s = (typeof v === "object") ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
(function () {
  var panel = document.getElementById("json-csv");
  if (!panel) return;
  var inp = document.getElementById("jc-in"), out = document.getElementById("jc-out"),
      meta = document.getElementById("jc-meta");
  function run() {
    tpHideError("jc-err");
    out.value = ""; meta.textContent = "";
    var text = inp.value.replace(/^\s+|\s+$/g, "");
    if (!text) { tpShowError("jc-err", "Paste a JSON array first."); return; }
    var data;
    try { data = JSON.parse(text); }
    catch (e) { tpShowError("jc-err", "Invalid JSON: " + e.message + tpJsonErrorPos(text, e)); return; }
    if (Object.prototype.toString.call(data) !== "[object Array]") {
      if (data && typeof data === "object") data = [data];
      else { tpShowError("jc-err", "That JSON is not an array of objects — paste something like [{\"name\":\"Ali\"}]."); return; }
    }
    if (!data.length) { tpShowError("jc-err", "The array is empty — nothing to convert."); return; }
    var keys = [];
    data.forEach(function (o) {
      if (o && typeof o === "object") Object.keys(o).forEach(function (k) {
        if (keys.indexOf(k) < 0) keys.push(k);
      });
    });
    if (!keys.length) { tpShowError("jc-err", "No object keys found — the array needs objects like {\"name\":\"Ali\"}."); return; }
    var lines = [keys.map(tpCsvCell).join(",")];
    data.forEach(function (o) {
      lines.push(keys.map(function (k) { return tpCsvCell(o ? o[k] : ""); }).join(","));
    });
    out.value = lines.join("\n");
    meta.textContent = data.length + " rows × " + keys.length + " columns";
  }
  document.getElementById("jc-go").addEventListener("click", run);
  document.getElementById("jc-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  document.getElementById("jc-download").addEventListener("click", function () {
    if (out.value) tpDownload(new Blob([out.value], { type: "text/csv" }), "converted.csv");
  });
})();

/* ---- Markdown to HTML (compact converter; input is escaped first, so typed
        HTML is shown as text and can never inject markup) ---- */
function tpMarkdownToHtml(src) {
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var codeBlocks = [];
  src = src.replace(/```[^\n]*\n([\s\S]*?)(?:```|$)/g, function (m, code) {
    codeBlocks.push("<pre><code>" + esc(code.replace(/\n$/, "")) + "</code></pre>");
    return "\u0001" + (codeBlocks.length - 1) + "\u0001";
  });
  function inline(s) {
    var spans = [];
    s = s.replace(/`([^`]+)`/g, function (m, c) {
      spans.push("<code>" + c + "</code>");
      return "\u0002" + (spans.length - 1) + "\u0002";
    });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, alt, url) {
      return '<img src="' + tpSanitizeHref(url) + '" alt="' + alt + '">';
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, url) {
      return '<a href="' + tpSanitizeHref(url) + '">' + txt + "</a>";
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/(^|[^A-Za-z0-9_])_([^_]+)_/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    s = s.replace(/\u0002(\d+)\u0002/g, function (m, i) { return spans[+i]; });
    return s;
  }
  function isTableSep(l) { return /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && l.indexOf("-") >= 0; }
  function splitRow(l) {
    return l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) {
      return c.replace(/^\s+|\s+$/g, "");
    });
  }
  var lines = src.split("\n"), html = [], i = 0;
  while (i < lines.length) {
    var line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    var cb = line.match(/^\u0001(\d+)\u0001\s*$/);
    if (cb) { html.push(codeBlocks[+cb[1]]); i++; continue; }
    var hd = line.match(/^(#{1,6})\s+(.*)$/);
    if (hd) {
      var lvl = hd[1].length;
      html.push("<h" + lvl + ">" + inline(esc(hd[2])) + "</h" + lvl + ">");
      i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { html.push("<hr>"); i++; continue; }
    if (line.indexOf("|") >= 0 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      var headCells = splitRow(line);
      var aligns = splitRow(lines[i + 1]).map(function (c) {
        if (/^:-+:$/.test(c)) return "center";
        if (/-+:$/.test(c)) return "right";
        return "";
      });
      i += 2;
      var bodyRows = [];
      while (i < lines.length && lines[i].indexOf("|") >= 0 && !/^\s*$/.test(lines[i])) {
        bodyRows.push(splitRow(lines[i]));
        i++;
      }
      var th = headCells.map(function (c, ci) {
        return "<th" + (aligns[ci] ? ' style="text-align:' + aligns[ci] + '"' : "") + ">" + inline(esc(c)) + "</th>";
      }).join("");
      var trs = bodyRows.map(function (r) {
        return "<tr>" + headCells.map(function (_, ci) {
          var c = r[ci] || "";
          return "<td" + (aligns[ci] ? ' style="text-align:' + aligns[ci] + '"' : "") + ">" + inline(esc(c)) + "</td>";
        }).join("") + "</tr>";
      }).join("");
      html.push("<table><thead><tr>" + th + "</tr></thead><tbody>" + trs + "</tbody></table>");
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      var quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      html.push("<blockquote><p>" + inline(esc(quote.join("\n"))).replace(/\n/g, "<br>") + "</p></blockquote>");
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      var items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      html.push("<ul>" + items.map(function (t) { return "<li>" + inline(esc(t)) + "</li>"; }).join("") + "</ul>");
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      var oitems = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        oitems.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      html.push("<ol>" + oitems.map(function (t) { return "<li>" + inline(esc(t)) + "</li>"; }).join("") + "</ol>");
      continue;
    }
    var para = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
           !/^(#{1,6})\s/.test(lines[i]) && !/^\s*>\s?/.test(lines[i]) &&
           !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) &&
           !/^\u0001\d+\u0001\s*$/.test(lines[i]) &&
           !(lines[i].indexOf("|") >= 0 && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
      para.push(lines[i]);
      i++;
    }
    html.push("<p>" + inline(esc(para.join("\n"))).replace(/\n/g, "<br>") + "</p>");
  }
  return html.join("\n");
}
(function () {
  var panel = document.getElementById("markdown-html");
  if (!panel) return;
  var inp = document.getElementById("md-in"), out = document.getElementById("md-out"),
      preview = document.getElementById("md-preview");
  function run() {
    if (!inp.value.replace(/^\s+|\s+$/g, "")) {
      out.value = "";
      preview.innerHTML = '<p class="note">Start typing — the preview appears here.</p>';
      return;
    }
    var html = tpMarkdownToHtml(inp.value);
    out.value = html;
    preview.innerHTML = html;
  }
  inp.addEventListener("input", run);
  document.getElementById("md-copy").addEventListener("click", function () {
    if (out.value) tpCopyWithFeedback(this, out.value);
  });
  document.getElementById("md-clear").addEventListener("click", function () {
    inp.value = "";
    run();
  });
  document.getElementById("md-sample").addEventListener("click", function () {
    inp.value = ["# Launch notes", "",
      "We shipped **fast** and *clean*, with `code` support and a [link](https://example.com).", "",
      "- First item", "- Second item", "",
      "> A quote worth keeping.", "",
      "| Tool | Speed |", "| --- | ---: |", "| Markdown | Fast |", "| HTML | Everywhere |"].join("\n");
    run();
  });
  run();
})();

/* ---- Text to Speech ---- */
(function () {
  var panel = document.getElementById("text-speech");
  if (!panel) return;
  var text = document.getElementById("tts-text"), voiceSel = document.getElementById("tts-voice"),
      rate = document.getElementById("tts-rate"), pitch = document.getElementById("tts-pitch"),
      pauseBtn = document.getElementById("tts-pause");
  var voices = [];
  function fillVoices() {
    if (!("speechSynthesis" in window)) return;
    voices = speechSynthesis.getVoices();
    var cur = voiceSel.value;
    voiceSel.innerHTML = "";
    voices.forEach(function (v, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = v.name + " — " + v.lang + (v.localService ? " (on-device)" : " (online)") + (v.default ? " · default" : "");
      voiceSel.appendChild(o);
    });
    if (cur && voices[+cur]) voiceSel.value = cur;
  }
  function labels() {
    document.getElementById("tts-rate-val").textContent = Number(rate.value).toFixed(1) + "×";
    document.getElementById("tts-pitch-val").textContent = Number(pitch.value).toFixed(1);
  }
  if (!("speechSynthesis" in window)) {
    tpShowError("tts-err", "This browser does not support speech synthesis — try Chrome, Edge or Safari.");
  } else {
    fillVoices();
    if (typeof speechSynthesis.onvoiceschanged !== "undefined") speechSynthesis.onvoiceschanged = fillVoices;
  }
  rate.addEventListener("input", labels);
  pitch.addEventListener("input", labels);
  labels();
  document.getElementById("tts-speak").addEventListener("click", function () {
    if (!("speechSynthesis" in window)) return;
    var t = text.value.replace(/^\s+|\s+$/g, "");
    if (!t) { tpShowError("tts-err", "Type or paste some text first."); return; }
    tpHideError("tts-err");
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    var v = voices[+voiceSel.value || 0];
    if (v) u.voice = v;
    u.rate = parseFloat(rate.value);
    u.pitch = parseFloat(pitch.value);
    pauseBtn.textContent = "Pause";
    speechSynthesis.speak(u);
  });
  pauseBtn.addEventListener("click", function () {
    if (!("speechSynthesis" in window)) return;
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      pauseBtn.textContent = "Resume";
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      pauseBtn.textContent = "Pause";
    }
  });
  document.getElementById("tts-stop").addEventListener("click", function () {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    pauseBtn.textContent = "Pause";
  });
})();

// ==== PURE: morse code ====
var TP_MORSE = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----", ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", "$": "...-..-", "@": ".--.-." };
var TP_MORSE_REV = {};
for (var mk in TP_MORSE) { TP_MORSE_REV[TP_MORSE[mk]] = mk; }
function tpTextToMorse(text) {
  var words = (text || "").toUpperCase().split(/\s+/).filter(Boolean);
  return words.map(function (w) {
    return w.split("").map(function (ch) { return TP_MORSE[ch] || ""; }).filter(Boolean).join(" ");
  }).filter(Boolean).join(" / ");
}
function tpMorseToText(code) {
  var words = (code || "").replace(/\|/g, "/").split("/").map(function (s) { return s.trim(); }).filter(Boolean);
  return words.map(function (w) {
    return w.split(/\s+/).map(function (tok) { return TP_MORSE_REV[tok] || ""; }).join("");
  }).join(" ");
}

// ==== DOM: morse code translator ====
(function () {
  var panel = document.getElementById("morse-code");
  if (!panel) return;
  var textEl = document.getElementById("mc-text"), morseEl = document.getElementById("mc-morse"), busy = false;
  function fromText() { if (busy) return; busy = true; morseEl.value = tpTextToMorse(textEl.value); busy = false; }
  function fromMorse() { if (busy) return; busy = true; textEl.value = tpMorseToText(morseEl.value); busy = false; }
  textEl.addEventListener("input", fromText);
  morseEl.addEventListener("input", fromMorse);
  document.getElementById("mc-copy").addEventListener("click", function () {
    if (morseEl.value) tpCopyWithFeedback(this, morseEl.value);
  });
  var ctx = null, playing = false;
  document.getElementById("mc-play").addEventListener("click", function () {
    var code = morseEl.value.trim();
    if (!code || playing) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) {
      tpShowError("mc-err", "This browser could not start audio playback — the translation above still works.");
      return;
    }
    tpHideError("mc-err");
    playing = true;
    var btn = this; btn.textContent = "Playing…";
    var unit = 0.09, t = ctx.currentTime + 0.06;
    function beep(dur) {
      var osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.value = 620;
      osc.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
      gain.gain.setValueAtTime(0.22, t + Math.max(0.012, dur - 0.012));
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t); osc.stop(t + dur);
      t += dur;
    }
    code.replace(/\//g, " / ").split(/\s+/).filter(Boolean).forEach(function (tok) {
      if (tok === "/") { t += unit * 7; return; }
      for (var i = 0; i < tok.length; i++) {
        if (tok[i] === ".") beep(unit);
        else if (tok[i] === "-") beep(unit * 3);
        if (i < tok.length - 1) t += unit;
      }
      t += unit * 3;
    });
    setTimeout(function () { playing = false; btn.textContent = "▶ Play the Morse"; }, (t - ctx.currentTime) * 1000 + 60);
  });
  fromText();
})();

// ==== DOM: character counter ====
(function () {
  var panel = document.getElementById("char-counter");
  if (!panel) return;
  var ta = document.getElementById("chc-text");
  var limitSel = document.getElementById("chc-limit");
  function update() {
    var c = tpCountText(ta.value);
    document.getElementById("chc-chars").textContent = c.chars.toLocaleString();
    document.getElementById("chc-nospace").textContent = c.charsNoSpaces.toLocaleString();
    document.getElementById("chc-words").textContent = c.words.toLocaleString();
    document.getElementById("chc-sent").textContent = c.sentences.toLocaleString();
    document.getElementById("chc-lines").textContent = ta.value ? String(ta.value.split(/\n/).length) : "0";
    document.getElementById("chc-para").textContent = c.paragraphs.toLocaleString();
    var lim = parseInt(limitSel.value, 10);
    var rem = document.getElementById("chc-remaining");
    if (lim > 0) {
      var left = lim - c.chars;
      rem.textContent = left >= 0
        ? left.toLocaleString() + " characters left"
        : (-left).toLocaleString() + " characters over the limit";
    } else {
      rem.textContent = "Pick a limit above to see how much room is left.";
    }
  }
  ta.addEventListener("input", update);
  limitSel.addEventListener("change", update);
  document.getElementById("chc-clear").addEventListener("click", function () { ta.value = ""; update(); ta.focus(); });
  update();
})();

// ==== DOM: reading time calculator ====
(function () {
  var panel = document.getElementById("reading-time");
  if (!panel) return;
  var ta = document.getElementById("rt-text");
  function update() {
    var c = tpCountText(ta.value);
    document.getElementById("rt-words").textContent = c.words.toLocaleString();
    document.getElementById("rt-slow").textContent = tpFmtMinutes(c.words / 150);
    document.getElementById("rt-avg").textContent = tpFmtMinutes(c.words / 200);
    document.getElementById("rt-fast").textContent = tpFmtMinutes(c.words / 250);
    document.getElementById("rt-speak").textContent = tpFmtMinutes(c.words / 130);
  }
  ta.addEventListener("input", update);
  document.getElementById("rt-clear").addEventListener("click", function () { ta.value = ""; update(); ta.focus(); });
  update();
})();
