/* ============================================================================
   POPUP — üstte açılan yorum balonu  (yorum sistemi 2.1)
   ----------------------------------------------------------------------------
   Bir baloncuğa (pin) dokun → tuvalin ÜSTÜNDE, ona yakın bir kart açılır.
   Kartın içinde o baloncuktaki BÜTÜN yorumlar var: kaydırarak hepsini okursun
   (carousel değil — dikey liste). Cevaplar girintili. Overlay olduğu için sayfa
   düzenine hiç dokunmaz.
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

  P.open = function (sel, anchorEl) {
    var roots = C.rootsFor(sel || {});
    if (!roots.length) return;
    P.close();
    ensureHost();
    card = buildCard(roots);
    host.appendChild(card);
    position(card, anchorEl);
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

  function buildCard(roots) {
    var sorted = roots.slice().sort(function (a, b) {
      return C.score(b) - C.score(a) || b.createdAt - a.createdAt;
    });
    var count = roots.reduce(function (n, c) {
      return n + C.threadSize(c.id);
    }, 0);

    var list = el("div.cpop__list");
    sorted.forEach(function (c) {
      list.appendChild(commentBlock(c));
    });

    return el("div.cpop", { role: "dialog", "aria-label": "Yorumlar" }, [
      el("div.cpop__bar", null, [
        el("b.cpop__count", { text: count + " yorum" }),
        el("button.cpop__x", { type: "button", text: "✕", "aria-label": "Kapat", onclick: P.close }),
      ]),
      list,
    ]);
  }

  function commentBlock(c) {
    var node = el("div.cpop__c", null, [inner(c)]);
    C.replies(c.id).forEach(function (r) {
      node.appendChild(el("div.cpop__reply", null, [inner(r)]));
    });
    return node;
  }

  function inner(c) {
    var rx = Object.keys(c.reactions || {});
    var q = C.quoteOf(c);
    return el("div", null, [
      el("div.cpop__head", null, [
        el("span.cpop__dot", { style: { "--c": c.author.color }, text: c.author.emoji }),
        el("b.cpop__name", { text: c.author.name }),
        el("span.cpop__time", { text: U.timeAgo(c.createdAt) }),
        c.status === "pending" ? el("i.cpop__pending", { text: "onayda" }) : null,
      ]),
      q ? el("div.cpop__quote", { text: "“" + q + "”" }) : null,
      el("p.cpop__body", { text: c.body }),
      rx.length ? el("div.cpop__rx", { text: rx.join("  ") }) : null,
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

    var top = a.bottom + m;
    if (top + h > canvas.bottom - m) top = a.top - h - m;
    top = U.clamp(top, canvas.top + m, Math.max(canvas.top + m, canvas.bottom - h - m));

    card.style.left = Math.round(left) + "px";
    card.style.top = Math.round(top) + "px";
  }

  MAG.popup = P;
})(window.MAG);
