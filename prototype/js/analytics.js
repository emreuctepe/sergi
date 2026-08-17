/* ============================================================================
   ANALİTİK GÖRÜNÜMÜ — editör paneli (sahte veri: js/data-analytics.js).
   ----------------------------------------------------------------------------
   Amaç işlevsellik: saf veri, tablo ağırlıklı, gerektiği yerde minik bar.
   Tam agregasyon — kişi-bazlı iz yok. Kaynak etiketleri gerçek build'in veri
   kökenini belgeler: [türev] ürün tablolarından, [olay] minik toplu günlük.
   Açılış: menü > "Analitik (editör)" veya #analitik adresi.
   ========================================================================== */
(function (MAG) {
  "use strict";
  var U = MAG.util;
  var O = MAG.overlays;
  var el = U.el;

  var An = {};

  /* --- küçük yardımcılar --------------------------------------------------- */
  function head(title, tag) {
    return el("div.an-head", null, [
      el("h3.an-h", { text: title }),
      tag ? el("span.an-tag", { "data-k": tag, text: tag }) : null,
    ]);
  }
  function pct(v) { return (Math.round(v * 10) / 10) + "%"; }
  function num(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  function bar(v, label) {
    return el("div.an-bar", null, [
      el("span.an-bar__fill", { style: { width: Math.max(0, Math.min(100, v)) + "%" } }),
      el("span.an-bar__lbl", { text: label != null ? label : pct(v) }),
    ]);
  }

  function table(headers, rows) {
    return el("div.an-scroll", null, [
      el("table.an-t", null, [
        el("thead", null, [el("tr", null, headers.map(function (h) { return el("th", { text: h }); }))]),
        el("tbody", null, rows.map(function (r) {
          return el("tr", null, r.map(function (c) {
            return c && c.__node ? el("td", null, [c.node]) : el("td", { text: c == null ? "" : String(c) });
          }));
        })),
      ]),
    ]);
  }
  function cell(node) { return { __node: true, node: node }; }

  function kpis(items) {
    return el("div.an-kpis", null, items.map(function (k) {
      return el("div.an-kpi", null, [
        el("b.an-kpi__v", { text: k.v }),
        el("span.an-kpi__l", { text: k.l }),
        k.s ? el("span.an-kpi__s", { text: k.s }) : null,
      ]);
    }));
  }

  function spark(values) {
    var max = Math.max.apply(null, values.map(function (d) { return d.readers; })) || 1;
    return el("div.an-spark", null, values.map(function (d) {
      return el("span.an-spark__bar", {
        style: { height: Math.max(4, (d.readers / max) * 100) + "%" },
        title: "Gün " + d.day + ": " + num(d.readers),
      });
    }));
  }

  /* --- panel --------------------------------------------------------------- */
  An.open = function () {
    var A = MAG.analyticsData.build();
    var s = A.summary;
    var body = el("div.an");

    body.appendChild(el("p.an-lede", {
      text: "№ " + A.issue.number + " · " + A.issue.title + " — yayından " + A.issue.publishedDaysAgo +
            " gün sonra. Sahte veri. Yalnızca editör görür; tüm sayılar toplu (kişi-bazlı iz yok).",
    }));
    body.appendChild(el("p.an-legend", null, [
      el("span.an-tag", { "data-k": "türev", text: "türev" }), " ürün tablolarından  ",
      el("span.an-tag", { "data-k": "olay", text: "olay" }), " minik toplu olay günlüğü",
    ]));

    /* 1 · ÖZET */
    body.appendChild(head("Özet", "türev"));
    body.appendChild(kpis([
      { v: num(s.uniqueReaders), l: "benzersiz okur", s: num(s.newReaders) + " yeni · " + num(s.returningReaders) + " dönen" },
      { v: pct(s.completionRate), l: "tamamlama", s: "ort. derinlik " + pct(s.avgDepthReached) },
      { v: num(s.sessions), l: "oturum", s: "medyan " + Math.round(s.medianSessionSec / 60) + " dk" },
      { v: pct(s.loggedInRate), l: "girişli", s: s.newLogins + " yeni giriş" },
      { v: num(s.comments.published), l: "yorum", s: s.comments.pending + " onayda · " + s.comments.rejected + " red" },
      { v: num(s.reactions), l: "tepki" },
      { v: num(s.puzzle.plays), l: "bulmaca oyna", s: s.puzzle.solves + " çözdü" },
    ]));

    /* 2 · OKUMA HUNİSİ / TERK EĞRİSİ */
    body.appendChild(head("Okuma hunisi — nerede bırakıyorlar?", "olay"));
    var maxDrop = { pageId: null, d: 0 };
    A.funnel.forEach(function (f, i) {
      if (i > 0) { var d = A.funnel[i - 1].reached - f.reached; if (d > maxDrop.d) maxDrop = { pageId: f.pageId, d: d }; }
    });
    body.appendChild(table(
      ["#", "Bölüm", "Sayfa", "Ulaşan", "Medyan süre"],
      A.funnel.map(function (f, i) {
        var lbl = pct(f.reached) + (f.pageId === maxDrop.pageId ? "  ⚑ en büyük düşüş" : "");
        return [i + 1, f.kicker, f.pageId, cell(bar(f.reached, lbl)), f.medianSec + " sn"];
      })
    ));

    /* 3 · BÖLÜM KARNESİ */
    body.appendChild(head("Bölüm karnesi", "türev"));
    body.appendChild(table(
      ["Bölüm", "Giren", "Bitiren", "Medyan", "Yorum", "Tepki"],
      A.sections.map(function (x) {
        return [x.kicker + " · " + x.title, pct(x.entered), pct(x.completed), x.medianSec + " sn", num(x.comments), num(x.reactions)];
      })
    ));

    /* 4 · OKUMA MODU */
    body.appendChild(head("Okuma modu", "türev"));
    body.appendChild(table(
      ["Mod", "Dağılım", "Tamamlama"],
      [
        ["Doomscroller 🫠", cell(bar(A.modes.dist.min)), pct(A.modes.completionByMode.min)],
        ["Dengeli ⚖️", cell(bar(A.modes.dist.mid)), pct(A.modes.completionByMode.mid)],
        ["Doomreader 🧠", cell(bar(A.modes.dist.full)), pct(A.modes.completionByMode.full)],
      ]
    ));
    body.appendChild(el("p.an-note", { text: "Sayı içinde mod değiştirme: " + num(A.modes.switches) + " kez" }));

    /* 5 · YORUM SAĞLIĞI */
    var c = A.comments;
    body.appendChild(head("Yorum sağlığı", "türev"));
    body.appendChild(table(
      ["Ölçüt", "Değer"],
      [
        ["Yayında / onayda / red", c.published + " / " + c.pending + " / " + c.rejected],
        ["Anonim vs girişli", pct(c.anonymousPct) + " / " + pct(c.loggedPct)],
        ["Onay kuyruğu medyan bekleme", c.queueMedianWaitH + " sa"],
        ["Red oranı", pct(c.rejectRate)],
        ["Dil (TR/EN/JA)", pct(c.byLocale.tr) + " / " + pct(c.byLocale.en) + " / " + pct(c.byLocale.ja)],
      ]
    ));

    /* 6 · BULMACA */
    var p = A.puzzle;
    body.appendChild(head("Bulmaca", "türev"));
    body.appendChild(table(
      ["Ölçüt", "Değer"],
      [
        ["Oyna / çöz / pes", num(p.plays) + " / " + num(p.solves) + " / " + num(p.gaveUp)],
        ["Medyan süre", Math.floor(p.medianSec / 60) + " dk " + (p.medianSec % 60) + " sn"],
        ["İlk denemede çözme", pct(p.firstTryRate)],
        ["İpucu kullanımı", pct(p.hintRate)],
      ]
    ));

    /* 7 · DÖNÜŞÜM HUNİSİ */
    body.appendChild(head("Dönüşüm hunisi", "olay"));
    var top = A.conversion[0].count || 1;
    body.appendChild(table(
      ["Adım", "Okur", "Oran"],
      A.conversion.map(function (st) {
        return [st.step, num(st.count), cell(bar((st.count / top) * 100, pct((st.count / top) * 100)))];
      })
    ));

    /* 8 · BAĞLAM */
    var ctx = A.context;
    body.appendChild(head("Bağlam (toplu)", "olay"));
    body.appendChild(table(
      ["Cihaz", "Dil", "Tema"],
      [[
        "mobil " + pct(ctx.devices.mobile) + " · masaüstü " + pct(ctx.devices.desktop),
        "TR " + pct(ctx.locales.tr) + " · EN " + pct(ctx.locales.en) + " · JA " + pct(ctx.locales.ja),
        "koyu " + pct(ctx.themes.dark) + " · açık " + pct(ctx.themes.light),
      ]]
    ));
    body.appendChild(table(
      ["Kaynak", "Oran"],
      ctx.sources.map(function (x) { return [x.name, cell(bar(x.pct))]; })
    ));
    body.appendChild(table(
      ["Ülke", "Oran"],
      ctx.countries.map(function (x) { return [x.name, cell(bar(x.pct))]; })
    ));

    /* 9 · ZAMAN */
    body.appendChild(head("Günlük okur — yayından sonra", "türev"));
    body.appendChild(spark(A.daily));

    body.appendChild(el("p.an-foot", {
      text: "Yasal: üçüncü taraf izleyici yok · IP saklanmaz · parmak izi yok · veri EU bölgesinde · saklama süresi sonunda ham olaylar toplanır/silinir.",
    }));

    O.modal(body, { title: "Analitik", wide: true });
  };

  An.init = function () {
    function maybeOpen() {
      if ((location.hash || "").replace(/^#/, "") === "analitik") An.open();
    }
    window.addEventListener("hashchange", maybeOpen);
    maybeOpen();
  };

  MAG.analytics = An;
})(window.MAG);
