/* ToolPixi — unit converters + calculators (BMI, percentage, tip) */
// ==== PURE ====
var TP_UNITS = {
  length: { label: "Length", units: { cm: 0.01, m: 1, km: 1000, inches: 0.0254, feet: 0.3048, yards: 0.9144, miles: 1609.344 }, def: ["cm", "inches"] },
  weight: { label: "Weight", units: { kg: 1, g: 0.001, lbs: 0.45359237, oz: 0.0283495231, stone: 6.35029318 }, def: ["kg", "lbs"] },
  temperature: { label: "Temperature", units: { "°C": "c", "°F": "f", K: "k" }, def: ["°C", "°F"], temp: true },
  distance: { label: "Distance", units: { km: 1000, miles: 1609.344, m: 1, feet: 0.3048 }, def: ["km", "miles"] }
};
function tpConvert(catKey, from, to, val) {
  var cat = TP_UNITS[catKey];
  if (cat.temp) {
    var c = from === "°C" ? val : from === "°F" ? (val - 32) * 5 / 9 : val - 273.15;
    return to === "°C" ? c : to === "°F" ? c * 9 / 5 + 32 : c + 273.15;
  }
  return val * cat.units[from] / cat.units[to];
}
function tpFmtNum(n) {
  if (!isFinite(n)) return "—";
  var a = Math.abs(n);
  var s = a !== 0 && (a >= 1e12 || a < 1e-4) ? n.toExponential(4) : String(Math.round(n * 1e6) / 1e6);
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function tpBMI(weightKg, heightCm) {
  var m = heightCm / 100;
  return weightKg / (m * m);
}
function tpBMICategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// ==== DOM: unit converter ====
(function () {
  var panel = document.getElementById("unit-converter");
  if (!panel) return;
  var catSel = document.getElementById("uc-cat"), fromSel = document.getElementById("uc-from"),
      toSel = document.getElementById("uc-to"), valIn = document.getElementById("uc-val");
  function fillUnits() {
    var cat = TP_UNITS[catSel.value];
    var opts = Object.keys(cat.units).map(function (u) { return '<option value="' + u + '">' + u + "</option>"; }).join("");
    fromSel.innerHTML = opts; toSel.innerHTML = opts;
    fromSel.value = cat.def[0]; toSel.value = cat.def[1];
  }
  function run() {
    tpHideError("uc-err");
    var v = parseFloat(valIn.value);
    if (isNaN(v)) { document.getElementById("uc-out").textContent = "—"; return; }
    var out = tpConvert(catSel.value, fromSel.value, toSel.value, v);
    document.getElementById("uc-out").textContent = tpFmtNum(out);
    document.getElementById("uc-formula").textContent =
      tpFmtNum(v) + " " + fromSel.value + " = " + tpFmtNum(out) + " " + toSel.value +
      "  ·  1 " + fromSel.value + " = " + tpFmtNum(tpConvert(catSel.value, fromSel.value, toSel.value, 1)) + " " + toSel.value;
  }
  catSel.innerHTML = Object.keys(TP_UNITS).map(function (k) {
    return '<option value="' + k + '">' + TP_UNITS[k].label + "</option>";
  }).join("");
  fillUnits();
  catSel.addEventListener("change", function () { fillUnits(); run(); });
  [fromSel, toSel].forEach(function (s) { s.addEventListener("change", run); });
  valIn.addEventListener("input", run);
  document.getElementById("uc-swap").addEventListener("click", function () {
    var t = fromSel.value; fromSel.value = toSel.value; toSel.value = t; run();
  });
  // Quick links like ?c=length&from=cm&to=inches&v=10 deep-link specific pairs.
  var qs = new URLSearchParams(location.search);
  if (qs.get("c") && TP_UNITS[qs.get("c")]) {
    catSel.value = qs.get("c"); fillUnits();
    if (qs.get("from")) fromSel.value = qs.get("from");
    if (qs.get("to")) toSel.value = qs.get("to");
    if (qs.get("v")) valIn.value = qs.get("v");
  }
  run();
})();

// ==== DOM: BMI ====
(function () {
  var panel = document.getElementById("bmi-calc");
  if (!panel) return;
  var mode = "metric";
  panel.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-mode]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); mode = b.getAttribute("data-mode");
      document.getElementById("bmi-metric").style.display = mode === "metric" ? "" : "none";
      document.getElementById("bmi-imperial").style.display = mode === "imperial" ? "" : "none";
    });
  });
  document.getElementById("bmi-go").addEventListener("click", function () {
    tpHideError("bmi-err");
    var kg, cm;
    if (mode === "metric") {
      kg = parseFloat(document.getElementById("bmi-kg").value);
      cm = parseFloat(document.getElementById("bmi-cm").value);
    } else {
      var ft = parseFloat(document.getElementById("bmi-ft").value || 0);
      var inch = parseFloat(document.getElementById("bmi-in").value || 0);
      var lbs = parseFloat(document.getElementById("bmi-lbs").value);
      cm = (ft * 12 + inch) * 2.54; kg = lbs * 0.45359237;
    }
    if (!kg || !cm || kg <= 0 || cm <= 0) { tpShowError("bmi-err", "Enter a valid weight and height."); return; }
    var bmi = tpBMI(kg, cm);
    var cat = tpBMICategory(bmi);
    document.getElementById("bmi-value").textContent = bmi.toFixed(1);
    document.getElementById("bmi-cat").textContent = cat;
    var lo = 18.5 * Math.pow(cm / 100, 2), hi = 24.9 * Math.pow(cm / 100, 2);
    document.getElementById("bmi-range").textContent =
      "For your height, the usual healthy range is about " + lo.toFixed(1) + "–" + hi.toFixed(1) + " kg (" +
      (lo / 0.45359237).toFixed(0) + "–" + (hi / 0.45359237).toFixed(0) + " lb).";
    document.getElementById("bmi-result").classList.add("show");
  });
})();

