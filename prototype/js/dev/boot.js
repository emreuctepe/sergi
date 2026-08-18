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

  function applyPrefs() {
    var root = document.documentElement;
    root.dataset.theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.motion = "on";
    root.dataset.issue = D.issue.slug;
    root.lang = "tr";
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
    MAG.dev.catalog.mount(U.$("#dev-catalog"));
    if (MAG.dev.editor) MAG.dev.editor.init();
    tabs();
    console.info("%cYazım kiti%c  ·  Katalog + canlı editör", "font-weight:700;color:#b8432c", "color:inherit");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.MAG);
