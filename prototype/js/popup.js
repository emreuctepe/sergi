/* ============================================================================
   POPUP — üstte açılan yorum konuşma balonu  (yorum sistemi, yeni yol — 2.1)
   ----------------------------------------------------------------------------
   Alttan açılan thread paneli yerine: bir işarete (pin / çentik / alıntı) dokun
   → tuvalin ÜSTÜNDE, ona yakın bir kart açılır. Overlay olduğu için sayfa
   düzenine hiç dokunmaz (z-index'te üstte, fixed konumlu).

   Şimdilik tek yorum (temsilci ses) gösterir. Sıradaki adımlar: kaydırmalı
   carousel (2.2), thread'e uzatma (2.3), serbest yerleştirme (2.4).
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var C = MAG.comments;
  var el = U.el;

  var P = {};
  var host = null;
  var card = null;
  var offOutside = null;

  function ensureHost() {
    if (!host) {
      host = el("div.cpop-host");
      U.$("#overlays").appendChild(host);
    }
    return host;
  }

  /** sel: C.rootsFor'un anladığı seçim ({ids}|{blockId,quote}|{pageId,pageLevel}…) */
  P.open = function (sel, anchorEl) {
    var roots = C.rootsFor(sel || {});
    if (!roots.length) return;
    var rep = C.representative(roots) || roots[0];
    var total = roots.reduce(function (n, c) {
      return n + C.threadSize(c.id);
    }, 0);

    P.close();
    ensureHost();
    card = buildCard(rep, total);
    host.appendChild(card);
    position(card, anchorEl);

    /* dışına dokun / Esc ile kapat — açan tıklamanın hemen kapatmaması için ertele */
    setTimeout(function () {
      offOutside = U.on(
        document,
        "pointerdown",
        function (e) {
          if (card && !card.contains(e.target)) P.close();
        },
        true
      );
    }, 0);
  };

  P.close = function () {
    if (offOutside) {
      offOutside();
      offOutside = null;
    }
    if (card) {
      card.remove();
      card = null;
    }
  };

  P.isOpen = function () {
    return !!card;
  };

  function buildCard(c, total) {
    var rx = Object.keys(c.reactions || {});
    var q = C.quoteOf(c);
    return el("div.cpop", { role: "dialog", "aria-label": c.author.name + " yorumu" }, [
      el("button.cpop__x", { type: "button", text: "✕", "aria-label": "Kapat", onclick: P.close }),
      el("div.cpop__head", null, [
        el("span.cpop__dot", { style: { "--c": c.author.color }, text: c.author.emoji }),
        el("b.cpop__name", { text: c.author.name }),
        el("span.cpop__time", { text: U.timeAgo(c.createdAt) }),
      ]),
      q ? el("div.cpop__quote", { text: "“" + q + "”" }) : null,
      el("p.cpop__body", { text: c.body }),
      el("div.cpop__foot", null, [
        rx.length ? el("span.cpop__rx", { text: rx.join(" ") }) : null,
        total > 1 ? el("span.cpop__more", { text: "+" + (total - 1) + " ses" }) : null,
      ]),
    ]);
  }

  /** Kartı ankrajın yanına koy, tuvale kırp (fixed koordinat). */
  function position(card, anchorEl) {
    var canvas = U.$("#canvas").getBoundingClientRect();
    var m = 12;
    var w = card.offsetWidth;
    var h = card.offsetHeight;
    var a = anchorEl
      ? anchorEl.getBoundingClientRect()
      : { left: canvas.left + canvas.width / 2, right: canvas.left + canvas.width / 2, top: canvas.top + canvas.height / 2, bottom: canvas.top + canvas.height / 2 };

    var cx = (a.left + a.right) / 2;
    var left = U.clamp(cx - w / 2, canvas.left + m, Math.max(canvas.left + m, canvas.right - w - m));

    var top = a.bottom + m; /* ankrajın altına */
    if (top + h > canvas.bottom - m) top = a.top - h - m; /* sığmazsa üstüne */
    top = U.clamp(top, canvas.top + m, Math.max(canvas.top + m, canvas.bottom - h - m));

    card.style.left = Math.round(left) + "px";
    card.style.top = Math.round(top) + "px";
  }

  MAG.popup = P;
})(window.MAG);
