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
  } else if (kind === "eid") {
    // 1 Shawwal 1448 AH expected 9 Mar 2027 (Umm al-Qura calendar; may shift a day by moon sighting).
    target = new Date(2027, 2, 9);
    if (target < tpStartOfDay(now)) target = new Date(2028, 1, 27); // ~1 Shawwal 1449, tabular estimate
    document.getElementById("du-date-label").textContent = "Expected Eid al-Fitr — " + tpFmtDate(target);
  } else if (kind === "ramadan") {
    // 1 Ramadan 1448 AH = 7 Feb 2027 (tabular calendar; may shift a day by moon sighting).
    target = new Date(2027, 1, 7);
    if (target < tpStartOfDay(now)) target = new Date(2028, 0, 27); // ~1 Ramadan 1449, tabular estimate
    document.getElementById("du-date-label").textContent = "Expected start of Ramadan — " + tpFmtDate(target);
  } else if (kind === "halloween") {
    target = new Date(y, 9, 31);
    if (target < tpStartOfDay(now)) target = new Date(y + 1, 9, 31);
    document.getElementById("du-date-label").textContent = "Halloween — " + tpFmtDate(target);
  } else if (kind === "thanksgiving") {
    // US Thanksgiving = the fourth Thursday of November, computed per year.
    function fourthThursday(yr) {
      var nov1 = new Date(yr, 10, 1);
      var firstThu = 1 + ((4 - nov1.getDay() + 7) % 7);
      return new Date(yr, 10, firstThu + 21);
    }
    target = fourthThursday(y);
    if (target < tpStartOfDay(now)) target = fourthThursday(y + 1);
    document.getElementById("du-date-label").textContent = "US Thanksgiving — " + tpFmtDate(target);
  } else if (kind === "diwali") {
    // Diwali (Lakshmi Puja) follows the Hindu lunar calendar. Verified dates:
    // 2026-11-08 (Sun), 2027-10-29, 2028-10-17, 2029-11-05, 2030-10-26.
    var diwaliDates = [new Date(2026, 10, 8), new Date(2027, 9, 29), new Date(2028, 9, 17),
                       new Date(2029, 10, 5), new Date(2030, 9, 26)];
    target = null;
    for (var i = 0; i < diwaliDates.length; i++) {
      if (diwaliDates[i] >= tpStartOfDay(now)) { target = diwaliDates[i]; break; }
    }
    if (!target) {
      document.getElementById("du-date-label").textContent =
        "Our Diwali date list runs through 2030 — this page will be updated with future dates.";
    } else {
      document.getElementById("du-date-label").textContent = "Diwali (Lakshmi Puja) — " + tpFmtDate(target);
    }
  } else if (kind === "eid-adha") {
    // 10 Dhu al-Hijjah 1448 AH expected 16 May 2027 (tabular calendar; may shift a day by moon sighting).
    target = new Date(2027, 4, 16);
    if (target < tpStartOfDay(now)) target = new Date(2028, 4, 4); // ~10 Dhu al-Hijjah 1449, tabular estimate
    document.getElementById("du-date-label").textContent = "Expected Eid al-Adha — " + tpFmtDate(target);
  } else if (kind === "easter") {
    // Western Easter Sunday, computed with the Anonymous Gregorian algorithm.
    // Verified: 2026-04-05, 2027-03-28, 2028-04-16, 2029-04-01, 2030-04-21.
    function easterSunday(yr) {
      var a = yr % 19, b = Math.floor(yr / 100), c = yr % 100,
          d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
          g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
          i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
          m = Math.floor((a + 11 * h + 22 * l) / 451);
      var month = Math.floor((h + l - 7 * m + 114) / 31);
      var day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(yr, month - 1, day);
    }
    target = easterSunday(y);
    if (target < tpStartOfDay(now)) target = easterSunday(y + 1);
    document.getElementById("du-date-label").textContent = "Easter Sunday — " + tpFmtDate(target);
  } else if (kind === "valentine") {
    target = new Date(y, 1, 14);
    if (target < tpStartOfDay(now)) target = new Date(y + 1, 1, 14);
    document.getElementById("du-date-label").textContent = "Valentine's Day — " + tpFmtDate(target);
  }
  if (target) tpCountdownCells("du", target);
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

