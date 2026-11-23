/* Spin the Wheel — ToolPixi (added 2026-11-23, SEO push Tool #9).
   Custom wheel spinner: draws the entries on a canvas, spins with an
   ease-out animation and lands on a crypto-randomly chosen winner.
   Runs entirely in the browser; nothing is uploaded or stored. */
(function () {
  var panel = document.getElementById("spin-the-wheel");
  if (!panel) return;

  var canvas = document.getElementById("sw-canvas");
  var ctx = canvas.getContext("2d");
  var entriesEl = document.getElementById("sw-entries");
  var spinBtn = document.getElementById("sw-spin");
  var resultEl = document.getElementById("sw-result");
  var winnerEl = document.getElementById("sw-winner");
  var historyEl = document.getElementById("sw-history");
  var clearBtn = document.getElementById("sw-clear");
  var removeChk = document.getElementById("sw-remove");
  var countEl = document.getElementById("sw-count");
  var errBox = "sw-err";

  var COLORS = ["#0d7377", "#12a594", "#ff6a3d", "#f5b301", "#7c3aed",
                "#2563eb", "#db2777", "#059669", "#ea580c", "#0891b2",
                "#be185d", "#65a30d"];
  var CX = 180, CY = 180, R = 172;
  var POINTER = -Math.PI / 2; /* pointer sits at the top of the wheel */
  var rotation = 0;
  var spinning = false;

  var PRESETS = {
    names: ["Alice", "Ben", "Carol", "Dave", "Eve", "Frank", "Grace", "Hassan"],
    yesno: ["Yes", "No"],
    numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    coin: ["Heads", "Tails"]
  };

  function entries() {
    return entriesEl.value.split("\n").map(function (s) {
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

  function draw() {
    var list = entries();
    ctx.clearRect(0, 0, 360, 360);
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " choice" : " choices");
    if (list.length < 2) {
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = "#f3f4f6";
      ctx.fill();
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#6b7280";
      ctx.font = "15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Add at least 2 choices", CX, CY - 4);
      ctx.fillText("one per line, to spin", CX, CY + 18);
      return;
    }
    var step = Math.PI * 2 / list.length;
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(rotation);
    for (var i = 0; i < list.length; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, i * step, (i + 1) * step);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.rotate(i * step + step / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px system-ui, sans-serif";
      var label = list[i].length > 14 ? list[i].slice(0, 13) + "…" : list[i];
      ctx.fillText(label, R - 12, 5);
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(CX, CY, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#0d7377";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#0d7377";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPIN", CX, CY + 5);
  }

  function winnerIndexFor(angle) {
    var list = entries();
    var step = Math.PI * 2 / list.length;
    var rel = ((POINTER - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(rel / step);
  }

  function addHistory(text) {
    var li = document.createElement("li");
    li.textContent = text;
    historyEl.insertBefore(li, historyEl.firstChild);
    while (historyEl.children.length > 20) {
      historyEl.removeChild(historyEl.lastChild);
    }
  }

  function spin() {
    if (spinning) return;
    tpHideError(errBox);
    var list = entries();
    if (list.length < 2) {
      tpShowError(errBox, "Add at least 2 choices — one per line — before you spin.");
      return;
    }
    if (list.length > 24) {
      tpShowError(errBox, "The wheel holds up to 24 choices — please trim the list to 24 or fewer.");
      return;
    }
    var bad = list.filter(function (s) { return s.length > 40; });
    if (bad.length) {
      tpShowError(errBox, "Keep each choice under 40 characters so it fits on the wheel.");
      return;
    }
    var winner = randInt(list.length);
    var step = Math.PI * 2 / list.length;
    /* Final rotation: winner segment centre lands under the top pointer. */
    var delta = ((POINTER - (winner + 0.5) * step - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    var startRot = rotation;
    var total = Math.PI * 2 * 5 + delta;
    var start = null;
    var DURATION = 4200;
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning…";
    winnerEl.textContent = "…";
    resultEl.classList.add("show");

    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / DURATION, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      rotation = startRot + total * eased;
      draw();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = "Spin the wheel";
        var landed = winnerIndexFor(rotation);
        var name = list[landed];
        winnerEl.textContent = name;
        addHistory(name);
        if (removeChk && removeChk.checked && list.length > 2) {
          var remaining = entries();
          remaining.splice(landed, 1);
          entriesEl.value = remaining.join("\n");
          draw();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  var presetRow = document.getElementById("sw-presets");
  if (presetRow) {
    presetRow.addEventListener("click", function (e) {
      var btn = e.target;
      if (btn && btn.classList && btn.classList.contains("chip")) {
        var chips = presetRow.getElementsByClassName("chip");
        for (var i = 0; i < chips.length; i++) chips[i].classList.remove("on");
        btn.classList.add("on");
        var key = btn.getAttribute("data-preset");
        if (PRESETS[key]) entriesEl.value = PRESETS[key].join("\n");
        tpHideError(errBox);
        draw();
      }
    });
  }
  entriesEl.addEventListener("input", function () { draw(); });
  spinBtn.addEventListener("click", spin);
  clearBtn.addEventListener("click", function () {
    historyEl.innerHTML = "";
    winnerEl.textContent = "—";
  });
  draw();
})();
