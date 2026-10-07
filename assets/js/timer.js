/* ToolPixi — countdown timer (WebAudio alarm) + stopwatch + random number generator */
// ==== PURE ====
function tpFmtClock(totalSeconds) {
  totalSeconds = Math.max(0, Math.ceil(totalSeconds));
  var h = Math.floor(totalSeconds / 3600), m = Math.floor(totalSeconds / 60) % 60, s = totalSeconds % 60;
  function p(n) { return (n < 10 ? "0" : "") + n; }
  return (h > 0 ? p(h) + ":" : "") + p(m) + ":" + p(s);
}
function tpRandomInts(min, max, count, unique) {
  var out = [], seen = {};
  var range = max - min + 1;
  if (unique && count > range) count = range;
  var guard = 0;
  while (out.length < count && guard < 10000) {
    guard++;
    var n = min + Math.floor(Math.random() * range);
    if (unique) { if (seen[n]) continue; seen[n] = 1; }
    out.push(n);
  }
  return out;
}

// ==== DOM: countdown timer ====
(function () {
  var panel = document.getElementById("timer-tool");
  if (!panel) return;
  var total = 300, remaining = 300, tickId = null, audioCtx = null, alarmId = null;
  var face = document.getElementById("tm-face"), bar = document.getElementById("tm-bar");
  function draw() {
    face.textContent = tpFmtClock(remaining);
    bar.style.width = total > 0 ? ((1 - remaining / total) * 100) + "%" : "0%";
  }
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var t = audioCtx.currentTime;
      for (var i = 0; i < 3; i++) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "sine"; o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, t + i * 0.35);
        g.gain.exponentialRampToValueAtTime(0.35, t + i * 0.35 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.35 + 0.28);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t + i * 0.35); o.stop(t + i * 0.35 + 0.3);
      }
    } catch (e) { /* audio unavailable — the flashing face still signals time-up */ }
  }
  function stopAlarm() { if (alarmId) { clearInterval(alarmId); alarmId = null; } }
  function finish() {
    clearInterval(tickId); tickId = null;
    remaining = 0; draw();
    face.textContent = "00:00";
    document.getElementById("tm-done").style.display = "block";
    beep(); alarmId = setInterval(beep, 2400);
    document.getElementById("tm-start").textContent = "Start";
  }
  function setFromInputs() {
    var h = parseInt(document.getElementById("tm-h").value, 10) || 0;
    var m = parseInt(document.getElementById("tm-m").value, 10) || 0;
    var s = parseInt(document.getElementById("tm-s").value, 10) || 0;
    total = Math.max(0, h * 3600 + m * 60 + s); remaining = total; draw();
  }
  panel.querySelectorAll("[data-min]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var mins = parseInt(chip.getAttribute("data-min"), 10);
      document.getElementById("tm-h").value = Math.floor(mins / 60);
      document.getElementById("tm-m").value = mins % 60;
      document.getElementById("tm-s").value = 0;
      setFromInputs();
    });
  });
  ["tm-h", "tm-m", "tm-s"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () { if (!tickId) setFromInputs(); });
  });
  document.getElementById("tm-start").addEventListener("click", function () {
    stopAlarm();
    document.getElementById("tm-done").style.display = "none";
    if (tickId) { clearInterval(tickId); tickId = null; this.textContent = "Resume"; return; }
    if (remaining <= 0) setFromInputs();
    if (remaining <= 0) { tpShowError("tm-err", "Set a time first — use the presets or type minutes and seconds."); return; }
    tpHideError("tm-err");
    this.textContent = "Pause";
    var last = Date.now();
    tickId = setInterval(function () {
      var now = Date.now();
      remaining -= (now - last) / 1000; last = now;
      if (remaining <= 0) { finish(); return; }
      draw();
    }, 200);
  });
  document.getElementById("tm-reset").addEventListener("click", function () {
    if (tickId) { clearInterval(tickId); tickId = null; }
    stopAlarm();
    document.getElementById("tm-done").style.display = "none";
    document.getElementById("tm-start").textContent = "Start";
    setFromInputs();
  });
  setFromInputs();

  // ---- stopwatch ----
  var swStart = 0, swElapsed = 0, swId = null;
  var swFace = document.getElementById("sw-face");
  function swDraw() {
    var t = swElapsed / 1000;
    var m = Math.floor(t / 60), s = Math.floor(t % 60), cs = Math.floor((t % 1) * 100);
    function p(n) { return (n < 10 ? "0" : "") + n; }
    swFace.textContent = p(m) + ":" + p(s) + "." + p(cs);
  }
  document.getElementById("sw-start").addEventListener("click", function () {
    if (swId) {
      clearInterval(swId); swId = null; swElapsed += Date.now() - swStart;
      this.textContent = "Resume"; return;
    }
    swStart = Date.now(); this.textContent = "Pause";
    swId = setInterval(function () {
      var cur = swElapsed + (Date.now() - swStart);
      var t = cur / 1000;
      var m = Math.floor(t / 60), s = Math.floor(t % 60), cs = Math.floor((t % 1) * 100);
      function p(n) { return (n < 10 ? "0" : "") + n; }
      swFace.textContent = p(m) + ":" + p(s) + "." + p(cs);
    }, 31);
  });
  document.getElementById("sw-lap").addEventListener("click", function () {
    var cur = swId ? swElapsed + (Date.now() - swStart) : swElapsed;
    var li = document.createElement("div");
    li.className = "fi";
    li.innerHTML = '<span class="nm">Lap</span><span class="sz">' + swFace.textContent + "</span>";
    document.getElementById("sw-laps").prepend(li);
  });
  document.getElementById("sw-reset").addEventListener("click", function () {
    if (swId) { clearInterval(swId); swId = null; }
    swElapsed = 0; swDraw();
    document.getElementById("sw-laps").innerHTML = "";
    document.getElementById("sw-start").textContent = "Start";
  });
  swDraw();
})();

// ==== DOM: random number generator ====
(function () {
  var panel = document.getElementById("rng-tool");
  if (!panel) return;
  function run() {
    tpHideError("rng-err");
    var min = parseInt(document.getElementById("rng-min").value, 10);
    var max = parseInt(document.getElementById("rng-max").value, 10);
    var count = parseInt(document.getElementById("rng-count").value, 10) || 1;
    var unique = document.getElementById("rng-unique").checked;
    var sort = document.getElementById("rng-sort").checked;
    if (isNaN(min) || isNaN(max)) { tpShowError("rng-err", "Enter both a lowest and a highest number."); return; }
    if (min > max) { var t = min; min = max; max = t; }
    count = Math.min(1000, Math.max(1, count));
    var nums = tpRandomInts(min, max, count, unique);
    if (sort) nums.sort(function (a, b) { return a - b; });
    document.getElementById("rng-out").textContent = nums.join(",  ");
    document.getElementById("rng-meta").textContent = nums.length + " number(s) between " + min + " and " + max + (unique ? ", no repeats" : "");
    document.getElementById("rng-result").classList.add("show");
  }
  document.getElementById("rng-go").addEventListener("click", run);
  run();
})();