// ==== PURE: add/subtract days + age difference ====
function tpAddDays(date, n) {
  var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}
/* Gap between two birth dates: who is older, by how much (y/m/d + total days). */
function tpAgeDiff(a, b) {
  var total = tpDaysBetween(a, b); // signed: b after a -> positive
  if (total === 0) return { same: true, aOlder: false, ymd: { years: 0, months: 0, days: 0 }, totalDays: 0 };
  var older = total > 0 ? a : b, younger = total > 0 ? b : a;
  return { same: false, aOlder: total > 0, ymd: tpAgeYMD(older, younger), totalDays: Math.abs(total) };
}

// ==== DOM: Date calculator (add or subtract days) ====
(function () {
  var panel = document.getElementById("date-calc");
  if (!panel) return;
  var dir = 1;
  panel.querySelectorAll("[data-dir]").forEach(function (b) {
    b.addEventListener("click", function () {
      panel.querySelectorAll("[data-dir]").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      dir = parseInt(b.getAttribute("data-dir"), 10);
      run();
    });
  });
  panel.querySelectorAll("[data-days]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      panel.querySelectorAll("[data-days]").forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      document.getElementById("dc-days").value = chip.getAttribute("data-days");
      run();
    });
  });
  function isoToday() {
    var n = new Date();
    function p(x) { return (x < 10 ? "0" : "") + x; }
    return n.getFullYear() + "-" + p(n.getMonth() + 1) + "-" + p(n.getDate());
  }
  var dateIn = document.getElementById("dc-date");
  if (dateIn && !dateIn.value) dateIn.value = isoToday();
  function run() {
    tpHideError("dc-err");
    var base = tpParseYMD(dateIn.value);
    var n = parseInt(document.getElementById("dc-days").value, 10);
    if (!base) { tpShowError("dc-err", "Please pick a starting date."); return; }
    if (isNaN(n)) { tpShowError("dc-err", "Please type how many days to add or subtract."); return; }
    var out = tpAddDays(base, dir * n);
    document.getElementById("dc-out").textContent = tpFmtDate(out);
    document.getElementById("dc-note").textContent = Math.abs(n) + " day" + (Math.abs(n) === 1 ? "" : "s") +
      (dir > 0 ? " after " : " before ") + tpFmtDate(base) + " lands on " + tpFmtDate(out) + ".";
    document.getElementById("dc-result").classList.add("show");
  }
  document.getElementById("dc-go").addEventListener("click", run);
  ["dc-date", "dc-days"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", run);
  });
})();

// ==== DOM: Age difference calculator ====
(function () {
  var panel = document.getElementById("age-diff");
  if (!panel) return;
  function run() {
    tpHideError("ad-err");
    var a = tpParseYMD(document.getElementById("ad-a").value);
    var b = tpParseYMD(document.getElementById("ad-b").value);
    if (!a || !b) { tpShowError("ad-err", "Please pick both birth dates."); return; }
    var d = tpAgeDiff(a, b);
    if (d.same) {
      document.getElementById("ad-headline").textContent = "Born on the same day — no age gap at all.";
    } else {
      document.getElementById("ad-headline").textContent =
        d.ymd.years + " years, " + d.ymd.months + " months, " + d.ymd.days + " days apart";
    }
    document.getElementById("ad-total").textContent = d.totalDays.toLocaleString() + " days";
    document.getElementById("ad-born-a").textContent = tpFmtDate(a);
    document.getElementById("ad-born-b").textContent = tpFmtDate(b);
    document.getElementById("ad-older").textContent = d.same
      ? "Same age, exactly."
      : (d.aOlder ? "Person 1 is the older of the two." : "Person 2 is the older of the two.");
    document.getElementById("ad-result").classList.add("show");
  }
  document.getElementById("ad-go").addEventListener("click", run);
  ["ad-a", "ad-b"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () {
      if (document.getElementById("ad-a").value && document.getElementById("ad-b").value) run();
    });
  });
})();

