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
