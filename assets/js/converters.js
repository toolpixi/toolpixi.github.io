/* ToolPixi — unit converters + calculators (BMI, percentage, tip) */
// ==== PURE ====
var TP_UNITS = {
  length: { label: "Length", units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inches: 0.0254, feet: 0.3048, yards: 0.9144, miles: 1609.344 }, def: ["cm", "inches"] },
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
  // Group only the integer part: grouping the whole string inserts a comma
  // inside the decimals ("0.984,252"). Fixed 2026-11-16.
  var parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
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
  return "$" + tpFmtNum(Math.round(n * 100) / 100);
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

// ==== PURE: calorie + grade + number-base maths ====
// Mifflin-St Jeor — the most validated BMR formula. Returns kcal/day.
function tpBMR(sex, weightKg, heightCm, ageYears) {
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + (sex === "m" ? 5 : -161);
}
var TP_ACTIVITY = [
  ["Sedentary (little exercise)", 1.2],
  ["Light (1–3 days/week)", 1.375],
  ["Moderate (3–5 days/week)", 1.55],
  ["Active (6–7 days/week)", 1.725],
  ["Very active (hard exercise + physical job)", 1.9]
];
function tpLetterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
/* Number bases: decimal <-> binary <-> hex. Decimal limited to safe integers. */
function tpParseBase(str, base) {
  var t = String(str || "").trim().toLowerCase().replace(/^0x/, "");
  if (!t) return null;
  var re = base === 2 ? /^[01]+$/ : base === 16 ? /^[0-9a-f]+$/ : /^-?\d+$/;
  if (!re.test(t)) return null;
  var n = base === 10 ? Number(t) : parseInt(t, base);
  if (!isFinite(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER) return null;
  return n;
}
function tpDecimalSteps(n) {
  // Repeated-division-by-2 steps for "how the conversion works".
  var rows = [], v = Math.abs(n);
  if (v === 0) return [["0 ÷ 2", "0", "0"]];
  while (v > 0) { rows.push([v + " ÷ 2", String(Math.floor(v / 2)), String(v % 2)]); v = Math.floor(v / 2); }
  return rows;
}
function tpBinaryPlaceValues(bin) {
  // Each 1-bit with its place value, e.g. bit 3 -> 2^3 = 8.
  var rows = [], len = bin.length;
  for (var i = 0; i < len; i++) {
    if (bin[len - 1 - i] === "1") rows.push(["Bit " + i, "2^" + i + " = " + Math.pow(2, i)]);
  }
  return rows.reverse();
}
function tpHexToRgb(hex) {
  var t = String(hex || "").replace(/^#/, "").toLowerCase();
  if (t.length === 3) t = t.split("").map(function (c) { return c + c; }).join("");
  if (!/^[0-9a-f]{6}$/.test(t)) return null;
  return { r: parseInt(t.slice(0, 2), 16), g: parseInt(t.slice(2, 4), 16), b: parseInt(t.slice(4, 6), 16) };
}

// ==== DOM: calorie calculator (BMR + TDEE) ====
(function () {
  var panel = document.getElementById("calorie-calc");
  if (!panel) return;
  var mode = "metric";
  panel.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-mode]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); mode = b.getAttribute("data-mode");
      document.getElementById("cal-metric").style.display = mode === "metric" ? "" : "none";
      document.getElementById("cal-imperial").style.display = mode === "imperial" ? "" : "none";
    });
  });
  var actSel = document.getElementById("cal-activity");
  actSel.innerHTML = TP_ACTIVITY.map(function (a, i) {
    return '<option value="' + i + '"' + (i === 2 ? " selected" : "") + ">" + a[0] + "</option>";
  }).join("");
  panel.querySelectorAll("[data-sex]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-sex]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
    });
  });
  function num(id) { return parseFloat(document.getElementById(id).value); }
  function run() {
    tpHideError("cal-err");
    var sex = panel.querySelector('[data-sex].on').getAttribute("data-sex");
    var age = num("cal-age"), kg, cm;
    if (mode === "metric") { kg = num("cal-kg"); cm = num("cal-cm"); }
    else {
      var ft = num("cal-ft") || 0, inch = num("cal-in") || 0, lbs = num("cal-lbs");
      cm = (ft * 12 + inch) * 2.54; kg = lbs * 0.45359237;
    }
    if (!kg || !cm || !age || kg <= 0 || cm <= 0 || age <= 0 || age > 120) {
      tpShowError("cal-err", "Enter a valid age, weight and height.");
      document.getElementById("cal-result").classList.remove("show");
      return;
    }
    var bmr = tpBMR(sex, kg, cm, age);
    var mult = TP_ACTIVITY[parseInt(actSel.value, 10)][1];
    var tdee = bmr * mult;
    document.getElementById("cal-bmr").textContent = Math.round(bmr).toLocaleString() + " kcal/day";
    document.getElementById("cal-tdee").textContent =
      Math.round(tdee * 0.9).toLocaleString() + "–" + Math.round(tdee * 1.1).toLocaleString() + " kcal/day";
    document.getElementById("cal-lose").textContent = Math.round(tdee - 500).toLocaleString() + " kcal/day (steady ~0.5 kg/week loss)";
    document.getElementById("cal-keep").textContent = Math.round(tdee).toLocaleString() + " kcal/day (stay about the same weight)";
    document.getElementById("cal-gain").textContent = Math.round(tdee + 300).toLocaleString() + " kcal/day (slow, mostly-muscle gain)";
    document.getElementById("cal-result").classList.add("show");
  }
  document.getElementById("cal-go").addEventListener("click", run);
  actSel.addEventListener("change", function () {
    if (document.getElementById("cal-age").value) run();
  });
})();

