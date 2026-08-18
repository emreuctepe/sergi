/* ============================================================================
   DEV · EDITOR — tarayıcı içi canlı blok editörü
   ----------------------------------------------------------------------------
   Bir BÖLÜM'ün JS'ini panelde düzenle → gerçek 3:4 tuvalde anında gör.
   Önizleme, üretim sınıf yapısını (.canvas > .pages > .page) yeniden kullanır;
   tipografi cqi ile ölçeklenir, snap CSS'ten gelir. #shell/canvas.js'e bağlanmaz.

   Kritik: `data-scene`'li sayfalarda bloklar açılış animasyonu için opacity:0
   başlar; editör onları HEMEN görünür kılmak için data-inview="true" işaretler
   (bkz. css/blocks.css:695).

   Blok literalini `Function` ile çözmek yalnızca dev.html'de; üretime girmez.
   ========================================================================= */
(function (MAG) {
  "use strict";

  var U = MAG.util;
  var R = MAG.render;
  var D = MAG.data;
  var DEV = MAG.dev;
  var el = U.el;

  var E = { started: false };

  var host, scroller, textarea, errBox, warnBox;
  var depth = "all";
  var renderSoon;

  /* --- açılış (sekmeye ilk geçişte) ---------------------------------------- */
  E.init = function () {
    host = U.$("#dev-editor");
    renderSoon = U.debounce(render, 260);
  };

  E.start = function () {
    if (E.started) return;
    E.started = true;
    build();
    textarea.value = MAG.dev.catalog.toJS(DEV.sectionSample);
    render();
  };

  /* --- iskelet -------------------------------------------------------------- */
  function build() {
    U.clear(host);

    /* SOL: 3:4 önizleme çerçevesi */
    scroller = el("div.pages.dev-scroller", { id: "dev-pages", tabindex: "0" });
    var frame = el("div.dev-frame", null, [el("div.canvas.dev-canvas", null, [scroller])]);
    var nav = el("div.dev-frame-nav", null, [
      navBtn("Önceki", -1),
      el("span.dev-frame-hint", { text: "kaydır · ok tuşları · sayfa sayfa" }),
      navBtn("Sonraki", 1),
    ]);
    var left = el("div.dev-editor__preview", null, [frame, nav]);

    /* SAĞ: düzenleme paneli */
    var depthSeg = el("div.dev-seg", { role: "group", "aria-label": "Önizleme derinliği" },
      ["all", "min", "mid", "full"].map(function (d) {
        return el("button.dev-seg__btn", {
          type: "button", "data-d": d, "aria-pressed": d === depth ? "true" : "false",
          text: d === "all" ? "Hepsi" : d,
          onClick: function () { setDepth(d); },
        });
      })
    );

    var blockPick = el("select.dev-select", {
      onChange: function (e) {
        var i = e.target.value;
        if (i === "") return;
        insertAtCursor("      " + MAG.dev.catalog.toJS(DEV.blocks[i].sample) + ",\n");
        e.target.value = "";
      },
    }, blockOptions());

    var pagePick = el("button.dev-btn", { type: "button", text: "＋ Boş sayfa",
      onClick: function () { insertAtCursor(pageSkeleton()); } });

    var copyBlocks = el("button.dev-btn", { type: "button", text: "Bölümü kopyala",
      onClick: function (e) { MAG.dev.catalog.copy(textarea.value, e.currentTarget); } });

    var copyFile = el("button.dev-btn.dev-btn--ghost", { type: "button", text: "Bölüm dosyası olarak kopyala",
      onClick: function (e) { MAG.dev.catalog.copy(sectionFile(), e.currentTarget); } });

    var toolbar = el("div.dev-toolbar", null, [depthSeg, blockPick, pagePick, copyBlocks, copyFile]);

    textarea = el("textarea.dev-source", { spellcheck: "false", autocapitalize: "off", autocomplete: "off",
      oninput: function () { renderSoon(); } });

    errBox = el("div.dev-err", { hidden: true });
    warnBox = el("div.dev-warns", { hidden: true });

    var right = el("div.dev-editor__panel", null, [
      toolbar,
      el("p.dev-panel-note", { html: "Bir <strong>bölüm nesnesi</strong> düzenliyorsun. Katalogdan blok ekle, tuvalde anında gör, bitince kopyalayıp <code>js/issues/&lt;sayı&gt;/sections/</code> altına yapıştır." }),
      errBox,
      warnBox,
      textarea,
    ]);

    host.appendChild(el("div.dev-editor__grid", null, [left, right]));

    /* klavye: tuval odaktayken sayfa sayfa */
    scroller.addEventListener("keydown", onFrameKey);
  }

  function navBtn(label, dir) {
    return el("button.dev-btn.dev-btn--nav", { type: "button", "aria-label": label,
      text: dir < 0 ? "↑" : "↓", onClick: function () { pageBy(dir); } });
  }

  function blockOptions() {
    var opts = [el("option", { value: "", text: "＋ Blok ekle…" })];
    DEV.blocks.forEach(function (b, i) {
      if (b.group) opts.push(el("option", { value: "", disabled: true, text: "— " + b.group + " —" }));
      else opts.push(el("option", { value: String(i), text: b.label }));
    });
    return opts;
  }

  /* --- derinlik ------------------------------------------------------------- */
  function setDepth(d) {
    depth = d;
    U.$$(".dev-seg__btn", host).forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.d === d ? "true" : "false");
    });
    render();
  }

  /* --- ayrıştır + çiz ------------------------------------------------------- */
  function parse() {
    var txt = textarea.value.trim();
    if (!txt) throw new Error("Boş. Bir bölüm nesnesi yaz: { slug, title, pages: [ … ] }");
    var obj;
    try {
      obj = new Function("return (" + txt + "\n)")();
    } catch (e) {
      throw new Error("JS okunamadı — " + e.message);
    }
    if (!obj || typeof obj !== "object") throw new Error("Bir nesne bekleniyor: { … }");
    if (!Array.isArray(obj.pages)) throw new Error("`pages` bir dizi olmalı.");
    return obj;
  }

  function render() {
    var section;
    try {
      section = parse();
      errBox.hidden = true;
    } catch (e) {
      errBox.hidden = false;
      errBox.textContent = "⚠ " + e.message;
      return; /* son iyi görüntü kalsın */
    }

    var unknown = {};
    var visible = section.pages.filter(function (p) {
      return depth === "all" || D.pageVisible(p, depth);
    });

    U.clear(scroller);
    visible.forEach(function (page, i) {
      (page.blocks || []).forEach(function (b) {
        if (!R.blocks[b.t]) unknown[b.t] = (unknown[b.t] || 0) + 1;
      });
      var node = R.page(section, page, i);
      node.dataset.inview = "true"; /* blokları görünür kıl + animasyonu oynat */
      scroller.appendChild(node);
    });

    if (!visible.length) {
      scroller.appendChild(el("div.dev-empty", { text: depth === "all"
        ? "Hiç sayfa yok." : "Bu derinlikte (" + depth + ") görünür sayfa yok." }));
    }

    var keys = Object.keys(unknown);
    warnBox.hidden = !keys.length;
    if (keys.length) {
      warnBox.textContent = "Bilinmeyen blok tipi: " + keys.map(function (k) {
        return k + " ×" + unknown[k];
      }).join(", ") + " — kataloğa bak.";
    }
  }

  /* --- gezinme -------------------------------------------------------------- */
  function pages() { return U.$$(".page", scroller); }

  function currentIndex() {
    var list = pages();
    var top = scroller.scrollTop + scroller.clientHeight * 0.4;
    var idx = 0;
    for (var i = 0; i < list.length; i++) { if (list[i].offsetTop <= top) idx = i; else break; }
    return idx;
  }

  function pageBy(dir) {
    var list = pages();
    var i = U.clamp(currentIndex() + dir, 0, list.length - 1);
    if (list[i]) scroller.scrollTo({ top: list[i].offsetTop, behavior: "smooth" });
  }

  function onFrameKey(e) {
    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); pageBy(1); }
    else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); pageBy(-1); }
  }

  /* --- metin ekleme / kopyalama -------------------------------------------- */
  function insertAtCursor(text) {
    var s = textarea.selectionStart, e = textarea.selectionEnd;
    textarea.value = textarea.value.slice(0, s) + text + textarea.value.slice(e);
    var pos = s + text.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
    textarea.focus();
    render();
  }

  function pageSkeleton() {
    return "    " + MAG.dev.catalog.toJS(DEV.pageSample) + ",\n";
  }

  /* Bölüm dosyası kalıbı — Faz 3'teki defineSection biçimi. Şimdiden üretilir;
     assembler geldiğinde doğrudan yeni bir dosya olarak çalışır. */
  function sectionFile() {
    var body = textarea.value.trim().replace(/,\s*$/, "");
    return [
      "/* Bölüm — js/issues/<sayı>/sections/NN-<slug>.js */",
      "(function (MAG) {",
      '  "use strict";',
      '  MAG.defineSection("<sayı-slug>", ' + indent(body, "  ") + ");",
      "})(window.MAG);",
      "",
    ].join("\n");
  }

  function indent(text, pad) {
    return text.split("\n").map(function (line, i) { return i === 0 ? line : pad + line; }).join("\n");
  }

  MAG.dev.editor = E;
})(window.MAG);