// ==== DOM: percentage calculator ====
(function () {
  var panel = document.getElementById("pct-calc");
  if (!panel) return;
  function num(id) { return parseFloat(document.getElementById(id).value); }
  document.getElementById("pct-go1").addEventListener("click", function () {
    var p = num("pct-p1"), v = num("pct-v1");
    document.getElementById("pct-r1").textContent = (isNaN(p) || isNaN(v)) ? "—" : tpFmtNum(p / 100 * v);
  });
  document.getElementById("pct-go2").addEventListener("click", function () {
    var a = num("pct-a2"), b = num("pct-b2");
    document.getElementById("pct-r2").textContent = (isNaN(a) || isNaN(b) || b === 0) ? "—" : tpFmtNum(a / b * 100) + "%";
  });
  document.getElementById("pct-go3").addEventListener("click", function () {
    var a = num("pct-a3"), b = num("pct-b3");
    document.getElementById("pct-r3").textContent = (isNaN(a) || isNaN(b) || a === 0) ? "—" :
      tpFmtNum((b - a) / a * 100) + "% " + (b >= a ? "increase" : "decrease");
  });
})();

// ==== DOM: tip calculator ====
(function () {
  var panel = document.getElementById("tip-calc");
  if (!panel) return;
  var tipPct = 15;
  panel.querySelectorAll("[data-tip]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-tip]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      tipPct = parseFloat(chip.getAttribute("data-tip"));
      if (tipPct === -1) { document.getElementById("tip-custom").style.display = ""; }
      else document.getElementById("tip-custom").style.display = "none";
      run();
    });
  });
  function run() {
    var bill = parseFloat(document.getElementById("tip-bill").value);
    var people = Math.max(1, parseInt(document.getElementById("tip-people").value, 10) || 1);
    var pct = tipPct === -1 ? (parseFloat(document.getElementById("tip-custom").value) || 0) : tipPct;
    if (isNaN(bill) || bill < 0) {
      document.getElementById("tip-per").textContent = "—";
      return;
    }
    var tip = bill * pct / 100, total = bill + tip;
    document.getElementById("tip-amt").textContent = tpFmtNum(Math.round(tip * 100) / 100);
    document.getElementById("tip-total").textContent = tpFmtNum(Math.round(total * 100) / 100);
    document.getElementById("tip-per").textContent = tpFmtNum(Math.round(total / people * 100) / 100);
    document.getElementById("tip-result").classList.add("show");
  }
  ["tip-bill", "tip-people", "tip-custom"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", run);
  });
})();

