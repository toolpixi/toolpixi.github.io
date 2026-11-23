/* ToolPixi — Resume Builder.
   A real form, a live A4 preview in three clean templates, and a PDF
   rendered locally with jsPDF. No sign-up, no watermark, no "free
   preview, pay to download" wall — and nothing you type is uploaded. */
(function () {
  var panel = document.getElementById("resume-builder");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- dynamic entry lists ---------------- */
  function entryHTML(kind, data) {
    data = data || {};
    if (kind === "exp") {
      return '<div class="rb-entry">' +
        '<div class="row"><div class="field"><label>Job title</label><input type="text" class="rb-role" value="' + esc(data.role) + '" placeholder="e.g. Sales Manager"></div>' +
        '<div class="field"><label>Company</label><input type="text" class="rb-company" value="' + esc(data.company) + '" placeholder="e.g. Bright Retail Ltd"></div>' +
        '<div class="field"><label>Dates</label><input type="text" class="rb-dates" value="' + esc(data.dates) + '" placeholder="e.g. 2021 — Present"></div></div>' +
        '<div class="field"><label>What you did (one achievement per line works best)</label>' +
        '<textarea class="rb-desc" rows="3" placeholder="Grew territory sales 24% in one year&#10;Trained a team of six">' + esc(data.desc) + "</textarea></div>" +
        '<button type="button" class="rb-rm">Remove this job</button></div>';
    }
    return '<div class="rb-entry">' +
      '<div class="row"><div class="field"><label>School / university</label><input type="text" class="rb-school" value="' + esc(data.school) + '" placeholder="e.g. City University"></div>' +
      '<div class="field"><label>Qualification</label><input type="text" class="rb-degree" value="' + esc(data.degree) + '" placeholder="e.g. BSc Business Administration"></div>' +
      '<div class="field"><label>Dates</label><input type="text" class="rb-dates" value="' + esc(data.dates) + '" placeholder="e.g. 2016 — 2020"></div></div>' +
      '<button type="button" class="rb-rm">Remove this entry</button></div>';
  }

  function wireList(listId, kind) {
    var list = el(listId);
    list.querySelectorAll(".rb-rm").forEach(function (b) {
      b.onclick = function () { b.closest(".rb-entry").remove(); render(); };
    });
  }
  function addEntry(listId, kind, data) {
    var wrap = document.createElement("div");
    wrap.innerHTML = entryHTML(kind, data);
    el(listId).appendChild(wrap.firstChild);
    wireList(listId, kind);
    render();
  }

  el("rb-add-exp").addEventListener("click", function () { addEntry("rb-exp-list", "exp"); });
  el("rb-add-edu").addEventListener("click", function () { addEntry("rb-edu-list", "edu"); });

  /* ---------------- data ---------------- */
  function val(id) { return el(id).value.trim(); }
  function collect() {
    var exp = [];
    el("rb-exp-list").querySelectorAll(".rb-entry").forEach(function (e) {
      exp.push({
        role: e.querySelector(".rb-role").value.trim(),
        company: e.querySelector(".rb-company").value.trim(),
        dates: e.querySelector(".rb-dates").value.trim(),
        desc: e.querySelector(".rb-desc").value.trim()
      });
    });
    var edu = [];
    el("rb-edu-list").querySelectorAll(".rb-entry").forEach(function (e) {
      edu.push({
        school: e.querySelector(".rb-school").value.trim(),
        degree: e.querySelector(".rb-degree").value.trim(),
        dates: e.querySelector(".rb-dates").value.trim()
      });
    });
    return {
      name: val("rb-name"), title: val("rb-title"),
      email: val("rb-email"), phone: val("rb-phone"),
      location: val("rb-location"), web: val("rb-web"),
      summary: val("rb-summary"),
      skills: val("rb-skills").split(",").map(function (s) { return s.trim(); }).filter(Boolean),
      exp: exp.filter(function (x) { return x.role || x.company || x.desc; }),
      edu: edu.filter(function (x) { return x.school || x.degree; }),
      template: el("rb-template").value,
      accent: el("rb-accent").value || "#0d7377"
    };
  }

  /* ---------------- HTML preview ---------------- */
  function render() {
    var d = collect();
    var a = d.accent;
    var contact = [d.email, d.phone, d.location, d.web].filter(Boolean).map(esc).join(" &nbsp;·&nbsp; ");
    var head = "", body = "", font = "Arial, Helvetica, sans-serif";
    if (d.template === "modern") {
      head = '<div style="background:' + a + ';color:#fff;padding:20px 24px;margin:-24px -24px 16px">' +
        '<div style="font-size:26px;font-weight:800;line-height:1.15">' + esc(d.name || "Your Name") + "</div>" +
        (d.title ? '<div style="font-size:13.5px;opacity:.92;margin-top:3px">' + esc(d.title) + "</div>" : "") +
        (contact ? '<div style="font-size:10.5px;opacity:.85;margin-top:7px">' + contact + "</div>" : "") + "</div>";
    } else if (d.template === "classic") {
      font = "Georgia, 'Times New Roman', serif";
      head = '<div style="text-align:center;border-bottom:2.5px solid #444;padding-bottom:12px;margin-bottom:14px">' +
        '<div style="font-size:26px;font-weight:700;letter-spacing:.4px">' + esc(d.name || "Your Name") + "</div>" +
        (d.title ? '<div style="font-size:13px;color:#555;margin-top:3px">' + esc(d.title) + "</div>" : "") +
        (contact ? '<div style="font-size:10.5px;color:#666;margin-top:6px">' + contact + "</div>" : "") + "</div>";
    } else {
      head = '<div style="border-bottom:1px solid #ddd;padding-bottom:12px;margin-bottom:14px">' +
        '<div style="font-size:25px;font-weight:300;letter-spacing:1.5px;text-transform:uppercase">' + esc(d.name || "Your Name") + "</div>" +
        (d.title ? '<div style="font-size:12.5px;color:' + a + ';margin-top:4px;letter-spacing:.6px">' + esc(d.title) + "</div>" : "") +
        (contact ? '<div style="font-size:10.5px;color:#777;margin-top:6px">' + contact + "</div>" : "") + "</div>";
    }
    function section(title, inner) {
      if (!inner) return "";
      var h = d.template === "classic"
        ? '<div style="font-size:12px;font-weight:700;letter-spacing:1.6px;color:#444;border-bottom:1px solid #bbb;padding-bottom:3px;margin:16px 0 8px">' + title + "</div>"
        : '<div style="font-size:12px;font-weight:800;letter-spacing:1.6px;color:' + a + ";margin:16px 0 8px\">" + title + "</div>";
      return h + inner;
    }
    if (d.summary) body += section("SUMMARY", '<p style="margin:0;font-size:11.5px;line-height:1.55">' + esc(d.summary) + "</p>");
    if (d.exp.length) {
      body += section("EXPERIENCE", d.exp.map(function (x) {
        var bullets = x.desc.split(/\n+/).filter(Boolean).map(function (ln) {
          return '<div style="font-size:11.5px;line-height:1.5;padding-left:13px;text-indent:-9px">•&nbsp;' + esc(ln) + "</div>";
        }).join("");
        return '<div style="margin-bottom:11px"><div style="display:flex;justify-content:space-between;gap:10px">' +
          '<span style="font-size:13px;font-weight:700">' + esc(x.role) + "</span>" +
          '<span style="font-size:10.5px;color:#777;white-space:nowrap">' + esc(x.dates) + "</span></div>" +
          (x.company ? '<div style="font-size:11.5px;color:' + a + ';font-weight:600">' + esc(x.company) + "</div>" : "") +
          bullets + "</div>";
      }).join(""));
    }
    if (d.skills.length) {
      body += section("SKILLS", '<p style="margin:0;font-size:11.5px;line-height:1.6">' +
        d.skills.map(esc).join(" &nbsp;·&nbsp; ") + "</p>");
    }
    if (d.edu.length) {
      body += section("EDUCATION", d.edu.map(function (x) {
        return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:10px">' +
          '<span style="font-size:12.5px;font-weight:700">' + esc(x.degree || x.school) + "</span>" +
          '<span style="font-size:10.5px;color:#777;white-space:nowrap">' + esc(x.dates) + "</span></div>" +
          (x.degree && x.school ? '<div style="font-size:11.5px;color:#555">' + esc(x.school) + "</div>" : "") + "</div>";
      }).join(""));
    }
    el("rb-preview").innerHTML =
      '<div style="font-family:' + font + ';color:#222;background:#fff;padding:24px;min-height:100%;box-sizing:border-box">' +
      head + body + "</div>";
  }

  /* ---------------- PDF export (jsPDF) ---------------- */
  function hexRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  el("rb-download").addEventListener("click", function () {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      tpShowError("rb-err", "The PDF engine is still loading — give it a second and press the button again.");
      return;
    }
    var d = collect();
    if (!d.name) {
      tpShowError("rb-err", "Add your name first — a resume without a name is just a list.");
      el("rb-name").focus();
      return;
    }
    tpHideError("rb-err");
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210, M = 16, R = W - M, CW = R - M;
    var acc = hexRgb(d.accent);
    var dark = [30, 32, 38], gray = [110, 116, 128];
    var serif = d.template === "classic";
    var F = serif ? "times" : "helvetica";
    var y = 16;

    function need(h) { if (y + h > 282) { doc.addPage(); y = 16; } }
    function wrap(text, size, w) {
      doc.setFontSize(size);
      return doc.splitTextToSize(text || "", w || CW);
    }
    function para(text, size, lh, color, font, style) {
      var lines = wrap(text, size);
      need(lines.length * lh + 2);
      doc.setFont(font || F, style || "normal");
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(lines, M, y);
      y += lines.length * lh;
    }
    function sectionH(title) {
      need(12);
      y += 4;
      if (serif) {
        doc.setFont(F, "bold"); doc.setFontSize(11.5); doc.setTextColor(68, 68, 68);
        doc.text(title, M, y);
        doc.setDrawColor(180, 180, 180); doc.line(M, y + 1.8, R, y + 1.8);
      } else {
        doc.setFont(F, "bold"); doc.setFontSize(11.5);
        doc.setTextColor(acc[0], acc[1], acc[2]);
        doc.text(title, M, y);
        if (d.template === "modern") {
          doc.setDrawColor(acc[0], acc[1], acc[2]); doc.setLineWidth(0.5);
          doc.line(M, y + 1.8, R, y + 1.8); doc.setLineWidth(0.2);
        }
      }
      y += 7;
    }

    // Header
    var contact = [d.email, d.phone, d.location, d.web].filter(Boolean).join("  ·  ");
    if (d.template === "modern") {
      doc.setFillColor(acc[0], acc[1], acc[2]);
      doc.rect(0, 0, W, 34, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont(F, "bold"); doc.setFontSize(23);
      doc.text(d.name, M, 16);
      doc.setFont(F, "normal"); doc.setFontSize(11.5);
      if (d.title) doc.text(d.title, M, 23);
      doc.setFontSize(9);
      if (contact) doc.text(contact, M, 29.5);
      y = 44;
    } else if (serif) {
      doc.setFont(F, "bold"); doc.setFontSize(23); doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(d.name, W / 2, y, { align: "center" }); y += 7;
      if (d.title) { doc.setFont(F, "italic"); doc.setFontSize(12); doc.setTextColor(85, 85, 85); doc.text(d.title, W / 2, y, { align: "center" }); y += 6; }
      if (contact) { doc.setFont(F, "normal"); doc.setFontSize(9); doc.setTextColor(gray[0], gray[1], gray[2]); doc.text(contact, W / 2, y, { align: "center" }); y += 5; }
      doc.setDrawColor(68, 68, 68); doc.setLineWidth(0.7); doc.line(M, y, R, y); doc.setLineWidth(0.2);
      y += 6;
    } else {
      doc.setFont(F, "normal"); doc.setFontSize(22); doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(d.name.toUpperCase(), M, y); y += 7;
      if (d.title) { doc.setFontSize(11.5); doc.setTextColor(acc[0], acc[1], acc[2]); doc.text(d.title, M, y); y += 6; }
      if (contact) { doc.setFontSize(9); doc.setTextColor(gray[0], gray[1], gray[2]); doc.text(contact, M, y); y += 5; }
      doc.setDrawColor(220, 220, 220); doc.line(M, y, R, y);
      y += 6;
    }

    if (d.summary) { sectionH("SUMMARY"); para(d.summary, 10.5, 5, dark); }
    if (d.exp.length) {
      sectionH("EXPERIENCE");
      d.exp.forEach(function (x) {
        need(14);
        doc.setFont(F, "bold"); doc.setFontSize(11.5); doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(x.role || "", M, y);
        if (x.dates) { doc.setFont(F, "normal"); doc.setFontSize(9.5); doc.setTextColor(gray[0], gray[1], gray[2]); doc.text(x.dates, R, y, { align: "right" }); }
        y += 5.5;
        if (x.company) { doc.setFont(F, "bold"); doc.setFontSize(10.5); doc.setTextColor(acc[0], acc[1], acc[2]); doc.text(x.company, M, y); y += 5.5; }
        x.desc.split(/\n+/).filter(Boolean).forEach(function (ln) {
          var lines = wrap("•  " + ln, 10.5);
          need(lines.length * 5 + 1);
          doc.setFont(F, "normal"); doc.setFontSize(10.5); doc.setTextColor(dark[0], dark[1], dark[2]);
          doc.text(lines, M, y);
          y += lines.length * 5;
        });
        y += 3;
      });
    }
    if (d.skills.length) { sectionH("SKILLS"); para(d.skills.join("  ·  "), 10.5, 5.5, dark); }
    if (d.edu.length) {
      sectionH("EDUCATION");
      d.edu.forEach(function (x) {
        need(11);
        doc.setFont(F, "bold"); doc.setFontSize(11); doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(x.degree || x.school || "", M, y);
        if (x.dates) { doc.setFont(F, "normal"); doc.setFontSize(9.5); doc.setTextColor(gray[0], gray[1], gray[2]); doc.text(x.dates, R, y, { align: "right" }); }
        y += 5.5;
        if (x.degree && x.school) { doc.setFont(F, "normal"); doc.setFontSize(10.5); doc.setTextColor(85, 85, 85); doc.text(x.school, M, y); y += 5.5; }
        y += 1.5;
      });
    }

    var fname = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
    doc.save(fname + "-resume.pdf");
  });

  /* ---------------- seed + live wiring ---------------- */
  addEntry("rb-exp-list", "exp", {});
  addEntry("rb-edu-list", "edu", {});
  panel.addEventListener("input", render);
  panel.addEventListener("change", render);
  render();
})();
