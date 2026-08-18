/* ============================================================================
   DATA — YORUMLAR  (Supabase `comments` tablosunun tohum karşılığı)
   ----------------------------------------------------------------------------
   Bu dosya yorum İÇERMEZ; koşum takımıdır. Okur kadrosu ve kurucular (on / pin /
   loose) burada duruyor, çünkü her sayı aynı otuz kişiyi ve aynı çıpa dilini
   kullanıyor. Sayıya özel tohumlar issues/<slug>.comments.js dosyalarında; bu
   dosya yalnızca AKTİF sayınınkini çağırıp D.comments'i doldurur.

   Gerçek üründe bunların hiçbiri olmayacak: yorumlar veritabanından gelecek.
   ========================================================================= */


(function (MAG) {
  "use strict";

  var D = MAG.data;
  var HOUR = 3600000;
  var now = Date.now();

  /* ------------------------------------------------------------------------
     OKUR KADROSU — 30 kişi. On kişiyle doldurulunca "aynı üç kişi konuşuyor"
     hissi doğuyordu; kalabalık ancak yeterince farklı isimle kalabalık görünür.
     --------------------------------------------------------------------- */

  var P = {};
  [
    ["vinc", "Sessiz Vinç 12", "🦩", "#7a9ec2"],
    ["balina", "Mor Balina 41", "🐳", "#8f7ac2"],
    ["tilki", "Kırmızı Tilki 07", "🦊", "#c2764a"],
    ["baykus", "Gri Baykuş 88", "🦉", "#6f7d86"],
    ["ceylan", "Yeşil Ceylan 23", "🌿", "#5f8f6b"],
    ["sahin", "Mavi Şahin 55", "🕊️", "#4a7fc2"],
    ["nilufer", "Sarı Ceylan 03", "🪷", "#c2a44a"],
    ["kirpi", "Turuncu Kirpi 19", "🦔", "#c2854a"],
    ["turna", "Beyaz Turna 61", "🐦", "#8a8f96"],
    ["geyik", "Bakır Geyik 34", "🦌", "#a86b4a"],
    ["karga", "Siyah Karga 04", "🐦‍⬛", "#5d6168"],
    ["sazan", "Gümüş Sazan 77", "🐟", "#7f97a8"],
    ["flamingo", "Pembe Flamingo 09", "🦩", "#c2748f"],
    ["yelkovan", "Lacivert Yelkovan 31", "🌊", "#3f5f8f"],
    ["ayi", "Kestane Ayı 66", "🐻", "#8a5a3c"],
    ["ari", "Bal Arısı 18", "🐝", "#c2a01f"],
    ["kaplumbaga", "Kum Kaplumbağa 52", "🐢", "#9a8f6a"],
    ["kedi", "Duman Kedi 27", "🐈", "#7c7a80"],
    ["sincap", "Çam Sincabı 44", "🐿️", "#6f8a52"],
    ["kartal", "Tunç Şahin 13", "🦅", "#9a7b3f"],
    ["yildiz", "Mercan Yıldızı 08", "🌟", "#c26a5a"],
    ["kertenkele", "Zeytin Kertenkele 71", "🦎", "#798a4f"],
    ["guvercin", "Kül Güvercin 90", "🕊️", "#8f8a86"],
    ["kelebek", "Ateş Kelebeği 05", "🦋", "#c2543f"],
    ["balik", "Buz Balığı 63", "🐠", "#5f9ab0"],
    ["kurbaga", "Yosun Kurbağa 22", "🐸", "#4f8a6a"],
    ["horoz", "Kiremit Horoz 47", "🐓", "#b05a3a"],
    ["yarasa", "Gece Yarasası 11", "🦇", "#5a5470"],
    ["orumcek", "İpek Örümcek 39", "🕷️", "#8a7f9a"],
    ["kunduz", "Odun Kunduz 83", "🦫", "#8a7350"],
  ].forEach(function (a) {
    P[a[0]] = { name: a[1], emoji: a[2], color: a[3] };
  });

  /* ------------------------------------------------------------------------
     KURUCULAR
     Bölüm bilgisini elle yazmıyoruz: sayfa kimliğinden bulunuyor. Bir sayfa
     taşınırsa yorumların bölüm etiketi kendiliğinden doğru kalır.
     --------------------------------------------------------------------- */

  var sectionOf = {};
  D.sections.forEach(function (s) {
    s.pages.forEach(function (p) {
      sectionOf[p.id] = s.slug;
    });
  });

  var out = [];
  var seq = 0;

  /**
   * Satır biçimi:  [okur, gövde, tepkiler, kaç saat önce, cevap verdiği satır, seçenekler]
   * `cevap verdiği satır` aynı çağrının satır dizinidir — thread'ler böyle kuruluyor.
   */
  function build(rows, base) {
    var ids = [];

    /* Yetim çıpa: sayfa yeniden adlandırılmış ya da silinmiş. Sessizce "" bölüme
       düşerdi; tohum yazarken fark edilmesi için bağırıyor. */
    if (!sectionOf[base.pageId]) {
      console.warn('[yorum] yetim çıpa: "' + base.pageId + '" bu sayıda yok.');
    }

    rows.forEach(function (r, i) {
      var isReply = r[4] !== undefined && r[4] !== null;
      var opts = r[5] || {};
      var c = {
        id: "s" + ++seq,
        pageId: base.pageId,
        sectionSlug: sectionOf[base.pageId] || "",
        parentId: isReply ? ids[r[4]] : null,
        anchorType: isReply ? "page" : base.anchorType,
        anchor: isReply ? null : base.anchor,
        quote: !isReply && base.quote ? { exact: base.quote } : null,
        featured: !!opts.featured,
        depthMode: opts.depth || "mid",
        locale: "tr",
        body: r[1],
        author: P[r[0]],
        status: opts.status || "published",
        createdAt: now - (r[3] || 1) * HOUR,
        reactions: r[2] || {},
      };
      ids.push(c.id);
      out.push(c);
    });
  }

  /** Bloğa bağlı yorumlar. `quote` verilirse hepsi aynı cümleyi alıntılar. */
  function on(blockId, quote, rows) {
    build(rows, {
      pageId: blockId.split(":")[0],
      anchorType: "block",
      anchor: { type: "block", blockId: blockId },
      quote: quote || null,
    });
  }

  /** Görsel üzerinde koordinat pini (tuvale göre normalize). */
  function pin(pageId, x, y, rows) {
    build(rows, {
      pageId: pageId,
      anchorType: "point",
      anchor: { type: "point", x: x, y: y },
      quote: null,
    });
  }

  /** Sayfanın kendisine bırakılmış yorum → 💬 rozeti. */
  function loose(pageId, rows) {
    build(rows, { pageId: pageId, anchorType: "page", anchor: null, quote: null });
  }

  /* ------------------------------------------------------------------------
     TESLİM — aktif sayının tohumunu döşe.
     Yorum dosyası olmayan bir sayı sessiz başlar; bu bir hata değil.
     --------------------------------------------------------------------- */

  var seed = (MAG.issueComments || {})[D.issue.slug];
  if (seed) seed({ on: on, pin: pin, loose: loose, P: P });

  D.comments = out;
})(window.MAG);