// ==== DOM: World clock (current time for major cities) ====
(function () {
  var panel = document.getElementById("world-clock");
  if (!panel) return;
  var CITIES = [
    ["Los Angeles", "America/Los_Angeles"],
    ["New York", "America/New_York"],
    ["Chicago", "America/Chicago"],
    ["Toronto", "America/Toronto"],
    ["São Paulo", "America/Sao_Paulo"],
    ["London", "Europe/London"],
    ["Paris", "Europe/Paris"],
    ["Dubai", "Asia/Dubai"],
    ["Karachi", "Asia/Karachi"],
    ["Mumbai", "Asia/Kolkata"],
    ["Singapore", "Asia/Singapore"],
    ["Hong Kong", "Asia/Hong_Kong"],
    ["Tokyo", "Asia/Tokyo"],
    ["Sydney", "Australia/Sydney"]
  ];
  var grid = document.getElementById("wc-grid");
  if (!grid) return;
  CITIES.forEach(function (c, i) {
    var div = document.createElement("div");
    div.className = "wc-card";
    div.innerHTML = '<div class="wc-city">' + c[0] + '</div>' +
      '<div class="wc-time" id="wct-' + i + '">–</div>' +
      '<div class="wc-date" id="wcd-' + i + '">–</div>' +
      '<div class="wc-off" id="wco-' + i + '">–</div>';
    grid.appendChild(div);
  });
  function fmt(tz, opts) {
    var o = { timeZone: tz };
    for (var k in opts) o[k] = opts[k];
    return new Intl.DateTimeFormat("en-US", o).format(new Date());
  }
  function offsetFor(tz) {
    try {
      var s = fmt(tz, { timeZoneName: "shortOffset" }); // "GMT-4"
      var m = /(GMT[+-]\d{1,2}(?::\d{2})?)/.exec(s);
      if (m) return m[1];
    } catch (e) { /* fall through */ }
    try { return fmt(tz, { timeZoneName: "short" }); } catch (e2) { /* ignore */ }
    return "";
  }
  function tick() {
    CITIES.forEach(function (c, i) {
      var t = document.getElementById("wct-" + i);
      if (!t) return;
      t.textContent = fmt(c[1], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      document.getElementById("wcd-" + i).textContent =
        fmt(c[1], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      document.getElementById("wco-" + i).textContent = offsetFor(c[1]);
    });
    var mine = document.getElementById("wc-mine");
    if (mine) {
      mine.textContent = "All times above use your device's clock — which is also how this page knows your own time.";
    }
    setTimeout(tick, 1000);
  }
  tick();
})();

/* ToolPixi — sunrise/sunset calculator (NOAA solar-position approximation) */
// ==== PURE ====
/* lat/lng in decimal degrees (east positive). date: a Date; its y/m/d are used.
   Returns {rise, set, noon} as UTC Date objects, or {polar:"day"|"night", noon}.
   Method: NOAA fractional-year equation-of-time + declination, 90.833° zenith
   (accounts for refraction and the sun's disc). Verified 2026-10-19 against
   published times for New York, London, Sydney and the equator. */
function tpSolarTimes(lat, lng, date) {
  var rad = Math.PI / 180;
  var y = date.getFullYear(), mo = date.getMonth(), d = date.getDate();
  var N = Math.floor((new Date(y, mo, d) - new Date(y, 0, 0)) / 86400000) + 1; // Jan 1 = 1
  var gamma = 2 * Math.PI / 365 * (N - 1);
  var eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma)); // minutes
  var decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma); // radians
  var latR = lat * rad;
  var cosH = (Math.cos(90.833 * rad) - Math.sin(latR) * Math.sin(decl)) / (Math.cos(latR) * Math.cos(decl));
  var noonMin = 720 - 4 * lng - eqtime; // solar noon, minutes UTC
  var noon = new Date(Date.UTC(y, mo, d) + noonMin * 60000);
  if (cosH > 1) return { polar: "night", noon: noon }; // sun never rises
  if (cosH < -1) return { polar: "day", noon: noon };   // sun never sets
  var Hmin = Math.acos(cosH) / rad / 15 * 60; // minutes from solar noon to rise/set
  return {
    rise: new Date(Date.UTC(y, mo, d) + (noonMin - Hmin) * 60000),
    set: new Date(Date.UTC(y, mo, d) + (noonMin + Hmin) * 60000),
    noon: noon, polar: null
  };
}
var TP_SUN_CITIES = [
  ["New York", 40.71, -74.0, "America/New_York"],
  ["Los Angeles", 34.05, -118.24, "America/Los_Angeles"],
  ["Chicago", 41.88, -87.63, "America/Chicago"],
  ["Houston", 29.76, -95.37, "America/Chicago"],
  ["London", 51.5, -0.13, "Europe/London"],
  ["Paris", 48.85, 2.35, "Europe/Paris"],
  ["Cairo", 30.04, 31.24, "Africa/Cairo"],
  ["Dubai", 25.2, 55.27, "Asia/Dubai"],
  ["Karachi", 24.86, 67.0, "Asia/Karachi"],
  ["Delhi", 28.61, 77.21, "Asia/Kolkata"],
  ["Dhaka", 23.81, 90.41, "Asia/Dhaka"],
  ["Tokyo", 35.68, 139.69, "Asia/Tokyo"],
  ["Sydney", -33.87, 151.21, "Australia/Sydney"],
  ["São Paulo", -23.55, -46.63, "America/Sao_Paulo"]
];