// ==== DOM: grade calculator (weighted + "what do I need on the final?") ====
(function () {
  var panel = document.getElementById("grade-calc");
  if (!panel) return;
  var rowsEl = document.getElementById("gr-rows");
  function addRow(name, grade, weight) {
    var div = document.createElement("div");
    div.className = "row gr-row";
    div.innerHTML =
      '<div class="field"><label>Item <span class="hint">(e.g. midterm)</span></label><input type="text" class="gr-name" placeholder="Homework, exam…"></div>' +
      '<div class="field"><label>Grade (%)</label><input type="number" class="gr-grade" min="0" max="100" step="any" placeholder="85"></div>' +
      '<div class="field"><label>Weight (%)</label><input type="number" class="gr-weight" min="0" step="any" placeholder="20"></div>' +
      '<div class="field"><label>&nbsp;</label><button class="btn ghost small gr-del" type="button">Remove</button></div>';
    if (name !== undefined) div.querySelector(".gr-name").value = name;
    if (grade !== undefined) div.querySelector(".gr-grade").value = grade;
    if (weight !== undefined) div.querySelector(".gr-weight").value = weight;
    div.querySelector(".gr-del").addEventListener("click", function () { div.remove(); run(); });
    rowsEl.appendChild(div);
    div.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", run); });
  }
  document.getElementById("gr-add").addEventListener("click", function () { addRow(); });
  function run() {
    tpHideError("gr-err");
    var gs = rowsEl.querySelectorAll(".gr-grade"), ws = rowsEl.querySelectorAll(".gr-weight");
    var sw = 0, swg = 0, n = 0;
    for (var i = 0; i < gs.length; i++) {
      var g = parseFloat(gs[i].value), w = parseFloat(ws[i].value);
      if (isNaN(g) || isNaN(w)) continue;
      n++; sw += w; swg += g * w;
    }
    // The weighted average and the "what do I need on the final?" sections
    // are independent: the final-exam answer must work even when no grade
    // rows are filled in. (Previously run() returned early when n === 0 and
    // the final-exam block silently never updated. Fixed 2026-11-16.)
    var hasRows = n > 0 && sw > 0;
    if (hasRows) {
      var avg = swg / sw;
      document.getElementById("gr-avg").textContent = avg.toFixed(1) + "% — " + tpLetterGrade(avg);
      document.getElementById("gr-note").textContent = "Weights total " + sw.toFixed(0) +
        "% across " + n + " item" + (n === 1 ? "" : "s") + ".";
    } else {
      document.getElementById("gr-avg").textContent = "—";
      document.getElementById("gr-note").textContent = "Add at least one graded item above to see your weighted average.";
    }
    // "What do I need on the final?"
    var cur = parseFloat(document.getElementById("gr-current").value);
    var want = parseFloat(document.getElementById("gr-want").value);
    var fw = parseFloat(document.getElementById("gr-fweight").value);
    var fmsg = document.getElementById("gr-final-msg");
    if (!isNaN(cur) && !isNaN(want) && !isNaN(fw) && fw > 0 && fw < 100) {
      var need = (want - cur * (1 - fw / 100)) / (fw / 100);
      if (need <= 0) fmsg.textContent = "You already have " + want + "% locked in — no final-exam score needed for it.";
      else if (need > 100) fmsg.textContent = "You would need " + need.toFixed(1) +
        "% on the final — above 100%, so that target is not reachable. Lower the target or raise earlier grades.";
      else fmsg.textContent = "You need " + need.toFixed(1) + "% on the final exam to finish with " + want + "%.";
    } else {
      fmsg.textContent = "Fill in current grade, desired grade and the final's weight to see the score you need.";
    }
    document.getElementById("gr-result").classList.add("show");
  }
  document.getElementById("gr-go").addEventListener("click", run);
  ["gr-current", "gr-want", "gr-fweight"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", run);
  });
  addRow("Homework", "", 20); addRow("Midterm", "", 30); addRow("Final exam", "", 50);
  run();
})();

// ==== DOM: binary converter ====
(function () {
  var panel = document.getElementById("binary-converter");
  if (!panel) return;
  var baseSel = document.getElementById("bn-base");
  function run() {
    tpHideError("bn-err");
    var base = parseInt(baseSel.value, 10);
    var n = tpParseBase(document.getElementById("bn-in").value, base);
    var res = document.getElementById("bn-result");
    if (n === null) {
      res.classList.remove("show");
      if (document.getElementById("bn-in").value.trim())
        tpShowError("bn-err", "That is not a valid " +
          (base === 2 ? "binary (use only 0 and 1)" : base === 16 ? "hexadecimal (0–9 and A–F)" : "decimal") + " number.");
      return;
    }
    var neg = n < 0, av = Math.abs(n);
    var bin = av.toString(2), hex = av.toString(16).toUpperCase();
    document.getElementById("bn-bin").textContent = (neg ? "-" : "") + bin;
    document.getElementById("bn-dec").textContent = (neg ? "-" : "") + av.toLocaleString();
    document.getElementById("bn-hex").textContent = (neg ? "-" : "") + hex;
    // Step-by-step working
    var stepsEl = document.getElementById("bn-steps");
    var html = "";
    if (base === 10) {
      html = "<h3>How " + av + " becomes binary</h3><p class=\"note\">Divide by 2 again and again; the remainders, read bottom to top, are the binary digits.</p><table>" +
        "<tr><th>Step</th><th>Quotient</th><th>Remainder</th></tr>" +
        tpDecimalSteps(n).map(function (r) {
          return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td><strong>" + r[2] + "</strong></td></tr>";
        }).join("") + "</table><p class=\"note\">Read the remainders upwards: <strong>" + bin + "</strong></p>";
    } else if (base === 2) {
      html = "<h3>How binary becomes decimal</h3><p class=\"note\">Every 1-bit adds its place value (a power of 2).</p><table>" +
        "<tr><th>1-bit position</th><th>Place value</th></tr>" +
        (tpBinaryPlaceValues(bin).map(function (r) {
          return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>";
        }).join("") || "<tr><td colspan=\"2\">All bits are 0, so the value is 0.</td></tr>") +
        "</table><p class=\"note\">Add them up: <strong>" + av.toLocaleString() + "</strong></p>";
    } else {
      html = "<h3>Why hex is a handy shortcut</h3><p class=\"note\">Hexadecimal is base 16 — each hex digit is exactly 4 binary bits. " +
        "Convert hex → binary by expanding each digit, or hex → decimal by place values of 16. The boxes above show all three forms of your number.</p>";
    }
    stepsEl.innerHTML = html;
    res.classList.add("show");
  }
  document.getElementById("bn-go").addEventListener("click", run);
  baseSel.addEventListener("change", run);
  document.getElementById("bn-in").addEventListener("input", run);
  run();
})();

