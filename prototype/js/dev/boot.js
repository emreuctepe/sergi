/* ============================================================================
   DEV · BOOT — yazım kiti açılışı (dev.html)
   ----------------------------------------------------------------------------
   Üretim app.js'inin YERİNE geçer: normal okuma akışını (tanıtım, mod seçimi,
   sayı render) başlatmaz. Yalnızca kiti kurar: sekmeler + katalog (+ editör).
   ========================================================================= */
(function (MAG) {
  "use strict";
  var U = MAG.util;
  var D = MAG.data;

  var STORE = "mag.dev.palette";

  function remember(key, val) {
    try {
      var o = JSON.parse(localStorage.getItem(STORE) || "{}");
      o[key] = val;
      localStorage.setItem(STORE, JSON.stringify(o));
    } catch (e) {
      /* özel pencere / kapalı depolama — kit yine çalışsın */
    }
  }

  function recall() {
    try {
      return JSON.parse(localStorage.getItem(STORE) || "{}");
    } catch (e) {
      return {};
    }
  }

  function applyPrefs() {
    var root = document.documentElement;
    root.dataset.motion = "on";
    root.lang = "tr";
  }

  /* Palet seçici. Kit ARAYÜZÜ her zaman koyu (--d-* token'ları tema
     değişkenlerinden bağımsız); buradaki seçim yalnızca önizleme yüzeylerini
     (.dev-stage, sahne swatch'ları, editör tuvali) boyar. Sahneler CSS
     değişkeni kullandığı için yeniden çizim gerekmiyor, renk kendiliğinden
     dönüyor. Varsayılan: DEV.palettes'in ilki. */
  function palette() {
    var root = document.documentElement;
    var list = MAG.dev.palettes || [];
    var saved = recall();
    var issueSel = U.$("#dev-issue");
    var themeSel = U.$("#dev-theme");

    var known = list.map(function (p) { return p.slug; });
    var issue = known.indexOf(saved.issue) >= 0 ? saved.issue : known[0] || D.issue.slug;
    var theme = saved.theme === "light" ? "light" : "dark";

    if (issueSel) {
      list.forEach(function (p) {
        issueSel.appendChild(U.el("option", { value: p.slug, text: p.name }));
      });
      issueSel.value = issue;
      issueSel.addEventListener("change", function () {
        root.dataset.issue = issueSel.value;
        remember("issue", issueSel.value);
      });
    }
    if (themeSel) {
      themeSel.value = theme;
      themeSel.addEventListener("change", function () {
        root.dataset.theme = themeSel.value;
        remember("theme", themeSel.value);
      });
    }

    root.dataset.issue = issue;
    root.dataset.theme = theme;
  }

  function tabs() {
    var btns = U.$$(".dev-tab");
    var panes = U.$$(".dev-pane");
    function select(name) {
      btns.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === name ? "true" : "false"); });
      panes.forEach(function (p) { p.dataset.active = p.dataset.pane === name ? "true" : "false"; });
      if (name === "editor" && MAG.dev.editor && !MAG.dev.editor.started) MAG.dev.editor.start();
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () { select(b.dataset.tab); });
    });
    /* #editor gibi bir adresle açılırsa o sekmeyle başla */
    var hash = (location.hash || "").replace("#", "");
    select(hash === "editor" ? "editor" : "catalog");
  }

  function boot() {
    applyPrefs();
    palette();
    MAG.dev.catalog.mount(U.$("#dev-catalog"));
    if (MAG.dev.editor) MAG.dev.editor.init();
    tabs();
    console.info("%cYazım kiti%c  ·  Katalog + canlı editör", "font-weight:700;color:#b8432c", "color:inherit");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.MAG);