// ==== DOM: sunrise/sunset calculator ====
(function () {
  var panel = document.getElementById("sun-calc");
  if (!panel) return;
  var citySel = document.getElementById("ss-city"), latIn = document.getElementById("ss-lat"),
      lngIn = document.getElementById("ss-lng"), dateIn = document.getElementById("ss-date");
  TP_SUN_CITIES.forEach(function (c, i) {
    var o = document.createElement("option");
    o.value = String(i); o.textContent = c[0];
    citySel.appendChild(o);
  });
  var oc = document.createElement("option");
  oc.value = "custom"; oc.textContent = "Custom location…";
  citySel.appendChild(oc);
  function useCity(i) {
    var c = TP_SUN_CITIES[i];
    latIn.value = c[1]; lngIn.value = c[2];
  }
  citySel.addEventListener("change", function () {
    if (citySel.value !== "custom") useCity(parseInt(citySel.value, 10));
  });
  useCity(0);
  var t = new Date();
  dateIn.value = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  function fmtT(d, tz) {
    try { return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }); }
    catch (e) { return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }); }
  }
  function run() {
    tpHideError("ss-err");
    var lat = parseFloat(latIn.value), lng = parseFloat(lngIn.value);
    var dt = tpParseYMD(dateIn.value);
    if (isNaN(lat) || lat < -90 || lat > 90) { tpShowError("ss-err", "Latitude must be between -90 and 90."); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { tpShowError("ss-err", "Longitude must be between -180 and 180."); return; }
    if (!dt) { tpShowError("ss-err", "Please pick a date."); return; }
    var custom = citySel.value === "custom";
    var tz = custom ? "UTC" : TP_SUN_CITIES[parseInt(citySel.value, 10)][3];
    var cityName = custom ? "your location" : TP_SUN_CITIES[parseInt(citySel.value, 10)][0];
    var r = tpSolarTimes(lat, lng, dt);
    document.getElementById("ss-noon").textContent = fmtT(r.noon, tz) + (custom ? " UTC" : "");
    if (r.polar) {
      document.getElementById("ss-sunrise").textContent = "—";
      document.getElementById("ss-sunset").textContent = "—";
      document.getElementById("ss-daylen").textContent = r.polar === "day" ? "24 hours" : "0 hours";
      document.getElementById("ss-tznote").textContent = (r.polar === "day" ? "Polar day" : "Polar night") +
        " in " + cityName + " on " + tpFmtDate(dt) + " — the sun " +
        (r.polar === "day" ? "doesn't set." : "doesn't rise.");
    } else {
      document.getElementById("ss-sunrise").textContent = fmtT(r.rise, tz) + (custom ? " UTC" : "");
      document.getElementById("ss-sunset").textContent = fmtT(r.set, tz) + (custom ? " UTC" : "");
      var mins = Math.round((r.set - r.rise) / 60000);
      document.getElementById("ss-daylen").textContent = Math.floor(mins / 60) + " h " + (mins % 60) + " min";
      document.getElementById("ss-tznote").textContent = custom
        ? "Times shown in UTC — a time zone can't be derived from coordinates alone."
        : "Times shown in " + cityName + "'s local time (daylight saving applied automatically).";
    }
    document.getElementById("ss-result").classList.add("show");
  }
  document.getElementById("ss-go").addEventListener("click", run);
  run();
})();

