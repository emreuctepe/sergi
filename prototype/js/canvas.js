/* ============================================================================
   CANVAS — 3:4 tuval yönetimi, snap gezinme motoru, sahne tetikleme
   ----------------------------------------------------------------------------
   Bu dosya içeriğin ne olduğunu bilmez. Sadece "sayfa" denen kutuları
   yönetir: hangisi görünür, ne kadar ilerledik, klavye nereye götürür.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var State = MAG.state;

  var shell, canvas, pagesEl, folio, folioSection, folioPage;
  var progressEl, progressFill;

  /* sabit menü ölçüleri — CSS'teki --dock-gap ile aynı olmalı */
  var DOCK_MIN_W = 240;
  var DOCK_MAX_W = 320;
  var DOCK_GAP = 24;
  var DOCK_EDGE = 20;
  /* Basık ve geniş pencerede tuval yüksekliğe sıkışır, yanlarda kocaman boşluk
     kalır. Menü tam oraya oturur. Eşik menünün kendi okunabilir olduğu en kısa
     boy: bunun altında liste kaydırmaktan ibaret kalır, boşluk bırakmak yeğdir. */
  var DOCK_MIN_H = 440;

  var pages = []; // [{ el, id, sectionSlug, sectionTitle, index, scene, fit }]
  var current = -1;
  var scrollLocked = false;
  var chromeTimer = null;
  var observer = null;

  var Canvas = {};

  /* ------------------------------------------------------------------------
     KURULUM
     --------------------------------------------------------------------- */

  Canvas.init = function () {
    shell = U.$("#shell");
    canvas = U.$("#canvas");
    pagesEl = U.$("#pages");
    folio = U.$("#folio");
    folioSection = U.$("#folio-section");
    folioPage = U.$("#folio-page");
    progressEl = U.$("#progress");
    progressFill = U.$("#progress-fill");

    measureLetterbox();
    window.addEventListener("resize", U.debounce(measureLetterbox, 120));
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", U.debounce(measureLetterbox, 120));
    }

    pagesEl.addEventListener("scroll", U.raf(onScroll), { passive: true });
    document.addEventListener("keydown", onKey);

    U.$("#btn-prev").addEventListener("click", function () {
      Canvas.prev();
    });
    U.$("#btn-next").addEventListener("click", function () {
      Canvas.next();
    });

    setupObserver();
  };

  /**
   * Tuvalin üstünde/altında bant için yer var mı?
   * Varsa bantlar letterbox boşluğunda yaşar (temiz okuma),
   * yoksa tuvalin üzerine biner (bulanık perdeyle).
   */
  function measureLetterbox() {
    var vh = window.innerHeight;
    var box = canvas.getBoundingClientRect();
    var bandH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ui-band-h")) || 52;
    var free = (vh - box.height) / 2;
    shell.dataset.letterbox = free >= bandH - 2 ? "roomy" : "tight";
    document.documentElement.style.setProperty("--letterbox-free", free.toFixed(1) + "px");

    /* Sabit menüye yer var mı?  [kenar][menü][boşluk][tuval][kenar] */
    var room = window.innerWidth - 2 * DOCK_EDGE - DOCK_GAP - box.width;
    var fits = room >= DOCK_MIN_W && vh >= DOCK_MIN_H;
    var root = document.documentElement;
    if (fits) root.style.setProperty("--dock-w", Math.min(DOCK_MAX_W, Math.floor(room)) + "px");
    var was = root.dataset.dockFits;
    root.dataset.dockFits = fits ? "true" : "false";
    if (was !== root.dataset.dockFits) U.emit("dock:fit", { fits: fits });
  }

  /* ------------------------------------------------------------------------
     SAYFA KAYDI — render.js sayfaları bastıktan sonra çağırır
     --------------------------------------------------------------------- */

  Canvas.registerPages = function () {
    pages = U.$$(".page", pagesEl).map(function (el, i) {
      el.dataset.index = i;
      return {
        el: el,
        index: i,
        id: el.dataset.pageId || "p" + i,
        sectionSlug: el.dataset.section || "",
        sectionTitle: el.dataset.sectionTitle || "",
        kind: el.dataset.kind || "",
        scene: el.dataset.scene || "none",
        fit: el.dataset.fit || "contain",
        bleed: el.dataset.bleed || "none",
      };
    });
    current = -1;
    if (observer) {
      observer.disconnect();
      pages.forEach(function (p) {
        observer.observe(p.el);
      });
    }
    onScroll();
    return pages;
  };

  Canvas.pages = function () {
    return pages;
  };
  Canvas.count = function () {
    return pages.length;
  };
  Canvas.currentIndex = function () {
    return current;
  };
  Canvas.currentPage = function () {
    return pages[current] || null;
  };
  Canvas.pageById = function (id) {
    for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return pages[i];
    return null;
  };
  Canvas.scroller = function () {
    return pagesEl;
  };

  /* ------------------------------------------------------------------------
     GEZİNME
     --------------------------------------------------------------------- */

  Canvas.goTo = function (index, opts) {
    opts = opts || {};
    index = U.clamp(index, 0, pages.length - 1);
    var page = pages[index];
    if (!page) return;
    var behavior = opts.instant || U.reducedMotion() ? "auto" : "smooth";
    scrollLocked = true;
    pagesEl.scrollTo({ top: page.el.offsetTop, behavior: behavior });
    setTimeout(function () {
      scrollLocked = false;
      onScroll();
    }, behavior === "auto" ? 30 : 420);
  };

  Canvas.goToId = function (pageId, opts) {
    var p = Canvas.pageById(pageId);
    if (p) Canvas.goTo(p.index, opts);
    return !!p;
  };

  Canvas.next = function () {
    var p = pages[current];
    /* uzun (fit:scroll) sayfada önce sayfanın sonuna in */
    if (p && p.fit === "scroll") {
      var bottom = p.el.offsetTop + p.el.offsetHeight;
      var seen = pagesEl.scrollTop + pagesEl.clientHeight;
      if (bottom - seen > 24) {
        pagesEl.scrollTo({
          top: Math.min(pagesEl.scrollTop + pagesEl.clientHeight * 0.86, bottom - pagesEl.clientHeight),
          behavior: U.reducedMotion() ? "auto" : "smooth",
        });
        return;
      }
    }
    Canvas.goTo(current + 1);
  };

  Canvas.prev = function () {
    var p = pages[current];
    if (p && p.fit === "scroll" && pagesEl.scrollTop - p.el.offsetTop > 24) {
      pagesEl.scrollTo({
        top: Math.max(pagesEl.scrollTop - pagesEl.clientHeight * 0.86, p.el.offsetTop),
        behavior: U.reducedMotion() ? "auto" : "smooth",
      });
      return;
    }
    Canvas.goTo(current - 1);
  };

  Canvas.goToSection = function (slug) {
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].sectionSlug === slug) {
        Canvas.goTo(i);
        return true;
      }
    }
    return false;
  };

  /* ------------------------------------------------------------------------
     KAYDIRMA → ilerleme, folio, olay
     --------------------------------------------------------------------- */

  function onScroll() {
    if (!pages.length) return;

    var top = pagesEl.scrollTop;
    var mid = top + pagesEl.clientHeight * 0.4;

    var idx = 0;
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].el.offsetTop <= mid) idx = i;
      else break;
    }

    /* ilerleme yüzdesi: sayfa sırası + sayfa içi konum */
    var max = pagesEl.scrollHeight - pagesEl.clientHeight;
    var pct = max > 0 ? U.clamp((top / max) * 100, 0, 100) : 0;
    progressFill.style.width = pct.toFixed(1) + "%";
    progressEl.setAttribute("aria-valuenow", Math.round(pct));

    if (idx !== current) {
      var prev = current;
      current = idx;
      var page = pages[current];

      folioSection.textContent = page.sectionTitle || "";
      folioPage.textContent = U.pad2(current + 1) + " / " + U.pad2(pages.length);
      folio.dataset.hidden = page.kind === "cover" || page.kind === "outro" ? "true" : "false";
      folio.dataset.overlay = page.bleed === "full" && page.kind !== "manga" ? "true" : "false";

      U.$("#btn-prev").disabled = current === 0;
      U.$("#btn-next").disabled = current === pages.length - 1;

      State.saveProgress(MAG.data.issue.slug, page.id, current);
      if (prev >= 0) State.data.stats.pagesRead++;

      U.emit("page:change", { page: page, index: current, prev: prev, total: pages.length });
    }

    /* sayının sonuna gelindi mi? */
    if (pct > 99 && current === pages.length - 1) {
      State.markFinished(MAG.data.issue.slug);
    }

    dimChrome();
  }

  /** Okurken bantlar sessizleşir, durunca geri gelir. */
  function dimChrome() {
    shell.dataset.chrome = "dim";
    clearTimeout(chromeTimer);
    chromeTimer = setTimeout(function () {
      shell.dataset.chrome = "on";
    }, 900);
  }

  /* ------------------------------------------------------------------------
     KLAVYE
     --------------------------------------------------------------------- */

  function onKey(e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (document.body.dataset.modal === "open") return;
    /* odak sabit menünün içindeyse Space/oklar oradaki düğmenin olsun */
    if (t && t.closest && t.closest("#menu-panel, #thread-panel, .modal-host")) return;

    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        Canvas.next();
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        Canvas.prev();
        break;
      case "Home":
        e.preventDefault();
        Canvas.goTo(0);
        break;
      case "End":
        e.preventDefault();
        Canvas.goTo(pages.length - 1);
        break;
    }
  }

  /* ------------------------------------------------------------------------
     SAHNE TETİKLEME
     Sayfa görünür olunca `data-scene` animasyonu çalışır. Sahne kitaplığı
     CSS'te (blocks.css) tanımlı; buradaki iş sadece sınıfı takmak.
     --------------------------------------------------------------------- */

  function setupObserver() {
    if (!("IntersectionObserver" in window)) return;
    /**
     * Eşik (threshold) bilinçli olarak çok düşük: `fit: scroll` sayfaları
     * tuvalden birkaç kat uzun olabilir, o yüzden kesişim oranı hiçbir zaman
     * yüksek bir eşiğe ulaşmaz. Sahne bir kez açıldıktan sonra da kapanmaz —
     * bunlar tek seferlik açılış animasyonları; sayfa geri kaydırıldığında
     * içeriğin yeniden kaybolması hata olurdu.
     */
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (!entry.isIntersecting) return;
          el.dataset.inview = "true";
          if (!el.dataset.played) {
            el.dataset.played = "1";
            U.emit("page:enter", { el: el, id: el.dataset.pageId });
          }
        });
      },
      { root: pagesEl, threshold: 0.02 }
    );
  }

  /* ------------------------------------------------------------------------
     TUVAL EFEKTLERİ (yorum katmanı vb. buradan tetikler)
     --------------------------------------------------------------------- */

  Canvas.setCommentMode = function (on) {
    shell.dataset.comments = on ? "on" : "off";
  };

  Canvas.lockScroll = function (locked) {
    pagesEl.style.overflowY = locked ? "hidden" : "auto";
  };

  /** Tuval içi (0-1) normalize koordinat → ekran pikseli ve tersi. */
  Canvas.toNormalized = function (clientX, clientY, pageEl) {
    var r = (pageEl || canvas).getBoundingClientRect();
    return {
      x: U.clamp((clientX - r.left) / r.width, 0, 1),
      y: U.clamp((clientY - r.top) / r.height, 0, 1),
    };
  };

  MAG.canvas = Canvas;
})(window.MAG);