// ==== DOM: hex converter ====
(function () {
  var panel = document.getElementById("hex-converter");
  if (!panel) return;
  function run() {
    tpHideError("hx-err");
    var raw = document.getElementById("hx-in").value;
    var res = document.getElementById("hx-result");
    if (!raw.trim()) { res.classList.remove("show"); return; }
    var n = tpParseBase(raw, 16);
    if (n === null) {
      res.classList.remove("show");
      tpShowError("hx-err", "That is not a valid hexadecimal number (use 0–9 and A–F; you may include the 0x prefix).");
      return;
    }
    var av = Math.abs(n);
    document.getElementById("hx-hex").textContent = av.toString(16).toUpperCase();
    document.getElementById("hx-dec").textContent = av.toLocaleString();
    document.getElementById("hx-bin").textContent = av.toString(2);
    // RGB colour card (only for 6-digit hex)
    var t = raw.trim().replace(/^0x/i, "").replace(/^#/, "");
    var rgb = tpHexToRgb(t);
    var card = document.getElementById("hx-rgb-card");
    if (rgb) {
      card.style.display = "";
      document.getElementById("hx-rgb-val").textContent = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
      document.getElementById("hx-rgb-sw").style.background = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
    } else {
      card.style.display = "none";
    }
    res.classList.add("show");
  }
  document.getElementById("hx-go").addEventListener("click", run);
  document.getElementById("hx-in").addEventListener("input", run);
  run();
})();

/* Compound interest projection.
   Assumptions (stated honestly in the FAQ): the rate stays constant;
   monthly contributions are added at the END of each compounding period,
   so they earn interest starting the following period; results are nominal
   (no tax, no inflation). Years capped at 100 to keep the table sane. */
function tpCompound(principal, ratePct, years, freq, monthly) {
  var r = Math.max(0, ratePct) / 100;
  var n = Math.max(1, Math.min(100, Math.floor(years)));
  var f = Math.max(1, freq);
  var c = Math.max(0, monthly);
  var per = r / f;                 /* rate applied per compounding period */
  var addPer = c * 12 / f;         /* year's monthly contributions, spread per period */
  var balance = principal;
  var rows = [];
  var i, y;
  for (y = 1; y <= n; y++) {
    var start = balance, contrib = 0, interest = 0;
    var periods = Math.round(f);   /* periods per year */
    for (i = 0; i < periods; i++) {
      var earned = balance * per;
      interest += earned;
      balance += earned;
      balance += addPer;           /* contributions at end of each period */
      contrib += addPer;
    }
    rows.push({ year: y, start: start, contrib: contrib, interest: interest, end: balance });
  }
  var putIn = principal + c * 12 * n;
  var totalInterest = balance - putIn;
  return { final: balance, putIn: putIn, interest: totalInterest, rows: rows };
}

(function () {
  var panel = document.getElementById("compound-calc");
  if (!panel) return;
  function render() {
    var principal = parseFloat(document.getElementById("ci-principal").value);
    var rate = parseFloat(document.getElementById("ci-rate").value);
    var years = parseInt(document.getElementById("ci-years").value, 10);
    var monthly = parseFloat(document.getElementById("ci-contrib").value);
    var freq = parseInt(document.getElementById("ci-freq").value, 10);
    if (isNaN(principal) || principal < 0 ||
        isNaN(rate) || rate < 0 || rate > 100 ||
        isNaN(years) || years < 1 || years > 100 ||
        isNaN(monthly) || monthly < 0 ||
        isNaN(freq) || freq < 1) {
      tpShowError("ci-err", "Please check your inputs: amounts can't be negative, rate 0–100, years 1–100.");
      return;
    }
    tpHideError("ci-err");
    var out = tpCompound(principal, rate, years, freq, monthly);
    document.getElementById("ci-final").textContent = tpMoney(out.final);
    document.getElementById("ci-putin").textContent = tpMoney(out.putIn);
    document.getElementById("ci-interest").textContent = tpMoney(out.interest);
    var html = "", i, row;
    for (i = 0; i < out.rows.length; i++) {
      row = out.rows[i];
      html += "<tr><td>" + row.year + "</td><td>" + tpMoney(row.start) + "</td><td>" +
        tpMoney(row.contrib) + "</td><td>" + tpMoney(row.interest) + "</td><td>" +
        tpMoney(row.end) + "</td></tr>";
    }
    document.getElementById("ci-tbody").innerHTML = html;
    document.getElementById("ci-result").classList.add("show");
  }
  document.getElementById("ci-go").addEventListener("click", render);
  render();
})();

/* Salary <-> hourly conversion. Annualizes first, then derives all formats.
   Assumes 52 paid weeks per year, constant hours, no overtime, no tax. */
function tpSalary(amount, from, hoursPerWeek, daysPerWeek) {
  var a = Math.max(0, amount);
  var h = hoursPerWeek > 0 ? hoursPerWeek : 40;
  var d = daysPerWeek > 0 ? daysPerWeek : 5;
  var annual;
  if (from === "hourly") annual = a * h * 52;
  else if (from === "daily") annual = a * d * 52;
  else if (from === "weekly") annual = a * 52;
  else if (from === "monthly") annual = a * 12;
  else annual = a;
  return {
    hourly: annual / (h * 52),
    daily: annual / (d * 52),
    weekly: annual / 52,
    monthly: annual / 12,
    annual: annual
  };
}

(function () {
  var panel = document.getElementById("salary-conv");
  if (!panel) return;
  function render() {
    var amount = parseFloat(document.getElementById("sc-amount").value);
    var from = document.getElementById("sc-from").value;
    var hours = parseFloat(document.getElementById("sc-hours").value);
    var days = parseFloat(document.getElementById("sc-days").value);
    if (isNaN(amount) || amount < 0 ||
        isNaN(hours) || hours <= 0 || hours > 100 ||
        isNaN(days) || days <= 0 || days > 7) {
      tpShowError("sc-err", "Please check your inputs: amount can't be negative, hours 1–100 per week, days 1–7 per week.");
      return;
    }
    tpHideError("sc-err");
    var out = tpSalary(amount, from, hours, days);
    document.getElementById("sc-hourly").textContent = "$" + tpFmtNum(Math.round(out.hourly * 100) / 100);
    document.getElementById("sc-daily").textContent = "$" + tpFmtNum(Math.round(out.daily));
    document.getElementById("sc-weekly").textContent = "$" + tpFmtNum(Math.round(out.weekly));
    document.getElementById("sc-monthly").textContent = "$" + tpFmtNum(Math.round(out.monthly));
    document.getElementById("sc-annual").textContent = "$" + tpFmtNum(Math.round(out.annual));
    document.getElementById("sc-result").classList.add("show");
  }
  document.getElementById("sc-go").addEventListener("click", render);
  render();
})();

// ==== DOM: VAT calculator ====
(function () {
  var panel = document.getElementById("vat-calc");
  if (!panel) return;
  var mode = "add", rate = 20;
  function fmt(n) { return tpFmtNum(Math.round(n * 100) / 100); }
  function run() {
    tpHideError("vat-err");
    var amt = parseFloat(document.getElementById("vat-amount").value);
    if (isNaN(amt) || amt < 0) {
      document.getElementById("vat-excl").textContent = "—";
      document.getElementById("vat-tax").textContent = "—";
      document.getElementById("vat-total").textContent = "—";
      return;
    }
    var r = rate / 100, excl, tax, total;
    if (mode === "add") { excl = amt; tax = amt * r; total = amt + tax; }
    else { total = amt; excl = amt / (1 + r); tax = amt - excl; }
    document.getElementById("vat-excl").textContent = fmt(excl);
    document.getElementById("vat-tax").textContent = fmt(tax);
    document.getElementById("vat-total").textContent = fmt(total);
    document.getElementById("vat-result").classList.add("show");
  }
  panel.querySelectorAll("[data-vatmode]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-vatmode]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); mode = b.getAttribute("data-vatmode"); run();
    });
  });
  panel.querySelectorAll("[data-vat]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-vat]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      var v = b.getAttribute("data-vat");
      var custom = document.getElementById("vat-custom");
      if (v === "-1") { custom.style.display = "block"; custom.focus(); }
      else { custom.style.display = "none"; rate = parseFloat(v); run(); }
    });
  });
  document.getElementById("vat-custom").addEventListener("input", function (e) {
    var v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0) { rate = v; run(); }
  });
  document.getElementById("vat-amount").addEventListener("input", run);
  run();
})();

