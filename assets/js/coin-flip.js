/* Coin Flip — ToolPixi (added 2026-11-24, SEO push Tool #11).
   Flips a virtual coin — heads or tails — with flip history, running
   heads/tails counts and the current streak. The result is decided with
   your browser's crypto-grade random source before the flip animation
   finishes, so the animation is only the reveal. Runs entirely in the
   browser; nothing is uploaded or stored. */
(function () {
  var panel = document.getElementById("coin-flip");
  if (!panel) return;

  var coinEl = document.getElementById("cf-coin");
  var flipBtn = document.getElementById("cf-flip");
  var flip10Btn = document.getElementById("cf-flip10");
  var clearBtn = document.getElementById("cf-clear");
  var resultEl = document.getElementById("cf-result");
  var outEl = document.getElementById("cf-out");
  var metaEl = document.getElementById("cf-meta");
  var headsEl = document.getElementById("cf-heads");
  var tailsEl = document.getElementById("cf-tails");
  var streakEl = document.getElementById("cf-streak");
  var historyEl = document.getElementById("cf-history");
  var errBox = "cf-err";

  var history = []; /* newest first, "H" or "T" */
  var heads = 0;
  var tails = 0;
  var streakSide = null; /* "H" or "T" */
  var streakLen = 0;
  var spinning = false;

  function randBit() {
    if (window.crypto && crypto.getRandomValues) {
      var a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] % 2;
    }
    return Math.floor(Math.random() * 2);
  }

  function flipOnce() {
    return randBit() === 0 ? "H" : "T";
  }

  function render() {
    headsEl.textContent = String(heads);
    tailsEl.textContent = String(tails);
    streakEl.textContent = streakLen === 0 ? "—" : (streakSide === "H" ? "Heads" : "Tails") + " × " + streakLen;
    var items = history.slice(0, 20).map(function (s) {
      return "<li>" + (s === "H" ? "Heads" : "Tails") + "</li>";
    }).join("");
    historyEl.innerHTML = items;
  }

  function record(side) {
    history.unshift(side);
    if (history.length > 20) history.length = 20;
    if (side === "H") heads++; else tails++;
    if (side === streakSide) {
      streakLen++;
    } else {
      streakSide = side;
      streakLen = 1;
    }
  }

  function showResult(side) {
    coinEl.textContent = side === "H" ? "H" : "T";
    coinEl.classList.remove("cf-heads", "cf-tails");
    coinEl.classList.add(side === "H" ? "cf-heads" : "cf-tails");
    outEl.textContent = side === "H" ? "Heads!" : "Tails!";
    var total = heads + tails;
    metaEl.textContent = "Flip " + total + " — " + heads + " heads, " + tails + " tails"
      + (total > 0 ? " (" + Math.round(heads / total * 100) + "% heads so far)" : "");
    resultEl.classList.add("show");
    render();
  }

  function doFlip() {
    if (spinning) return;
    tpHideError(errBox);
    var side = flipOnce(); /* decided now; the animation only reveals it */
    spinning = true;
    flipBtn.disabled = true;
    flip10Btn.disabled = true;
    coinEl.classList.add("cf-spinning");
    outEl.textContent = "Flipping…";
    resultEl.classList.add("show");
    setTimeout(function () {
      coinEl.classList.remove("cf-spinning");
      record(side);
      showResult(side);
      spinning = false;
      flipBtn.disabled = false;
      flip10Btn.disabled = false;
    }, 650);
  }

  flipBtn.addEventListener("click", doFlip);

  flip10Btn.addEventListener("click", function () {
    if (spinning) return;
    tpHideError(errBox);
    var i, side;
    for (i = 0; i < 10; i++) {
      side = flipOnce();
      record(side);
    }
    var last = history[0];
    coinEl.textContent = last === "H" ? "H" : "T";
    coinEl.classList.remove("cf-heads", "cf-tails");
    coinEl.classList.add(last === "H" ? "cf-heads" : "cf-tails");
    outEl.textContent = "Last of 10 flips: " + (last === "H" ? "Heads" : "Tails");
    var total = heads + tails;
    metaEl.textContent = "10 flips added — " + heads + " heads, " + tails + " tails in total"
      + " (" + Math.round(heads / total * 100) + "% heads so far)";
    resultEl.classList.add("show");
    render();
  });

  clearBtn.addEventListener("click", function () {
    history = [];
    heads = 0;
    tails = 0;
    streakSide = null;
    streakLen = 0;
    coinEl.textContent = "?";
    coinEl.classList.remove("cf-heads", "cf-tails");
    outEl.textContent = "—";
    metaEl.textContent = "";
    resultEl.classList.remove("show");
    render();
  });

  render();
})();