// ==== DOM: Weekday Calculator ====
(function () {
  var panel = document.getElementById("weekday-calc");
  if (!panel) return;
  var NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function run(silent) {
    tpHideError("wd-err");
    var v = document.getElementById("wd-date").value;
    if (!v) { if (!silent) tpShowError("wd-err", "Please pick a date."); return; }
    var d = tpParseYMD(v);
    if (!d) { if (!silent) tpShowError("wd-err", "Please pick a valid date."); return; }
    document.getElementById("wd-day").textContent = NAMES[d.getDay()];
    document.getElementById("wd-full").textContent = tpFmtDate(d);
    var diff = tpDaysBetween(new Date(), d);
    document.getElementById("wd-note").textContent = diff === 0
      ? "That's today."
      : diff > 0
        ? diff + (diff === 1 ? " day" : " days") + " from now."
        : (-diff) + ((-diff) === 1 ? " day" : " days") + " ago.";
    document.getElementById("wd-result").classList.add("show");
  }
  document.getElementById("wd-go").addEventListener("click", function () { run(false); });
  document.getElementById("wd-date").addEventListener("change", function () { run(true); });
})();

// ==== DOM: Business Days Calculator ====
(function () {
  var panel = document.getElementById("biz-days");
  if (!panel) return;
  function run(silent) {
    tpHideError("bz-err");
    var a = tpParseYMD(document.getElementById("bz-from").value);
    var b = tpParseYMD(document.getElementById("bz-to").value);
    if (!a || !b) { if (!silent) tpShowError("bz-err", "Please pick both dates."); return; }
    var inclusive = document.getElementById("bz-inclusive").checked;
    var sA = tpStartOfDay(a), sB = tpStartOfDay(b);
    var start = sA <= sB ? sA : sB, end = sA <= sB ? sB : sA;
    var cal = 0, biz = 0, d = new Date(start.getTime());
    while (d.getTime() < end.getTime()) {
      cal++;
      var wd = d.getDay();
      if (wd !== 0 && wd !== 6) biz++;
      d.setDate(d.getDate() + 1);
    }
    if (inclusive) {
      cal++;
      var wd2 = end.getDay();
      if (wd2 !== 0 && wd2 !== 6) biz++;
    }
    document.getElementById("bz-biz").textContent = biz + (biz === 1 ? " business day" : " business days");
    document.getElementById("bz-cal").textContent = cal + " calendar " + (cal === 1 ? "day" : "days");
    document.getElementById("bz-note").textContent =
      "Counts Monday–Friday only. Public holidays are not excluded — they differ by country and employer, so add those yourself.";
    document.getElementById("bz-result").classList.add("show");
  }
  ["bz-from", "bz-to", "bz-inclusive"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () { run(true); });
  });
  document.getElementById("bz-go").addEventListener("click", function () { run(false); });
})();