/* ---- Color Converter (HEX <-> RGB <-> HSL) ---- */
(function () {
  var panel = document.getElementById("color-converter");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  var hexEl = el("col-hex"), rEl = el("col-r"), gEl = el("col-g"), bEl = el("col-b"),
      hEl = el("col-h"), sEl = el("col-s"), lEl = el("col-l"), sw = el("col-swatch"),
      pickEl = el("col-pick");
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function toHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      return ("0" + clamp(Math.round(v), 0, 255).toString(16)).slice(-2);
    }).join("");
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }
  function hslToRgb(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function hue(t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
  }
  function render(r, g, b, fromHex) {
    var hsl = rgbToHsl(r, g, b);
    if (!fromHex) hexEl.value = toHex(r, g, b);
    rEl.value = r; gEl.value = g; bEl.value = b;
    hEl.value = hsl[0]; sEl.value = hsl[1]; lEl.value = hsl[2];
    if (pickEl) pickEl.value = toHex(r, g, b);
    sw.style.background = toHex(r, g, b);
    el("col-css-rgb").value = "rgb(" + r + ", " + g + ", " + b + ")";
    el("col-css-hsl").value = "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)";
    tpHideError("col-err");
  }
  function fromHexInput() {
    var v = hexEl.value.replace(/^\s+|\s+$/g, "").replace(/^#/, "");
    if (/^[0-9a-fA-F]{3}$/.test(v)) v = v.split("").map(function (c) { return c + c; }).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(v)) {
      tpShowError("col-err", "Enter a HEX colour like #0d7377 (3 or 6 hex digits).");
      return;
    }
    render(parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16), true);
  }
  function fromRgb() {
    render(clamp(parseInt(rEl.value, 10) || 0, 0, 255),
           clamp(parseInt(gEl.value, 10) || 0, 0, 255),
           clamp(parseInt(bEl.value, 10) || 0, 0, 255), false);
  }
  function fromHsl() {
    var rgb = hslToRgb(parseFloat(hEl.value) || 0, parseFloat(sEl.value) || 0, parseFloat(lEl.value) || 0);
    render(rgb[0], rgb[1], rgb[2], false);
  }
  hexEl.addEventListener("input", fromHexInput);
  if (pickEl) pickEl.addEventListener("input", function () {
    hexEl.value = pickEl.value;
    fromHexInput();
  });
  [rEl, gEl, bEl].forEach(function (e) { e.addEventListener("input", fromRgb); });
  [hEl, sEl, lEl].forEach(function (e) { e.addEventListener("input", fromHsl); });
  panel.querySelectorAll("[data-col-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = el(btn.getAttribute("data-col-copy"));
      if (f && f.value) tpCopyWithFeedback(btn, f.value);
    });
  });
  fromHexInput();
})();

// ==== PURE: roman numerals ====
function tpToRoman(n) {
  if (!isFinite(n) || n < 1 || n > 3999 || Math.floor(n) !== n) return null;
  var table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  var out = "";
  for (var i = 0; i < table.length; i++) { while (n >= table[i][0]) { out += table[i][1]; n -= table[i][0]; } }
  return out;
}
function tpFromRoman(s) {
  s = (s || "").toUpperCase().replace(/\s+/g, "");
  if (!s || !/^[IVXLCDM]+$/.test(s)) return null;
  var vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  var total = 0;
  for (var i = 0; i < s.length; i++) {
    var cur = vals[s[i]], next = i + 1 < s.length ? vals[s[i + 1]] : 0;
    total += cur < next ? -cur : cur;
  }
  if (total < 1 || total > 3999 || tpToRoman(total) !== s) return null;
  return total;
}

// ==== DOM: roman numeral converter ====
(function () {
  var panel = document.getElementById("roman-numeral-converter");
  if (!panel) return;
  var numEl = document.getElementById("rn-num"), romEl = document.getElementById("rn-roman"),
      out = document.getElementById("rn-out"), note = document.getElementById("rn-note");
  function fromNum() {
    tpHideError("rn-err");
    var v = numEl.value.trim();
    if (!v) { romEl.value = ""; out.textContent = "—"; note.textContent = ""; return; }
    var n = Number(v), r = tpToRoman(n);
    if (r === null) { tpShowError("rn-err", "Enter a whole number from 1 to 3999 — the standard Roman system stops there (3999 = MMMCMXCIX)."); return; }
    romEl.value = r;
    out.textContent = n.toLocaleString("en-US") + "  =  " + r;
    note.textContent = "Read it in chunks: thousands, then hundreds, tens and ones.";
  }
  function fromRoman() {
    tpHideError("rn-err");
    var v = romEl.value.trim();
    if (!v) { numEl.value = ""; out.textContent = "—"; note.textContent = ""; return; }
    var n = tpFromRoman(v);
    if (n === null) { tpShowError("rn-err", "That is not a standard Roman numeral. The rules: I, X, C and M repeat at most three times; V, L and D never repeat; and only one smaller numeral stands before a larger one (IV, IX, XL, XC, CD, CM)."); return; }
    numEl.value = n;
    out.textContent = v.toUpperCase() + "  =  " + n.toLocaleString("en-US");
    note.textContent = "";
  }
  numEl.addEventListener("input", fromNum);
  romEl.addEventListener("input", fromRoman);
  fromNum();
})();

// ==== PURE: number to words ====
var TP_ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
var TP_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function tpUnder1000(n) {
  var parts = [];
  if (n >= 100) { parts.push(TP_ONES[Math.floor(n / 100)] + " hundred"); n = n % 100; }
  if (n >= 20) { var t = TP_TENS[Math.floor(n / 10)]; parts.push(n % 10 ? t + "-" + TP_ONES[n % 10] : t); }
  else if (n > 0) { parts.push(TP_ONES[n]); }
  return parts.join(" ");
}
function tpWordsIntl(n) {
  if (n === 0) return "zero";
  var scales = [[1000000000, "billion"], [1000000, "million"], [1000, "thousand"]];
  var parts = [];
  for (var i = 0; i < scales.length; i++) {
    if (n >= scales[i][0]) { parts.push(tpUnder1000(Math.floor(n / scales[i][0])) + " " + scales[i][1]); n = n % scales[i][0]; }
  }
  if (n > 0) parts.push(tpUnder1000(n));
  return parts.join(" ");
}
function tpWordsIndian(n) {
  if (n === 0) return "zero";
  var parts = [];
  if (n >= 10000000) { parts.push(tpWordsIndian(Math.floor(n / 10000000)) + " crore"); n = n % 10000000; }
  if (n >= 100000) { parts.push(tpUnder1000(Math.floor(n / 100000)) + " lakh"); n = n % 100000; }
  if (n >= 1000) { parts.push(tpUnder1000(Math.floor(n / 1000)) + " thousand"); n = n % 1000; }
  if (n > 0) parts.push(tpUnder1000(n));
  return parts.join(" ");
}

// ==== DOM: number to words converter ====
(function () {
  var panel = document.getElementById("number-to-words");
  if (!panel) return;
  var numEl = document.getElementById("nw-num"), sysEl = document.getElementById("nw-sys"),
      out = document.getElementById("nw-out"), lastWords = "";
  function run() {
    tpHideError("nw-err");
    var v = numEl.value.trim();
    if (!v) { out.textContent = "—"; lastWords = ""; return; }
    var n = Number(v);
    if (!isFinite(n) || Math.floor(n) !== n || n < 0 || n > 999999999999) {
      tpShowError("nw-err", "Enter a whole number from 0 to 999,999,999,999.");
      out.textContent = "—"; lastWords = ""; return;
    }
    var w = sysEl.value === "in" ? tpWordsIndian(n) : tpWordsIntl(n);
    lastWords = w.charAt(0).toUpperCase() + w.slice(1);
    out.textContent = lastWords;
  }
  numEl.addEventListener("input", run);
  sysEl.addEventListener("change", run);
  document.getElementById("nw-go").addEventListener("click", run);
  document.getElementById("nw-copy").addEventListener("click", function () {
    if (lastWords) tpCopyWithFeedback(this, lastWords);
  });
  run();
})();

