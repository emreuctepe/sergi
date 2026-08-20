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

   JETON (eski adıyla "anahtar")
   Tamamlanan her SAYI bir jeton veriyor — jetonu ilk tamamlanan mod açıyor,
   sonraki modlar yeni jeton eklemiyor, o jetonun DERECESİNİ yükseltiyor.
   Derece keşfette açılan derginin kaç modunu okuyabileceğini belirliyor:

     min tamamlandı  → açılan dergide min + mid
     mid tamamlandı  → üç mod da
     full tamamlandı → üç mod da + yorumlarda prestij rozeti

   Bir jeton bir DERGİYİ açıyor (keşfetteki kapağı ve o an akışta o dergiye
   bağlı bütün kareleri birden — kilit dergi bazında).
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

  /* ========================================================================
     JETON, DERECE, KİLİT
     ===================================================================== */

  /* Derece → açılan dergide okunabilecek modlar. mid ile full aynı üç modu
     açıyor; full'ün fazlası mod değil, yorumlardaki prestij rozeti. */
  var GRADE_MODES = {
    min: ["min", "mid"],
    mid: ["min", "mid", "full"],
    full: ["min", "mid", "full"],
  };

  S.modesFor = function (grade) {
    return (GRADE_MODES[grade] || []).slice();
  };

  /** Bu sayıda tamamlanan EN İYİ mod — jetonun derecesi. Yoksa null. */
  S.grade = function (slug) {
    var s = slug || D.issue.slug;
    for (var i = D.depths.length - 1; i >= 0; i--) {
      if (State.isModeDone(s, D.depths[i])) return D.depths[i];
    }
    return null;
  };

  /** Kazanılmış jetonlar — tamamlanmış her sayı için bir tane, derecesiyle. */
  S.tokens = function () {
    var out = [];
    D.archive.forEach(function (a) {
      var g = S.grade(a.slug);
      if (g) out.push({ issue: a.slug, grade: g });
    });
    return out;
  };

  S.spent = function () {
    return Object.keys(State.get("unlocked", {})).length;
  };

  S.left = function () {
    return Math.max(0, S.tokens().length - S.spent());
  };

  /* Harcanacak jeton: elde kalanların EN İYİSİ. Okurdan "hangi jetonu
     harcamak istersin" diye sormuyoruz — o soru mekaniği görünür kılardı. */
  S.nextGrade = function () {
    var rank = D.depths;
    var grades = S.tokens()
      .map(function (t) {
        return t.grade;
      })
      .sort(function (a, b) {
        return rank.indexOf(b) - rank.indexOf(a);
      });
    return grades[S.spent()] || null;
  };

  S.isUnlocked = function (magId) {
    return !!State.get("unlocked", {})[magId];
  };

  S.unlockInfo = function (magId) {
    return State.get("unlocked", {})[magId] || null;
  };

  /**
   * Bir dergiyi açar. Jeton yoksa ya da zaten açıksa false döner.
   * Kilit dergi bazında: kapağı ve akıştaki kareleri birlikte açılır.
   */
  S.unlock = function (magId) {
    if (!magId || S.isUnlocked(magId)) return false;
    var grade = S.nextGrade();
    if (!grade || S.left() < 1) return false;

    var map = State.get("unlocked", {});
    map[magId] = { at: Date.now(), grade: grade, modes: S.modesFor(grade) };
    State.set("unlocked", map);
    U.emit("magazine:unlocked", { magazine: magId, grade: grade });
    return true;
  };

  /** Doomreader rozeti: herhangi bir sayıda `full` tamamlandıysa. */
  S.hasPrestige = function () {
    return D.archive.some(function (a) {
      return State.isModeDone(a.slug, "full");
    });
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

  /* Jeton ayrıca kaydedilmiyor: `modeDone` işaretlendiği an S.tokens() onu
     zaten sayıyor. İlk tamamlanan mod jetonu veriyor, sonrakiler yeni jeton
     eklemiyor — S.grade()'i, yani jetonun derecesini yükseltiyor. */
  function tamamla(slug, depth) {
    State.markModeDone(slug, depth);
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
    return {
      issue: slug,
      derece: S.grade(slug),
      jeton: { kazanilan: S.tokens().length, harcanan: S.spent(), kalan: S.left(), sirada: S.nextGrade() },
      acilanDergiler: Object.keys(State.get("unlocked", {})),
      prestij: S.hasPrestige(),
    };
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
