/* ToolPixi — PDF to Word: rebuild a text-layer PDF as an editable .docx.
   Extraction runs locally with PDF.js; the document is built locally with
   the docx library. Nothing is uploaded. Honest scope: text-based PDFs
   only — scanned pages have no text layer to convert. */
(function () {
  var panel = document.getElementById("pdf-to-word");
  if (!panel) return;
  function el(id) { return document.getElementById(id); }
  var file = null;
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "/assets/vendor/pdf.worker.min.js";
  }
  tpDropzone("pdw-drop", "pdw-file", { accept: "application/pdf",
    onFiles: function (files) {
      if (!files.length) return;
      file = files[0];
      tpHideError("pdw-err");
      tpFileList("pdw-list", [file]);
      el("pdw-go").disabled = false;
      el("pdw-result").classList.remove("show");
    } });

  function pageBlocks(items) {
    var lines = [];
    items.forEach(function (it) {
      if (!it.str) return;
      var size = Math.hypot(it.transform[2], it.transform[3]) || it.height || 0;
      var y = it.transform[5], x = it.transform[4];
      var line = null;
      for (var i = 0; i < lines.length; i++) {
        if (Math.abs(lines[i].y - y) <= Math.max(2, size * 0.35)) { line = lines[i]; break; }
      }
      if (!line) { line = { y: y, items: [] }; lines.push(line); }
      line.items.push({ x: x, str: it.str, size: size, w: it.width || 0 });
    });
    lines.sort(function (a, b) { return b.y - a.y; });
    return lines.map(function (line) {
      line.items.sort(function (a, b) { return a.x - b.x; });
      var text = "", prev = null, maxSize = 0;
      line.items.forEach(function (it) {
        if (it.size > maxSize) maxSize = it.size;
        if (prev) {
          var gap = it.x - (prev.x + prev.w);
          if (gap > it.size * 0.22 && !/\s$/.test(text) && !/^\s/.test(it.str)) text += " ";
        }
        text += it.str;
        prev = it;
      });
      return { text: text.replace(/\s+/g, " ").trim(), size: maxSize, y: line.y };
    }).filter(function (l) { return l.text; });
  }

  el("pdw-go").addEventListener("click", function () {
    if (!file) { tpShowError("pdw-err", "Choose a PDF first."); return; }
    var btn = el("pdw-go");
    tpHideError("pdw-err");
    btn.disabled = true; btn.textContent = "Converting…";
    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    }).then(function (pdf) {
      var pages = [], sizes = [], totalChars = 0;
      var chain = Promise.resolve();
      var collect = function (p) {
        chain = chain.then(function () {
          return pdf.getPage(p).then(function (page) {
            return page.getTextContent();
          }).then(function (tc) {
            var blocks = pageBlocks(tc.items);
            blocks.forEach(function (b) { sizes.push(b.size); totalChars += b.text.length; });
            pages.push(blocks);
          });
        });
      };
      for (var p = 1; p <= pdf.numPages; p++) collect(p);
      return chain.then(function () { return { pages: pages, sizes: sizes, totalChars: totalChars, numPages: pdf.numPages }; });
    }).then(function (res) {
      if (res.totalChars < 20) {
        throw new Error("no-text-layer");
      }
      var sizes = res.sizes.slice().sort(function (a, b) { return a - b; });
      var median = sizes[Math.floor(sizes.length / 2)] || 12;
      var children = [];
      res.pages.forEach(function (blocks, pi) {
        if (pi > 0) children.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
        var para = null;
        function flush() { if (para) { children.push(new docx.Paragraph({ text: para })); para = null; } }
        blocks.forEach(function (l, li) {
          if (l.size >= median * 1.45) {
            flush();
            children.push(new docx.Paragraph({ text: l.text, heading: docx.HeadingLevel.HEADING_1 }));
          } else if (l.size >= median * 1.18) {
            flush();
            children.push(new docx.Paragraph({ text: l.text, heading: docx.HeadingLevel.HEADING_2 }));
          } else {
            var prev = li > 0 ? blocks[li - 1] : null;
            var wrap = para !== null && prev && prev.size < median * 1.18 &&
                       (prev.y - l.y) <= Math.max(prev.size, l.size) * 1.8;
            if (wrap) {
              para += /-$/.test(para) ? l.text : " " + l.text;
            } else {
              flush();
              para = l.text;
            }
          }
        });
        flush();
      });
      var doc = new docx.Document({ sections: [{ children: children }] });
      return docx.Packer.toBlob(doc).then(function (blob) {
        var outName = tpStripExt(file.name) + ".docx";
        tpDownload(blob, outName);
        el("pdw-done").textContent = "Done — " + outName + " downloaded: " + res.numPages +
          (res.numPages === 1 ? " page" : " pages") + ", " + res.totalChars +
          " characters of text rebuilt as an editable Word document.";
        el("pdw-result").classList.add("show");
        btn.disabled = false; btn.textContent = "Convert PDF to Word";
      });
    }).catch(function (e) {
      if (e && e.message === "no-text-layer") {
        tpShowError("pdw-err", "No selectable text was found in this PDF — it looks like a scanned or image-only document. Word conversion needs a real text layer (scanned pages need OCR first, which this tool does not do). Our PDF to JPG tool can turn its pages into pictures instead.");
      } else {
        tpShowError("pdw-err", "That PDF could not be converted — it may be encrypted, damaged, or built in a way this tool cannot read. Your original file is untouched.");
      }
      btn.disabled = false; btn.textContent = "Convert PDF to Word";
    });
  });
})();
