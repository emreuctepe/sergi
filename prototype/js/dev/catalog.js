/* ============================================================================
   DEV · CATALOG — blok şablon galerisi
   ----------------------------------------------------------------------------
   Her blok tipini CANLI basar (MAG.render.blocks[t]) ve yanında data.js'e
   yapıştırılabilir JS parçasını gösterir. Sahne adları, animasyonlar ve sayfa
   alanları da listelenir. Kaynak: js/dev/samples.js.

   Bloklar `.page__inner` içine ama `data-scene`'siz sarılır: blocks.css'teki
   açılış animasyonu yalnızca `.page[data-scene]` altında gizlediği için burada
   her şey tam görünür (bkz. css/blocks.css:678).
   ========================================================================= */
(function (MAG) {
  "use strict";

  var U = MAG.util;
  var R = MAG.render;
  var A = MAG.art;
  var DEV = MAG.dev;
  var el = U.el;

  var Cat = {};

  /* --- JS serileştirici: paste'e hazır, JSON değil (anahtar tırnaksız) -------
     Prettier benzeri: kısa ve tek satıra sığan nesne/dizi satır içi kalır
     (`{ t: "cover" }`, `["all"]`); uzun ya da içinde çok satırlı çocuk barındıran
     yapılar açılır (her alan/öğe kendi satırında, sonda virgül). Eşik ~72 sütun. */
  var WRAP = 72;

  function toJS(v, indent) {
    indent = indent || "";
    var next = indent + "  ";

    if (Array.isArray(v)) {
      if (!v.length) return "[]";
      var items = v.map(function (x) { return toJS(x, next); });
      var inline = "[" + items.join(", ") + "]";
      if (inline.length <= WRAP && inline.indexOf("\n") < 0) return inline;
      return "[\n" + items.map(function (s) { return next + s; }).join(",\n") + ",\n" + indent + "]";
    }

    if (v && typeof v === "object") {
      var keys = Object.keys(v);
      if (!keys.length) return "{}";
      var parts = keys.map(function (k) { return safeKey(k) + ": " + toJS(v[k], next); });
      var inlineObj = "{ " + parts.join(", ") + " }";
      if (inlineObj.length <= WRAP && inlineObj.indexOf("\n") < 0) return inlineObj;
      return "{\n" + parts.map(function (s) { return next + s; }).join(",\n") + ",\n" + indent + "}";
    }

    if (typeof v === "string") return '"' + v.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    return String(v);
  }

  function safeKey(k) {
    return /^[a-zA-Z_$][\w$]*$/.test(k) ? k : '"' + k + '"';
  }
  Cat.toJS = toJS;

  /* --- blok önizleme hücresi ------------------------------------------------ */
  function renderBlock(sample) {
    var inner = el("div.page__inner");
    var fn = R.blocks[sample.t];
    if (!fn) return el("div.dev-warn", { text: "bilinmeyen blok: " + sample.t });
    try {
      var node = fn(sample, {});
      if (!node) return el("div.dev-warn", { text: "boş çıktı" });
      node.classList.add("blk");
      if (sample.invert) node.classList.add("blk--invert");
      inner.appendChild(node);
    } catch (e) {
      return el("div.dev-warn", { text: "hata: " + e.message });
    }
    return inner;
  }

  function blockCard(entry) {
    var snippet = toJS(entry.sample);
    /* Sahne gerçek .canvas: sabit 3:4, dergi token'larıyla (paper/ink) boyanır. */
    var stage = el("div.dev-stage.canvas", null, [renderBlock(entry.sample)]);
    var code = el("pre.dev-code", null, [el("code", { text: snippet })]);
    var copyBtn = el("button.dev-copy", {
      type: "button",
      onClick: function () { copy(snippet, copyBtn); },
    }, ["Kopyala"]);

    return el("article.dev-card", null, [
      el("div.dev-card__head", null, [
        el("h4.dev-card__title", { text: entry.label }),
        el("span.dev-card__t", { text: "t: " + entry.t }),
      ]),
      entry.note ? el("p.dev-card__note", { html: U.inline(entry.note) }) : null,
      stage,
      el("div.dev-card__code", null, [code, copyBtn]),
    ]);
  }

  function copy(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "Kopyalandı ✓";
      btn.classList.add("is-done");
      setTimeout(function () { btn.textContent = old; btn.classList.remove("is-done"); }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else {
      fallbackCopy(text);
      done();
    }
  }
  Cat.copy = copy;

  function fallbackCopy(text) {
    var ta = el("textarea", { style: { position: "fixed", opacity: "0" } });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  }

  /* --- sahne kılavuzu -------------------------------------------------------
     Sahneler ağır satır içi SVG. 17'sini birden çizmek sayfayı yavaşlatıyordu,
     bu yüzden görünür olana kadar boş dururlar (IntersectionObserver). */
  var sceneObserver = null;

  function sceneSwatch(name) {
    var art = el("div.dev-scene__art", { "data-scene-name": A.has(name) ? name : "" });
    var frame = el("div.dev-scene", null, [art]);
    var snippet = 'bg: "scene:' + name + '"';
    if (sceneObserver && art.dataset.sceneName) sceneObserver.observe(art);
    else if (art.dataset.sceneName) art.innerHTML = A.scene(name); /* observer yoksa hemen çiz */
    return el("div.dev-scene-cell", {
      title: "kopyalamak için tıkla",
      onClick: function (e) { copy(snippet, e.currentTarget.querySelector(".dev-scene__name")); },
    }, [
      frame,
      el("span.dev-scene__name", { text: name }),
    ]);
  }

  function initSceneObserver() {
    if (!("IntersectionObserver" in window)) return null;
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var art = e.target;
        if (!art.firstChild && art.dataset.sceneName) art.innerHTML = A.scene(art.dataset.sceneName);
        sceneObserver.unobserve(art);
      });
    }, { rootMargin: "300px" });
  }

  /* --- küçük referans tabloları -------------------------------------------- */
  function refList(title, rows, colA, colB) {
    return el("section.dev-ref", null, [
      el("h3.dev-h", { text: title }),
      el("dl.dev-reflist", null, rows.reduce(function (acc, r) {
        acc.push(el("dt", { text: r[colA] }));
        acc.push(el("dd", { html: U.inline(r[colB] || "") }));
        return acc;
      }, [])),
    ]);
  }

  /* --- kurulum -------------------------------------------------------------- */
  Cat.mount = function (host) {
    U.clear(host);

    host.appendChild(el("p.dev-lead", {
      html: "Her kartın altındaki JS'i <strong>Kopyala</strong> ile alıp bölüm dosyandaki <code>blocks</code> dizisine yapıştır. Sahne adına tıklamak <code>bg:</code> satırını kopyalar.",
    }));

    /* bloklar — gruplu */
    var grid = null;
    DEV.blocks.forEach(function (entry) {
      if (entry.group) {
        host.appendChild(el("h3.dev-h", { text: entry.group }));
        grid = el("div.dev-grid");
        host.appendChild(grid);
        return;
      }
      if (grid) grid.appendChild(blockCard(entry));
    });

    /* her blokta geçerli değiştiriciler */
    host.appendChild(refList("Her blokta geçerli", DEV.blockMods, "key", "note"));

    /* arka plan sahneleri (tembel çizilir) */
    host.appendChild(el("h3.dev-h", { text: "Arka plan sahneleri  ·  bg" }));
    sceneObserver = initSceneObserver();
    var scenes = el("div.dev-scenes");
    DEV.scenes.forEach(function (name) { scenes.appendChild(sceneSwatch(name)); });
    host.appendChild(scenes);
    host.appendChild(refList("Arka plan biçimleri", DEV.bgForms, "form", "note"));

    /* animasyonlar + sayfa alanları */
    host.appendChild(refList("Sayfa animasyonları  ·  scene", DEV.anims, "name", "note"));
    host.appendChild(refList("Sayfa alanları", DEV.pageFields, "name", "note"));
  };

  MAG.dev.catalog = Cat;
})(window.MAG);