// ==== DOM: Pregnancy Due Date Calculator (Naegele's rule) ====
(function () {
  var panel = document.getElementById("preg-due");
  if (!panel) return;
  function run(silent) {
    tpHideError("pd-err");
    var v = document.getElementById("pd-lmp").value;
    if (!v) { if (!silent) tpShowError("pd-err", "Please pick the first day of your last period."); return; }
    var lmp = tpParseYMD(v);
    if (!lmp) { if (!silent) tpShowError("pd-err", "Please pick a valid date."); return; }
    var due = tpAddDays(lmp, 280);
    document.getElementById("pd-due").textContent = tpFmtDate(due);
    var today = tpStartOfDay(new Date());
    if (tpStartOfDay(lmp).getTime() <= today.getTime()) {
      var days = tpDaysBetween(lmp, today);
      var weeks = Math.floor(days / 7), rem = days % 7;
      document.getElementById("pd-progress").textContent =
        "About " + weeks + " weeks" + (rem ? ", " + rem + " day" + (rem > 1 ? "s" : "") : "") + " along.";
      document.getElementById("pd-tri").textContent =
        weeks < 14 ? "First trimester (weeks 1–13)." :
        weeks < 28 ? "Second trimester (weeks 14–27)." : "Third trimester (weeks 28–40).";
    } else {
      document.getElementById("pd-progress").textContent =
        "That date is in the future — the estimate below treats it as the first day of the last period.";
      document.getElementById("pd-tri").textContent = "—";
    }
    document.getElementById("pd-conc").textContent =
      "Estimated conception: " + tpFmtDate(tpAddDays(lmp, 14)) +
      " (ovulation timing is an estimate — only an ultrasound dates a pregnancy precisely).";
    document.getElementById("pd-result").classList.add("show");
  }
  document.getElementById("pd-go").addEventListener("click", function () { run(false); });
  document.getElementById("pd-lmp").addEventListener("change", function () { run(true); });
})();

// ==== DOM: Zodiac Sign Calculator ====
(function () {
  var panel = document.getElementById("zodiac-calc");
  if (!panel) return;
  // start month, start day, name, element, one-line trait
  var SIGNS = [
    [1, 20, "Aquarius", "Air", "Independent, curious and a little rebellious."],
    [2, 19, "Pisces", "Water", "Dreamy, kind and deeply imaginative."],
    [3, 21, "Aries", "Fire", "Bold, energetic and first through the door."],
    [4, 20, "Taurus", "Earth", "Steady, loyal and fond of the good things."],
    [5, 21, "Gemini", "Air", "Quick, talkative and full of ideas."],
    [6, 21, "Cancer", "Water", "Warm, protective and home-loving."],
    [7, 23, "Leo", "Fire", "Confident, generous and born to shine."],
    [8, 23, "Virgo", "Earth", "Precise, thoughtful and quietly helpful."],
    [9, 23, "Libra", "Air", "Fair-minded, charming and a natural peace-keeper."],
    [10, 23, "Scorpio", "Water", "Intense, loyal and hard to read."],
    [11, 22, "Sagittarius", "Fire", "Adventurous, honest and freedom-loving."],
    [12, 22, "Capricorn", "Earth", "Patient, practical and quietly ambitious."]
  ];
  var RANGES = {
    "Aquarius": "20 January – 18 February", "Pisces": "19 February – 20 March",
    "Aries": "21 March – 19 April", "Taurus": "20 April – 20 May",
    "Gemini": "21 May – 20 June", "Cancer": "21 June – 22 July",
    "Leo": "23 July – 22 August", "Virgo": "23 August – 22 September",
    "Libra": "23 September – 22 October", "Scorpio": "23 October – 21 November",
    "Sagittarius": "22 November – 21 December", "Capricorn": "22 December – 19 January"
  };
  function signFor(m, day) {
    var cur = SIGNS[11]; // Capricorn covers 1–19 January
    for (var i = 0; i < SIGNS.length; i++) {
      var s = SIGNS[i];
      if (s[0] < m || (s[0] === m && day >= s[1])) cur = s;
    }
    return cur;
  }
  function run(silent) {
    tpHideError("zx-err");
    var v = document.getElementById("zx-dob").value;
    if (!v) { if (!silent) tpShowError("zx-err", "Please pick your date of birth."); return; }
    var d = tpParseYMD(v);
    if (!d) { if (!silent) tpShowError("zx-err", "Please pick a valid date."); return; }
    var s = signFor(d.getMonth() + 1, d.getDate());
    document.getElementById("zx-sign").textContent = s[2];
    document.getElementById("zx-range").textContent = RANGES[s[2]];
    document.getElementById("zx-element").textContent = "Element: " + s[3];
    document.getElementById("zx-trait").textContent = s[4];
    document.getElementById("zx-result").classList.add("show");
  }
  document.getElementById("zx-go").addEventListener("click", function () { run(false); });
  document.getElementById("zx-dob").addEventListener("change", function () { run(true); });
})();

