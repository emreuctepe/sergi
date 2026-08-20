/* ============================================================================
   DATA — KEŞFET  (ileride `magazines` tablosunun tohum karşılığı)
   ----------------------------------------------------------------------------
   Keşfet, ARŞİVDEN başka bir şey. Arşiv yereldir: bu derginin kendi eski
   sayıları. Keşfet ise BAŞKA dergileri gösterir — onların da kendi arşivleri
   var, biz yalnızca kapaklarını ve birkaç sayfasını görüyoruz.

   Buradaki hiçbir dergi gerçek değil. Prototipin geri kalanı gibi "sahte ama
   tam görünümlü": kadro elle yazıldı (üretilmiş isimler kalabalık değil liste
   gibi duruyordu), akış tohumlu rastgelelikle diziliyor.

   Gerçek üründe bu dosya gitmez, `magazines` + `magazine_issues` tablolarından
   sayfalanmış bir sorgu gelir. Kart şekli aynı kalsın diye alan adları şimdiden
   düz: id, name, tagline, tags, scene, no, month.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var E = {};

  /* ========================================================================
     DERGİ KADROSU — 24 dergi
     ------------------------------------------------------------------------
     `line` = kapağın ya da bir sayfanın üstünde görünecek çekilmiş cümle.
     Kareler (1:1) bir SAYFA gösterdiği için ona ihtiyaç var: çıplak bir doku
     "sayfa" gibi okunmuyor, üstünde bir cümle olunca okunuyor.
     ===================================================================== */

  E.magazines = [
    { id: "altkat", name: "Altkat", tagline: "Şehrin duymadığı sesler", tags: ["şehir", "röportaj"], scene: "street", line: "Bodrum katta üç vardiya, bir pencere." },
    { id: "mercek", name: "Mercek", tagline: "Yavaş gazetecilik, uzun okuma", tags: ["inceleme", "politika"], scene: "paper", line: "Belgeyi bulmak altı ay sürdü; okumak yirmi dakika." },
    { id: "kuytu", name: "Kuytu", tagline: "Taşra, hafıza, fotoğraf", tags: ["foto-öykü", "taşra"], scene: "mountains", line: "Köyün adı haritadan silindi, tabelası duruyor." },
    { id: "devre", name: "Devre", tagline: "Teknoloji ve iktidar", tags: ["teknoloji", "mahremiyet"], scene: "circuit", line: "Rızanız alındı. Nerede, ne zaman, kimden?" },
    { id: "gece-vardiyasi", name: "Gece Vardiyası", tagline: "02.00'den sonra yazılanlar", tags: ["deneme", "gece"], scene: "moon", line: "Uykusuzluk bir tür dikkattir, kimse böyle anlatmıyor." },
    { id: "kagit-kesigi", name: "Kâğıt Kesiği", tagline: "Çizgi roman antolojisi", tags: ["çizgi roman", "manga"], scene: "genko", line: "Kare boşsa okur nefes alır — boşluk da çizimdir." },
    { id: "lodos", name: "Lodos", tagline: "Deniz, iklim, kıyı", tags: ["iklim", "doğa"], scene: "waves", line: "Kıyı çizgisi her yıl otuz santim içeri geliyor." },
    { id: "palimpsest", name: "Palimpsest", tagline: "Üst üste yazılmış şehirler", tags: ["tarih", "mimari"], scene: "temple", line: "Aynı avluda dört yüzyıl, üç din, tek kuyu." },
    { id: "bakir-tel", name: "Bakır Tel", tagline: "Müzik ve ses", tags: ["müzik", "ses"], scene: "signal-grid", line: "Kayıt stüdyosu değil, merdiven boşluğuydu." },
    { id: "uzun-tren", name: "Uzun Tren", tagline: "Yol yazıları", tags: ["seyahat", "deneme"], scene: "train", line: "Varmak için değil, bakmak için bindim." },
    { id: "yaprak-arasi", name: "Yaprak Arası", tagline: "Kitap ve okuma", tags: ["edebiyat", "kitap"], scene: "leaves", line: "Kenar notu, metnin kendisinden uzun." },
    { id: "demlik", name: "Demlik", tagline: "Mutfak, tarif, sofra", tags: ["yemek", "kültür"], scene: "bowl", line: "Tarif dört satır; tarifin hikâyesi dört sayfa." },
    { id: "tanzaku", name: "Tanzaku", tagline: "Şiir ve çeviri", tags: ["şiir", "çeviri"], scene: "tanzaku", line: "Aynı dizeyi yedi çevirmen yedi türlü kırdı." },
    { id: "sumi", name: "Sumi", tagline: "Çizgi, mürekkep, hat", tags: ["sanat", "tasarım"], scene: "sumi", line: "Tek hamle. Düzeltme yok, silgi yok." },
    { id: "kagit-duvar", name: "Kâğıt Duvar", tagline: "Mimari ve ışık", tags: ["mimari", "tasarım"], scene: "shoji", line: "Duvar ışığı kesmiyor, süzüyor — fark burada." },
    { id: "emaki", name: "Emaki", tagline: "Anlatı ve resim", tags: ["illüstrasyon", "tarih"], scene: "emaki", line: "Rulo açıldıkça zaman geçiyor; kapanınca duruyor." },
    { id: "torii-sokagi", name: "Torii Sokağı", tagline: "Japonya günlükleri", tags: ["japonya", "seyahat"], scene: "torii", line: "Kapıdan geçtim ama nereye girdiğimi bilmiyorum." },
    { id: "neon-vardiya", name: "Neon Vardiya", tagline: "Gece ekonomisi", tags: ["şehir", "emek"], scene: "neon-city", line: "Şehir uyurken kim çalışıyor, kaça çalışıyor?" },
    { id: "terminal", name: "Terminal", tagline: "Yazılım ve zanaat", tags: ["yazılım", "zanaat"], scene: "terminal", line: "Otuz satır sildim, program hızlandı." },
    { id: "saganak", name: "Sağanak", tagline: "Hafıza ve kayıp", tags: ["deneme", "anı"], scene: "rain", line: "Hatırlamak da bir kurgu; kaynağını göstermiyor." },
    { id: "portre", name: "Portre", tagline: "Tek kişilik sayılar", tags: ["söyleşi", "biyografi"], scene: "portrait", line: "Kırk yıl aynı tezgâh, aynı ışık, aynı pencere." },
    { id: "sehir-hatti", name: "Şehir Hattı", tagline: "Toplu taşıma ve gündelik hayat", tags: ["şehir", "ulaşım"], scene: "city", line: "Günde iki saat, yılda yirmi gün: yolda geçen ömür." },
    { id: "musvedde", name: "Müsvedde", tagline: "Yayımlanmamış olanlar", tags: ["edebiyat", "deneme"], scene: "genko", line: "Bu metin üç kez reddedildi; dördüncüsü elinizde." },
    { id: "ariza", name: "Arıza", tagline: "Bozulan şeylerin peşinde", tags: ["teknoloji", "onarım"], scene: "circuit", line: "Tamir etmek, tasarımı geri okumaktır." },
  ];

  E.byId = function (id) {
    for (var i = 0; i < E.magazines.length; i++) if (E.magazines[i].id === id) return E.magazines[i];
    return null;
  };

  /* ========================================================================
     AKIŞ — 3:4 kapaklar ve 1:1 kareler karışık
     ------------------------------------------------------------------------
     Tohum her AÇILIŞTA yeniden atılıyor (sayfa yenilenince akış değişsin —
     keşfet donuk bir liste değil). Ama oturum içinde sabit: arama kutusunu
     her tuşa bastığında ızgara yeniden karılsaydı okunmaz olurdu.

     Kilit dergi bazında olduğu için kareler ait oldukları derginin kilidini
     paylaşıyor: bir dergiyi açan, o an akışta ona bağlı kareleri de açmış olur.
     ===================================================================== */

  var PAGE_KINDS = ["açılış", "söyleşi", "foto-öykü", "deneme", "günlük", "inceleme", "portre", "not"];

  E.buildFeed = function (seed) {
    var rand = U.rng(seed || Date.now());
    var items = [];

    E.magazines.forEach(function (m) {
      /* Her derginin bir kapağı var — keşfetin omurgası bu. */
      items.push({
        kind: "cover",
        mag: m,
        no: 3 + Math.floor(rand() * 26),
        month: monthOf(rand),
        seed: Math.floor(rand() * 100000),
      });
    });

    /* Dergilerin yaklaşık üçte ikisi akışa bir de SAYFA düşürüyor. Hepsine
       kare verilirse ızgara kapak-kare-kapak diye tekdüze şeritleniyor. */
    E.magazines.forEach(function (m) {
      if (rand() > 0.66) return;
      items.push({
        kind: "page",
        mag: m,
        page: 8 + Math.floor(rand() * 70),
        pageKind: PAGE_KINDS[Math.floor(rand() * PAGE_KINDS.length)],
        seed: Math.floor(rand() * 100000),
      });
    });

    return shuffle(items, rand);
  };

  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim"];

  function monthOf(rand) {
    return MONTHS[Math.floor(rand() * MONTHS.length)] + " 2026";
  }

  function shuffle(arr, rand) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  /** Arama: ad, slogan ve etiketlerde geçiyor mu? */
  E.matches = function (item, q) {
    if (!q) return true;
    var m = item.mag;
    var hay = (m.name + " " + m.tagline + " " + m.tags.join(" ") + " " + m.line).toLocaleLowerCase("tr");
    return hay.indexOf(q.toLocaleLowerCase("tr")) >= 0;
  };

  MAG.exploreData = E;
})(window.MAG);
