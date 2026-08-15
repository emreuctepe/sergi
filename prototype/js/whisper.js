/* ============================================================================
   FISILTI — alt bant konuşur  (yorum sunumu, Yol B)
   ----------------------------------------------------------------------------
   Gerekçe ve karşılaştırma: docs/YORUM-SISTEMI.md §4 "Yol B".

   Fikir: sayfa düzenine HİÇ dokunmadan yorumu okuma akışına karıştırmak.
   Zaten var olan alt bant iki satıra açılır ve o an odaktaki bloğun TEMSİLCİ
   sesini söyler. Metin sütunu daralmaz, sayfa uzamaz, tipografi bozulmaz.

   Odak, şu sırayla belirlenir:
     1. son dokunulan blok            (okur seçti — her şeyin üstünde)
     2. kaydırmalı sayfada ekranın dikey ortasına en yakın yorumlu blok
     3. sayfanın en yüksek puanlı yorumunun bloğu
   Hiçbiri yoksa şerit kapanır ve bant tek satıra döner.

   Bu dosya bilerek TEK PARÇA: B5'te bu yol kaybederse silinmesi bir dosya, bir
   CSS bölümü, bir betik etiketi ve bir menü satırı kadar iş olsun.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var C = MAG.comments;
  var State = MAG.state;
  var el = U.el;

  var W = {};

  var band = null;
  var node = null; /* şeridin kendisi (button.whisper) */
  var manual = null; /* { pageId, blockId } — son dokunulan blok */
  var currentKey = null; /* aynı sesi tekrar tekrar çizmemek için */
  var currentSel = null; /* banda dokununca açılacak seçim */
  var focusEl = null; /* aydınlatılmış blok */

  /* ------------------------------------------------------------------------
     AÇIK MI?
     Fısıltı yalnızca eş okuma açıkken konuşur — katman kapalıyken okuma
     tamamen temiz kalır, bu sözden vazgeçmiyoruz.
     --------------------------------------------------------------------- */

  W.active = function () {
    return State.get("commentUI", "whisper") === "whisper" && C.layerOn();
  };

  /* ------------------------------------------------------------------------
     ODAK SEÇİMİ
     --------------------------------------------------------------------- */

  /** Kaydırmalı sayfada ekranın dikey ortasına en yakın yorumlu blok. */
  function nearestBlock(page) {
    var blocks = U.$$("[data-block-id][data-comments]", page.el);
    if (!blocks.length) return null;
    var view = MAG.canvas.scroller().getBoundingClientRect();
    var mid = view.top + view.height / 2;
    var best = null;
    var bestD = Infinity;
    blocks.forEach(function (b) {
      var r = b.getBoundingClientRect();
      /* blok ekranın ortasını kapsıyorsa mesafe sıfır: uzun paragraflar
         kısa komşularına kaybetmesin */
      var d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    });
    return best ? best.getAttribute("data-block-id") : null;
  }

  function inView(node) {
    var view = MAG.canvas.scroller().getBoundingClientRect();
    var r = node.getBoundingClientRect();
    return r.bottom > view.top && r.top < view.bottom;
  }

  function blockSel(blockId, pageId) {
    var roots = C.rootsFor({ blockId: blockId, pageId: pageId });
    return roots.length ? { sel: { blockId: blockId, pageId: pageId }, roots: roots } : null;
  }

  function compute() {
    var page = MAG.canvas.currentPage();
    if (!page || !W.active()) return null;

    var roots = C.roots(page.id);
    if (!roots.length) return null;

    /* 1 — okurun kendi seçtiği blok */
    if (manual && manual.pageId === page.id) {
      var picked = blockSel(manual.blockId, page.id);
      if (picked) return picked;
      manual = null; /* blok kayboldu (mod değişti) */
    }

    /* 2 — kaydırmalı sayfa: göz nerede, ses orada */
    if (page.fit === "scroll") {
      var near = nearestBlock(page);
      var byScroll = near && blockSel(near, page.id);
      if (byScroll) return byScroll;
    }

    /* 3 — sayfanın en yüksek puanlı sesi */
    var top = C.representative(roots);
    if (!top) return null;
    var blockId = C.blockIdOf(top);
    if (blockId && U.$('[data-block-id="' + blockId + '"]', page.el)) {
      var byTop = blockSel(blockId, page.id);
      if (byTop) return byTop;
    }
    /* görsel pini ya da sayfa seviyesi: tek sesle konuş */
    return { sel: { rootId: top.id }, roots: [top] };
  }

  /* ------------------------------------------------------------------------
     ÇİZİM
     --------------------------------------------------------------------- */

  function clearFocus() {
    if (focusEl) focusEl.removeAttribute("data-whisper-focus");
    focusEl = null;
  }

  function setFocus(blockId) {
    clearFocus();
    if (!blockId) return;
    var page = MAG.canvas.currentPage();
    focusEl = page && U.$('[data-block-id="' + blockId + '"]', page.el);
    if (focusEl) focusEl.setAttribute("data-whisper-focus", "true");
  }

  /** Şeridin ilk satırı: kim, nereye. Alıntı varsa alıntı kazanır. */
  function contextLabel(rep, sel) {
    var q = C.quoteOf(rep);
    if (q) return "“" + q + "”";
    if (sel.blockId) return C.blockLabel(sel.blockId) + " hakkında";
    if (rep.anchorType === "point") return "görselde bir nokta";
    return "bu sayfa hakkında";
  }

  function ensureNode() {
    if (node && node.parentNode === band) return node;
    node = el("button.whisper", {
      type: "button",
      onclick: function () {
        if (currentSel) MAG.overlays.openThread(currentSel);
      },
    });
    band.insertBefore(node, band.firstChild);
    return node;
  }

  function hide() {
    currentKey = null;
    currentSel = null;
    clearFocus();
    if (node) {
      node.remove();
      node = null;
    }
  }

  /**
   * Şerit AÇIKKEN yer kaplar — sesi olmayan sayfada bile. Yoksa bant her sayfa
   * değişiminde büyüyüp küçülürdü; telefonda bu tuvali de her seferinde yeniden
   * ölçtürüyor, okuma yerini oynatıyordu. Yer bir kez ayrılır, gerisi sessizlik.
   */
  function setMode(on) {
    var root = document.documentElement;
    if ((root.dataset.whisper === "on") === on) return;

    /* Telefonda tuval boyu `--whisper-h` kadar kısalır (bkz. css/comments.css):
       okunan yer kaymasın diye sayfa içindeki konumu ölçüp geri koyuyoruz. */
    var page = MAG.canvas.currentPage();
    var scroller = MAG.canvas.scroller();
    var offset = page ? scroller.scrollTop - page.el.offsetTop : 0;

    root.dataset.whisper = on ? "on" : "off";
    band.dataset.whisper = on ? "on" : "off";

    if (page && offset > 0) {
      var maxOffset = Math.max(0, page.el.offsetHeight - scroller.clientHeight);
      scroller.scrollTo({ top: page.el.offsetTop + Math.min(offset, maxOffset), behavior: "instant" });
    } else if (page) {
      scroller.scrollTo({ top: page.el.offsetTop, behavior: "instant" });
    }
  }

  /** Sesi olmayan sayfada şerit susar ama yerinde durur. */
  function quiet() {
    currentKey = "quiet";
    currentSel = null;
    clearFocus();
    var host = ensureNode();
    host.dataset.quiet = "true";
    U.clear(host);
    U.append(host, [
      el("span.whisper__dot", { text: "💬" }),
      el("span.whisper__text", null, [
        el("span.whisper__who", null, [el("b", { text: "bu sayfa" })]),
        el("span.whisper__body", { text: "henüz sessiz — bir paragrafa dokun, ilk sözü sen söyle" }),
      ]),
    ]);
    host.setAttribute("aria-label", "Bu sayfada henüz yorum yok.");
  }

  function render(state) {
    if (!W.active()) {
      setMode(false);
      return hide();
    }
    setMode(true);

    var rep = state && C.representative(state.roots);
    if (!rep) {
      if (currentKey !== "quiet") quiet();
      return;
    }

    /* bu blokta/bu seste kaç ses daha var? */
    var total = state.roots.reduce(function (n, c) {
      return n + C.threadSize(c.id);
    }, 0);

    var key = (state.sel.blockId || state.sel.rootId) + "|" + rep.id + "|" + total;
    if (key === currentKey) {
      setFocus(state.sel.blockId); /* aynı ses, blok yeniden çizilmiş olabilir */
      return;
    }
    currentKey = key;
    currentSel = state.sel;

    var host = ensureNode();
    host.removeAttribute("data-quiet");
    U.clear(host);
    U.append(host, [
      el("span.whisper__dot", { style: { "--c": rep.author.color }, text: rep.author.emoji }),
      el("span.whisper__text", null, [
        el("span.whisper__who", null, [
          el("b", { text: rep.author.name }),
          rep.status === "pending" ? el("i.whisper__pending", { text: "onayda" }) : null,
          el("span.whisper__where", { text: contextLabel(rep, state.sel) }),
        ]),
        el("span.whisper__body", { text: rep.body }),
      ]),
      total > 1 ? el("span.whisper__more", { text: "+" + (total - 1) }) : null,
      el("span.whisper__chev", { text: "›", "aria-hidden": "true" }),
    ]);
    host.setAttribute(
      "aria-label",
      rep.author.name + ": " + rep.body + (total > 1 ? " — ve " + (total - 1) + " ses daha" : "") + ". Konuşmayı aç."
    );

    setFocus(state.sel.blockId);
  }

  /* ------------------------------------------------------------------------
     DIŞ YÜZEY
     --------------------------------------------------------------------- */

  W.refresh = function () {
    if (!band) return;
    render(compute());
  };

  /**
   * Eş okuma açıkken yorumlu bir bloğa dokunulduğunda comments.js buraya sorar.
   * true dönerse thread AÇILMAZ: ses banda taşınır, okuma bölünmez.
   * Aynı bloğa ikinci dokunuş false döner → konuşma açılır.
   * ("önce duy, istersen aç" — fısıltının bütün fikri bu.)
   */
  W.focusBlock = function (blockId, pageId) {
    if (!W.active()) return false;
    if (manual && manual.pageId === pageId && manual.blockId === blockId) return false;
    manual = { pageId: pageId, blockId: blockId };
    W.refresh();
    return true;
  };

  W.init = function () {
    band = U.$("#band-bottom");

    U.listen("page:change", function () {
      manual = null;
      W.refresh();
    });
    /* Tek kapı: her decorate sonrası tazele (ekleme, stres, moderasyon). */
    U.listen("comments:decorated", W.refresh);
    U.listen("comment:reaction", W.refresh); /* tepki decorate etmez ama temsilci değişebilir */
    U.listen("comments:layer", W.refresh);
    U.listen("state:change", function (e) {
      if (e.detail.path === "commentUI") {
        manual = null;
        W.refresh();
      }
    });

    /* Kaydırmalı sayfalarda odak gözü takip eder. Okur bir bloğu kendi seçtiyse
       seçimi korunur — ta ki o blok ekrandan çıkana kadar; uzun bir sayfada
       görünmeyen bir paragrafın sesini taşımanın anlamı yok. */
    MAG.canvas.scroller().addEventListener(
      "scroll",
      U.raf(function () {
        var page = MAG.canvas.currentPage();
        if (!page || page.fit !== "scroll" || !W.active()) return;
        if (manual) {
          if (focusEl && inView(focusEl)) return;
          manual = null;
        }
        W.refresh();
      }),
      { passive: true }
    );

    W.refresh();
  };

  MAG.whisper = W;
})(window.MAG);