/* ToolPixi — Time Zone Converter (Intl-based; DST handled by the API) */
// ==== PURE ====
// Wall-clock components in `tz` -> UTC timestamp. Iterates the Intl
// round-trip so the offset in force on that date (including DST) is used.
function tpTzParts(instant, tz) {
  var parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(instant);
  var map = {};
  parts.forEach(function (p) { map[p.type] = p.value; });
  return map;
}
function tpTzOffsetMinutes(instant, tz) {
  var p = tpTzParts(instant, tz);
  var h = parseInt(p.hour, 10);
  var asUtc = Date.UTC(parseInt(p.year, 10), parseInt(p.month, 10) - 1,
    parseInt(p.day, 10), h === 24 ? 0 : h, parseInt(p.minute, 10), parseInt(p.second, 10));
  if (h === 24) asUtc += 86400000; // some engines report midnight as hour 24
  return Math.round((asUtc - instant.getTime()) / 60000);
}
function tpTzWallToUtc(y, mo, d, h, mi, tz) {
  var target = Date.UTC(y, mo - 1, d, h, mi);
  var guess = target;
  for (var i = 0; i < 3; i++) {
    var p = tpTzParts(new Date(guess), tz);
    var hh = parseInt(p.hour, 10);
    var asUtc = Date.UTC(parseInt(p.year, 10), parseInt(p.month, 10) - 1,
      parseInt(p.day, 10), hh === 24 ? 0 : hh, parseInt(p.minute, 10), parseInt(p.second, 10));
    if (hh === 24) asUtc += 86400000;
    guess = target - (asUtc - guess);
  }
  return guess;
}
function tpFmtOffset(min) {
  var sign = min < 0 ? "-" : "+";
  var a = Math.abs(min);
  var h = Math.floor(a / 60), m = a % 60;
  return "UTC" + sign + h + (m ? ":" + (m < 10 ? "0" + m : m) : "");
}
function tpFmtGap(min) {
  var a = Math.abs(min);
  var h = Math.floor(a / 60), m = a % 60;
  var bits = [];
  if (h) bits.push(h + (h === 1 ? " hour" : " hours"));
  if (m) bits.push(m + (m === 1 ? " minute" : " minutes"));
  return bits.join(" ") || "0 minutes";
}

