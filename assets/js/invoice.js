/* ToolPixi — Invoice Generator.
   A clean form in, a professional PDF invoice out — rendered with
   jsPDF entirely in the browser. No account, no sign-up wall, and the
   details you type never leave your device. */
(function () {
  var panel = document.getElementById("invoice-generator");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }

  var CURRENCIES = { USD: "$", EUR: "€", GBP: "£", INR: "₹", PKR: "Rs ", AED: "AED ", AUD: "A$", CAD: "C$" };
  function sym() { return CURRENCIES[el("inv-currency").value] || "$"; }
  function money(n) { return sym() + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function addItem(desc, qty, rate) {
    var row = document.createElement("div");
    row.className = "inv-item";
    row.innerHTML =
      '<input type="text" class="inv-desc" placeholder="Description of work or item" value="' + (desc || "") + '">' +
      '<input type="number" class="inv-qty" min="0" step="any" value="' + (qty || 1) + '" aria-label="Quantity">' +
      '<input type="number" class="inv-rate" min="0" step="any" value="' + (rate || 0) + '" aria-label="Rate">' +
      '<span class="inv-amt">—</span>' +
      '<button type="button" class="inv-rm" aria-label="Remove item">×</button>';
    el("inv-items").appendChild(row);
    row.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", recalc); });
    row.querySelector(".inv-rm").addEventListener("click", function () { row.remove(); recalc(); });
    recalc();
  }

  function items() {
    var out = [];
    el("inv-items").querySelectorAll(".inv-item").forEach(function (row) {
      var d = row.querySelector(".inv-desc").value.trim();
      var q = parseFloat(row.querySelector(".inv-qty").value) || 0;
      var r = parseFloat(row.querySelector(".inv-rate").value) || 0;
      out.push({ desc: d, qty: q, rate: r, amount: q * r, row: row });
    });
    return out;
  }

  function totals() {
    var list = items();
    var sub = list.reduce(function (a, i) { return a + i.amount; }, 0);
    var discPct = parseFloat(el("inv-discount").value) || 0;
    var disc = sub * discPct / 100;
    var taxPct = parseFloat(el("inv-tax").value) || 0;
    var tax = (sub - disc) * taxPct / 100;
    return { list: list, sub: sub, discPct: discPct, disc: disc, taxPct: taxPct, tax: tax, total: sub - disc + tax };
  }

  function recalc() {
    var t = totals();
    t.list.forEach(function (i) {
      i.row.querySelector(".inv-amt").textContent = money(i.amount);
    });
    el("inv-t-sub").textContent = money(t.sub);
    el("inv-t-disc").textContent = "−" + money(t.disc);
    el("inv-t-tax").textContent = money(t.tax);
    el("inv-t-total").textContent = money(t.total);
  }

  el("inv-add").addEventListener("click", function () { addItem("", 1, 0); });
  ["inv-tax", "inv-discount", "inv-currency"].forEach(function (id) {
    el(id).addEventListener("input", recalc);
  });

  // Defaults: today + 14 days.
  var today = new Date(), due = new Date(Date.now() + 14 * 864e5);
  function iso(d) { return d.toISOString().slice(0, 10); }
  el("inv-date").value = iso(today);
  el("inv-due").value = iso(due);

  addItem("Professional services", 1, 0);
  addItem("", 1, 0);
  recalc();

  el("inv-download").addEventListener("click", function () {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      tpShowError("inv-err", "The PDF engine is still loading — give it a second and press the button again.");
      return;
    }
    var t = totals();
    if (!t.list.length || t.sub === 0 && !t.list.some(function (i) { return i.desc; })) {
      tpShowError("inv-err", "Add at least one item with a description before downloading the invoice.");
      return;
    }
    tpHideError("inv-err");
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210, M = 16, R = W - M;
    var accent = [13, 115, 119];
    var dark = [25, 28, 35], gray = [105, 112, 125];

    // Header band
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, 0, W, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text("INVOICE", M, 19);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("#" + (el("inv-number").value || "INV-001"), R, 19, { align: "right" });

    var y = 42;
    function block(x, label, text) {
      doc.setTextColor(gray[0], gray[1], gray[2]); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      doc.text(label.toUpperCase(), x, y);
      doc.setTextColor(dark[0], dark[1], dark[2]); doc.setFontSize(10.5); doc.setFont("helvetica", "normal");
      var lines = doc.splitTextToSize(text || "—", 78);
      doc.text(lines, x, y + 5.5);
      return lines.length;
    }
    var n1 = block(M, "From", el("inv-from").value);
    var n2 = block(112, "Bill to", el("inv-to").value);
    y += 5.5 + Math.max(n1, n2) * 5 + 6;

    doc.setFontSize(10); doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("Issued: " + (el("inv-date").value || iso(today)) + "    ·    Due: " + (el("inv-due").value || iso(due)), M, y);
    y += 8;

    // Items table
    doc.setFillColor(243, 244, 246);
    doc.rect(M, y - 5, R - M, 9, "F");
    doc.setTextColor(dark[0], dark[1], dark[2]); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    doc.text("DESCRIPTION", M + 2, y + 1);
    doc.text("QTY", 128, y + 1, { align: "right" });
    doc.text("RATE", 156, y + 1, { align: "right" });
    doc.text("AMOUNT", R - 2, y + 1, { align: "right" });
    y += 9;
    doc.setFont("helvetica", "normal");
    t.list.forEach(function (i) {
      if (!i.desc && !i.amount) return;
      var lines = doc.splitTextToSize(i.desc || "—", 100);
      doc.text(lines, M + 2, y);
      doc.text(String(i.qty), 128, y, { align: "right" });
      doc.text(money(i.rate), 156, y, { align: "right" });
      doc.text(money(i.amount), R - 2, y, { align: "right" });
      y += Math.max(1, lines.length) * 5 + 1.5;
      doc.setDrawColor(229, 231, 235); doc.line(M, y - 2, R, y - 2);
      y += 2;
    });
    y += 4;

    // Totals
    function trow(label, val, bold) {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 11.5 : 10);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(label, 140, y);
      doc.text(val, R - 2, y, { align: "right" });
      y += bold ? 7 : 6;
    }
    trow("Subtotal", money(t.sub));
    if (t.disc) trow("Discount (" + t.discPct + "%)", "−" + money(t.disc));
    if (t.tax) trow("Tax (" + t.taxPct + "%)", money(t.tax));
    doc.setDrawColor(accent[0], accent[1], accent[2]); doc.setLineWidth(0.6);
    doc.line(140, y - 4.5, R, y - 4.5); doc.setLineWidth(0.2);
    trow("Total due", money(t.total), true);

    var notes = el("inv-notes").value.trim();
    if (notes) {
      y += 8;
      doc.setTextColor(gray[0], gray[1], gray[2]); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      doc.text("NOTES", M, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(doc.splitTextToSize(notes, R - M), M, y);
    }
    doc.save((el("inv-number").value || "invoice").replace(/[^\w-]+/g, "-") + ".pdf");
  });
})();