// ==== Hex <-> text (bytes as hex; UTF-8) ====
function tpTextToHex(s) {
  var bytes = new TextEncoder().encode(s), out = [];
  for (var i = 0; i < bytes.length; i++) out.push(("0" + bytes[i].toString(16)).slice(-2).toUpperCase());
  return out.join("");
}
function tpHexToText(hex) {
  var h = String(hex).replace(/0x/gi, "").replace(/[^0-9A-Fa-f]/g, "");
  if (h.length % 2) throw new Error("A hex string needs an even number of digits — each character is two digits.");
  var bytes = new Uint8Array(h.length / 2);
  for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(h.substr(i * 2, 2), 16);
  return new TextDecoder("utf-8").decode(bytes);
}
(function () {
  var panel = document.getElementById("hex-text");
  if (!panel) return;
  var txt = document.getElementById("hxt-text"), hex = document.getElementById("hxt-hex");
  var err = document.getElementById("hxt-err"), busy = false;
  function showErr(m) { err.textContent = m || ""; }
  function fromText() {
    if (busy) return; busy = true; showErr("");
    hex.value = txt.value ? tpTextToHex(txt.value) : "";
    busy = false;
  }
  function fromHex() {
    if (busy) return; busy = true; showErr("");
    try { txt.value = hex.value.trim() ? tpHexToText(hex.value) : ""; }
    catch (e) { showErr(e.message); }
    busy = false;
  }
  txt.addEventListener("input", fromText);
  hex.addEventListener("input", fromHex);
  fromText();
})();

// ==== DOM: single-pair converter pages (celsius<->fahrenheit, kg<->lbs, cm<->inches, mm<->inches, m<->feet) ====
(function () {
  var panel = document.getElementById("pair-converter");
  if (!panel) return;
  var cat = panel.getAttribute("data-cat"),
      from = panel.getAttribute("data-from"),
      to = panel.getAttribute("data-to");
  var aEl = document.getElementById("pc-a"), bEl = document.getElementById("pc-b");
  var last = "a";
  function round6(v) { return Math.round(v * 1e6) / 1e6; }
  function setFormula() {
    var f = document.getElementById("pc-formula");
    if (!f) return;
    var av = parseFloat(aEl.value);
    if (isNaN(av)) {
      f.textContent = "1 " + from + " = " + tpFmtNum(tpConvert(cat, from, to, 1)) + " " + to;
    } else {
      f.textContent = tpFmtNum(av) + " " + from + " = " + tpFmtNum(tpConvert(cat, from, to, av)) + " " + to;
    }
  }
  function convert() {
    var av = parseFloat(aEl.value), bv = parseFloat(bEl.value);
    if (last === "a") {
      bEl.value = isNaN(av) ? "" : String(round6(tpConvert(cat, from, to, av)));
    } else {
      aEl.value = isNaN(bv) ? "" : String(round6(tpConvert(cat, to, from, bv)));
    }
    setFormula();
  }
  aEl.addEventListener("input", function () { last = "a"; convert(); });
  bEl.addEventListener("input", function () { last = "b"; convert(); });
  convert();
})();

// ==== DOM: percentage increase calculator ====
(function () {
  var panel = document.getElementById("pct-inc");
  if (!panel) return;
  function num(id) { var v = parseFloat(document.getElementById(id).value); return isNaN(v) ? null : v; }
  document.getElementById("pi-go1").addEventListener("click", function () {
    tpHideError("pi-err1");
    var oldV = num("pi-old"), newV = num("pi-new");
    if (oldV === null || newV === null) { tpShowError("pi-err1", "Enter both values."); return; }
    if (oldV === 0) { tpShowError("pi-err1", "The old value cannot be zero — a percentage change from zero is undefined."); return; }
    var diff = newV - oldV, pct = diff / oldV * 100;
    document.getElementById("pi-r1").textContent = (pct >= 0 ? "+" : "") + tpFmtNum(pct) + "%";
    document.getElementById("pi-r1-note").textContent =
      (pct >= 0 ? "An increase" : "A decrease") + " of " + tpFmtNum(Math.abs(diff)) +
      " (" + tpFmtNum(oldV) + " → " + tpFmtNum(newV) + ").";
    document.getElementById("pi-result1").classList.add("show");
  });
  document.getElementById("pi-go2").addEventListener("click", function () {
    tpHideError("pi-err2");
    var v = num("pi-val"), p = num("pi-pct");
    if (v === null || p === null) { tpShowError("pi-err2", "Enter a value and a percentage."); return; }
    document.getElementById("pi-pct-label").textContent = String(p);
    document.getElementById("pi-pct-label2").textContent = String(p);
    document.getElementById("pi-r2").textContent = tpFmtNum(v * (1 + p / 100));
    document.getElementById("pi-r2-down").textContent = tpFmtNum(v * (1 - p / 100));
    document.getElementById("pi-result2").classList.add("show");
  });
})();

// ==== 2026-11-17 high-volume tools: mortgage, currency, GPA, scientific, auto loan ====

// ==== PURE: mortgage maths (P&I + tax + insurance + PMI + yearly schedule) ====
function tpMortgage(price, downPct, annualRatePct, years, taxPct, insYearly, pmiPct) {
  var down = price * downPct / 100;
  var loan = price - down;
  var L = tpLoan(loan, annualRatePct, years);
  var r = annualRatePct / 1200, n = Math.round(years * 12);
  var taxM = price * taxPct / 100 / 12;
  var insM = (insYearly || 0) / 12;
  var pmiM = downPct < 20 ? loan * (pmiPct || 0) / 100 / 12 : 0;
  // Yearly amortization schedule, aggregated from the monthly walk.
  var schedule = [], bal = loan, yPay = 0, yPrin = 0, yInt = 0;
  for (var m = 1; m <= n; m++) {
    var interest = bal * r;
    var princ = L.monthly - interest;
    if (m === n || princ > bal) princ = bal;
    bal -= princ;
    yPay += L.monthly; yPrin += princ; yInt += interest;
    if (m % 12 === 0 || m === n) {
      schedule.push({ year: Math.ceil(m / 12), paid: yPay, principal: yPrin, interest: yInt, balance: Math.max(bal, 0) });
      yPay = 0; yPrin = 0; yInt = 0;
    }
    if (bal <= 0) break;
  }
  return {
    down: down, loan: loan, pi: L.monthly, taxM: taxM, insM: insM, pmiM: pmiM,
    totalMonthly: L.monthly + taxM + insM + pmiM,
    totalInterest: L.totalInterest, totalPI: L.totalPaid, payments: n, schedule: schedule
  };
}

