/* ============================================================================
   ART — satır içi SVG görsel kitaplığı
   ----------------------------------------------------------------------------
   Prototipte tek bir dış görsel yok. Bütün "fotoğraflar" ve illüstrasyonlar
   burada elle çizildi ve sayı temasının CSS değişkenleriyle boyanıyor —
   yani tema değişince görseller de değişiyor. Gerçek üründe bunların yerine
   `content/issues/<ay>/sections/.../images/` altındaki AVIF/WebP dosyaları gelir;
   çağrı yüzeyi (MAG.art.scene(ad)) aynı kalır.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var A = {};

  var VB = "0 0 300 400"; // 3:4 — tuvalle aynı oran

  function wrap(inner, vb, cls) {
    return (
      '<svg class="art ' +
      (cls || "") +
      '" viewBox="' +
      (vb || VB) +
      '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      inner +
      "</svg>"
    );
  }

  /** Yumuşak dikey degrade tanımı. */
  function grad(id, stops, x1, y1, x2, y2) {
    var s = stops
      .map(function (st) {
        return '<stop offset="' + st[0] + '" stop-color="' + st[1] + '" stop-opacity="' + (st[2] === undefined ? 1 : st[2]) + '"/>';
      })
      .join("");
    return (
      '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) +
      '" x2="' + (x2 || 0) + '" y2="' + (y2 === undefined ? 1 : y2) + '">' + s + "</linearGradient>"
    );
  }

  /** Tekrarlanan ince tarama dokusu — baskı hissi verir. */
  function hatch(id, color, opacity) {
    return (
      '<pattern id="' + id + '" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">' +
      '<line x1="0" y1="0" x2="0" y2="4" stroke="' + color + '" stroke-width="1" opacity="' + opacity + '"/>' +
      "</pattern>"
    );
  }

  /* ------------------------------------------------------------------------
     SAHNELER — her biri 3:4, tam kanama kullanılmak üzere
     --------------------------------------------------------------------- */

  var scenes = {};

  /* Torii kapısı, batan güneş — sayının kapak görseli */
  scenes.torii = function () {
    return wrap(
      "<defs>" +
        grad("sky", [["0", "var(--accent-2)", 0.35], ["0.55", "var(--accent)", 0.5], ["1", "var(--accent)", 0.85]]) +
        grad("hill", [["0", "var(--accent-3)", 0.85], ["1", "var(--accent-3)", 1]]) +
        hatch("h1", "var(--ink)", 0.06) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--paper-sunken)"/>' +
        '<rect width="300" height="400" fill="url(#sky)"/>' +
        '<circle cx="150" cy="196" r="62" fill="var(--paper-raised)" opacity="0.92"/>' +
        '<circle cx="150" cy="196" r="62" fill="url(#h1)"/>' +
        /* uzak dağlar */
        '<path d="M0 250 L52 196 L96 238 L140 188 L196 246 L242 206 L300 258 L300 400 L0 400Z" fill="var(--ink)" opacity="0.14"/>' +
        '<path d="M0 288 L60 250 L118 286 L172 246 L232 292 L300 262 L300 400 L0 400Z" fill="url(#hill)" opacity="0.55"/>' +
        /* torii */
        '<g fill="var(--accent)" opacity="0.96">' +
        '<path d="M62 168 h176 l-8 15 H70Z"/>' +
        '<rect x="72" y="190" width="156" height="11" rx="2"/>' +
        '<rect x="92" y="183" width="15" height="180" rx="3"/>' +
        '<rect x="193" y="183" width="15" height="180" rx="3"/>' +
        '<rect x="140" y="201" width="20" height="26" rx="2"/>' +
        "</g>" +
        '<rect y="352" width="300" height="48" fill="var(--ink)" opacity="0.2"/>' +
        '<rect width="300" height="400" fill="url(#h1)"/>'
    );
  };

  /* Katmanlı dağ silsilesi + sis */
  scenes.mountains = function () {
    return wrap(
      "<defs>" +
        grad("mg", [["0", "var(--paper-raised)", 1], ["1", "var(--paper-sunken)", 1]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="url(#mg)"/>' +
        '<circle cx="222" cy="92" r="34" fill="var(--accent-2)" opacity="0.35"/>' +
        '<path d="M0 214 L74 128 L128 196 L166 152 L228 226 L300 168 L300 400 L0 400Z" fill="var(--accent-3)" opacity="0.28"/>' +
        '<rect y="212" width="300" height="16" fill="var(--paper-raised)" opacity="0.75"/>' +
        '<path d="M0 268 L58 206 L112 262 L168 214 L226 274 L300 232 L300 400 L0 400Z" fill="var(--accent-3)" opacity="0.5"/>' +
        '<rect y="272" width="300" height="12" fill="var(--paper-raised)" opacity="0.6"/>' +
        '<path d="M0 322 L66 278 L126 326 L192 284 L258 330 L300 308 L300 400 L0 400Z" fill="var(--ink)" opacity="0.55"/>' +
        '<path d="M0 366 L48 344 L118 372 L190 342 L262 374 L300 358 L300 400 L0 400Z" fill="var(--ink)" opacity="0.82"/>'
    );
  };

  /* Gece şehri — pencere ızgarası */
  scenes.city = function () {
    var rand = U.rng(4711);
    var towers = "";
    var x = -10;
    while (x < 310) {
      var w = 18 + Math.round(rand() * 26);
      var h = 90 + Math.round(rand() * 190);
      var y = 400 - h;
      towers += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="var(--ink)" opacity="' + (0.55 + rand() * 0.35).toFixed(2) + '"/>';
      for (var wy = y + 8; wy < 392; wy += 11) {
        for (var wx = x + 4; wx < x + w - 5; wx += 8) {
          if (rand() > 0.52) {
            towers +=
              '<rect x="' + wx + '" y="' + wy + '" width="3.4" height="4.6" fill="var(--accent-2)" opacity="' +
              (0.35 + rand() * 0.6).toFixed(2) + '"/>';
          }
        }
      }
      x += w + 3 + Math.round(rand() * 8);
    }
    return wrap(
      "<defs>" +
        grad("night", [["0", "var(--accent-3)", 0.9], ["0.5", "var(--ink)", 0.75], ["1", "var(--ink)", 0.95]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--paper-sunken)"/>' +
        '<rect width="300" height="400" fill="url(#night)"/>' +
        '<circle cx="72" cy="76" r="26" fill="var(--paper-raised)" opacity="0.9"/>' +
        '<circle cx="60" cy="68" r="24" fill="var(--ink)" opacity="0.85"/>' +
        towers
    );
  };

  /* Yağmur + şemsiyeli figür */
  scenes.rain = function () {
    var rand = U.rng(9012);
    var drops = "";
    for (var i = 0; i < 110; i++) {
      var rx = rand() * 320 - 10;
      var ry = rand() * 400;
      var len = 10 + rand() * 22;
      drops += '<line x1="' + rx.toFixed(1) + '" y1="' + ry.toFixed(1) + '" x2="' + (rx - len * 0.28).toFixed(1) + '" y2="' + (ry + len).toFixed(1) + '" stroke="var(--paper-raised)" stroke-width="1" opacity="' + (0.15 + rand() * 0.4).toFixed(2) + '"/>';
    }
    return wrap(
      "<defs>" + grad("rn", [["0", "var(--accent-3)", 0.55], ["1", "var(--ink)", 0.8]]) + "</defs>" +
        '<rect width="300" height="400" fill="var(--paper-sunken)"/>' +
        '<rect width="300" height="400" fill="url(#rn)"/>' +
        drops +
        /* ıslak zemin yansıması */
        '<rect y="330" width="300" height="70" fill="var(--ink)" opacity="0.35"/>' +
        '<g opacity="0.95">' +
        '<path d="M108 250 a44 34 0 0 1 84 0Z" fill="var(--accent)"/>' +
        '<line x1="150" y1="250" x2="150" y2="330" stroke="var(--ink)" stroke-width="3"/>' +
        '<path d="M150 330 q10 6 16 0" fill="none" stroke="var(--ink)" stroke-width="3"/>' +
        '<ellipse cx="150" cy="356" rx="26" ry="5" fill="var(--ink)" opacity="0.5"/>' +
        "</g>" +
        '<g opacity="0.35"><path d="M118 356 h64 l-8 44 h-48Z" fill="var(--accent)"/></g>'
    );
  };

  /* Tapınak çatısı ve basamaklar */
  scenes.temple = function () {
    return wrap(
      "<defs>" + grad("tg", [["0", "var(--paper-raised)", 1], ["1", "var(--accent-soft)", 0.9]]) + "</defs>" +
        '<rect width="300" height="400" fill="url(#tg)"/>' +
        '<circle cx="86" cy="88" r="46" fill="var(--accent-2)" opacity="0.22"/>' +
        /* çatı */
        '<path d="M24 190 q126 -96 252 0 q-30 -12 -50 -6 q-76 -56 -152 0 q-22 -6 -50 6Z" fill="var(--ink)" opacity="0.88"/>' +
        '<path d="M58 196 h184 v10 H58Z" fill="var(--accent)"/>' +
        /* sütunlar */
        '<rect x="76" y="206" width="12" height="96" fill="var(--accent)" opacity="0.9"/>' +
        '<rect x="212" y="206" width="12" height="96" fill="var(--accent)" opacity="0.9"/>' +
        '<rect x="120" y="222" width="60" height="80" fill="var(--ink)" opacity="0.3"/>' +
        /* fener */
        '<g transform="translate(150,150)"><rect x="-9" y="-16" width="18" height="26" rx="4" fill="var(--accent-2)" opacity="0.95"/><rect x="-12" y="-20" width="24" height="5" rx="2" fill="var(--ink)"/></g>' +
        /* basamaklar */
        '<g fill="var(--ink)" opacity="0.16">' +
        '<rect x="52" y="308" width="196" height="12"/><rect x="42" y="324" width="216" height="12"/>' +
        '<rect x="32" y="340" width="236" height="12"/><rect x="22" y="356" width="256" height="12"/>' +
        '<rect x="12" y="372" width="276" height="12"/></g>'
    );
  };

  /* Dar sokak, fenerler, tabelalar */
  scenes.street = function () {
    var rand = U.rng(2211);
    var signs = "";
    for (var i = 0; i < 9; i++) {
      var sy = 100 + i * 26;
      var left = i % 2 === 0;
      var w = 14 + rand() * 16;
      var h = 40 + rand() * 40;
      signs +=
        '<rect x="' + (left ? 22 + i * 3 : 268 - i * 3 - w) + '" y="' + sy + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) +
        '" rx="2" fill="' + (rand() > 0.5 ? "var(--accent)" : "var(--accent-2)") + '" opacity="' + (0.45 + rand() * 0.5).toFixed(2) + '"/>';
    }
    return wrap(
      "<defs>" + grad("st", [["0", "var(--ink)", 0.92], ["0.6", "var(--accent-3)", 0.6], ["1", "var(--accent)", 0.35]]) + "</defs>" +
        '<rect width="300" height="400" fill="var(--paper-sunken)"/>' +
        '<rect width="300" height="400" fill="url(#st)"/>' +
        /* perspektif duvarlar */
        '<path d="M0 0 L96 150 L96 400 L0 400Z" fill="var(--ink)" opacity="0.72"/>' +
        '<path d="M300 0 L204 150 L204 400 L300 400Z" fill="var(--ink)" opacity="0.72"/>' +
        signs +
        /* yerdeki ışık */
        '<path d="M96 400 L138 220 L162 220 L204 400Z" fill="var(--accent-2)" opacity="0.2"/>' +
        '<circle cx="150" cy="214" r="16" fill="var(--paper-raised)" opacity="0.55"/>'
    );
  };

  /* Yaprak silueti — tek çizim, her yerde tekrar kullanılır */
  var LEAF =
    "M0 13 C-7.5 7 -10.5 -2 -5.5 -8.5 C-3 -11.8 3 -11.8 5.5 -8.5 C10.5 -2 7.5 7 0 13Z";
  var LEAF_VEIN = "M0 12 L0 -9 M0 2 L5 -3 M0 2 L-5 -3 M0 7 L4.5 3 M0 7 L-4.5 3";

  function leafGroup(fill) {
    return (
      '<path d="' + LEAF + '" fill="' + (fill || "var(--accent)") + '"/>' +
      '<path d="' + LEAF_VEIN + '" fill="none" stroke="var(--paper)" stroke-width="0.8" opacity="0.45" stroke-linecap="round"/>'
    );
  }

  /* Düşen yapraklar — sade kâğıt üstünde, seyrek ve yumuşak */
  scenes.leaves = function () {
    var rand = U.rng(31337);
    var out = "";
    var tones = ["var(--accent)", "var(--accent-2)", "var(--accent-3)"];
    for (var i = 0; i < 17; i++) {
      var lx = rand() * 300;
      var ly = rand() * 400;
      var s = 0.55 + rand() * 1.25;
      var rot = rand() * 360;
      var op = (0.16 + rand() * 0.42).toFixed(2);
      out +=
        '<g transform="translate(' + lx.toFixed(0) + "," + ly.toFixed(0) + ") rotate(" + rot.toFixed(0) + ") scale(" + s.toFixed(2) + ')" opacity="' + op + '">' +
        leafGroup(tones[Math.floor(rand() * tones.length)]) +
        "</g>";
    }
    return wrap(
      '<rect width="300" height="400" fill="var(--paper)"/>' +
        '<circle cx="248" cy="52" r="110" fill="var(--accent)" opacity="0.05"/>' +
        out
    );
  };

  /* Soyut portre — söyleşi bölümleri için */
  scenes.portrait = function (opts) {
    var flip = opts && opts.flip;
    return wrap(
      "<defs>" + grad("pg", [["0", "var(--accent-soft)", 1], ["1", "var(--paper-sunken)", 1]]) + "</defs>" +
        '<rect width="300" height="400" fill="url(#pg)"/>' +
        '<g transform="translate(' + (flip ? "300,0) scale(-1,1)" : "0,0)") + '">' +
        /* grafik daire — portrenin arkasındaki baskı lekesi */
        '<circle cx="164" cy="150" r="96" fill="var(--accent)" opacity="0.2"/>' +
        '<path d="M0 250 h300 v6 H0Z" fill="var(--ink)" opacity="0.12"/>' +
        /* profil silueti: yüz hatları YOK, sadece kontur */
        '<path d="M96 400 q-4 -78 26 -108 q-22 -20 -22 -58 q0 -66 54 -66 q52 0 52 62 q0 20 -6 34 q10 4 14 16 q6 18 -8 24 q4 26 -6 40 q28 26 32 56 Z" fill="var(--ink)" opacity="0.92"/>' +
        /* omuz / yaka */
        '<path d="M60 400 q10 -68 60 -84 l16 30 l18 -28 q54 14 66 82 Z" fill="var(--accent-3)" opacity="0.9"/>' +
        '<path d="M136 316 l14 26 l14 -26 l-14 -8Z" fill="var(--paper-raised)" opacity="0.85"/>' +
        /* ışık kenarı */
        '<path d="M100 234 q-24 34 -22 96" fill="none" stroke="var(--accent-2)" stroke-width="3" opacity="0.5"/>' +
        "</g>"
    );
  };

  /* Tren penceresi — hız çizgileri */
  scenes.train = function () {
    var rand = U.rng(777);
    var streaks = "";
    for (var i = 0; i < 30; i++) {
      var y = 120 + rand() * 200;
      streaks += '<rect x="0" y="' + y.toFixed(0) + '" width="300" height="' + (1 + rand() * 4).toFixed(1) + '" fill="var(--accent-3)" opacity="' + (0.1 + rand() * 0.35).toFixed(2) + '"/>';
    }
    return wrap(
      "<defs>" + grad("tr", [["0", "var(--accent-2)", 0.5], ["1", "var(--accent-3)", 0.7]]) + "</defs>" +
        '<rect width="300" height="400" fill="var(--ink)" opacity="0.9"/>' +
        '<rect x="26" y="60" width="248" height="280" rx="24" fill="url(#tr)"/>' +
        '<g clip-path="inset(0 round 24px)"><rect x="26" y="60" width="248" height="280" fill="none"/>' + streaks + "</g>" +
        '<rect x="26" y="60" width="248" height="280" rx="24" fill="none" stroke="var(--paper-sunken)" stroke-width="10"/>' +
        '<rect x="18" y="344" width="264" height="14" rx="7" fill="var(--paper-sunken)" opacity="0.8"/>'
    );
  };

  /* Buharı tüten kâse — yemek/liste bölümleri */
  scenes.bowl = function () {
    return wrap(
      '<rect width="300" height="400" fill="var(--paper)"/>' +
        '<circle cx="150" cy="220" r="118" fill="var(--accent-soft)" opacity="0.5"/>' +
        '<path d="M56 200 h188 a94 94 0 0 1 -188 0Z" fill="var(--accent)" opacity="0.9"/>' +
        '<ellipse cx="150" cy="200" rx="94" ry="24" fill="var(--ink)" opacity="0.82"/>' +
        '<ellipse cx="150" cy="198" rx="80" ry="18" fill="var(--accent-2)" opacity="0.85"/>' +
        '<g stroke="var(--paper-raised)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.75">' +
        '<path d="M112 196 q22 -6 44 2"/><path d="M120 204 q34 -4 58 4"/><path d="M104 190 q30 -10 62 -2"/></g>' +
        '<g stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round" opacity="0.7">' +
        '<path d="M206 96 l-40 62"/><path d="M216 106 l-40 62"/></g>' +
        '<g fill="none" stroke="var(--ink)" stroke-width="2.5" opacity="0.3" stroke-linecap="round">' +
        '<path d="M124 150 q-12 -18 0 -34 q12 -16 0 -32"/>' +
        '<path d="M152 142 q-12 -18 0 -34 q12 -16 0 -32"/>' +
        '<path d="M180 150 q-12 -18 0 -34 q12 -16 0 -32"/></g>'
    );
  };

  /* Büyük ay + bulut şeritleri */
  scenes.moon = function () {
    return wrap(
      "<defs>" + grad("mn", [["0", "var(--ink)", 0.94], ["1", "var(--accent-3)", 0.7]]) + "</defs>" +
        '<rect width="300" height="400" fill="url(#mn)"/>' +
        '<circle cx="150" cy="150" r="72" fill="var(--paper-raised)" opacity="0.94"/>' +
        '<circle cx="124" cy="132" r="12" fill="var(--paper-sunken)" opacity="0.6"/>' +
        '<circle cx="168" cy="166" r="18" fill="var(--paper-sunken)" opacity="0.45"/>' +
        '<circle cx="176" cy="118" r="7" fill="var(--paper-sunken)" opacity="0.5"/>' +
        '<g fill="var(--ink)" opacity="0.55">' +
        '<rect x="-20" y="128" width="200" height="12" rx="6"/>' +
        '<rect x="120" y="182" width="220" height="14" rx="7"/>' +
        '<rect x="-30" y="216" width="180" height="10" rx="5"/></g>' +
        '<path d="M0 320 q76 -34 150 0 q74 34 150 0 L300 400 L0 400Z" fill="var(--ink)" opacity="0.85"/>'
    );
  };

  /* Seigaiha (dalga) deseni — bölüm ayraçları */
  scenes.waves = function () {
    var out = "";
    for (var r = 0; r < 10; r++) {
      for (var c = -1; c < 8; c++) {
        var cx = c * 44 + (r % 2 ? 22 : 0);
        var cy = r * 42;
        out +=
          '<g opacity="' + (0.14 + (r % 3) * 0.08).toFixed(2) + '" fill="none" stroke="var(--accent)" stroke-width="2">' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="26"/><circle cx="' + cx + '" cy="' + cy + '" r="19"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="12"/><circle cx="' + cx + '" cy="' + cy + '" r="5"/></g>';
      }
    }
    return wrap('<rect width="300" height="400" fill="var(--paper-sunken)"/>' + out);
  };

  /* Sade doku — metin sayfalarının arkasına */
  scenes.paper = function () {
    return wrap(
      '<rect width="300" height="400" fill="var(--paper)"/>' +
        '<circle cx="270" cy="-20" r="120" fill="var(--accent)" opacity="0.05"/>' +
        '<circle cx="10" cy="420" r="150" fill="var(--accent-3)" opacity="0.05"/>'
    );
  };

  /* ------------------------------------------------------------------------
     SAYI 04 · "GÜRÜLTÜ" SAHNELERİ
     Cyberpunk ama aynı kural geçerli: tek bir sabit renk yok, hepsi sayının
     CSS değişkenlerinden geliyor. Tema koyuya dönünce bunlar da dönüyor.
     Kendi görselini koymak istersen sayfanın bg alanını değiştirmen yeter:
         bg: "scene:neon-city"  →  bg: "img:assets/2026-10/kapak.webp"
     --------------------------------------------------------------------- */

  /* Yağmurlu neon şehir — kapak */
  scenes["neon-city"] = function () {
    var rand = U.rng(90210);
    var s = "";

    /* silüetler, arkadan öne üç katman */
    [
      { y0: 168, h: 120, op: 0.3, step: 34 },
      { y0: 206, h: 150, op: 0.55, step: 27 },
      { y0: 244, h: 170, op: 0.85, step: 21 },
    ].forEach(function (layer, li) {
      var x = -12;
      while (x < 312) {
        var w = layer.step + Math.round(rand() * layer.step);
        var top = layer.y0 + Math.round(rand() * 46) - 20;
        s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + (400 - top) + '" fill="var(--ink)" opacity="' + layer.op + '"/>';

        /* ön katmanda pencereler ve neon tabelalar */
        if (li === 2) {
          for (var wy = top + 10; wy < 380; wy += 13) {
            for (var wx = x + 4; wx < x + w - 5; wx += 9) {
              if (rand() > 0.62) {
                s += '<rect x="' + wx + '" y="' + wy + '" width="3" height="4" fill="var(--accent)" opacity="' + (0.3 + rand() * 0.5).toFixed(2) + '"/>';
              }
            }
          }
          if (rand() > 0.55) {
            var sy = top + 24 + Math.round(rand() * 60);
            s += '<rect x="' + (x + 5) + '" y="' + sy + '" width="' + Math.max(6, w - 10) + '" height="4" rx="2" fill="var(--accent-2)" opacity="0.9"/>';
          }
        }
        x += w + 2;
      }
    });

    /* dikey neon tabelalar — magenta ve teal */
    s +=
      '<rect x="36" y="150" width="7" height="96" rx="3" fill="var(--accent-2)" opacity="0.85"/>' +
      '<rect x="252" y="176" width="6" height="74" rx="3" fill="var(--accent)" opacity="0.85"/>';

    /* yağmur */
    var rain = "";
    for (var i = 0; i < 110; i++) {
      var rx = rand() * 320 - 10;
      var ry = rand() * 400;
      rain += '<line x1="' + rx.toFixed(1) + '" y1="' + ry.toFixed(1) + '" x2="' + (rx - 5).toFixed(1) + '" y2="' + (ry + 16).toFixed(1) + '"/>';
    }

    return wrap(
      "<defs>" +
        grad("nc-sky", [["0", "var(--backdrop)", 1], ["0.62", "var(--accent-3)", 0.55], ["1", "var(--accent-2)", 0.28]]) +
        grad("nc-wet", [["0", "var(--accent)", 0.3], ["1", "var(--backdrop)", 0.9]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--backdrop)"/>' +
        '<rect width="300" height="400" fill="url(#nc-sky)"/>' +
        '<circle cx="212" cy="104" r="40" fill="var(--accent)" opacity="0.16"/>' +
        s +
        /* ıslak asfalt yansıması */
        '<rect y="356" width="300" height="44" fill="url(#nc-wet)"/>' +
        '<g stroke="var(--accent)" stroke-width="3" opacity="0.35">' +
        '<line x1="40" y1="360" x2="40" y2="392"/><line x1="255" y1="364" x2="255" y2="396"/>' +
        "</g>" +
        '<g stroke="var(--paper-raised)" stroke-width="0.7" opacity="0.22">' + rain + "</g>"
    );
  };

  /* CRT terminal — tarama çizgileri ve akan kayıt satırları */
  scenes.terminal = function () {
    var rand = U.rng(1337);
    var rows = "";
    var y = 74;
    while (y < 344) {
      var indent = rand() > 0.72 ? 16 : 0;
      var w = 26 + Math.round(rand() * 168);
      var isHit = rand() > 0.86;
      rows +=
        '<rect x="' + (46 + indent) + '" y="' + y + '" width="' + w + '" height="4.5" rx="2" fill="var(--accent' + (isHit ? "-2" : "") + ')" opacity="' +
        (isHit ? 0.95 : 0.34 + rand() * 0.4).toFixed(2) + '"/>';
      y += 13;
    }

    return wrap(
      "<defs>" +
        grad("tm-glow", [["0", "var(--accent)", 0.22], ["1", "var(--backdrop)", 0]]) +
        '<pattern id="tm-scan" width="3" height="3" patternUnits="userSpaceOnUse">' +
        '<line x1="0" y1="0" x2="300" y2="0" stroke="var(--backdrop)" stroke-width="1.2" opacity="0.5"/>' +
        "</pattern>" +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--backdrop)"/>' +
        '<rect x="26" y="40" width="248" height="326" rx="10" fill="var(--paper-sunken)" opacity="0.14"/>' +
        '<rect x="26" y="40" width="248" height="326" rx="10" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity="0.55"/>' +
        '<ellipse cx="150" cy="200" rx="150" ry="190" fill="url(#tm-glow)"/>' +
        /* başlık çubuğu */
        '<rect x="26" y="40" width="248" height="20" rx="10" fill="var(--accent)" opacity="0.18"/>' +
        '<circle cx="42" cy="50" r="3" fill="var(--accent-2)" opacity="0.9"/>' +
        '<circle cx="54" cy="50" r="3" fill="var(--accent)" opacity="0.7"/>' +
        rows +
        /* imleç */
        '<rect x="46" y="348" width="9" height="11" fill="var(--accent)" opacity="0.95"/>' +
        '<rect width="300" height="400" fill="url(#tm-scan)"/>'
    );
  };

  /* Devre kartı — yollar, düğümler, akan veri */
  scenes.circuit = function () {
    var rand = U.rng(24680);
    var traces = "";
    var pads = "";

    for (var i = 0; i < 16; i++) {
      var x = Math.round(rand() * 280) + 10;
      var yy = Math.round(rand() * 380) + 10;
      var d = "M" + x + " " + yy;
      var cx = x;
      var cy = yy;
      var segs = 2 + Math.round(rand() * 3);
      for (var s2 = 0; s2 < segs; s2++) {
        var len = 22 + Math.round(rand() * 58);
        if (s2 % 2 === 0) {
          cx += rand() > 0.5 ? len : -len;
          d += " H" + cx;
        } else {
          cy += rand() > 0.5 ? len : -len;
          d += " V" + cy;
        }
      }
      var warm = rand() > 0.78;
      traces +=
        '<path d="' + d + '" fill="none" stroke="var(--accent' + (warm ? "-2" : "") + ')" stroke-width="' +
        (warm ? 1.8 : 1.1) + '" opacity="' + (warm ? 0.85 : 0.34 + rand() * 0.3).toFixed(2) + '" stroke-linecap="round"/>';
      pads +=
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (warm ? 3.4 : 2.2) + '" fill="var(--accent' + (warm ? "-2" : "") +
        ')" opacity="' + (warm ? 0.95 : 0.5) + '"/>';
    }

    return wrap(
      "<defs>" +
        grad("ci-bg", [["0", "var(--paper-sunken)", 1], ["1", "var(--backdrop)", 0.55]]) +
        '<pattern id="ci-dot" width="12" height="12" patternUnits="userSpaceOnUse">' +
        '<circle cx="1.5" cy="1.5" r="0.9" fill="var(--ink)" opacity="0.16"/>' +
        "</pattern>" +
        "</defs>" +
        '<rect width="300" height="400" fill="url(#ci-bg)"/>' +
        '<rect width="300" height="400" fill="url(#ci-dot)"/>' +
        traces +
        pads +
        /* merkez yonga */
        '<rect x="112" y="176" width="76" height="52" rx="4" fill="var(--ink)" opacity="0.72"/>' +
        '<rect x="112" y="176" width="76" height="52" rx="4" fill="none" stroke="var(--accent)" stroke-width="1.2" opacity="0.8"/>' +
        '<rect x="126" y="192" width="48" height="4" rx="2" fill="var(--accent)" opacity="0.75"/>' +
        '<rect x="126" y="202" width="32" height="4" rx="2" fill="var(--accent-2)" opacity="0.75"/>' +
        '<rect x="126" y="212" width="40" height="4" rx="2" fill="var(--accent)" opacity="0.45"/>'
    );
  };

  /* Tel kafes ufuk + üç halka — bulmacaya görsel gönderme */
  scenes["signal-grid"] = function () {
    var lines = "";
    var i;

    /* perspektif: ufuk 232, aşağı doğru açılan dikeyler */
    for (i = -7; i <= 7; i++) {
      lines += '<line x1="150" y1="232" x2="' + (150 + i * 62) + '" y2="400" stroke="var(--accent)" stroke-width="0.9" opacity="0.3"/>';
    }
    /* yatay çizgiler, aşağı indikçe seyrelir */
    var yy = 236;
    var gap = 4;
    while (yy < 404) {
      lines += '<line x1="0" y1="' + yy.toFixed(1) + '" x2="300" y2="' + yy.toFixed(1) + '" stroke="var(--accent)" stroke-width="0.9" opacity="' + (0.42 - (yy - 236) / 460).toFixed(2) + '"/>';
      yy += gap;
      gap *= 1.34;
    }

    /* üç kule ve halkaları — kesişim tek noktada */
    var towers = [
      { x: 74, y: 128, r: 78 },
      { x: 214, y: 106, r: 92 },
      { x: 158, y: 210, r: 56 },
    ];
    var rings = "";
    towers.forEach(function (t, ti) {
      rings +=
        '<circle cx="' + t.x + '" cy="' + t.y + '" r="' + t.r + '" fill="none" stroke="var(--accent' + (ti === 1 ? "-2" : "") +
        ')" stroke-width="1.4" opacity="0.62"/>' +
        '<path d="M' + (t.x - 6) + ' ' + (t.y + 9) + ' L' + t.x + ' ' + (t.y - 9) + ' L' + (t.x + 6) + ' ' + (t.y + 9) + 'Z" fill="var(--accent)" opacity="0.9"/>';
    });

    return wrap(
      "<defs>" +
        grad("sg-sky", [["0", "var(--backdrop)", 1], ["0.7", "var(--accent-3)", 0.4], ["1", "var(--accent-2)", 0.3]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--backdrop)"/>' +
        '<rect width="300" height="400" fill="url(#sg-sky)"/>' +
        '<circle cx="150" cy="232" r="52" fill="var(--accent-2)" opacity="0.22"/>' +
        lines +
        rings +
        /* kesişim işareti */
        '<circle cx="150" cy="172" r="5" fill="var(--accent-2)"/>' +
        '<circle cx="150" cy="172" r="12" fill="none" stroke="var(--accent-2)" stroke-width="1.2" opacity="0.7"/>'
    );
  };

  /* ------------------------------------------------------------------------
     JAPONYA SAHNELERİ · dil, edebiyat, kültür
     Derginin görsel omurgası. Aynı kural: tek bir sabit renk yok, hepsi sayının
     CSS değişkenlerinden geliyor — washi/sumi/şu kırmızısı paletinde de, başka
     bir sayının paletinde de kendini taşısın diye.

     Beşi bilerek farklı ritimde: yoğun ızgara (genko), tek büyük jest (sumi),
     geometrik ışık (shoji), yatay bant (emaki), dikey tekrar (tanzaku). Böylece
     bir sayının içinde yan yana gelince birbirini tekrar etmiyorlar.

     İki ortak motif aileyi bağlıyor: vermilyon mühür ve "okunmayan yazı".
     --------------------------------------------------------------------- */

  /** Vermilyon mühür (hanko) — kare taş, içinde oyulmuş soyut izler. */
  function seal(x, y, size, seed) {
    var rand = U.rng(seed || 7);
    var pad = size * 0.22;
    var cuts = "";
    for (var i = 0; i < 5; i++) {
      var ox = x + pad + rand() * (size - pad * 2);
      var oy = y + pad + rand() * (size - pad * 2);
      var len = size * (0.24 + rand() * 0.3);
      cuts +=
        rand() > 0.45
          ? '<line x1="' + ox.toFixed(1) + '" y1="' + (oy - len / 2).toFixed(1) + '" x2="' + ox.toFixed(1) + '" y2="' + (oy + len / 2).toFixed(1) + '"/>'
          : '<line x1="' + (ox - len / 2).toFixed(1) + '" y1="' + oy.toFixed(1) + '" x2="' + (ox + len / 2).toFixed(1) + '" y2="' + oy.toFixed(1) + '"/>';
    }
    return (
      '<g opacity="0.8">' +
      '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="' + (size * 0.12).toFixed(1) +
      '" fill="var(--accent)"/>' +
      '<g stroke="var(--paper)" stroke-width="' + (size * 0.08).toFixed(2) + '" stroke-linecap="square" opacity="0.9">' + cuts + "</g>" +
      "</g>"
    );
  }

  /** Soyut bir karakter — okunmuyor ama "yazı" gibi duruyor. Metnin altında
      kalacağı için bilerek okunaksız: göz onu doku sanıp üstündeki başlığa geçsin. */
  function glyph(cx, cy, box, rand) {
    var n = 2 + Math.floor(rand() * 3);
    var out = "";
    for (var i = 0; i < n; i++) {
      var len = box * (0.34 + rand() * 0.46);
      var ox = cx + (rand() - 0.5) * box * 0.44;
      var oy = cy + (rand() - 0.5) * box * 0.52;
      out +=
        rand() > 0.42
          ? '<line x1="' + (ox - len / 2).toFixed(1) + '" y1="' + oy.toFixed(1) + '" x2="' + (ox + len / 2).toFixed(1) + '" y2="' + oy.toFixed(1) + '"/>'
          : '<line x1="' + ox.toFixed(1) + '" y1="' + (oy - len / 2).toFixed(1) + '" x2="' + ox.toFixed(1) + '" y2="' + (oy + len / 2).toFixed(1) + '"/>';
    }
    return out;
  }

  /* 原稿用紙 — sayfa sağdan sola yarıya kadar yazılmış, kalem ortada durmuş.
     En sakin sahne: uzun metin ve söyleşi sayfalarının altına. */
  scenes.genko = function () {
    var rand = U.rng(1024);
    var CW = 24; /* hücre kenarı */
    var PITCH = 29; /* sütun adımı — aradaki boşluk furigana payı */
    var COLS = 10;
    var ROWS = 15;
    var X0 = 10;
    var Y0 = 26;
    var grid = "";
    var ink = "";
    var c, r, cx;

    for (c = 0; c < COLS; c++) {
      cx = X0 + c * PITCH;
      grid += '<rect x="' + cx + '" y="' + Y0 + '" width="' + CW + '" height="' + ROWS * CW + '"/>';
      for (r = 1; r < ROWS; r++) {
        grid += '<line x1="' + cx + '" y1="' + (Y0 + r * CW) + '" x2="' + (cx + CW) + '" y2="' + (Y0 + r * CW) + '"/>';
      }
    }

    /* yazı sağ üstten başlar; sola gittikçe seyrelir ve biter */
    for (c = COLS - 1; c >= 0; c--) {
      var nth = COLS - 1 - c;
      if (nth > 5) break;
      var ratio = nth < 3 ? 1 : 1 - (nth - 2) * 0.3 - rand() * 0.18;
      var stop = Math.max(0, Math.round(ROWS * ratio));
      cx = X0 + c * PITCH + CW / 2;
      for (r = 0; r < stop; r++) ink += glyph(cx, Y0 + r * CW + CW / 2, CW - 6, rand);
    }

    /* washi lifleri */
    var fibers = "";
    for (var f = 0; f < 22; f++) {
      var fy = rand() * 400;
      fibers += '<line x1="' + (rand() * 120).toFixed(1) + '" y1="' + fy.toFixed(1) + '" x2="' + (180 + rand() * 130).toFixed(1) + '" y2="' + (fy + rand() * 6 - 3).toFixed(1) + '"/>';
    }

    return wrap(
      "<defs>" +
        grad("gk-paper", [["0", "var(--paper-raised)", 1], ["1", "var(--paper)", 1]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="url(#gk-paper)"/>' +
        '<g stroke="var(--ink)" stroke-width="0.6" opacity="0.06">' + fibers + "</g>" +
        /* çift çerçeve — basılı müsvedde kâğıdının kenarı */
        '<g fill="none" stroke="var(--accent)" opacity="0.45">' +
        '<rect x="4" y="18" width="294" height="374" stroke-width="1.6"/>' +
        '<rect x="7.5" y="21.5" width="287" height="367" stroke-width="0.7"/>' +
        "</g>" +
        '<g fill="none" stroke="var(--accent)" stroke-width="0.8" opacity="0.42">' + grid + "</g>" +
        '<g stroke="var(--ink)" stroke-width="1.7" stroke-linecap="round" opacity="0.34">' + ink + "</g>" +
        seal(98, 298, 24, 512)
    );
  };

  /* 書道 — enso (円相) ve tek dikey sütun. Kapak ve bölüm açılışları için
     tek büyük jest; ortası boş bırakıldı ki üstüne başlık otursun. */
  scenes.sumi = function () {
    var rand = U.rng(4649); /* 4-6-4-9 · "yoroshiku" */

    /* fırçanın kuruduğu yerler: mürekkebin üstüne kâğıt renginde ince çizikler */
    var column = "";
    for (var g = 0; g < 5; g++) column += glyph(254, 66 + g * 30, 24, rand);

    var splatter = "";
    for (var s = 0; s < 14; s++) {
      var a = rand() * Math.PI * 2;
      var d = 96 + rand() * 46;
      splatter +=
        '<circle cx="' + (150 + Math.cos(a) * d).toFixed(1) + '" cy="' + (176 + Math.sin(a) * d * 0.9).toFixed(1) +
        '" r="' + (0.7 + rand() * 2.4).toFixed(1) + '" opacity="' + (0.15 + rand() * 0.4).toFixed(2) + '"/>';
    }

    return wrap(
      "<defs>" +
        hatch("sm-tooth", "var(--ink)", 0.05) +
        grad("sm-wash", [["0", "var(--ink)", 0], ["1", "var(--ink)", 0.13]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--paper)"/>' +
        '<rect width="300" height="400" fill="url(#sm-tooth)"/>' +
        '<rect y="300" width="300" height="100" fill="url(#sm-wash)"/>' +
        /* Enso: halka bilerek kapanmıyor. Fırça baskısı sabit olmadığı için tek
           kalın daire yerine üç yay üst üste — girişte ince, ortada dolgun,
           çıkışta incelerek bitiyor. Çevre ≈ 528; çizilen 0→452, kalanı boşluk. */
        '<g fill="none" transform="rotate(-34 150 176)">' +
        '<circle cx="150" cy="176" r="84" stroke="var(--ink)" stroke-width="10" stroke-linecap="round" stroke-dasharray="164 364" opacity="0.88"/>' +
        '<circle cx="150" cy="176" r="84" stroke="var(--ink)" stroke-width="18" stroke-linecap="round" stroke-dasharray="196 332" stroke-dashoffset="-142" opacity="0.88"/>' +
        '<circle cx="150" cy="176" r="84" stroke="var(--ink)" stroke-width="11" stroke-linecap="round" stroke-dasharray="128 400" stroke-dashoffset="-324" opacity="0.88"/>' +
        '<circle cx="150" cy="176" r="89" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-dasharray="120 408" stroke-dashoffset="-150" opacity="0.24"/>' +
        /* kasure — kuru fırça izi */
        '<circle cx="150" cy="176" r="87" stroke="var(--paper)" stroke-width="1.7" stroke-dasharray="7 15" stroke-dashoffset="-320" opacity="0.5"/>' +
        '<circle cx="150" cy="176" r="81" stroke="var(--paper)" stroke-width="1.2" stroke-dasharray="5 21" stroke-dashoffset="-352" opacity="0.42"/>' +
        "</g>" +
        '<g fill="var(--ink)">' + splatter + "</g>" +
        '<g stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" opacity="0.62">' + column + "</g>" +
        seal(240, 206, 28, 46)
    );
  };

  /* 障子 — arkadan gelen ışık, kâğıda düşen bambu gölgesi. Sessiz sayfalar:
     söyleşi, deneme, "editörden". Işık ortada, metin ona oturuyor. */
  scenes.shoji = function () {
    var X1 = 24;
    var X2 = 276;
    var Y1 = 20;
    var Y2 = 336;
    var COLS = 4;
    var ROWS = 6;
    var kumiko = "";
    var i;

    for (i = 1; i < COLS; i++) {
      var mx = X1 + (i * (X2 - X1)) / COLS;
      kumiko += '<rect x="' + (mx - 1.6).toFixed(1) + '" y="' + Y1 + '" width="3.2" height="' + (Y2 - Y1) + '"/>';
    }
    for (i = 1; i < ROWS; i++) {
      var my = Y1 + (i * (Y2 - Y1)) / ROWS;
      kumiko += '<rect x="' + X1 + '" y="' + (my - 1.6).toFixed(1) + '" width="' + (X2 - X1) + '" height="3.2"/>';
    }

    /* kâğıdın ARKASINDAKİ bambu — gölge olduğu için yumuşak, ama okunacak kadar koyu */
    var bamboo = "";
    [
      { x: 54, w: 9, lean: 7 },
      { x: 86, w: 6, lean: -5 },
      { x: 226, w: 10, lean: 6 },
      { x: 252, w: 6, lean: -4 },
    ].forEach(function (b) {
      bamboo += '<path d="M' + b.x + " " + Y2 + " L" + (b.x + b.lean) + " " + Y1 + " L" + (b.x + b.lean + b.w) + " " + Y1 + " L" + (b.x + b.w) + " " + Y2 + 'Z"/>';
      for (var ny = 56; ny < Y2; ny += 52) {
        var t = (Y2 - ny) / (Y2 - Y1);
        var nx = b.x + b.lean * t;
        bamboo += '<rect x="' + (nx - 1.6).toFixed(1) + '" y="' + ny + '" width="' + (b.w + 3.2) + '" height="3"/>';
      }
    });
    /* yapraklar: sapa yakın üçlü kümeler, tek tek serpiştirilmiş değil */
    [
      [63, 104, 1], [63, 116, 1], [59, 128, -1],
      [92, 196, -1], [88, 208, -1], [96, 218, 1],
      [236, 132, 1], [232, 144, -1], [238, 156, 1],
      [258, 250, -1], [254, 262, 1],
    ].forEach(function (p) {
      var d = p[2];
      bamboo += '<path d="M' + p[0] + " " + p[1] + " q" + 15 * d + " -11 " + 34 * d + " -3 q" + -16 * d + " 11 " + -34 * d + ' 3Z"/>';
    });

    return wrap(
      "<defs>" +
        /* Işık kâğıdın ARKASINDA. --paper'a bağlasaydık koyu temada ekran kararır,
           shoji'nin bütün fikri ters dönerdi. Bu yüzden A.photo'daki gibi palet
           dışına çıkıp altın vurguyu kâğıda karıştırıyoruz: her iki temada da
           "arkadan yanan fener" okuması korunuyor. */
        '<radialGradient id="sj-glow" cx="0.5" cy="0.4" r="0.68">' +
        '<stop offset="0" stop-color="color-mix(in oklab, var(--accent-2) 52%, var(--paper-raised))"/>' +
        '<stop offset="0.5" stop-color="color-mix(in oklab, var(--accent-2) 26%, var(--paper))"/>' +
        '<stop offset="1" stop-color="color-mix(in oklab, var(--accent-2) 8%, var(--paper-sunken))"/>' +
        "</radialGradient>" +
        grad("sj-floor", [["0", "var(--backdrop)", 0.55], ["1", "var(--backdrop)", 0.9]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--paper-sunken)"/>' +
        '<rect x="' + X1 + '" y="' + Y1 + '" width="' + (X2 - X1) + '" height="' + (Y2 - Y1) + '" fill="url(#sj-glow)"/>' +
        '<g fill="var(--ink)" opacity="0.2">' + bamboo + "</g>" +
        /* kumiko kafes */
        '<g fill="var(--ink)" opacity="0.66">' + kumiko + "</g>" +
        /* dış kasa — ince, çünkü sahnenin konusu ışık, kasa değil */
        '<rect x="17" y="13" width="266" height="352" fill="none" stroke="var(--ink)" stroke-width="5.5" opacity="0.72"/>' +
        /* koshita — alt ahşap panel */
        '<rect x="20" y="' + Y2 + '" width="260" height="26" fill="var(--ink)" opacity="0.42"/>' +
        '<rect y="366" width="300" height="34" fill="url(#sj-floor)"/>' +
        /* eşiğe düşen ışık lekesi */
        '<path d="M62 366 L238 366 L268 400 L32 400Z" fill="var(--accent-2)" opacity="0.1"/>'
    );
  };

  /* 絵巻 — altın suyari-gasumi (すやり霞) bantları arasından görünen manzara.
     Klasik edebiyat dosyaları için: Genji, waka, Heian. Bantlar metni taşıyan
     yatay şeritler olduğu için üstüne başlık koymak kolay. */
  scenes.emaki = function () {
    /* matsu — gövde ve üç yassı iğne öbeği; öbekler yukarı doğru küçülüyor */
    function pine(x, y, s) {
      return (
        '<g transform="translate(' + x + " " + y + ") scale(" + s + ')" fill="var(--ink)">' +
        '<path d="M-2 0 L-3.4 -40 L3.4 -40 L2 0Z" opacity="0.5"/>' +
        '<path d="M-27 -30 q11 -12 27 -10 q16 -2 27 10 q-13 7 -27 6 q-14 1 -27 -6Z" opacity="0.44"/>' +
        '<path d="M-21 -44 q9 -11 21 -9 q12 -2 21 9 q-10 6 -21 5 q-11 1 -21 -5Z" opacity="0.5"/>' +
        '<path d="M-14 -57 q6 -9 14 -8 q8 -1 14 8 q-7 5 -14 4 q-7 1 -14 -4Z" opacity="0.56"/>' +
        "</g>"
      );
    }

    /* stilize kesik bulut: aynı dolguyla kaydırılmış yuvarlak bantlar */
    function kasumi(bands, op) {
      return (
        '<g fill="var(--accent-2)" opacity="' + op + '">' +
        bands
          .map(function (b) {
            return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="' + (b[3] / 2).toFixed(1) + '"/>';
          })
          .join("") +
        "</g>"
      );
    }

    return wrap(
      "<defs>" +
        grad("em-silk", [["0", "var(--paper-raised)", 1], ["0.6", "var(--paper)", 1], ["1", "var(--paper-sunken)", 1]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="url(#em-silk)"/>' +
        /* uzak tepeler, arkadan öne */
        '<path d="M0 236 q54 -40 108 -6 q52 32 96 -12 q48 -46 96 -2 L300 400 L0 400Z" fill="var(--accent-3)" opacity="0.2"/>' +
        '<path d="M0 288 q66 -34 128 -4 q58 28 106 -14 q34 -30 66 -4 L300 400 L0 400Z" fill="var(--accent-3)" opacity="0.3"/>' +
        /* çamlar — klasik matsu: gövde + katman katman yassı öbekler */
        pine(48, 326, 1) +
        pine(258, 308, 0.74) +
        /* köşk: küçük ve düşük kontrast — sahneyi bulutlar taşıyor */
        '<g opacity="0.8">' +
        '<rect x="112" y="286" width="76" height="26" fill="var(--paper-sunken)"/>' +
        '<path d="M96 290 Q150 246 204 290 Q150 270 96 290Z" fill="var(--ink)" opacity="0.72"/>' +
        '<g stroke="var(--ink)" stroke-width="1.8" opacity="0.5">' +
        '<line x1="124" y1="292" x2="124" y2="312"/><line x1="150" y1="292" x2="150" y2="312"/><line x1="176" y1="292" x2="176" y2="312"/>' +
        "</g>" +
        "</g>" +
        /* altın kesik bulutlar */
        kasumi([[-20, 58, 176, 17], [140, 68, 132, 15], [246, 56, 84, 14]], 0.72) +
        kasumi([[-30, 126, 128, 14], [86, 136, 150, 13], [214, 124, 116, 15]], 0.55) +
        kasumi([[-20, 208, 118, 16], [92, 218, 128, 14]], 0.6) +
        kasumi([[128, 328, 192, 18], [-24, 340, 168, 16]], 0.68) +
        /* mounting — kakemono/emaki kumaş kenarı; ince, çünkü asıl olay bulutlar */
        '<rect width="300" height="17" fill="var(--accent-3)" opacity="0.4"/>' +
        '<rect y="383" width="300" height="17" fill="var(--accent-3)" opacity="0.4"/>' +
        '<g stroke="var(--accent-2)" stroke-width="1" opacity="0.45">' +
        '<line x1="0" y1="18" x2="300" y2="18"/><line x1="0" y1="382" x2="300" y2="382"/>' +
        "</g>" +
        seal(252, 336, 26, 1180)
    );
  };

  /* 短冊 — bambuya asılı şiir şeritleri (Tanabata). Şiir, haiku ve çeviri
     dosyalarının açılışı; dikey tekrar sayfaya ritim veriyor. */
  scenes.tanzaku = function () {
    var rand = U.rng(707); /* 7 Temmuz */
    var fills = [
      "var(--paper-raised)",
      "var(--accent-soft)",
      "var(--accent)",
      "var(--accent-2)",
      "var(--paper-raised)",
      "var(--accent-3)",
      "var(--accent)",
    ];
    var strips = "";

    [20, 60, 100, 142, 186, 228, 266].forEach(function (hx, i) {
      var w = 24 + Math.round(rand() * 10);
      var h = 128 + Math.round(rand() * 124);
      var cx = hx + w / 2;
      /* dalın o noktadaki yüksekliği — şerit ipini oraya bağla */
      var t = (cx + 10) / 320;
      var ly = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 64 + t * t * 36;
      var y = ly + 12 + rand() * 8;
      var rot = (rand() - 0.5) * 12;
      var marks = "";
      for (var gy = y + 20; gy < y + h - 14; gy += 21) marks += glyph(cx, gy, w * 0.62, rand);

      strips +=
        '<g transform="rotate(' + rot.toFixed(1) + " " + cx.toFixed(1) + " " + y.toFixed(1) + ')">' +
        '<line x1="' + cx.toFixed(1) + '" y1="' + (y - 14).toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + y.toFixed(1) +
        '" stroke="var(--ink)" stroke-width="1" opacity="0.5"/>' +
        '<rect x="' + hx + '" y="' + y.toFixed(1) + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + fills[i] +
        '" opacity="' + (0.62 + rand() * 0.26).toFixed(2) + '"/>' +
        '<rect x="' + hx + '" y="' + y.toFixed(1) + '" width="' + w + '" height="5" fill="var(--ink)" opacity="0.24"/>' +
        '<g stroke="var(--ink)" stroke-width="1.4" stroke-linecap="round" opacity="0.42">' + marks + "</g>" +
        "</g>";
    });

    /* bambu dalı ve yaprakları */
    var leaves = "";
    [
      [12, 34, 1],
      [78, 44, -1],
      [166, 52, 1],
      [232, 44, -1],
      [284, 32, 1],
    ].forEach(function (p) {
      leaves +=
        '<path d="M' + p[0] + " " + p[1] + " q" + 24 * p[2] + " -16 " + 46 * p[2] + ' -6 q' + -22 * p[2] + " 16 " + -46 * p[2] + ' 6Z"/>';
    });

    return wrap(
      "<defs>" +
        grad("tz-dusk", [["0", "var(--accent-3)", 0.4], ["0.45", "var(--paper-sunken)", 1], ["1", "var(--paper-sunken)", 1]]) +
        grad("tz-foot", [["0", "var(--ink)", 0], ["1", "var(--ink)", 0.34]]) +
        "</defs>" +
        '<rect width="300" height="400" fill="var(--paper-sunken)"/>' +
        '<rect width="300" height="400" fill="url(#tz-dusk)"/>' +
        '<circle cx="238" cy="70" r="30" fill="var(--paper-raised)" opacity="0.16"/>' +
        strips +
        '<path d="M-10 40 Q150 64 310 36" fill="none" stroke="var(--ink)" stroke-width="3.4" opacity="0.6"/>' +
        '<g fill="var(--accent-3)" opacity="0.5">' + leaves + "</g>" +
        '<rect y="320" width="300" height="80" fill="url(#tz-foot)"/>'
    );
  };

  A.scenes = scenes;

  A.scene = function (name, opts) {
    var fn = scenes[name] || scenes.paper;
    return fn(opts || {});
  };

  A.has = function (name) {
    return !!scenes[name];
  };

  /* ------------------------------------------------------------------------
     GALERİ "FOTOĞRAFLARI" — kompozisyon + doku, kare/dikey oranlar
     --------------------------------------------------------------------- */

  A.photo = function (seed, ratio) {
    var rand = U.rng(seed || 1);
    var w = 300;
    var h = ratio === "square" ? 300 : ratio === "wide" ? 200 : 400;
    var palette = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--ink)"];
    var shapes = "";
    var n = 3 + Math.floor(rand() * 4);
    for (var i = 0; i < n; i++) {
      var kind = rand();
      var op = (0.18 + rand() * 0.5).toFixed(2);
      var fill = palette[Math.floor(rand() * palette.length)];
      if (kind < 0.34) {
        shapes += '<circle cx="' + (rand() * w).toFixed(0) + '" cy="' + (rand() * h).toFixed(0) + '" r="' + (30 + rand() * 90).toFixed(0) + '" fill="' + fill + '" opacity="' + op + '"/>';
      } else if (kind < 0.7) {
        shapes += '<rect x="' + (rand() * w).toFixed(0) + '" y="' + (rand() * h).toFixed(0) + '" width="' + (40 + rand() * 160).toFixed(0) + '" height="' + (40 + rand() * 200).toFixed(0) + '" fill="' + fill + '" opacity="' + op + '"/>';
      } else {
        shapes +=
          '<path d="M' + (rand() * w).toFixed(0) + " " + (rand() * h).toFixed(0) + " Q" + (rand() * w).toFixed(0) + " " + (rand() * h).toFixed(0) +
          " " + (rand() * w).toFixed(0) + " " + (rand() * h).toFixed(0) + '" fill="none" stroke="' + fill + '" stroke-width="' + (6 + rand() * 26).toFixed(0) + '" opacity="' + op + '" stroke-linecap="round"/>';
      }
    }
    /* Fotoğrafın zemini bilerek kâğıt paletine BAĞLI DEĞİL. Kâğıda bağlarsak
       karanlık temada taban #211a15 → #0d0a08 olur, yani fotoğraf kapkara bir
       dikdörtgene döner — sayfa "boş/bozuk" görünür. Bir fotoğrafın kendi
       tonlaması vardır: üstte ışık, altta karanlık. Sayının rengi bu rampaya
       yalnızca ton olarak karışır, temayla yer değiştirmez. */
    return wrap(
      "<defs>" +
        grad("pg" + seed, [
          ["0", "color-mix(in oklab, var(--accent-3) 55%, #c2b9a9)", 1],
          ["0.52", "color-mix(in oklab, var(--accent-3) 68%, #5b544a)", 1],
          ["1", "color-mix(in oklab, var(--accent) 24%, #241c17)", 1],
        ]) +
        "</defs>" +
        '<rect width="' + w + '" height="' + h + '" fill="url(#pg' + seed + ')"/>' +
        shapes,
      "0 0 " + w + " " + h,
      "art--photo"
    );
  };

  /* ------------------------------------------------------------------------
     MANGA — one-shot sayfası (sağdan sola panel düzeni)
     --------------------------------------------------------------------- */

  var mangaArt = [scenes.street, scenes.rain, scenes.city, scenes.moon, scenes.train, scenes.temple];

  /**
   * layout: panel dikdörtgenleri [x,y,w,h] — 300x400 alanda
   * Panel sırası SAĞDAN SOLA okunur; `order` bunu zaten yansıtır.
   */
  /* p.img verilirse çizilmiş sahne yerine gerçek kare kullanılır (bkz.
     2026-09 one-shot). Balon katmanı ikisinde de aynı — balonlar HTML,
     görselin içine gömülü değil: seçilebilir, çevrilebilir, yorumlanabilir. */
  A.mangaPanel = function (index, text, kind, img, alt) {
    var art = img
      ? '<img src="' + U.escape(img) + '" alt="' + U.escape(alt || "") + '" loading="lazy" decoding="async">'
      : mangaArt[index % mangaArt.length]();

    /* text bir dizi olabilir: tek karede birden çok balon (karşılıklı konuşma,
       ya da kadraj dışından gelen ses). {text, kind, at:"alt"} → alt balon. */
    var list = Array.isArray(text) ? text : text ? [{ text: text, kind: kind }] : [];
    var bubbles = list
      .map(function (b) {
        if (!b || !b.text) return "";
        /* at: "alt" → hazır alt konum.  at: {top,left,right,bottom,width} →
           serbest yerleşim (yüzde ya da herhangi bir CSS uzunluğu). Plan
           düzeninde balonlar panel sınırlarını bilerek taşıyor. */
        var cls = "", style = "";
        if (b.at === "alt") cls = " manga-bubble--alt";
        else if (b.at && typeof b.at === "object") {
          cls = " manga-bubble--free";
          style = ' style="' + ["top", "right", "bottom", "left", "width"]
            .filter(function (k) { return b.at[k] != null; })
            .map(function (k) { return k + ":" + b.at[k]; })
            .join(";") + '"';
        }
        return (
          '<div class="manga-bubble' + (b.kind ? " manga-bubble--" + b.kind : "") + cls + '"' + style + ">" +
          U.escape(b.text) + "</div>"
        );
      })
      .join("");

    return '<div class="manga-panel__art">' + art + "</div>" + bubbles;
  };

  /* ------------------------------------------------------------------------
     AVATAR — okur kimliği rozeti
     --------------------------------------------------------------------- */

  A.avatarSvg = function (color, emoji) {
    return (
      '<svg viewBox="0 0 40 40" class="avatar__svg" aria-hidden="true">' +
      '<circle cx="20" cy="20" r="20" fill="' + color + '"/>' +
      '<text x="20" y="27" text-anchor="middle" font-size="20">' + (emoji || "🙂") + "</text></svg>"
    );
  };

  /* ------------------------------------------------------------------------
     KÜÇÜK SÜSLER
     --------------------------------------------------------------------- */

  A.rule = function () {
    return (
      '<svg class="rule" viewBox="0 0 120 8" aria-hidden="true">' +
      '<path d="M0 4 H44" stroke="currentColor" stroke-width="1"/>' +
      '<circle cx="60" cy="4" r="3" fill="currentColor"/>' +
      '<path d="M76 4 H120" stroke="currentColor" stroke-width="1"/></svg>'
    );
  };

  A.leafMark = function () {
    return (
      '<svg class="leafmark" viewBox="-14 -15 28 30" aria-hidden="true">' +
      '<path d="' + LEAF + '" fill="currentColor"/>' +
      '<path d="' + LEAF_VEIN + '" fill="none" stroke="var(--paper)" stroke-width="0.9" opacity="0.5" stroke-linecap="round"/>' +
      "</svg>"
    );
  };

  MAG.art = A;
})(window.MAG);
