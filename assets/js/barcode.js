/* ToolPixi — Barcode generator (JsBarcode, self-hosted) */
(function () {
  var panel = document.getElementById("bc-gen");
  if (!panel) return;
  var lastText = "", lastFormat = "";

  var HINTS = {
    "CODE128": "Code 128 takes letters, numbers and symbols — up to about 60 characters.",
    "EAN13": "EAN-13 takes digits only: type 12 digits and the check digit is added for you, or type all 13 and it is verified.",
    "UPC": "UPC-A takes digits only: type 11 digits and the check digit is added for you, or type all 12 and it is verified.",
    "CODE39": "Code 39 takes capital letters, numbers and the symbols - . $ / + % and spaces.",
    "ITF14": "ITF-14 takes digits only: type 13 digits and the check digit is added for you, or type all 14 and it is verified."
  };

  function validate(text, format) {
    if (!text) return "Type the number or text your barcode should hold first.";
    if (format === "EAN13") {
      if (!/^\d+$/.test(text)) return "EAN-13 is numbers only — remove any letters or symbols.";
      if (text.length !== 12 && text.length !== 13)
        return "EAN-13 needs 12 digits (the check digit is added for you) or the full 13 digits. You typed " + text.length + ".";
    }
    if (format === "UPC") {
      if (!/^\d+$/.test(text)) return "UPC-A is numbers only — remove any letters or symbols.";
      if (text.length !== 11 && text.length !== 12)
        return "UPC-A needs 11 digits (the check digit is added for you) or the full 12 digits. You typed " + text.length + ".";
    }
    if (format === "ITF14") {
      if (!/^\d+$/.test(text)) return "ITF-14 is numbers only — remove any letters or symbols.";
      if (text.length !== 13 && text.length !== 14)
        return "ITF-14 needs 13 digits (the check digit is added for you) or the full 14 digits. You typed " + text.length + ".";
    }
    if (format === "CODE39") {
      if (!/^[0-9A-Z\-. $/+%]+$/.test(text.toUpperCase()))
        return "Code 39 cannot hold that character. It takes capital letters, numbers and - . $ / + % and spaces.";
    }
    if (format === "CODE128" && text.length > 80)
      return "That is very long for one barcode — scanners struggle past about 80 characters. Shorten it if you can.";
    return "";
  }

  function draw() {
    tpHideError("bc-err");
    if (typeof JsBarcode === "undefined") {
      tpShowError("bc-err", "The barcode engine could not be loaded. Check your internet connection and refresh the page.");
      return;
    }
    var format = document.getElementById("bc-format").value;
    var text = document.getElementById("bc-text").value.trim();
    if (format === "CODE39") text = text.toUpperCase();
    var problem = validate(text, format);
    if (problem) {
      tpShowError("bc-err", problem);
      document.getElementById("bc-result").classList.remove("show");
      return;
    }
    var svg = document.getElementById("bc-svg");
    try {
      JsBarcode(svg, text, {
        format: format,
        width: parseInt(document.getElementById("bc-width").value, 10) || 2,
        height: parseInt(document.getElementById("bc-height").value, 10) || 70,
        displayValue: document.getElementById("bc-showtext").checked,
        background: document.getElementById("bc-bg").value || "#ffffff",
        lineColor: document.getElementById("bc-fg").value || "#111111",
        margin: 12,
        fontSize: 16,
        textMargin: 4
      });
    } catch (e) {
      tpShowError("bc-err", "That text cannot be encoded as a " + format + " barcode. " + HINTS[format]);
      document.getElementById("bc-result").classList.remove("show");
      return;
    }
    lastText = text; lastFormat = format;
    // Report the full encoded value (JsBarcode may have appended a check
    // digit). EAN/UPC draw the value across several <text> elements, so
    // join them all before comparing.
    var joined = "";
    svg.querySelectorAll("text").forEach(function (t) { joined += t.textContent; });
    var full = joined.replace(/\s/g, "");
    var note = "";
    if (/^\d+$/.test(full) && full.length === text.length + 1 && full.indexOf(text) === 0)
      note = "Encoded value: " + full + " — the final check digit (" + full.slice(-1) + ") was calculated and added for you.";
    else if (/^\d+$/.test(full) && full === text)
      note = "Encoded value: " + full + " — check digit verified.";
    if (!note) note = "Encoded value: " + text + " (" + format + ").";
    document.getElementById("bc-dims").textContent = note;
    document.getElementById("bc-result").classList.add("show");
  }

  function svgString() {
    var svg = document.getElementById("bc-svg");
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  }

  document.getElementById("bc-go").addEventListener("click", draw);
  document.getElementById("bc-text").addEventListener("keydown", function (e) { if (e.key === "Enter") draw(); });
  ["bc-format", "bc-width", "bc-height", "bc-fg", "bc-bg", "bc-showtext"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () {
      if (lastText) draw();
    });
  });
  document.getElementById("bc-format").addEventListener("change", function () {
    document.getElementById("bc-hint").textContent = HINTS[document.getElementById("bc-format").value];
  });

  document.getElementById("bc-png").addEventListener("click", function () {
    if (!lastText) return;
    var str = svgString();
    var img = new Image();
    img.onload = function () {
      var scale = 3;
      var canvas = document.createElement("canvas");
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = document.getElementById("bc-bg").value || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function (b) { if (b) tpDownload(b, "barcode-" + lastFormat.toLowerCase() + ".png"); }, "image/png");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
  });

  document.getElementById("bc-svgdl").addEventListener("click", function () {
    if (!lastText) return;
    var blob = new Blob([svgString()], { type: "image/svg+xml;charset=utf-8" });
    tpDownload(blob, "barcode-" + lastFormat.toLowerCase() + ".svg");
  });
})();
