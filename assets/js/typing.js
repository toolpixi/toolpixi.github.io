/* ToolPixi — Typing Speed Test.
   Pure JS: a passage of common words, a real input to type into, live
   WPM + accuracy from the characters actually typed. Nothing leaves
   the device; there is nothing to upload. */
(function () {
  var panel = document.getElementById("typing-speed-test");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var WORDS = ("the of and a to in is you that it he was for on are as with his they i " +
    "at be this have from or one had by word but not what all were we when your can " +
    "said there use an each which she do how their if will up other about out many " +
    "then them these so some her would make like him into time has look two more " +
    "write go see number no way could people my than first water been call who oil " +
    "its now find long down day did get come made may part over new sound take only " +
    "little work know place year live me back give most very after thing our just " +
    "name good sentence man think say great where help through much before line " +
    "right too mean old any same tell boy follow came want show also around form " +
    "three small set put end does another well large must big even such because " +
    "turn here why ask went men read need land different home us move try kind " +
    "hand picture again change off play spell air away animal house point page " +
    "letter mother answer found study still learn should world high every near " +
    "add food between own below country plant last school father keep tree never " +
    "start city earth eye light thought head under story saw left few while along " +
    "might close something seem next hard open example begin life always those " +
    "both paper together got group often run quick brown fox jumps lazy dog").split(" ");

  var duration = 30;         // seconds, set by the mode chips
  var passage = "";          // target text
  var startedAt = null;      // ms timestamp of first keystroke
  var timerInt = null;
  var finished = false;

  function newPassage() {
    var words = [];
    var last = "";
    for (var i = 0; i < 45; i++) {
      var w = WORDS[Math.floor(Math.random() * WORDS.length)];
      if (w === last) { i--; continue; }
      words.push(w); last = w;
    }
    return words.join(" ");
  }

  function renderPassage() {
    var typed = el("tt-input").value;
    var html = "";
    for (var i = 0; i < passage.length; i++) {
      var cls = "tt-ch";
      if (i < typed.length) cls += typed[i] === passage[i] ? " ok" : " bad";
      else if (i === typed.length) cls += " cur";
      html += '<span class="' + cls + '">' + (passage[i] === " " ? "&nbsp;" : passage[i]) + "</span>";
    }
    el("tt-passage").innerHTML = html;
  }

  function stats() {
    var typed = el("tt-input").value;
    var correct = 0;
    for (var i = 0; i < typed.length && i < passage.length; i++) {
      if (typed[i] === passage[i]) correct++;
    }
    var elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0;
    var wpm = elapsed > 1 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
    var acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    return { typed: typed.length, correct: correct, elapsed: elapsed, wpm: wpm, acc: acc };
  }

  function tick() {
    var s = stats();
    var left = Math.max(0, duration - s.elapsed);
    el("tt-time").textContent = Math.ceil(left) + "s";
    el("tt-wpm").textContent = s.wpm;
    el("tt-acc").textContent = s.acc + "%";
    if (left <= 0 || s.typed >= passage.length) finish();
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (timerInt) clearInterval(timerInt);
    var s = stats();
    el("tt-input").disabled = true;
    el("tt-final-wpm").textContent = s.wpm;
    el("tt-final-acc").textContent = s.acc + "%";
    el("tt-final-chars").textContent = s.correct + " / " + s.typed;
    el("tt-result").style.display = "block";
    el("tt-verdict").textContent =
      s.wpm >= 60 ? "Professional speed — faster than most typists." :
      s.wpm >= 40 ? "Solid everyday speed — right around the average typist." :
      s.wpm >= 25 ? "Getting there — accuracy first, speed follows." :
                    "Early days — slow down, hit the right keys, and speed comes on its own.";
  }

  function reset() {
    if (timerInt) clearInterval(timerInt);
    passage = newPassage();
    startedAt = null;
    finished = false;
    var input = el("tt-input");
    input.value = "";
    input.disabled = false;
    el("tt-time").textContent = duration + "s";
    el("tt-wpm").textContent = "0";
    el("tt-acc").textContent = "100%";
    el("tt-result").style.display = "none";
    renderPassage();
  }

  panel.querySelectorAll("[data-dur]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-dur]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      duration = parseInt(chip.getAttribute("data-dur"), 10) || 30;
      reset();
      el("tt-input").focus();
    });
  });

  el("tt-input").addEventListener("input", function () {
    if (finished) return;
    if (!startedAt) {
      startedAt = Date.now();
      timerInt = setInterval(tick, 200);
    }
    // No pasting a passage in: cap the input at the passage length.
    var v = el("tt-input").value;
    if (v.length > passage.length) el("tt-input").value = v.slice(0, passage.length);
    renderPassage();
    tick();
  });
  el("tt-passage").addEventListener("click", function () { el("tt-input").focus(); });
  el("tt-restart").addEventListener("click", function () { reset(); el("tt-input").focus(); });
  var again = el("tt-again");
  if (again) again.addEventListener("click", function () { reset(); el("tt-input").focus(); });

  reset();
})();
