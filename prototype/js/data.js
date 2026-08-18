/* ============================================================================
   DATA — hangi sayı açılacak?
   ----------------------------------------------------------------------------
   Bu dosya içerik TUTMAZ. İçerik js/issues/<slug>.js dosyalarında yaşıyor ve
   her biri yüklenince kendini MAG.issues'a kaydediyor. Burada yalnızca üç iş var:

     1. Arşiv listesi (hangi sayılar var, hangisi güncel)
     2. Aktif sayının seçilmesi
     3. Sayıdan bağımsız yardımcılar (flow, pageVisible, estimateMinutes…)

   Sonuç yine tek bir MAG.data nesnesi — geri kalan tüm modüller (render, canvas,
   comments, puzzles, analytics) bunu okur ve çok sayılı olduğunu bilmez.

   AKTİF SAYI NEREDEN GELİYOR
   URL'den: ?sayi=2026-09. Başka yerde saklanmıyor, bilerek. Durum URL'de olunca
   eski bir sayıyı okurken sayfayı yenilemek okuduğunu kaybettirmiyor; tertemiz
   bir adres ise her zaman güncel sayıyı açıyor. Arşiv de böylece paylaşılabilir
   bir bağlantı üretiyor.

   Gerçek üründe bu seçim rota katmanının işi olacak (/sayi/2026-09), listeyi de
   `issues` tablosu verecek. Şema aynı kalıyor.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var REG = MAG.issues || {};
  var D = {};

  /* ========================================================================
     ARŞİV — sayı listesi
     ------------------------------------------------------------------------
     `current` = derginin güncel sayısı (kapak). Aktif sayı bundan farklı
     olabilir: arşivden eski bir sayı açıldığında aktif odur, güncel yine bu.
     İçeriği olmayan kayıtlar (2026-08, 2026-07) bilerek duruyor — arşivin
     kilitli/boş hâli de tasarımın parçası.
     ===================================================================== */

  D.archive = [
    { slug: "2026-10", number: 4, title: "Gürültü", month: "Ekim 2026", scene: "neon-city", current: true },
    { slug: "2026-09", number: 3, title: "Kızıl Mevsim", month: "Eylül 2026", scene: "torii" },
    { slug: "2026-08", number: 2, title: "Mavi Saat", month: "Ağustos 2026", scene: "moon" },
    { slug: "2026-07", number: 1, title: "Uzun Gün", month: "Temmuz 2026", scene: "waves" },
  ];

  /** Bu slug'ın içeriği yüklü mü? (arşivde görünüp de okunamayanlar var) */
  D.hasIssue = function (slug) {
    return !!REG[slug];
  };

  D.currentSlug = function () {
    for (var i = 0; i < D.archive.length; i++) if (D.archive[i].current) return D.archive[i].slug;
    return D.archive[0].slug;
  };

  /** Sayı okuma bağlantısı — güncel sayı için sade adres, ötekiler için ?sayi= */
  D.issueHref = function (slug) {
    return slug === D.currentSlug() ? "./" : "?sayi=" + encodeURIComponent(slug);
  };

  /* ========================================================================
     AKTİF SAYI
     ===================================================================== */

  function pickSlug() {
    var m = /[?&]sayi=([^&]+)/.exec(window.location.search);
    var asked = m ? decodeURIComponent(m[1]) : null;
    if (asked && REG[asked]) return asked;
    if (asked) console.warn('[data] "' + asked + '" sayısı yüklü değil, güncel sayı açılıyor.');

    var cur = D.currentSlug();
    if (REG[cur]) return cur;

    /* Güncel sayı henüz yazılmadıysa yüklü olan ilk sayıya düş. */
    for (var i = 0; i < D.archive.length; i++) if (REG[D.archive[i].slug]) return D.archive[i].slug;
    return null;
  }

  var slug = pickSlug();
  if (!slug) throw new Error("[data] Hiçbir sayı yüklenmedi — js/issues/*.js index.html'de data.js'ten ÖNCE gelmeli.");

  var active = REG[slug];

  D.issue = active.issue;
  D.intro = active.intro;
  D.sections = active.sections;
  D.puzzles = active.puzzles || [];

  /* Yorumlar burada değil: js/data-comments.js, aktif sayının tohumunu döşer. */
  D.comments = [];

  /* ========================================================================
     YARDIMCILAR — sayıdan bağımsız, hepsi aktif sayı üzerinde çalışır
     ===================================================================== */

  D.sectionBySlug = function (s) {
    for (var i = 0; i < D.sections.length; i++) if (D.sections[i].slug === s) return D.sections[i];
    return null;
  };

  D.puzzleById = function (id) {
    for (var i = 0; i < D.puzzles.length; i++) if (D.puzzles[i].id === id) return D.puzzles[i];
    return null;
  };

  /** Bir sayfa, verilen okuma derinliğinde görünür mü? */
  D.pageVisible = function (page, depth) {
    var d = page.depth || ["all"];
    return d.indexOf("all") >= 0 || d.indexOf(depth) >= 0;
  };

  /** Verilen derinlikte akışa girecek tüm sayfalar, sırayla. */
  D.flow = function (depth) {
    var out = [];
    D.sections.forEach(function (section) {
      section.pages.forEach(function (page) {
        if (D.pageVisible(page, depth)) out.push({ section: section, page: page });
      });
    });
    return out;
  };

  /** Derinliğe göre toplam okuma süresi tahmini. */
  D.estimateMinutes = function (depth) {
    var f = D.flow(depth);
    var m = 0;
    f.forEach(function (item) {
      var p = item.page;
      var words = 0;
      (p.blocks || []).forEach(function (b) {
        if (b.text) words += b.text.split(/\s+/).length;
        if (b.lines) words += b.lines.join(" ").split(/\s+/).length;
        if (b.items) {
          b.items.forEach(function (it) {
            words += String(it.def || it.term || it).split(/\s+/).length;
          });
        }
      });
      m += words / 190;
      /* Görsel sayfalar da zaman alır; bulmaca "okuma" değil, oyun sayılmaz. */
      if (p.kind === "manga") m += 0.75;
      else if (p.kind === "photo" || p.kind === "opener") m += 0.3;
    });
    return Math.max(1, Math.round(m));
  };

  MAG.data = D;
})(window.MAG);
