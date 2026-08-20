/* ============================================================================
   RENDER — içerik ağacını DOM'a basar
   ----------------------------------------------------------------------------
   Gerçek üründeki `lib/blocks/<tip>/` klasörlerinin prototip karşılığı.
   Her blok tipi burada tek bir saf fonksiyondur: (blok, bağlam) → DOM düğümü.
   Yeni blok tipi eklemek = BLOCKS nesnesine bir satır eklemek. "Lego" kuralı.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var D = MAG.data;
  var State = MAG.state;
  var A = MAG.art;
  var el = U.el;

  var R = {};

  /* ========================================================================
     BLOK ÇİZİCİLER
     ===================================================================== */

  /* YouTube Shorts işareti — filigranın "burası video" demesinin en kısa yolu. */
  var SHORTS_ICON =
    '<svg class="ymark__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.52-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-1.99 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 15.94c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.52 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.98-3.49-.07-1.42-.93-2.67-2.22-3.26z"/>' +
    "</svg>";

  /* Sayfanın sağ altındaki stüdyo filigranı — planda da orada duruyor.
     Yorum pinleri gibi hafifçe salınıyor ki dokunulabilir olduğu belli olsun;
     dokununca yorumların penceresi açılıp nereye gittiğini söylüyor. */
  function mangaMark(m) {
    var btn = el(
      "button.manga-mark",
      {
        type: "button",
        "aria-label": m.label + " — " + (m.note || ""),
        onclick: function (e) {
          e.preventDefault();
          e.stopPropagation();
          MAG.popup.note(
            {
              title: m.label,
              body: m.note,
              href: m.href,
              action: m.action || "YouTube Shorts'ta izle",
              icon: SHORTS_ICON,
            },
            btn
          );
        },
      },
      [
        m.img
          ? el("img.manga-mark__logo", { src: m.img, alt: m.label, loading: "lazy", decoding: "async" })
          : el("span.manga-mark__label", { text: m.label }),
        /* Küçük Shorts rozeti: filigranın yalnızca imza değil, bir kapı da
           olduğunu tek bakışta söyleyen şey. */
        el("span.manga-mark__badge", { html: SHORTS_ICON }),
      ]
    );
    return btn;
  }

  var BLOCKS = {
    kicker: function (b) {
      return el("p.kicker", { text: b.text });
    },

    h1: function (b) {
      return el("h1.h1" + (b.big ? ".h1--big" : ""), { html: U.inline(b.text) });
    },

    h2: function (b) {
      return el("h2.h2", { html: U.inline(b.text) });
    },

    h3: function (b) {
      return el("h3.h3", { html: U.inline(b.text) });
    },

    lead: function (b) {
      return el("p.lead", { html: U.inline(b.text) });
    },

    p: function (b) {
      return el("p.para" + (b.drop ? ".para--drop" : ""), { html: U.inline(b.text) });
    },

    pull: function (b) {
      return el("aside.pull" + (b.big ? ".pull--big" : ""), { html: U.inline(b.text) });
    },

    quote: function (b) {
      return el("blockquote.quote", null, [
        el("p", { html: U.inline(b.text) }),
        b.by ? el("cite", { text: b.by }) : null,
      ]);
    },

    note: function (b) {
      return el("p.note", { html: U.inline(b.text) });
    },

    caption: function (b) {
      return el("p.caption", { html: U.inline(b.text) });
    },

    rule: function () {
      return el("div.rule-wrap", { html: A.rule() });
    },

    byline: function (b) {
      return el("div.byline", null, [
        el("span.byline__author", { text: b.author }),
        b.role ? el("span.byline__role", { text: b.role }) : null,
        b.minutes ? el("span.byline__time", { text: b.minutes + " dk" }) : null,
      ]);
    },

    stat: function (b) {
      return el(
        "div.stats",
        null,
        b.items.map(function (it) {
          return el("div.stat", null, [
            el("span.stat__v", { text: it.v }),
            el("span.stat__k", { text: it.k }),
          ]);
        })
      );
    },

    /* `data-sub` = bu satır kendi başına yorumlanabilir bir alt blok.
       Kimliğini R.page basar (blok kimliği orada biliniyor). */
    list: function (b) {
      if (b.style === "dict") {
        return el(
          "dl.dict",
          null,
          b.items.map(function (it, i) {
            return el("div.dict__row", { style: { "--i": i }, "data-sub": i }, [
              el("dt", { text: it.term }),
              el("dd", { html: U.inline(it.def) }),
            ]);
          })
        );
      }
      var tag = b.style === "num" ? "ol.list.list--num" : "ul.list";
      return el(
        tag,
        null,
        b.items.map(function (it, i) {
          return el("li", {
            style: { "--i": i },
            "data-sub": i,
            html: U.inline(typeof it === "string" ? it : it.def),
          });
        })
      );
    },

    dialog: function (b) {
      var isQ = b.who === "q";
      return el("div.dialog" + (isQ ? ".dialog--q" : ".dialog--a"), null, [
        el("span.dialog__who", { text: isQ ? "S" : (b.name || "C").slice(0, 1) }),
        el("p.dialog__text", { html: U.inline(b.text) }),
      ]);
    },

    rtlhint: function () {
      return el("div.rtl-hint", null, [
        el("span.rtl-hint__arrow", { text: "←" }),
        el("span", { text: "Bu bölüm sağdan sola okunur" }),
      ]);
    },

    /* --- terminal kaydı ----------------------------------------------------
       Kod bloğu değil, "ekranda akan kayıt" bloğu. `$` ile başlayan satır komut
       sayılıp vurgulanıyor; gerisi çıktı. Metin olduğu gibi basılıyor (U.inline
       yok) — log içindeki *yıldız* ve `ters tırnak` biçimlendirme değil, veridir.
       -------------------------------------------------------------------- */
    term: function (b) {
      var node = el("div.term" + (b.invert ? ".term--invert" : ""));
      if (b.host) node.appendChild(el("div.term__bar", { text: b.host }));

      var pre = el("pre.term__body");
      (b.lines || []).forEach(function (line) {
        var isCmd = /^\s*[$#>]/.test(line);
        pre.appendChild(el("span.term__line" + (isCmd ? ".term__line--cmd" : ""), { text: line }));
      });
      node.appendChild(pre);

      if (b.caption) node.appendChild(el("p.term__cap", { html: U.inline(b.caption) }));
      return node;
    },

    /* --- manga sayfası ----------------------------------------------------- */
    manga: function (b) {
      /* Okuma yönü artık bloktan geliyor. Japon one-shot'ları sağdan sola
         okunur, ama her manga öyle değil — 2026-09'un "Kapalı Kapılar"ı
         soldan sağa kurgulanmış bir dikey şerit. Sabit rtl yanlış cevaptı. */
      var wrap = el("div.manga" + ".manga--" + (b.layout || "3-üst-1-alt").replace(/[^a-z0-9-]/gi, ""), {
        "data-layout": b.layout,
        dir: b.dir === "ltr" ? "ltr" : "rtl",
      });
      b.panels.forEach(function (p, i) {
        var panel = el("figure.manga-panel", {
          style: { "--i": i },
          "data-panel": i,
          "data-sub": i,
          html: A.mangaPanel(p.art, p.text, p.kind, p.img, p.alt),
        });
        wrap.appendChild(panel);
      });
      /* Bazı düzenlerde başlık sayfanın kendi kompozisyonunda bir kutu
         (bkz. 2026-09 "Kapalı Kapılar" planı) — ayrı açılış sayfası değil.
         Panel indeksleri kaymasın diye en sona ekleniyor. */
      if (b.title) wrap.appendChild(el("div.manga-title", { text: b.title }));
      var page = el("div.manga-page", null, [wrap, el("span.manga-page__no", { text: b.page })]);
      if (b.mark) page.appendChild(mangaMark(b.mark));
      return page;
    },

    /* --- bulmaca yuvası (puzzles.js doldurur) ------------------------------ */
    puzzleSlots: function () {
      return el("div.puzzle-slots#puzzle-slots", null, [
        el("p.note", { text: "Bulmacalar yükleniyor…" }),
      ]);
    },

    /* --- kapak -------------------------------------------------------------- */
    cover: function () {
      var iss = D.issue;
      return el("div.cover", null, [
        el("div.cover__top", null, [
          el("span.cover__mark", { html: A.leafMark() }),
          el("span.cover__meta", { text: iss.colophon }),
        ]),
        el("div.cover__mid", null, [
          el("span.cover__no", { text: "№ " + U.pad2(iss.number) }),
          el("h1.cover__title", { text: iss.title }),
          el("p.cover__sub", { text: iss.subtitle }),
        ]),
        el("div.cover__bottom", null, [
          el("span.cover__hint", { text: "kaydır" }),
          el("span.cover__chev", { text: "⌄" }),
        ]),
      ]);
    },

    /* --- sayı sonu (overlays.js zenginleştirir) ---------------------------- */
    outro: function () {
      return el("div.outro#outro", null, [el("p.note", { text: "…" })]);
    },
  };

  /* ========================================================================
     SAYFA ÇİZİMİ
     ===================================================================== */

  /* Sayfa arka planı üç biçimde verilebilir:
       scene:torii                    → art.js'teki satır içi SVG sahne
       photo:101                      → art.js'in ürettiği sahte "fotoğraf"
       img:assets/2026-09/tren.webp   → gerçek dosya
     Üçü de kullanımda: 2026-10 tamamen çizilmiş sahnelerle, 2026-09 karışık
     (10 sayfa arka planı + one-shot'ın kareleri gerçek dosya). Çizilmiş bir
     sahneyi gerçek görselle değiştirmek bilerek tek satırlık bir iş. */
  function backgroundFor(spec) {
    if (!spec) return null;
    var m = /^(scene|photo|img):(.+)$/.exec(spec);
    if (!m) return null;

    if (m[1] === "img") {
      return el("div.page__bg", null, [
        el("img.page__bg-img", { src: m[2], alt: "", loading: "lazy", decoding: "async" }),
      ]);
    }
    var html = m[1] === "scene" ? A.scene(m[2]) : A.photo(parseInt(m[2], 10), "tall");
    return el("div.page__bg", { html: html });
  }

  R.page = function (section, page, index) {
    var node = el("section.page", {
      "data-page-id": page.id,
      "data-section": section.slug,
      "data-section-title": section.title,
      "data-kind": page.kind || section.type,
      "data-scene": page.scene || "none",
      "data-fit": page.fit || "contain",
      "data-bleed": page.bleed || "none",
      "data-inview": "false",
      role: "group",
      "aria-roledescription": "sayfa",
      "aria-label": section.title + " — sayfa " + (index + 1),
    });

    var bg = backgroundFor(page.bg);
    if (bg) node.appendChild(bg);

    var inner = el("div.page__inner");
    var hasInvert = false;

    (page.blocks || []).forEach(function (b, i) {
      var fn = BLOCKS[b.t];
      if (!fn) {
        console.warn("[render] bilinmeyen blok tipi:", b.t);
        return;
      }
      var child = fn(b, { section: section, page: page });
      if (!child) return;
      child.style.setProperty("--i", i);
      child.classList.add("blk");

      /* BLOK KİMLİĞİ — yorum ankrajının dayanağı.
         `pageId:index[.alt]`. Kaynak dizideki sıradan türer, bilinmeyen blok
         tipleri atlansa bile kaymaz. Gerçek üründe bu kimliği içerik derleyicisi
         üretecek (bkz. docs/YORUM-SISTEMI.md §2.1). */
      var blockId = page.id + ":" + i;
      child.setAttribute("data-block-id", blockId);
      child.setAttribute("data-block-kind", b.t);
      U.$$("[data-sub]", child).forEach(function (sub) {
        sub.setAttribute("data-block-id", blockId + "." + sub.getAttribute("data-sub"));
        sub.setAttribute("data-block-kind", b.t + "-item");
      });

      if (b.invert) {
        child.classList.add("blk--invert");
        hasInvert = true;
      }
      inner.appendChild(child);
    });

    if (hasInvert || page.bleed === "full") node.classList.add("page--overlay");
    node.appendChild(inner);
    return node;
  };

  /* ========================================================================
     TÜM AKIŞ
     ===================================================================== */

  /**
   * Seçili derinliğe göre bütün sayfaları basar.
   * `keepPageId` verilirse, çizimden sonra o sayfaya (yoksa en yakınına) döner —
   * okuma modu değiştiğinde okurun yerini kaybetmemesi buradan geliyor.
   */
  R.renderFlow = function (opts) {
    opts = opts || {};
    var depth = State.depth();
    var host = U.$("#pages");
    var flow = D.flow(depth);

    U.clear(host);
    flow.forEach(function (item, i) {
      host.appendChild(R.page(item.section, item.page, i));
    });

    document.documentElement.dataset.depth = depth;
    MAG.canvas.registerPages();

    /* konum koruma */
    var target = opts.keepPageId || null;
    if (target && !MAG.canvas.pageById(target)) {
      target = nearestVisible(target, depth);
    }
    if (target) {
      MAG.canvas.goToId(target, { instant: true });
    } else if (opts.restore !== false) {
      var saved = State.getProgress(D.issue.slug);
      if (saved && MAG.canvas.pageById(saved.pageId)) {
        MAG.canvas.goToId(saved.pageId, { instant: true });
      }
    }

    U.emit("flow:render", { depth: depth, count: flow.length });
    return flow.length;
  };

  /**
   * Bir sayfa yeni derinlikte yoksa, aynı bölümdeki en yakın komşusunu bul.
   * (Gerçek üründe bu, sayfanın "ankraj kimliği" üzerinden yapılacak.)
   */
  function nearestVisible(pageId, depth) {
    var all = [];
    D.sections.forEach(function (s) {
      s.pages.forEach(function (p) {
        all.push({ s: s, p: p });
      });
    });
    var at = -1;
    for (var i = 0; i < all.length; i++) if (all[i].p.id === pageId) at = i;
    if (at < 0) return null;

    for (var d = 1; d < all.length; d++) {
      var back = all[at - d];
      if (back && D.pageVisible(back.p, depth)) return back.p.id;
      var fwd = all[at + d];
      if (fwd && D.pageVisible(fwd.p, depth)) return fwd.p.id;
    }
    return null;
  }

  R.blocks = BLOCKS;
  MAG.render = R;
})(window.MAG);
