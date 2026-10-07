/* ToolPixi — date tools: age calculator, days between, days until */
// ==== PURE ====
/* Parse "YYYY-MM-DD" as a LOCAL date (avoids UTC off-by-one). Returns null if invalid. */
function tpParseYMD(str) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || "");
  if (!m) return null;
  var y = +m[1], mo = +m[2], d = +m[3];
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}
function tpStartOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function tpDaysBetween(a, b) {
  var MS = 86400000;
  return Math.round((tpStartOfDay(b) - tpStartOfDay(a)) / MS);
}
/* Age as years/months/days from dob to "on" (both Date objects). */
function tpAgeYMD(dob, on) {
  var y = on.getFullYear() - dob.getFullYear();
  var m = on.getMonth() - dob.getMonth();
  var d = on.getDate() - dob.getDate();
  if (d < 0) {
    m -= 1;
    var prevMonthDays = new Date(on.getFullYear(), on.getMonth(), 0).getDate();
    d += prevMonthDays;
  }
  if (m < 0) { y -= 1; m += 12; }
  return { years: y, months: m, days: d };
}
function tpNextBirthday(dob, from) {
  var nb = new Date(from.getFullYear(), dob.getMonth(), dob.getDate());
  if (nb < tpStartOfDay(from)) nb = new Date(from.getFullYear() + 1, dob.getMonth(), dob.getDate());
  return nb;
}
function tpFmtDate(d) {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ==== DOM helpers ====
function tpCountdownCells(prefix, target) {
  function tick() {
    var now = new Date();
    var diff = target - now;
    var dEl = document.getElementById(prefix + "-d"), hEl = document.getElementById(prefix + "-h"),
        mEl = document.getElementById(prefix + "-m"), sEl = document.getElementById(prefix + "-s");
    if (!dEl) return;
    if (diff <= 0) {
      dEl.textContent = "0"; hEl.textContent = "0"; mEl.textContent = "0"; sEl.textContent = "0";
      var done = document.getElementById(prefix + "-done");
      if (done) done.style.display = "block";
      return;
    }
    var days = Math.floor(diff / 86400000);
    var hrs = Math.floor(diff / 3600000) % 24;
    var min = Math.floor(diff / 60000) % 60;
    var sec = Math.floor(diff / 1000) % 60;
    dEl.textContent = days; hEl.textContent = hrs; mEl.textContent = min; sEl.textContent = sec;
    setTimeout(tick, 500);
  }
  tick();
}

// ==== DOM: Age calculator (mode: today | specific date) ====
(function () {
  var panel = document.getElementById("age-calc");
  if (!panel) return;
  var fixedMode = panel.getAttribute("data-mode") === "on-date";
  function currentOnDate() {
    if (fixedMode) return tpParseYMD(document.getElementById("ag-ondate").value);
    var v = document.getElementById("ag-ondate") ? document.getElementById("ag-ondate").value : "";
    return v ? tpParseYMD(v) : new Date();
  }
  function run() {
    tpHideError("ag-err");
    var dob = tpParseYMD(document.getElementById("ag-dob").value);
    var on = currentOnDate();
    if (!dob) { tpShowError("ag-err", "Please pick a date of birth."); return; }
    if (!on) { tpShowError("ag-err", "Please pick the date to calculate the age on."); return; }
    if (tpStartOfDay(on) < tpStartOfDay(dob)) { tpShowError("ag-err", "The 'on' date is before the date of birth — swap them and try again."); return; }
    var age = tpAgeYMD(dob, on);
    var totalDays = tpDaysBetween(dob, on);
    var totalMonths = age.years * 12 + age.months;
    var nb = tpNextBirthday(dob, on);
    document.getElementById("ag-headline").textContent =
      age.years + " years, " + age.months + " months, " + age.days + " days";
    document.getElementById("ag-total-days").textContent = totalDays.toLocaleString() + " days";
    document.getElementById("ag-total-weeks").textContent = Math.floor(totalDays / 7).toLocaleString() + " weeks";
    document.getElementById("ag-total-months").textContent = totalMonths + " months";
    document.getElementById("ag-hours").textContent = (totalDays * 24).toLocaleString() + " hours";
    document.getElementById("ag-born").textContent = tpFmtDate(dob);
    document.getElementById("ag-next").textContent = tpFmtDate(nb) + " (" + tpDaysBetween(on, nb) + " days away)";
    document.getElementById("ag-result").classList.add("show");
  }
  document.getElementById("ag-go").addEventListener("click", run);
  var od = document.getElementById("ag-ondate");
  if (od && !fixedMode) { /* optional today-default field */ }
  if (od) od.addEventListener("change", function () { if (document.getElementById("ag-dob").value) run(); });
  document.getElementById("ag-dob").addEventListener("change", function () { if (this.value) run(); });
})();

// ==== DOM: Days between dates ====
(function () {
  var panel = document.getElementById("days-between");
  if (!panel) return;
  function run() {
    tpHideError("db-err");
    var a = tpParseYMD(document.getElementById("db-from").value);
    var b = tpParseYMD(document.getElementById("db-to").value);
    if (!a || !b) { tpShowError("db-err", "Please pick both dates."); return; }
    var diff = tpDaysBetween(a, b);
    var incl = document.getElementById("db-inclusive").checked;
    var days = Math.abs(diff) + (incl ? 1 : 0);
    document.getElementById("db-headline").textContent = days.toLocaleString() + " days";
    document.getElementById("db-weeks").textContent = (days / 7).toFixed(1) + " weeks";
    document.getElementById("db-months").textContent = (days / 30.44).toFixed(1) + " months";
    document.getElementById("db-years").textContent = (days / 365.25).toFixed(2) + " years";
    document.getElementById("db-hours").textContent = (days * 24).toLocaleString() + " hours";
    document.getElementById("db-dir").textContent = diff >= 0
      ? tpFmtDate(b) + " is after " + tpFmtDate(a)
      : tpFmtDate(a) + " is after " + tpFmtDate(b);
    document.getElementById("db-result").classList.add("show");
  }
  document.getElementById("db-go").addEventListener("click", run);
  ["db-from", "db-to", "db-inclusive"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () {
      if (document.getElementById("db-from").value && document.getElementById("db-to").value) run();
    });
  });
})();