// ==== DOM: mortgage calculator ====
(function () {
  var panel = document.getElementById("mortgage-calc");
  if (!panel) return;
  function run() {
    tpHideError("mg-err");
    var price = parseFloat(document.getElementById("mg-price").value);
    var downPct = parseFloat(document.getElementById("mg-downpct").value);
    var rate = parseFloat(document.getElementById("mg-rate").value);
    var years = parseFloat(document.getElementById("mg-years").value);
    var tax = parseFloat(document.getElementById("mg-tax").value) || 0;
    var ins = parseFloat(document.getElementById("mg-ins").value) || 0;
    var pmi = parseFloat(document.getElementById("mg-pmi").value) || 0;
    var res = document.getElementById("mg-result");
    if (isNaN(price) || isNaN(downPct) || isNaN(rate) || isNaN(years) ||
        price <= 0 || downPct < 0 || downPct >= 100 || rate < 0 || years <= 0 || years > 50) {
      tpShowError("mg-err", "Enter the home price, a down payment under 100%, the rate and a term of up to 50 years.");
      res.classList.remove("show");
      return;
    }
    var M = tpMortgage(price, downPct, rate, years, tax, ins, pmi);
    document.getElementById("mg-monthly").textContent = tpMoney(M.totalMonthly);
    document.getElementById("mg-count").textContent = M.payments + " monthly payments · loan of " + tpMoney(M.loan) +
      " after a " + tpMoney(M.down) + " down payment";
    document.getElementById("mg-pi").textContent = tpMoney(M.pi);
    document.getElementById("mg-taxm").textContent = tpMoney(M.taxM);
    document.getElementById("mg-insm").textContent = tpMoney(M.insM);
    var pmiRow = document.getElementById("mg-pmirow");
    if (M.pmiM > 0) { pmiRow.style.display = ""; document.getElementById("mg-pmim").textContent = tpMoney(M.pmiM); }
    else pmiRow.style.display = "none";
    document.getElementById("mg-interest").textContent = tpMoney(M.totalInterest);
    document.getElementById("mg-totalpi").textContent = tpMoney(M.totalPI);
    var rows = M.schedule.map(function (s) {
      return "<tr><td>" + s.year + "</td><td>" + tpMoney(s.paid) + "</td><td>" + tpMoney(s.principal) +
        "</td><td>" + tpMoney(s.interest) + "</td><td>" + tpMoney(s.balance) + "</td></tr>";
    }).join("");
    document.getElementById("mg-schedule").innerHTML = rows;
    res.classList.add("show");
  }
  document.getElementById("mg-go").addEventListener("click", run);
  ["mg-price", "mg-downpct", "mg-rate", "mg-years", "mg-tax", "mg-ins", "mg-pmi"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      var core = ["mg-price", "mg-downpct", "mg-rate", "mg-years"];
      if (core.every(function (i) { return document.getElementById(i).value !== ""; })) run();
    });
  });
})();

// ==== PURE: auto loan maths (tax on price minus trade-in, the common US rule) ====
function tpAutoLoan(price, down, trade, taxPct, annualRatePct, years) {
  var taxable = Math.max(price - trade, 0);
  var tax = taxable * taxPct / 100;
  var financed = price - down - trade + tax;
  var L = tpLoan(Math.max(financed, 0), annualRatePct, years);
  return {
    taxable: taxable, tax: tax, financed: financed, monthly: L.monthly,
    totalInterest: L.totalInterest, totalPayments: L.totalPaid,
    totalCost: down + trade + L.totalPaid, payments: L.payments
  };
}

// ==== DOM: auto loan calculator ====
(function () {
  var panel = document.getElementById("auto-loan-calc");
  if (!panel) return;
  function run() {
    tpHideError("al-err");
    var price = parseFloat(document.getElementById("al-price").value);
    var down = parseFloat(document.getElementById("al-down").value) || 0;
    var trade = parseFloat(document.getElementById("al-trade").value) || 0;
    var tax = parseFloat(document.getElementById("al-tax").value) || 0;
    var rate = parseFloat(document.getElementById("al-rate").value);
    var years = parseFloat(document.getElementById("al-years").value);
    var res = document.getElementById("al-result");
    if (isNaN(price) || isNaN(rate) || isNaN(years) || price <= 0 || rate < 0 || years <= 0 || years > 12 ||
        down < 0 || trade < 0 || down + trade > price) {
      tpShowError("al-err", "Enter the vehicle price, the rate and a term of up to 12 years. Down payment plus trade-in cannot exceed the price.");
      res.classList.remove("show");
      return;
    }
    var A = tpAutoLoan(price, down, trade, tax, rate, years);
    document.getElementById("al-monthly").textContent = tpMoney(A.monthly);
    document.getElementById("al-count").textContent = A.payments + " monthly payments";
    document.getElementById("al-financed").textContent = tpMoney(A.financed);
    document.getElementById("al-taxamt").textContent = tpMoney(A.tax) + " (on " + tpMoney(A.taxable) + " after trade-in)";
    document.getElementById("al-interest").textContent = tpMoney(A.totalInterest);
    document.getElementById("al-total").textContent = tpMoney(A.totalCost);
    res.classList.add("show");
  }
  document.getElementById("al-go").addEventListener("click", run);
  ["al-price", "al-down", "al-trade", "al-tax", "al-rate", "al-years"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      var core = ["al-price", "al-rate", "al-years"];
      if (core.every(function (i) { return document.getElementById(i).value !== ""; })) run();
    });
  });
})();

// ==== PURE: GPA maths (credit-weighted, 4.0 scale) ====
var TP_GRADE_POINTS = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "D-": 0.7, "F": 0.0 };
function tpGPA(rows, prevGpa, prevCredits) {
  var pts = 0, cr = 0;
  rows.forEach(function (r) { pts += r.points * r.credits; cr += r.credits; });
  var gpa = cr > 0 ? pts / cr : null;
  var cum = null;
  if (gpa !== null && prevGpa !== null && prevGpa !== undefined && prevCredits > 0)
    cum = (prevGpa * prevCredits + pts) / (prevCredits + cr);
  else if (gpa !== null && (prevCredits === 0 || prevGpa === null || prevGpa === undefined))
    cum = gpa;
  return { gpa: gpa, credits: cr, points: pts, cumulative: cum };
}

// ==== DOM: GPA calculator ====
(function () {
  var panel = document.getElementById("gpa-calc");
  if (!panel) return;
  var rowsEl = document.getElementById("gp-rows");
  var gradeOpts = Object.keys(TP_GRADE_POINTS).map(function (g) {
    return '<option value="' + g + '">' + g + " (" + TP_GRADE_POINTS[g].toFixed(1) + ")</option>";
  }).join("");
  function addRow(grade, credits) {
    var div = document.createElement("div");
    div.className = "row gp-row";
    div.innerHTML =
      '<div class="field"><label>Course <span class="hint">(optional)</span></label><input type="text" class="gp-name" placeholder="e.g. Biology 101"></div>' +
      '<div class="field"><label>Grade</label><select class="gp-grade">' + gradeOpts + "</select></div>" +
      '<div class="field"><label>Credits</label><input type="number" class="gp-credits" min="0" step="any" placeholder="3"></div>' +
      '<div class="field"><label>&nbsp;</label><button class="btn ghost small gp-del" type="button">Remove</button></div>';
    if (grade) div.querySelector(".gp-grade").value = grade;
    if (credits !== undefined) div.querySelector(".gp-credits").value = credits;
    div.querySelector(".gp-del").addEventListener("click", function () { div.remove(); run(); });
    rowsEl.appendChild(div);
    div.querySelectorAll("input, select").forEach(function (i) { i.addEventListener("input", run); });
  }
  document.getElementById("gp-add").addEventListener("click", function () { addRow(); });
  function run() {
    var rows = [];
    rowsEl.querySelectorAll(".gp-row").forEach(function (row) {
      var g = row.querySelector(".gp-grade").value;
      var c = parseFloat(row.querySelector(".gp-credits").value);
      if (!isNaN(c) && c > 0) rows.push({ points: TP_GRADE_POINTS[g], credits: c });
    });
    var pg = parseFloat(document.getElementById("gp-pgpa").value);
    var pc = parseFloat(document.getElementById("gp-pcredits").value) || 0;
    var R = tpGPA(rows, isNaN(pg) ? null : pg, pc);
    var res = document.getElementById("gp-result");
    if (R.gpa === null) {
      document.getElementById("gp-sem").textContent = "—";
      document.getElementById("gp-note").textContent = "Add a course with credits to see your GPA.";
      res.classList.remove("show");
      return;
    }
    document.getElementById("gp-sem").textContent = R.gpa.toFixed(2);
    document.getElementById("gp-note").textContent = "Across " + tpFmtNum(R.credits) + " credits this term.";
    var cumEl = document.getElementById("gp-cum");
    if (!isNaN(pg) && pc > 0 && R.cumulative !== null)
      cumEl.textContent = "Cumulative GPA (with your previous " + tpFmtNum(pc) + " credits at " +
        pg.toFixed(2) + "): " + R.cumulative.toFixed(2);
    else cumEl.textContent = "";
    res.classList.add("show");
  }
  document.getElementById("gp-go").addEventListener("click", run);
  ["gp-pgpa", "gp-pcredits"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", run);
  });
  addRow("A", 3); addRow("B", 3); addRow("", 3); addRow("", 3);
  run();
})();