// ==== PURE: discount + loan maths ====
function tpDiscount(price, pctOff, taxPct) {
  var off = price * pctOff / 100;
  var after = price - off;
  var tax = after * (taxPct || 0) / 100;
  return { off: off, afterDiscount: after, tax: tax, final: after + tax, saved: off };
}
function tpLoan(principal, annualRatePct, years) {
  var n = Math.round(years * 12);
  var r = annualRatePct / 1200;
  if (n <= 0 || principal <= 0) return { monthly: 0, totalPaid: 0, totalInterest: 0, payments: 0 };
  var monthly = r === 0 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
  var total = monthly * n;
  return { monthly: monthly, totalPaid: total, totalInterest: total - principal, payments: n };
}
function tpMoney(n) {
  if (!isFinite(n)) return "—";
  return tpFmtNum(Math.round(n * 100) / 100);
}

// ==== DOM: discount calculator ====
(function () {
  var panel = document.getElementById("discount-calc");
  if (!panel) return;
  function run() {
    var price = parseFloat(document.getElementById("ds-price").value);
    var off = parseFloat(document.getElementById("ds-off").value);
    var tax = parseFloat(document.getElementById("ds-tax").value) || 0;
    var res = document.getElementById("ds-result");
    if (isNaN(price) || isNaN(off) || price < 0 || off < 0 || off > 100) {
      document.getElementById("ds-final").textContent = "—";
      res.classList.remove("show");
      return;
    }
    var d = tpDiscount(price, off, tax);
    document.getElementById("ds-orig").textContent = tpMoney(price);
    document.getElementById("ds-offamt").textContent = "− " + tpMoney(d.off) + " (" + tpFmtNum(off) + "% off)";
    document.getElementById("ds-after").textContent = tpMoney(d.afterDiscount);
    document.getElementById("ds-taxamt").textContent = tax > 0 ? "+ " + tpMoney(d.tax) : "—";
    document.getElementById("ds-final").textContent = tpMoney(d.final);
    document.getElementById("ds-saved").textContent = "You save " + tpMoney(d.saved) + " before tax.";
    res.classList.add("show");
  }
  ["ds-price", "ds-off", "ds-tax"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", run);
  });
  run();
})();

// ==== DOM: loan / EMI calculator ====
(function () {
  var panel = document.getElementById("loan-calc");
  if (!panel) return;
  function run() {
    tpHideError("ln-err");
    var amt = parseFloat(document.getElementById("ln-amount").value);
    var rate = parseFloat(document.getElementById("ln-rate").value);
    var years = parseFloat(document.getElementById("ln-years").value);
    if (isNaN(amt) || isNaN(rate) || isNaN(years) || amt <= 0 || rate < 0 || years <= 0) {
      tpShowError("ln-err", "Enter the amount, the yearly interest rate and the loan length in years.");
      document.getElementById("ln-result").classList.remove("show");
      return;
    }
    var L = tpLoan(amt, rate, years);
    document.getElementById("ln-monthly").textContent = tpMoney(L.monthly);
    document.getElementById("ln-interest").textContent = tpMoney(L.totalInterest);
    document.getElementById("ln-total").textContent = tpMoney(L.totalPaid);
    document.getElementById("ln-count").textContent = L.payments + " monthly payments";
    document.getElementById("ln-result").classList.add("show");
  }
  document.getElementById("ln-go").addEventListener("click", run);
  ["ln-amount", "ln-rate", "ln-years"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      // Live-update only once every field has a value, so a half-typed
      // form never flashes the error message.
      var ids = ["ln-amount", "ln-rate", "ln-years"];
      var allFilled = ids.every(function (i) { return document.getElementById(i).value !== ""; });
      if (allFilled) run();
    });
  });
})();
