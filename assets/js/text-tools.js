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