// ==== DOM: Fixed-event countdown pages (Christmas / New Year / Ramadan) ====
(function () {
  var panel = document.getElementById("days-until-fixed");
  if (!panel) return;
  var kind = panel.getAttribute("data-event");
  var now = new Date(), y = now.getFullYear(), target;
  if (kind === "christmas") {
    target = new Date(y, 11, 25);
    if (target < tpStartOfDay(now)) target = new Date(y + 1, 11, 25);
    document.getElementById("du-date-label").textContent = "Christmas Day — " + tpFmtDate(target);
  } else if (kind === "new-year") {
    target = new Date(y + 1, 0, 1);
    document.getElementById("du-date-label").textContent = "New Year's Day — " + tpFmtDate(target);
  } else if (kind === "ramadan") {
    // 1 Ramadan 1448 AH = 7 Feb 2027 (tabular calendar; may shift a day by moon sighting).
    target = new Date(2027, 1, 7);
    if (target < tpStartOfDay(now)) target = new Date(2028, 0, 27); // ~1 Ramadan 1449, tabular estimate
    document.getElementById("du-date-label").textContent = "Expected start of Ramadan — " + tpFmtDate(target);
  }
  tpCountdownCells("du", target);
})();

// ==== DOM: generic Days Until [any date] ====
(function () {
  var panel = document.getElementById("days-until-any");
  if (!panel) return;
  var timer = null;
  document.getElementById("dua-go").addEventListener("click", function () {
    tpHideError("dua-err");
    var d = tpParseYMD(document.getElementById("dua-date").value);
    if (!d) { tpShowError("dua-err", "Please pick a date."); return; }
    var name = document.getElementById("dua-name").value.trim();
    document.getElementById("dua-title").textContent = name ? "Days until " + name : "Countdown";
    document.getElementById("dua-date-label").textContent = tpFmtDate(d);
    document.getElementById("dua-days").textContent = tpDaysBetween(new Date(), d) + " days";
    document.getElementById("dua-result").classList.add("show");
    if (timer) clearTimeout(timer);
    tpCountdownCells("dua", d);
  });
})();