// ==== PURE: scientific calculator — tokenizer + recursive-descent parser (no eval) ====
function tpGamma(z) { // Lanczos approximation — lets x! work for non-integers too
  var p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * tpGamma(1 - z));
  z -= 1;
  var x = p[0];
  for (var i = 1; i < p.length; i++) x += p[i] / (z + i);
  var t = z + p.length - 1.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
function tpFact(n) {
  if (n < 0) throw new Error("Factorial of a negative");
  if (Math.abs(n - Math.round(n)) > 1e-9) return tpGamma(n + 1);
  var r = 1;
  for (var i = 2; i <= n; i++) r *= i;
  return r;
}
function tpSciTokens(s) {
  var toks = [], i = 0;
  while (i < s.length) {
    var c = s[i];
    if (c === " ") { i++; continue; }
    if (/[0-9.]/.test(c)) {
      var j = i, dot = false;
      while (j < s.length && /[0-9.]/.test(s[j])) {
        if (s[j] === ".") { if (dot) throw new Error("Bad number"); dot = true; }
        j++;
      }
      toks.push({ t: "num", v: parseFloat(s.slice(i, j)) });
      i = j; continue;
    }
    if (c === "π") { toks.push({ t: "id", v: "pi" }); i++; continue; }
    if (/[a-zA-Z]/.test(c)) {
      var k = i;
      while (k < s.length && /[a-zA-Z]/.test(s[k])) k++;
      toks.push({ t: "id", v: s.slice(i, k) });
      i = k; continue;
    }
    if ("+-*/%^!()".indexOf(c) >= 0) { toks.push({ t: c }); i++; continue; }
    throw new Error("Unexpected character: " + c);
  }
  return toks;
}
function tpSciFn(name, x, deg) {
  var toRad = deg ? Math.PI / 180 : 1, fromRad = deg ? 180 / Math.PI : 1;
  switch (name) {
    case "sin": return Math.sin(x * toRad);
    case "cos": return Math.cos(x * toRad);
    case "tan": return Math.tan(x * toRad);
    case "asin": return Math.asin(x) * fromRad;
    case "acos": return Math.acos(x) * fromRad;
    case "atan": return Math.atan(x) * fromRad;
    case "log": return Math.log10(x);
    case "ln": return Math.log(x);
    case "sqrt": return Math.sqrt(x);
    case "abs": return Math.abs(x);
    case "exp": return Math.exp(x);
  }
  throw new Error("Unknown function: " + name);
}
function tpSciEval(src, deg) {
  var toks = tpSciTokens(src), pos = 0;
  function peek() { return toks[pos]; }
  function next() { return toks[pos++]; }
  function parseExpr() {
    var v = parseTerm();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      var op = next().t, rhs = parseTerm();
      v = op === "+" ? v + rhs : v - rhs;
    }
    return v;
  }
  function parseTerm() {
    var v = parseFactor();
    while (peek() && (peek().t === "*" || peek().t === "/" || peek().t === "%" ||
                       peek().t === "(" || peek().t === "id")) {
      if (peek().t === "(" || peek().t === "id") { v = v * parseFactor(); continue; }
      var op = next().t, rhs = parseFactor();
      v = op === "*" ? v * rhs : op === "/" ? v / rhs : v % rhs;
    }
    return v;
  }
  function parseFactor() {
    var base = parseUnary();
    if (peek() && peek().t === "^") { next(); return Math.pow(base, parseFactor()); }
    return base;
  }
  function parseUnary() {
    if (peek() && peek().t === "-") { next(); return -parseUnary(); }
    if (peek() && peek().t === "+") { next(); return parseUnary(); }
    return parsePostfix();
  }
  function parsePostfix() {
    var v = parsePrimary();
    while (peek() && peek().t === "!") { next(); v = tpFact(v); }
    return v;
  }
  function parsePrimary() {
    var tk = next();
    if (!tk) throw new Error("Incomplete expression");
    if (tk.t === "num") return tk.v;
    if (tk.t === "(") {
      var v = parseExpr(), cl = next();
      if (!cl || cl.t !== ")") throw new Error("Missing closing bracket");
      return v;
    }
    if (tk.t === "id") {
      var name = tk.v.toLowerCase();
      if (name === "pi") return Math.PI;
      if (name === "e") return Math.E;
      var open = next();
      if (!open || open.t !== "(") throw new Error("Expected ( after " + name);
      var arg = parseExpr(), cl2 = next();
      if (!cl2 || cl2.t !== ")") throw new Error("Missing closing bracket");
      return tpSciFn(name, arg, deg);
    }
    throw new Error("Unexpected token");
  }
  var out = parseExpr();
  if (pos < toks.length) throw new Error("Trailing characters");
  return out;
}

// ==== DOM: scientific calculator ====
(function () {
  var panel = document.getElementById("scientific-calculator");
  if (!panel) return;
  var disp = document.getElementById("sc-display");
  var hist = document.getElementById("sc-history");
  var deg = true, justSolved = false;
  function setDeg(d) {
    deg = d;
    document.getElementById("sc-deg").classList.toggle("on", d);
    document.getElementById("sc-rad").classList.toggle("on", !d);
  }
  document.getElementById("sc-deg").addEventListener("click", function () { setDeg(true); });
  document.getElementById("sc-rad").addEventListener("click", function () { setDeg(false); });
  function insert(txt) {
    if (justSolved && /[0-9.(π]/.test(txt.charAt(0)) && txt !== "(") disp.value = "";
    justSolved = false;
    disp.value += txt;
    disp.focus();
  }
  function solve() {
    var raw = disp.value.trim();
    if (!raw) return;
    var norm = raw.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/√/g, "sqrt");
    try {
      var v = tpSciEval(norm, deg);
      if (typeof v !== "number" || isNaN(v)) throw new Error("No result");
      if (!isFinite(v)) throw new Error("Overflow");
      hist.textContent = raw + " =";
      disp.value = String(parseFloat(v.toPrecision(10)));
      justSolved = true;
    } catch (e) {
      hist.textContent = raw;
      disp.value = "Error";
      justSolved = true;
    }
    disp.focus();
  }
  panel.querySelectorAll("[data-ins]").forEach(function (b) {
    b.addEventListener("click", function () { insert(b.getAttribute("data-ins")); });
  });
  document.getElementById("sc-clear").addEventListener("click", function () {
    disp.value = ""; hist.textContent = ""; justSolved = false; disp.focus();
  });
  document.getElementById("sc-back").addEventListener("click", function () {
    if (justSolved) { disp.value = ""; justSolved = false; }
    else disp.value = disp.value.slice(0, -1);
    disp.focus();
  });
  document.getElementById("sc-neg").addEventListener("click", function () {
    if (!disp.value) { disp.value = "-"; return; }
    disp.value = disp.value.charAt(0) === "-" ? disp.value.slice(1) : "-(" + disp.value + ")";
    disp.focus();
  });
  document.getElementById("sc-eq").addEventListener("click", solve);
  disp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); solve(); } });
  document.addEventListener("keydown", function (e) {
    if (e.target !== document.body && e.target !== disp) return;
    if (/^[0-9.+\-*/%^!()]$/.test(e.key)) { insert(e.key); e.preventDefault(); }
    else if (e.key === "Enter" || e.key === "=") { solve(); e.preventDefault(); }
    else if (e.key === "Backspace") { disp.value = disp.value.slice(0, -1); e.preventDefault(); }
    else if (e.key === "Escape") { disp.value = ""; hist.textContent = ""; }
  });
})();

