/* ============================================================================
   SAHTE ANALİTİK VERİSİ — yalnızca yayımlayıcı (editör) görür.
   ----------------------------------------------------------------------------
   Prototip: hepsi uydurma ama tutarlı. Sayı slug'ıyla tohumlanır, böylece
   sayfa yenilense de aynı sayılar gelir (editör tutarlı bir tablo görsün).

   Gerçek build'de iki kaynaktan beslenir; burada her bölümü etiketledik:
     · [türev] → ürünün zaten tuttuğu tablolardan (reading_progress,
                 comments, puzzle_runs, issue_reads) hesaplanır. Yeni veri yok.
     · [olay]  → türetilemeyen şeyler için minik, ilk-taraf, TOPLU olay günlüğü
                 (sayfada geçen süre, terk noktası, kaynak). Kişi-bazlı iz yok.
   Yasal çerçeve: üçüncü taraf izleyici yok, IP saklanmaz, parmak izi yok,
   editöre yalnızca AGREGASYON gösterilir (kişi sadece moderasyonda görünür).
   ========================================================================== */
(function (MAG) {
  "use strict";
  var D = MAG.data;
  var A = {};

  /* tohumlu RNG (mulberry32) — aynı slug → aynı akış */
  function seeded(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  A.build = function () {
    var rnd = seeded("analytics:" + D.issue.slug);
    function ri(lo, hi) { return Math.floor(lo + (hi - lo + 1) * rnd()); }
    function rf(lo, hi, d) { return +(lo + (hi - lo) * rnd()).toFixed(d == null ? 1 : d); }

    var flow = D.flow("mid"); /* temsili akış */

    /* --- kitle [türev] --- */
    var readers = ri(520, 880);
    var newR = Math.round(readers * rf(0.55, 0.72, 2));
    var returning = readers - newR;
    var sessions = readers + ri(120, 380);

    /* --- okuma hunisi / terk eğrisi [olay] --- */
    var reach = 100;
    var funnel = [];
    flow.forEach(function (item, i) {
      var p = item.page, s = item.section;
      if (i > 0) {
        var drop = 1.0 + rnd() * 2.6;
        if (p.kind === "article") drop += rnd() * 2.4; /* uzun metin daha çok terk */
        if (i === 1) drop += 3; /* kapaktan içeri ilk eşik */
        reach = Math.max(8, reach - drop);
      }
      funnel.push({
        pageId: p.id,
        section: s.title,
        kicker: s.kicker || s.type,
        kind: p.kind || "page",
        reached: +reach.toFixed(1),
        medianSec: ri(6, p.kind === "cover" ? 16 : p.kind === "puzzle" ? 150 : p.kind === "manga" ? 40 : 72),
      });
    });
    var completion = funnel[funnel.length - 1].reached;

    /* --- bölüm karnesi [türev] — huniden topla --- */
    var order = [];
    var bySec = {};
    funnel.forEach(function (f) {
      if (!bySec[f.section]) { bySec[f.section] = { title: f.section, kicker: f.kicker, first: f.reached, last: f.reached, sec: 0, n: 0 }; order.push(f.section); }
      var g = bySec[f.section];
      g.last = f.reached; g.sec += f.medianSec; g.n++;
    });
    var totalPub = (MAG.comments && MAG.comments.all)
      ? MAG.comments.all().filter(function (c) { return c.status === "published"; }).length
      : ri(80, 140);
    var sections = order.map(function (name, idx) {
      var g = bySec[name];
      var weight = g.first; /* çok okunan bölüm çok yorum alır */
      return {
        title: g.title,
        kicker: g.kicker,
        entered: g.first,
        completed: g.last,
        medianSec: Math.round(g.sec / g.n),
        comments: Math.max(0, Math.round((weight / 100) * totalPub * rf(0.6, 1.5, 2) / order.length * 3)),
        reactions: ri(4, Math.max(6, Math.round(weight))),
      };
    });

    /* --- okuma modu [türev] --- */
    var mMin = rf(38, 52), mFull = rf(10, 20), mMid = +(100 - mMin - mFull).toFixed(1);
    var modes = {
      dist: { min: mMin, mid: mMid, full: mFull },
      switches: ri(40, 130),
      completionByMode: { min: rf(58, 74), mid: rf(44, 60), full: rf(30, 46) },
    };

    /* --- yorum sağlığı [türev] --- */
    var pending = ri(3, 14), rejected = ri(2, 10);
    var anon = rf(46, 64);
    var comments = {
      published: totalPub, pending: pending, rejected: rejected,
      anonymousPct: anon, loggedPct: +(100 - anon).toFixed(1),
      queueMedianWaitH: rf(2, 20),
      rejectRate: +((rejected / Math.max(1, totalPub + rejected)) * 100).toFixed(1),
      byLocale: { tr: rf(72, 88), en: 0, ja: 0 },
    };
    comments.byLocale.en = rf(8, 20);
    comments.byLocale.ja = +(100 - comments.byLocale.tr - comments.byLocale.en).toFixed(1);

    /* --- bulmaca [türev] --- */
    var plays = Math.round(readers * rf(0.28, 0.46, 2));
    var solves = Math.round(plays * rf(0.5, 0.78, 2));
    var puzzle = {
      plays: plays, solves: solves, gaveUp: plays - solves,
      medianSec: ri(45, 210), hintRate: rf(12, 40),
      firstTryRate: rf(24, 46),
    };

    /* --- dönüşüm hunisi [olay + türev] --- */
    var visit = Math.round(readers * rf(1.15, 1.4, 2));
    var opened = readers;
    var half = Math.round(readers * (0.5 + rf(0, 0.15, 2)));
    var finished = Math.round(readers * completion / 100);
    var offerSeen = Math.round(readers * rf(0.4, 0.6, 2));
    var loggedIn = ri(30, 90);
    var returned = ri(40, 120);
    var conversion = [
      { step: "Ziyaret", count: visit },
      { step: "Sayıyı açtı", count: opened },
      { step: "%50'yi geçti", count: half },
      { step: "Bitirdi", count: finished },
      { step: "Giriş teklifi gördü", count: offerSeen },
      { step: "Giriş yaptı", count: loggedIn },
      { step: "Sonraki sayıya döndü", count: returned },
    ];

    /* --- bağlam [olay, toplu] --- */
    var mob = rf(68, 82);
    var context = {
      devices: { mobile: mob, desktop: +(100 - mob).toFixed(1) },
      locales: { tr: comments.byLocale.tr, en: comments.byLocale.en, ja: comments.byLocale.ja },
      themes: { dark: rf(48, 66), light: 0 },
      sources: [
        { name: "Doğrudan", pct: rf(30, 45) },
        { name: "Sosyal", pct: rf(24, 40) },
        { name: "Arama", pct: rf(10, 22) },
        { name: "Bülten", pct: rf(6, 16) },
      ],
      countries: [
        { name: "Türkiye", pct: rf(70, 84) },
        { name: "Almanya", pct: rf(4, 10) },
        { name: "ABD", pct: rf(3, 8) },
        { name: "Diğer", pct: rf(6, 14) },
      ],
    };
    context.themes.light = +(100 - context.themes.dark).toFixed(1);

    /* --- zaman: yayından sonraki ilk günler [türev] --- */
    var daily = [];
    var base = Math.round(readers * rf(0.32, 0.42, 2));
    for (var d = 1; d <= 14; d++) {
      var v = d === 1 ? base : d === 2 ? Math.round(base * rf(0.6, 0.8, 2)) : Math.round(base * Math.pow(0.72, d - 1) * (0.7 + rnd() * 0.6));
      daily.push({ day: d, readers: Math.max(2, v) });
    }

    return {
      issue: { slug: D.issue.slug, number: D.issue.number, title: D.issue.title, publishedDaysAgo: 6 },
      summary: {
        uniqueReaders: readers, newReaders: newR, returningReaders: returning,
        sessions: sessions, medianSessionSec: ri(140, 360),
        completionRate: completion,
        avgDepthReached: rf(52, 74),
        loggedInRate: +((loggedIn / readers) * 100).toFixed(1),
        newLogins: loggedIn,
        comments: { published: totalPub, pending: pending, rejected: rejected },
        reactions: sections.reduce(function (n, s) { return n + s.reactions; }, 0),
        puzzle: { plays: plays, solves: solves },
      },
      funnel: funnel,
      sections: sections,
      modes: modes,
      comments: comments,
      puzzle: puzzle,
      conversion: conversion,
      context: context,
      daily: daily,
    };
  };

  MAG.analyticsData = A;
})(window.MAG);
