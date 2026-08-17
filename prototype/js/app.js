/* ============================================================================
   APP — açılış sırası ve modüllerin birbirine bağlandığı tek yer
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var D = MAG.data;
  var State = MAG.state;

  var DEPTH_LABEL = { min: "Doomscroller", mid: "Dengeli", full: "Doomreader" };

  function applyPreferences() {
    var root = document.documentElement;

    /* tema: kayıtlı tercih > sistem */
    var theme = State.get("theme");
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    root.dataset.theme = theme;

    root.dataset.motion = State.get("motion") === "off" ? "off" : "on";
    root.dataset.issue = D.issue.slug;
    root.dataset.commentLayer = "off";

    var locale = State.get("locale", "tr");
    root.lang = locale;
    U.$("#btn-lang").textContent = locale.toUpperCase();

    U.$("#depth-label").textContent = DEPTH_LABEL[State.depth()];
    U.$("#issue-tag").querySelector(".band__issue-no").textContent = U.pad2(D.issue.number);
    U.$("#issue-tag").querySelector(".band__issue-name").textContent = D.issue.title;
    document.title = D.issue.title + " · № " + U.pad2(D.issue.number);
  }

  function wire() {
    /* okuma modu etiketi her değişimde tazelensin */
    U.listen("state:change", function (e) {
      if (e.detail.path === "depth") {
        U.$("#depth-label").textContent = DEPTH_LABEL[e.detail.value] || "Dengeli";
      }
    });

    /* sayı sonu sayfasına gelince özet ekranını doldur */
    U.listen("page:change", function (e) {
      if (e.detail.page.kind === "outro") MAG.overlays.renderOutro();
    });
    U.listen("flow:render", function () {
      if (U.$("#outro")) MAG.overlays.renderOutro();
    });

    /* yorum eklenince sayaç + katman tazelensin */
    U.listen("comment:added", function () {
      MAG.comments.decorate();
      MAG.comments.updateCount();
    });

    U.listen("issue:finished", function () {
      MAG.overlays.toast("Sayıyı bitirdin 🍁");
    });

    U.listen("identity:upgraded", function (e) {
      if (!e.detail.keptId) console.warn("[kimlik] id değişti — bu olmamalıydı");
    });

    /* sistem teması değişirse ve kullanıcı elle seçmediyse takip et */
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!State.get("theme")) document.documentElement.dataset.theme = e.matches ? "dark" : "light";
    });
  }

  function start() {
    MAG.render.renderFlow({ restore: true });
    MAG.comments.decorate();
    MAG.comments.updateCount();
    MAG.puzzles.mount();
  }

  function boot() {
    applyPreferences();
    MAG.identity.ensure();

    MAG.canvas.init();
    MAG.overlays.init();
    MAG.comments.init();
    MAG.puzzles.init();
    MAG.analytics.init();
    wire();

    var seenIntro = State.get("seenIntro");
    var depth = State.get("depth");

    if (!seenIntro) {
      /* ilk ziyaret: tanıtım → mod seçimi → sayı */
      MAG.overlays.openIntro(function () {
        MAG.overlays.openDepthPicker({
          switching: false,
          closable: false,
          onDone: function () {
            start();
          },
        });
      });
    } else if (!depth) {
      MAG.overlays.openDepthPicker({
        switching: false,
        onDone: function () {
          start();
        },
      });
    } else {
      start();
    }

    /* geliştirme kolaylığı: konsoldan MAG.reset() */
    MAG.reset = State.reset;
    console.info(
      "%cDergi prototipi%c\nMAG.reset()   → her şeyi sıfırla\nMAG.data      → sayı içeriği\nMAG.flood(250) → stres modu: 250 sahte yorum (yalnızca bellekte)\nMAG.flood(0)  → temizle\nMAG.pins()    → pin kümelenmesi: çekim alanlarını çiz",
      "font-weight:700;color:#b8432c;font-size:14px",
      "color:inherit"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.MAG);
