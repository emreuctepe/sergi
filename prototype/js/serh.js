/* ============================================================================
   ŞERH — dipnot / haşiye  (yorum sunumu, Yol D)
   ----------------------------------------------------------------------------
   Fikir: yorum bir "arayüz balonu" değil, kitabın kendi diziliş dili. Metinde
   bloğun sonuna küçük bir üst-simge numara (¹ ² ³) düşer; yorumun kendisi
   sayfanın altında, numaralı bir "haşiye" bloğunda dizilir. Osmanlı yazma
   geleneğindeki şerh/haşiye budur: metnin kenarına düşülmüş okur notu.

   Kenar'dan farkı: yüzen kart değil, **numaralı tipografi**. Numara cümleyi
   işaret eder, not aşağıda okunur — dipnot okuma alışkanlığının aynısı.

   Sayfa notları sığdırmak için uzar (dokuma gibi): "sığan sayfa" kimliği bu
   modda bilerek esner. Her şey in-flow olduğu için (Kenar'ın aksine) gutter
   hizalama, kaydırma takibi yok — en basit sunum bu.

   Etkileşim: numaraya dokun → notuna kayar (dipnot gezinmesi); nota dokun →
   thread açılır. Bloğa (numara dışına) dokunmak da thread açar.

   Fısıltı/Kenar gibi tek dosya + tek CSS bölümü.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var C = MAG.comments;
  var State = MAG.state;
  var el = U.el;

  var S = {};

  S.active = function () {
    return State.get("commentUI", "whisper") === "serh" && C.layerOn();
  };

  /** Şerh yalnızca metin sayfalarında; görsel/manga/kapak dışarıda. */
  function textPage(p) {
    return p.bleed !== "full" && ["cover", "manga", "outro", "puzzle"].indexOf(p.kind) < 0;
  }

  function voiceOf(blockId, pageId) {
    var roots = C.rootsFor({ blockId: blockId, pageId: pageId });
    if (!roots.length) return null;
    var rep = C.representative(roots);
    var total = roots.reduce(function (n, c) {
      return n + C.threadSize(c.id);
    }, 0);
    return { roots: roots, rep: rep, total: total, ids: roots.map(function (c) { return c.id; }) };
  }

  /** Liste/sözlük kabına üst-simge düşürmek geçersiz — son satırına oturt. */
  function refHost(node) {
    var t = node.tagName;
    if (t === "UL" || t === "OL" || t === "DL") return node.lastElementChild || node;
    return node;
  }

  function noteNode(num, v, blockId, pageId) {
    var q = C.quoteOf(v.rep);
    var node = el(
      "div.serh-note",
      {
        "data-n": num,
        "data-comment-ids": v.ids.join(","),
        "data-pending": v.rep.status === "pending" ? "true" : null,
      },
      [
        el("span.serh-note__n", { text: num }),
        el("div.serh-note__text", null, [
          el("span.serh-note__head", null, [
            el("span.serh-note__dot", { style: { "--c": v.rep.author.color }, text: v.rep.author.emoji }),
            el("b.serh-note__name", { text: v.rep.author.name }),
            v.rep.status === "pending" ? el("i.serh-note__pending", { text: "onayda" }) : null,
            v.total > 1 ? el("span.serh-note__more", { text: "+" + (v.total - 1) + " ses" }) : null,
          ]),
          q ? el("span.serh-note__quote", { text: "“" + q + "”" }) : null,
          el("span.serh-note__body", { text: v.rep.body }),
        ]),
      ]
    );
    node.addEventListener("click", function () {
      MAG.overlays.openThread({ blockId: blockId, pageId: pageId });
    });
    return node;
  }

  function gotoNote(p, num) {
    var target = U.$('.serh-note[data-n="' + num + '"]', p.el);
    if (!target) return;
    target.scrollIntoView({ behavior: U.reducedMotion() ? "auto" : "smooth", block: "center" });
    target.dataset.flash = "1";
    setTimeout(function () {
      if (target) target.removeAttribute("data-flash");
    }, 1200);
  }

  function build(p) {
    var blocks = U.$$("[data-block-id][data-comments]", p.el);
    if (!blocks.length) return;

    var notes = el("aside.serh-notes", { "aria-label": "Bu sayfanın şerhleri" });
    var n = 0;
    blocks.forEach(function (node) {
      var blockId = node.getAttribute("data-block-id");
      var v = voiceOf(blockId, p.id);
      if (!v) return;
      n++;
      var num = n;

      var ref = el("sup.serh-ref", {
        "data-n": num,
        role: "button",
        tabindex: "0",
        text: num,
        "aria-label": num + ". şerh — " + v.rep.author.name + ": " + v.rep.body.slice(0, 40),
      });
      ref.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation(); /* bloğun kendi tıklamasını tetikleme */
        gotoNote(p, num);
      });
      ref.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          gotoNote(p, num);
        }
      });
      refHost(node).appendChild(ref);

      notes.appendChild(noteNode(num, v, blockId, p.id));
    });

    if (!n) return;
    (U.$(".page__inner", p.el) || p.el).appendChild(notes);
    p.el.setAttribute("data-serh-grow", ""); /* sayfa notlar için uzasın (CSS) */
  }

  function clearAll() {
    U.$$(".serh-ref").forEach(function (n) {
      n.remove();
    });
    U.$$(".serh-notes").forEach(function (n) {
      n.remove();
    });
    U.$$("[data-serh-grow]").forEach(function (n) {
      n.removeAttribute("data-serh-grow");
    });
  }

  S.layout = function () {
    clearAll();
    var root = document.documentElement;
    if (!S.active()) {
      root.dataset.serh = "off";
      return;
    }
    root.dataset.serh = "on";
    MAG.canvas.pages().forEach(function (p) {
      if (textPage(p)) build(p);
    });
  };

  S.init = function () {
    /* Tek kapı: her decorate sonrası (ekleme, stres, moderasyon) tazele. */
    U.listen("comments:decorated", S.layout);
    U.listen("comment:reaction", S.layout);
    U.listen("comments:layer", S.layout);
    U.listen("state:change", function (e) {
      if (e.detail.path === "commentUI") S.layout();
    });

    S.layout();
  };

  MAG.serh = S;
})(window.MAG);