// ==== DOM: Time Zone Converter ====
(function () {
  var panel = document.getElementById("tz-convert");
  if (!panel) return;
  var ZONES = [
    ["UTC (Coordinated Universal Time)", "UTC"],
    ["Los Angeles (Pacific)", "America/Los_Angeles"],
    ["Denver (Mountain)", "America/Denver"],
    ["Chicago (Central)", "America/Chicago"],
    ["New York (Eastern)", "America/New_York"],
    ["Toronto (Eastern)", "America/Toronto"],
    ["Mexico City (Central)", "America/Mexico_City"],
    ["São Paulo", "America/Sao_Paulo"],
    ["London", "Europe/London"],
    ["Paris (Central European)", "Europe/Paris"],
    ["Berlin (Central European)", "Europe/Berlin"],
    ["Moscow", "Europe/Moscow"],
    ["Cairo", "Africa/Cairo"],
    ["Dubai (Gulf)", "Asia/Dubai"],
    ["Karachi (Pakistan)", "Asia/Karachi"],
    ["Kolkata (India)", "Asia/Kolkata"],
    ["Dhaka (Bangladesh)", "Asia/Dhaka"],
    ["Bangkok", "Asia/Bangkok"],
    ["Singapore", "Asia/Singapore"],
    ["Hong Kong", "Asia/Hong_Kong"],
    ["Shanghai (China)", "Asia/Shanghai"],
    ["Tokyo (Japan)", "Asia/Tokyo"],
    ["Seoul (Korea)", "Asia/Seoul"],
    ["Sydney (Australia East)", "Australia/Sydney"],
    ["Auckland (New Zealand)", "Pacific/Auckland"]
  ];
  var fromSel = document.getElementById("tz-from"), toSel = document.getElementById("tz-to");
  ZONES.forEach(function (z) {
    [fromSel, toSel].forEach(function (sel) {
      var o = document.createElement("option");
      o.value = z[1]; o.textContent = z[0]; sel.appendChild(o);
    });
  });
  var mine = null;
  try { mine = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* ignore */ }
  fromSel.value = ZONES.some(function (z) { return z[1] === mine; }) ? mine : "America/New_York";
  toSel.value = "Europe/London";
  var dtEl = document.getElementById("tz-dt");
  if (!dtEl.value) {
    var n = new Date();
    var pad = function (v) { return (v < 10 ? "0" : "") + v; };
    dtEl.value = n.getFullYear() + "-" + pad(n.getMonth() + 1) + "-" + pad(n.getDate()) +
      "T" + pad(n.getHours()) + ":" + pad(n.getMinutes());
  }
  function zoneLabel(tz) {
    for (var i = 0; i < ZONES.length; i++) if (ZONES[i][1] === tz) return ZONES[i][0].split(" (")[0];
    return tz;
  }
  function run(silent) {
    tpHideError("tz-err");
    var v = dtEl.value;
    if (!v) { if (!silent) tpShowError("tz-err", "Please pick a date and time."); return; }
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
    if (!m) { if (!silent) tpShowError("tz-err", "Please pick a valid date and time."); return; }
    var fromTz = fromSel.value, toTz = toSel.value;
    var utcMs;
    try {
      utcMs = tpTzWallToUtc(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10),
        parseInt(m[4], 10), parseInt(m[5], 10), fromTz);
      var instant = new Date(utcMs);
      var timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: toTz, hour: "2-digit", minute: "2-digit", hour12: true });
      var dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: toTz, weekday: "long", month: "long", day: "numeric", year: "numeric" });
      document.getElementById("tz-out").textContent = timeFmt.format(instant);
      document.getElementById("tz-outdate").textContent =
        "That is " + dateFmt.format(instant) + " in " + zoneLabel(toTz) + ".";
      var fromOff = tpTzOffsetMinutes(instant, fromTz), toOff = tpTzOffsetMinutes(instant, toTz);
      var gap = toOff - fromOff;
      document.getElementById("tz-diff").textContent = zoneLabel(toTz) + " is " + tpFmtGap(gap) +
        (gap >= 0 ? " ahead of " : " behind ") + zoneLabel(fromTz) + " at this time.";
      document.getElementById("tz-offs").textContent =
        zoneLabel(fromTz) + ": " + tpFmtOffset(fromOff) + " · " +
        zoneLabel(toTz) + ": " + tpFmtOffset(toOff) + " at this time.";
      document.getElementById("tz-result").classList.add("show");
    } catch (e) {
      if (!silent) tpShowError("tz-err", "That time zone is not supported by this browser. Try a modern browser.");
    }
  }
  document.getElementById("tz-go").addEventListener("click", function () { run(false); });
  document.getElementById("tz-swap").addEventListener("click", function () {
    var t = fromSel.value; fromSel.value = toSel.value; toSel.value = t; run(false);
  });
  ["tz-dt", "tz-from", "tz-to"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () { run(true); });
  });
  run(true);
})();