// ==== DOM: currency converter (Frankfurter/ECB primary + open feed for the
// currencies the ECB does not publish, e.g. PKR, AED, SAR; offline snapshot last) ====
(function () {
  var panel = document.getElementById("currency-converter");
  if (!panel) return;
  var CURRENCIES = [
    ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"], ["PKR", "Pakistani Rupee"],
    ["INR", "Indian Rupee"], ["AED", "UAE Dirham"], ["SAR", "Saudi Riyal"], ["QAR", "Qatari Riyal"],
    ["KWD", "Kuwaiti Dinar"], ["BDT", "Bangladeshi Taka"], ["LKR", "Sri Lankan Rupee"], ["NPR", "Nepalese Rupee"],
    ["CAD", "Canadian Dollar"], ["AUD", "Australian Dollar"], ["NZD", "New Zealand Dollar"],
    ["JPY", "Japanese Yen"], ["CNY", "Chinese Yuan"], ["HKD", "Hong Kong Dollar"], ["SGD", "Singapore Dollar"],
    ["CHF", "Swiss Franc"], ["TRY", "Turkish Lira"], ["ZAR", "South African Rand"], ["KRW", "South Korean Won"],
    ["MYR", "Malaysian Ringgit"], ["IDR", "Indonesian Rupiah"], ["PHP", "Philippine Peso"], ["THB", "Thai Baht"],
    ["BRL", "Brazilian Real"], ["MXN", "Mexican Peso"], ["SEK", "Swedish Krona"], ["NOK", "Norwegian Krone"],
    ["DKK", "Danish Krone"], ["PLN", "Polish Zloty"], ["RUB", "Russian Ruble"]
  ];
  // Offline snapshot (open.er-api.com, 17 Nov 2026) — used ONLY if both live
  // feeds are unreachable, and the page says so when it happens.
  var FALLBACK = { USD: 1, EUR: 0.908584, GBP: 0.758255, PKR: 276.55578, INR: 93.959855, AED: 3.6725,
    SAR: 3.75, QAR: 3.64, KWD: 0.311177, BDT: 124.589647, LKR: 332.677303, NPR: 150.338359,
    CAD: 1.42937, AUD: 1.483068, NZD: 1.816952, JPY: 159.580113, CNY: 6.679257, HKD: 7.846956,
    SGD: 1.288895, CHF: 0.839814, TRY: 50.421147, ZAR: 16.959311, KRW: 1335.485864, MYR: 4.094237,
    IDR: 18273.211135, PHP: 63.93553, THB: 33.886826, BRL: 5.714693, MXN: 18.548392,
    SEK: 10.092701, NOK: 9.629694, DKK: 6.789305, PLN: 4.001322, RUB: 82.518177 };
  var rates = null, sourceNote = "";
  var fromSel = document.getElementById("fx-from"), toSel = document.getElementById("fx-to");
  var opts = CURRENCIES.map(function (c) { return '<option value="' + c[0] + '">' + c[0] + " — " + c[1] + "</option>"; }).join("");
  fromSel.innerHTML = opts; toSel.innerHTML = opts;
  fromSel.value = "USD"; toSel.value = "EUR";
  function fmtRate(v) {
    if (v >= 100) return tpFmtNum(Math.round(v * 100) / 100);
    if (v >= 1) return String(parseFloat(v.toPrecision(5)));
    return String(parseFloat(v.toPrecision(5)));
  }
  function convert() {
    if (!rates) return;
    var amt = parseFloat(document.getElementById("fx-amount").value);
    var f = fromSel.value, t = toSel.value, res = document.getElementById("fx-result");
    if (isNaN(amt) || amt < 0 || !rates[f] || !rates[t]) { res.classList.remove("show"); return; }
    var rate = rates[t] / rates[f];
    var out = amt * rate;
    document.getElementById("fx-big").textContent =
      tpFmtNum(amt) + " " + f + " = " + tpFmtNum(Math.round(out * 100) / 100) + " " + t;
    document.getElementById("fx-rate").textContent = "1 " + f + " = " + fmtRate(rate) + " " + t +
      " · 1 " + t + " = " + fmtRate(1 / rate) + " " + f;
    document.getElementById("fx-src").textContent = sourceNote;
    buildTable();
    res.classList.add("show");
  }
  function buildTable() {
    if (!rates) return;
    var f = fromSel.value;
    var majors = ["USD", "EUR", "GBP", "PKR", "INR", "AED", "SAR", "CAD", "AUD", "JPY", "CNY", "CHF", "TRY", "KWD"];
    var rows = majors.filter(function (c) { return c !== f && rates[c]; }).map(function (c) {
      return "<tr><td>1 " + f + " → " + c + "</td><td>" + fmtRate(rates[c] / rates[f]) + "</td></tr>";
    }).join("");
    document.getElementById("fx-table").innerHTML = rows;
    document.getElementById("fx-table-title").textContent = "What 1 " + f + " buys today";
  }
  function ready(note) { sourceNote = note; convert(); }
  function loadFallback() {
    rates = FALLBACK;
    ready("Live rates could not be reached, so this page is showing a saved snapshot from 17 November 2026. Treat the figures as a guide until you are back online.");
  }
  function loadOpenFeed(primary) {
    fetch("https://open.er-api.com/v6/latest/USD").then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.rates) throw new Error("bad feed");
      if (primary) {
        rates = d.rates;
        ready("Live rates from the open ExchangeRate feed, updated " + (d.time_last_update_utc || "today") + ".");
      } else {
        // Top up the ECB table with the currencies it does not publish.
        Object.keys(d.rates).forEach(function (k) { if (!(k in rates)) rates[k] = d.rates[k]; });
        convert();
      }
    }).catch(function () { if (primary) loadFallback(); });
  }
  fetch("https://api.frankfurter.app/latest?from=USD").then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.rates) throw new Error("bad feed");
    rates = d.rates; rates.USD = 1;
    ready("Live mid-market rates from the European Central Bank (via Frankfurter), " + d.date +
      ". A second free feed adds the currencies the ECB does not publish, such as PKR and AED.");
    loadOpenFeed(false);
  }).catch(function () { loadOpenFeed(true); });
  document.getElementById("fx-go").addEventListener("click", convert);
  document.getElementById("fx-swap").addEventListener("click", function () {
    var v = fromSel.value; fromSel.value = toSel.value; toSel.value = v; convert();
  });
  ["fx-amount"].forEach(function (id) { document.getElementById(id).addEventListener("input", convert); });
  [fromSel, toSel].forEach(function (s) { s.addEventListener("change", convert); });
  panel.querySelectorAll("[data-pair]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = b.getAttribute("data-pair").split("/");
      fromSel.value = p[0]; toSel.value = p[1]; convert();
    });
  });
})();
