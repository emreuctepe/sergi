/* ============================================================================
   STREAK — okuma süresi sayacı ve mod tamamlama
   ----------------------------------------------------------------------------
   Okur bir sayıyı bir modda, o modun tahmini süresinin YARISI kadar okursa o
   modu tamamlamış sayılır. Üç modu da tamamlarsa o sayının anahtarını kazanır.

   BİLEREK SESSİZ
   Tamamlanma anında hiçbir şey söylenmiyor: toast yok, rozet yok, ses yok. Tek
   görünür iz, mod seçim ekranındaki kartın altın zemine dönmesi (overlays.js
   `data-done`, overlays.css `.depth-card[data-done]`). Okur oraya kendi merakıyla
   dönüp fark etsin diye böyle; "şunu da yap" diyen bir görev listesi olmasın.

   NEYİ SAYIYORUZ
   Duvar saatini değil, okuma süresini. Sayaç yalnızca sekme görünürken ve okur
   son ATIL_MS içinde bir hareket yapmışken işliyor. Yani sekmeyi açık bırakıp
   gitmek modu tamamlatmıyor. Süre sayı+mod çiftine yazılıyor; mod değiştirince
   sayaç kendiliğinden öteki kovaya geçer, biriken kaybolmaz.

   ANAHTAR
   Şimdilik yalnızca durumda duruyor (`State.keys`) ve `key:earned` olayını
   yayıyor. Bir sonraki aşamada dergi keşfet sayfasının kilidini o açacak.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var D = MAG.data;
  var State = MAG.state;

  var TIK_MS = 1000; // sayaç turu
  var ATIL_MS = 3 * 60 * 1000; // bu kadar hareketsizlik = artık okumuyor

  var S = {};
  var timer = null;
  var sonTik = 0;
  var sonHareket = 0;

  /* ========================================================================
     HEDEF VE İLERLEME
     ===================================================================== */

  /** Bu modu tamamlamak için gereken süre (ms) — tahminin yarısı. */
  S.targetMs = function (depth) {
    return (D.estimateMinutes(depth) * 60000) / 2;
  };

  S.spentMs = function (depth, slug) {
    return State.getModeTime(slug || D.issue.slug, depth || State.depth());
  };

  S.isDone = function (depth, slug) {
    return State.isModeDone(slug || D.issue.slug, depth || State.depth());
  };

  /** 0..1 — tamamlanmışsa hep 1. Keşfet sayfası bunu çizebilir. */
  S.progress = function (depth, slug) {
    if (S.isDone(depth, slug)) return 1;
    return U.clamp(S.spentMs(depth, slug) / S.targetMs(depth || State.depth()), 0, 1);
  };

  S.hasKey = function (slug) {
    return State.hasKey(slug || D.issue.slug);
  };

  S.keys = function () {
    return State.keyList();
  };

  /* ========================================================================
     SAYAÇ
     ===================================================================== */

  function okuyor() {
    return document.visibilityState === "visible" && Date.now() - sonHareket < ATIL_MS;
  }

  function tik() {
    var now = Date.now();
    var delta = now - sonTik;
    sonTik = now;
    if (!okuyor()) return;

    /* Sekme uyutulmuş olabilir (arka plan kısıtı, kapak kapanması): tek turda
       dakikalar birden gelir. Bir turdan fazlasını saymıyoruz. */
    if (delta > TIK_MS * 3) delta = TIK_MS;

    var slug = D.issue.slug;
    var depth = State.depth();
    if (State.isModeDone(slug, depth)) return;

    if (State.addModeTime(slug, depth, delta) >= S.targetMs(depth)) tamamla(slug, depth);
  }

  function tamamla(slug, depth) {
    if (!State.markModeDone(slug, depth)) return;

    var hepsi = D.depths.every(function (d) {
      return State.isModeDone(slug, d);
    });
    if (hepsi) State.grantKey(slug);
  }

  function basla() {
    if (timer) return;
    sonTik = Date.now();
    sonHareket = Date.now();
    timer = setInterval(tik, TIK_MS);
  }

  /* ========================================================================
     KURULUM
     ===================================================================== */

  S.init = function () {
    /* Sayaç tanıtım ve mod seçimi bitip sayı gerçekten çizilince başlasın. */
    U.listen("flow:render", basla);

    /* "Hâlâ buradayım" sinyalleri. Sayfa çevirmek de sayılır: uzun bir sayfayı
       kıpırdamadan okumak hareketsizlik değil. */
    ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"].forEach(function (t) {
      document.addEventListener(t, function () {
        sonHareket = Date.now();
      }, { passive: true });
    });
    U.listen("page:change", function () {
      sonHareket = Date.now();
    });

    document.addEventListener("visibilitychange", function () {
      /* Geri dönmek hareket sayılır; yokluk süresi zaten tik()'te eleniyor. */
      if (document.visibilityState === "visible") sonHareket = Date.now();
    });
  };

  /* Geliştirme kolaylığı — konsoldan MAG.streak.report() / .forward(12).
     Banner'da bilerek duyurulmuyor; okur bunu keşfetmesin. */

  S.report = function () {
    var slug = D.issue.slug;
    console.table(
      D.depths.map(function (d) {
        return {
          mod: d,
          hedef_dk: +(S.targetMs(d) / 60000).toFixed(1),
          gecen_dk: +(S.spentMs(d, slug) / 60000).toFixed(1),
          tamam: S.isDone(d, slug),
        };
      })
    );
    return { issue: slug, anahtar: S.hasKey(slug), anahtarlar: S.keys() };
  };

  /** Sayacı ileri sarar (yalnızca test için). */
  S.forward = function (dakika, depth) {
    var slug = D.issue.slug;
    var d = depth || State.depth();
    if (State.addModeTime(slug, d, (dakika || 1) * 60000) >= S.targetMs(d)) tamamla(slug, d);
    return S.report();
  };

  MAG.streak = S;
})(window.MAG);
