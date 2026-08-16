/* ============================================================================
   DATA — YORUMLAR  (Supabase `comments` tablosunun tohum karşılığı)
   ----------------------------------------------------------------------------
   İçerik ile yorum bilerek ayrı dosyada: gerçek üründe biri `packages/content`
   derleyicisinden gelir, öteki veritabanından. data.js derleyici çıktısıdır,
   bu dosya ise sosyal katman.

   NEDEN BU KADAR ÇOK
   Her yorum sunumu 15 yorumla güzel görünür. Ayrım kalabalıkta ortaya çıkar:
   bir cümleye 16 kişi dokunduğunda sayfa hâlâ okunabiliyor mu? Bu yüzden tohum
   veri "birkaç örnek" değil, dolu bir sayı: ~170 yorum, gerçek hayattaki gibi
   EŞİTSİZ dağılmış. Bazı bloklar sessiz, birkaç blok kaynıyor.

   js/debug.js'teki MAG.flood() ise bambaşka bir iş: o sentetik ve yalnızca
   bellekte, buradaki veri kalıcı ve elle yazılmış — prototipe her açılışta
   canlı bir dergi gibi girilsin diye.

   ISI HARİTASI (bilerek kurulan uçlar)
     km-1:0   "renk her gün yaklaşık yirmi metre iner"        16 alıntı → ısı 4
     km-3:3   "Tamamlanmış güzellik durur…"                    9 alıntı → ısı 3
     sy-2:2   "Fark görülmeyince, fark yok demektir."           6 alıntı → ısı 3
     km-1:2   "Bunu bilmek, beklemeyi değiştirir."             5 alıntı → ısı 3
     …ve 2-4 alıntılı bir düzine cümle (ısı 2), gerisi tek (ısı 1).

   AYNI CÜMLE, İKİ AYRI BLOK
     "Kötü fener yapmak, fener yapmamaktan daha kötüdür." hem sy-1:3'te söyleniyor
     hem sy-2:0'da alıntı bloğu olarak tekrar ediyor. İkisi AYRI işaret alır ve
     ayrı sayılır — arama bloğa kapalı olduğu için (bkz. docs/YORUM-SISTEMI.md §2).
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

  /* ========================================================================
     00 · KAPAK
     ===================================================================== */

  loose("kapak-1", [
    ["kelebek", "Bu kapak geçen sayıdan da iyi. Yaprak izini basılı görmek isterdim.", { "❤️": 19 }, 64],
    ["guvercin", "Sayı numarasının yazı tipi çok oturmuş.", { "👍": 6 }, 61],
  ]);

  /* ========================================================================
     01 · EDİTÖRDEN
     ===================================================================== */

  on("ed-1:1", "Renk, aslında bir veda", [
    ["yildiz", "Başlığı okuyup bir süre açmadım. Hazır olmak gerekiyor sanki.", { "❤️": 14, "🍁": 5 }, 58],
    ["karga", "Bence fazla ağır bir başlık. Yazı daha neşeli aslında.", { "🤔": 4 }, 52],
  ]);

  on("ed-1:4", "Ağaç o rengi üretmez; sadece yeşili geri çeker.", [
    ["baykus", "Açılış cümlesi olarak kusursuz.", { "❤️": 22 }, 50],
    ["kurbaga", "Biyolojik olarak da tam doğru, güzel yazılmış hâli bu.", { "💯": 17 }, 47],
    ["ayi", "Bunu çocuğuma anlattım, “yani ağaç boya sürmüyor mu” dedi. Aynen öyle.", { "😄": 26, "❤️": 9 }, 44],
    ["orumcek", "Cümlenin ikinci yarısı olmasa klişe olurdu. “Geri çeker” kurtarıyor.", { "💯": 8 }, 41],
  ]);

  on("ed-1:4", "Geriye kalan, hep orada olan renktir.", [
    ["kaplumbaga", "İnsan için de geçerli galiba. Yaşlanınca yeni bir şey olmuyoruz.", { "❤️": 31, "🤯": 6 }, 39],
    ["sazan", "Bu cümleyi sonbaharda değil, şubatta okumak isterdim.", { "❤️": 7 }, 36],
    ["kedi", "Fazla iddialı. Renk pigmentin ömrüyle ilgili, felsefe değil.", { "🤔": 5 }, 34, null],
    ["kurbaga", "Bir metin hem doğru hem şiirsel olabilir, ikisi rakip değil.", { "💯": 12 }, 33, 2],
  ]);

  on("ed-1:5", "sadece gürültüyü çektik", [
    ["kunduz", "Dergi olarak vaat bu olsun, yeter.", { "🙏": 11 }, 30],
  ]);

  loose("ed-1", [
    ["horoz", "İlk defa giriyorum, hesap açmadan yorum yazabilmek tuhaf geldi (iyi anlamda).", { "👀": 15 }, 28],
  ]);

  on("ed-2:0", "bu ay ilk kez, sayıya özel çizilmiş bir one-shot", [
    ["yarasa", "One-shot kısmı için geldim, kalmak için sebep buldum.", { "🔥": 13 }, 26],
    ["balik", "Her sayıda olur mu bu? Yoksa deneme mi?", { "👀": 8 }, 25],
    ["tilki", "Editör “ilk kez” demiş, yani niyet var gibi.", { "👍": 4 }, 24, 1],
  ]);

  on("ed-2:1", "Bitişi olan bir şey okumayı özlediysen, doğru yerdesin.", [
    ["flamingo", "Bu cümle için abone olurum.", { "❤️": 38, "💯": 14 }, 23],
    ["kartal", "Sonsuz akıştan yorulmuş biri olarak: teşekkürler.", { "❤️": 21 }, 22],
    ["karga", "Bitmesi iyi de, bitince ne yapacağız?", { "😄": 9 }, 21],
    ["flamingo", "Bir ay bekleyeceğiz. Beklemek de okumanın parçası.", { "❤️": 17 }, 20, 2],
  ]);

  on("ed-2:2", null, [
    ["ari", "Denedim, gerçekten çalışıyor. Yorum bırakması bu kadar kolay olmamalı, sonra susmuyorum.", { "😄": 24 }, 19],
  ]);

  /* ========================================================================
     02 · KIZIL MEVSİM  (derginin en kalabalık bölümü)
     ===================================================================== */

  on("km-acilis:2", "Sonbahar bir tarih değil, bir yükseklik meselesidir.", [
    ["sincap", "Bu cümleyi okuduktan sonra hava durumuna bakışım değişti.", { "🤯": 18, "❤️": 6 }, 68],
    ["yelkovan", "Denizciler için de böyle: mevsim enlemle gelir, takvimle gelmez.", { "💯": 15 }, 66],
    ["geyik", "Yükseklik meselesi ama nem de var. Kuru yıllarda renk soluk kalıyor.", { "🤔": 7 }, 63],
  ]);

  pin("km-acilis", 0.72, 0.19, [
    ["kertenkele", "Sağdaki sırtın çizgisi tam ortada duruyor, bu tesadüf değil sanırım.", { "👀": 9 }, 60],
  ]);
  pin("km-acilis", 0.24, 0.66, [
    ["turna", "Buradaki ağaç grubu fotoğrafın saatini söylüyor: gölge daha uzun.", { "🔥": 5 }, 57],
  ]);

  /* --- EN AZ modundaki sayfa da sessiz kalmasın ---------------------------- */

  on("km-min:2.0", "Günde 20 metre, haftada bir ilçe.", [
    ["kaplumbaga", "En az modunda okuyup sonra klasiğe geçtim, sırf bu maddeyi merak ettiğim için.", { "❤️": 12 }, 55],
    ["ari", "Üç maddeyle özetlenebiliyorsa uzun yazıya ne gerek var diye düşündüm, sonra uzununu okudum. Gerek var.", { "😄": 19, "💯": 7 }, 53],
  ]);
  on("km-min:2.1", null, [
    ["horoz", "Üçüncü hafta kalabalık, doğru. Geçen yıl otoparka giremedim.", { "👍": 8 }, 51],
  ]);
  on("km-min:2.2", "yeşille kızılın aynı dalda durduğu üç gündür", [
    ["yildiz", "Bu üç günü yakalamak için üç yıl bekledim, değdi.", { "❤️": 16 }, 49],
    ["kedi", "Bence beş gün. Ama tartışılır.", { "😄": 6 }, 47],
  ]);
  on("km-min:4", null, [
    ["balik", "Bu notu görmesem derinlik düğmesini fark etmezdim.", { "🙏": 9 }, 45],
  ]);

  /* --- km-1 · SAYININ EN SICAK CÜMLESİ (16 alıntı → ısı 4) ---------------- */

  on("km-1:0", "renk her gün yaklaşık yirmi metre iner", [
    ["vinc", "Bunu ilk defa duyuyorum ve inanamıyorum. Kaynak var mı acaba?", { "🤯": 14, "❤️": 3 }, 44],
    ["balina", "Meteoroloji kurumları “sonbahar cephesi” diye haritalıyor, gerçekten böyle ilerliyor.", { "🙏": 21 }, 43, 0],
    ["kurbaga", "Ormancılık okuyan biri olarak: rakam kabaca doğru, yamacın eğimine göre 15-25 arasında oynuyor.", { "💯": 34, "🙏": 8 }, 42],
    ["kirpi", "Yirmi metre… Sonbahar yürüyerek inseydi bundan hızlı olurdu.", { "😄": 27 }, 41],
    ["guvercin", "Bu cümleyi okuyunca telefonu bıraktım, pencereden baktım.", { "❤️": 13 }, 40],
    ["ayi", "Babam her sonbahar bunu söylerdi, ben masal sanıyordum.", { "❤️": 46, "🍁": 11 }, 39],
    ["kartal", "Kuzey yamacında daha hızlı iniyor bence, gölge yüzünden.", { "🤔": 6 }, 38],
    ["yildiz", "Metreyle ölçülen bir mevsim fikri beni fena çarptı.", { "🔥": 12 }, 37],
    ["kedi", "Ekran görüntüsü alıp gruba attım, kimse inanmadı.", { "😄": 9 }, 36],
    ["kaplumbaga", "Yıllardır tarih tutuyorum, gerçekten haftada bir ilçe aşağı kayıyor.", { "👍": 17 }, 35],
    ["balik", "Güney yarımkürede aynı hızda mı çıkıyor peki?", { "👀": 5 }, 34],
    ["yelkovan", "Bunu haritaya çizen var mı? Görmek isterim.", { "👍": 10 }, 33],
    ["orumcek", "Cümlenin ritmi de iniyor gibi, fark ettiniz mi.", { "❤️": 7 }, 32],
    ["karga", "Fazla şiirsel geldi. Sayı verilince inandırıcılık azalıyor bence.", { "🤔": 4 }, 31],
    ["sazan", "Tam tersi: sayı olmasa hiç inanmazdım.", { "💯": 9 }, 30, 13],
    ["ari", "Öğretmenim olsa bunu tahtaya yazardı.", { "❤️": 6 }, 29],
    ["kunduz", "Her yıl geç kalıyorum. Artık takvime yazıyorum: eylül 12.", { "👍": 11 }, 28],
    ["sincap", "Bir asansör hızı değil ama bir mevsim için çok hızlı.", { "🔥": 5 }, 27],
  ]);

  on("km-1:0", "Eylülün ilk günü hiçbir şey olmaz.", [
    ["flamingo", "Eylülün ilk günü benim için de hiçbir şey olmaz, sadece okullar açılır.", { "😄": 14 }, 26],
    ["geyik", "Aslında olur: gece sıcaklığı düşmeye başlar. Görünmüyor ama olur.", { "💯": 11 }, 25],
  ]);

  on("km-1:0", "kimsenin görmediği bir yerde ilk yaprak döner", [
    ["kelebek", "Bu görüntü aklımdan çıkmıyor.", { "❤️": 18 }, 24],
    ["yarasa", "İlk yaprağı gören biri olsa da anlatsa.", { "😄": 8 }, 23],
    ["turna", "O ilk yaprağı bulmak için bir sayı ayırın, ciddiyim.", { "🔥": 13 }, 22],
  ]);

  on("km-1:1", "Bir mevsimin hız birimi olmasını saçma buldum.", [
    ["horoz", "Ben de. Sonra düşündüm: gelgitin de hızı var.", { "💯": 9 }, 21],
    ["kertenkele", "Saçma bulmak ile yanlış bulmak arasındaki fark güzel kurulmuş.", { "❤️": 6 }, 20],
  ]);

  on("km-1:2", "Bunu bilmek, beklemeyi değiştirir.", [
    ["nilufer", "Bütün yazının özeti bu cümle.", { "❤️": 29, "💯": 8 }, 19],
    ["kunduz", "Beklemeyi bilmek, sabırdan farklı bir şey. Bunu ayırmak lazım.", { "❤️": 14 }, 18],
    ["baykus", "Katılmıyorum: bilmek bekleyişi kısaltmıyor, sadece huzursuzluğu azaltıyor.", { "🤔": 11 }, 17],
    ["nilufer", "Zaten aynı şeyi söylüyorsun.", { "😄": 7 }, 16, 2],
    ["kelebek", "Trene bakarken de böyle: kaç dakika kaldığını bilmek yolu kısaltmıyor ama katlanılır yapıyor.", { "💯": 22 }, 15],
    ["ayi", "Bu cümleyi işime uyarladım, tuhaf ama işe yaradı.", { "👍": 6 }, 14],
  ]);

  on("km-1:3", "Beton geceleri ısıyı tutar, ağaçlar kararsız kalır.", [
    ["yelkovan", "Şehir ısı adası etkisi. Ölçümlerde 4-6 derece fark çıkıyor, yazıdaki gecikmeyi tam açıklıyor.", { "💯": 26, "🙏": 5 }, 13],
    ["kedi", "Bizim sokakta bir ağaç var, aralığa kadar yeşil kalıyor. Yalnız o.", { "❤️": 19 }, 12],
  ]);
  on("km-1:3", "sanki aceleye gelmiş gibi", [
    ["orumcek", "Şehirde her şey aceleye geliyor, sonbahar da alışmış.", { "❤️": 15 }, 11],
  ]);

  /* --- km-2 · fotoğraf sayfası: pin kümesi -------------------------------- */

  pin("km-2", 0.66, 0.34, [
    ["baykus", "Sağ üstteki ışık nasıl bu kadar temiz çıkmış?", { "👀": 9 }, 33],
    ["geyik", "Sabah yedide hava henüz sertleşmiyor, o yüzden.", { "🙏": 12 }, 31, 0],
  ]);
  pin("km-2", 0.71, 0.41, [
    ["sazan", "Buradaki ikinci sıra ağaçlar tam dönmüş, öndekiler değil.", { "👀": 6 }, 30],
  ]);
  pin("km-2", 0.62, 0.44, [
    ["kartal", "Bu köşedeki gölge kadraja denge veriyor.", { "🔥": 4 }, 29],
  ]);
  pin("km-2", 0.28, 0.77, [
    ["kirpi", "Aşağıdaki patika görünmese fotoğraf bu kadar iyi olmazdı.", { "❤️": 11 }, 28],
  ]);
  pin("km-2", 0.5, 0.12, [
    ["yarasa", "Üstteki boşluk bilerek bırakılmış gibi. Nefes alanı.", { "👍": 7 }, 26],
  ]);
  on("km-2:0", "Kalabalık henüz otobüslerde.", [
    ["horoz", "Bu alt yazı fotoğraftan daha çok şey anlatıyor.", { "❤️": 23, "💯": 6 }, 25],
    ["balik", "Yedide bile kalabalık varsa saat altıda gitmek lazım demek ki.", { "😄": 8 }, 24],
  ]);

  /* --- km-3 · aynı cümleye dokuz ses -------------------------------------- */

  on("km-3:0", null, [
    ["kaplumbaga", "Başlık tam yerinde: gerçekten bir yarış ve genelde kaybediyoruz.", { "👍": 9 }, 23],
  ]);

  on("km-3:1", "bir hafta erken gel", [
    ["kelebek", "Geçen yıl denedim, gerçekten işe yarıyor.", { "👍": 21 }, 22],
    ["sincap", "Bir hafta erken gidince otel de yarı fiyat oluyor, ek bilgi.", { "💯": 17 }, 21],
    ["karga", "Erken gidip “olmamış” diye dönenler de var, tek çözüm değil.", { "🤔": 6 }, 20],
  ]);
  on("km-3:1", "aynı anda aynı yere bakan yedi bin kişidir", [
    ["guvercin", "Yedi bin kişi aynı fotoğrafı çekiyor ve hiçbiri birbirine benzemiyor, tuhaf.", { "❤️": 24 }, 19],
    ["kedi", "Rakam nereden geliyor merak ettim, gerçek bir sayım var mı?", { "👀": 7 }, 18],
  ]);
  on("km-3:2", "Bir şey olmaktadır.", [
    ["nilufer", "Üç kelime, bütün yazının derdi.", { "❤️": 27, "🔥": 9 }, 17],
    ["kunduz", "Bu cümleyi bir şeye başlarken hatırlamak lazım.", { "❤️": 12 }, 16],
  ]);

  on("km-3:3", "Tamamlanmış güzellik durur. Yarım güzellik ilerler.", [
    ["tilki", "Bu cümleyi duvarıma yazacağım.", { "❤️": 41, "🔥": 9 }, 15, { featured: true }],
    ["baykus", "Katılmıyorum. Yarım güzellik çoğu zaman sadece yarımdır, ilerlediği falan yok.", { "🤔": 12, "💯": 2 }, 14],
    ["tilki", "Bence mesele güzellik değil, bakan kişinin beklemeye razı olması.", { "❤️": 8 }, 13, 1],
    ["kirpi", "Bunu bir çeviri sanmıştım, meğer yazarın kendi cümlesiymiş.", { "👀": 3 }, 13],
    ["yildiz", "Yarım bırakılmış her şeyi savunan bir cümle, dikkatli olmak lazım 😄", { "😄": 18 }, 12],
    ["kurbaga", "Tam tersi de doğru: yarım kalan çoğu şey ilerlemiyor, çürüyor.", { "🤔": 14 }, 12],
    ["orumcek", "Bahçıvanlar en iyi aforizmaları üretiyor, çünkü beklemeyi meslek edinmişler.", { "❤️": 22 }, 11],
    ["ari", "İlk okuduğumda katılmadım. Üç gün sonra tekrar okudum, katıldım.", { "❤️": 16, "🤯": 4 }, 10],
    ["yelkovan", "Bunu tez konusu yapabilirim.", { "😄": 11 }, 9],
    ["ayi", "Japoncada bunun tek kelimelik hâli var mı acaba? Sözlük bölümüne bakacağım.", { "👀": 8 }, 9],
  ]);
  on("km-3:3", "kaynağını bilmediğim söz", [
    ["kertenkele", "Kaynağı bilmemek cümleyi güçlendiriyor bence, sahibi olmayan bir doğru gibi.", { "❤️": 13 }, 8],
  ]);

  /* --- km-4 · yalnızca klasik modda -------------------------------------- */

  on("km-4:2", "klorofil pahalıdır", [
    ["kurbaga", "“Pahalı” kelimesi burada teknik olarak da doğru: enerji maliyeti gerçekten yüksek.", { "💯": 19 }, 30],
    ["sazan", "Ağaç muhasebe tutuyor gibi anlatılmış, çok sevdim.", { "😄": 14 }, 28],
  ]);
  on("km-4:3", "Yani ağaç, veda ederken masrafa girer.", [
    ["flamingo", "Bu sayının en güzel cümlesi bu, iddia ediyorum.", { "❤️": 33, "🔥": 7 }, 27],
    ["guvercin", "Cenazelerde çiçek almak gibi.", { "❤️": 21, "🍁": 5 }, 26],
    ["karga", "Ağaç veda etmiyor, yaprak dökülüyor. Şiir güzel ama biyoloji değil.", { "🤔": 9 }, 25],
    ["kurbaga", "Biyoloji de tam bunu söylüyor aslında: antosiyanin ölmekte olan yaprakta üretiliyor. Masraf gerçek.", { "💯": 24 }, 24, 2],
  ]);
  on("km-4:4", null, [
    ["kaplumbaga", "Bu üç sayıyı ekran görüntüsü aldım, gelecek yıl plan yapacağım.", { "👍": 12 }, 23],
  ]);
  on("km-4:5", "Kızıl, ağacın son işidir.", [
    ["yildiz", "Son iş en gösterişli olsun, fena fikir değil.", { "❤️": 17 }, 22],
    ["yarasa", "Bunu okuduktan sonra sonbahar bana hüzünlü gelmiyor artık.", { "❤️": 25, "🍁": 8 }, 21],
  ]);

  /* --- km-5 · sözlük satırları ------------------------------------------- */

  on("km-5:1.0", "ödülü tenhalık", [
    ["kunduz", "Tenhalık için erken kalkmaya değer. Onaylıyorum.", { "👍": 14 }, 20],
    ["horoz", "Kuzey yamacı bir haftada dökülüyor, riski de bu.", { "🤔": 6 }, 19],
  ]);
  on("km-5:1.1", null, [
    ["balik", "Güney yamacını hiç denememiştim, bu yıl deneyeceğim.", { "👍": 9 }, 18],
  ]);
  on("km-5:1.2", "sabahın ilk saatinde ışık her şeyi affeder", [
    ["kelebek", "Fotoğrafçılık öğrenmek isteyen herkese bu cümleyi okutmak lazım.", { "❤️": 28, "💯": 11 }, 17],
    ["kertenkele", "Sis olmadan da affediyor aslında, ama sisliyken daha çok.", { "❤️": 8 }, 16],
  ]);
  on("km-5:2", "kalabalığın gittiği yere iki gün önce git", [
    ["kirpi", "Bunu her şeye uyguluyorum artık: sinemaya, tatile, markete.", { "😄": 23, "💯": 9 }, 15],
    ["sincap", "İki gün önce gidince kalabalık senin arkandan geliyor, o da tuhaf bir his.", { "❤️": 11 }, 14],
  ]);

  /* --- km-imza · kapanış ------------------------------------------------- */

  on("km-imza:0", "Renk gelmiyor. Yeşil gidiyor.", [
    ["nilufer", "Bütün yazı bu iki cümle için yazılmış gibi.", { "❤️": 36, "🔥": 12 }, 13],
    ["turna", "Kapanış sayfası olarak kusursuz. Sessizce bitiyor.", { "❤️": 18 }, 12],
    ["karga", "Biraz slogan gibi oldu ama itiraz etmiyorum.", { "😄": 7 }, 11],
  ]);
  pin("km-imza", 0.5, 0.28, [
    ["ceylan", "Bu sayfada bir süre durdum.", { "🍁": 16 }, 10],
  ]);
  pin("km-imza", 0.31, 0.63, [
    ["ari", "Buradaki yaprak yığınının çizimi çok iyi.", { "❤️": 9 }, 9],
  ]);

  /* ========================================================================
     03 · GECE HATTI  (foto-öykü — pinlerin evi)
     ===================================================================== */

  on("gh-acilis:2", "Hepsi aynı yöne yürüyor ve kimse konuşmuyor.", [
    ["yarasa", "Her gece bu kalabalığın içindeyim, tarifi tam.", { "❤️": 29 }, 47],
    ["guvercin", "Konuşmuyorlar ama hepsi aynı şeyi düşünüyor: yarın yine.", { "❤️": 21, "🍁": 3 }, 45],
  ]);
  pin("gh-acilis", 0.19, 0.72, [
    ["kedi", "Soldaki ışık lekesi bir vitrin mi, tren mi?", { "👀": 6 }, 43],
  ]);

  on("gh-1:0", "Kimse acele etmiyor.", [
    ["kaplumbaga", "Son treni kaçıran insanın acelesi biter, doğru gözlem.", { "❤️": 24, "💯": 7 }, 41],
  ]);
  pin("gh-1", 0.38, 0.29, [
    ["turna", "Tabelanın yansıması peronu ikiye bölüyor.", { "🔥": 8 }, 40],
  ]);
  pin("gh-1", 0.44, 0.34, [
    ["orumcek", "Buradaki iki kişi birbirine bakmıyor ama aynı hizada duruyor.", { "❤️": 14 }, 39],
  ]);
  pin("gh-1", 0.79, 0.61, [
    ["balik", "Sağdaki bank boş, herkes ayakta. Neden acaba?", { "👀": 11 }, 38],
    ["kedi", "Oturunca kalkmak zorlaşıyor, gece yarısı herkes bunu bilir.", { "😄": 19 }, 37, 0],
  ]);

  on("gh-2:0", "Tek ses, kartların çıkardığı ses.", [
    ["ceylan", "Turnikedeki o an. Herkes aynı sesi çıkarıyor ve kimse duymuyor.", { "❤️": 32 }, 36],
    ["sahin", "Bu seride en sevdiğim kare bu.", {}, 35],
    ["ari", "Sesi hatırlıyorum, okurken kulağımda çaldı.", { "🤯": 13 }, 34],
  ]);
  pin("gh-2", 0.31, 0.62, [
    ["ceylan", "Buradaki kolun açısı çok iyi yakalanmış.", { "❤️": 18 }, 33],
  ]);
  pin("gh-2", 0.36, 0.66, [
    ["sahin", "Yanındaki kişinin ayakkabısı bulanık, hareket burada.", { "🔥": 9 }, 32],
  ]);
  pin("gh-2", 0.29, 0.7, [
    ["kunduz", "Zemindeki yansıma sanki ikinci bir kalabalık.", { "❤️": 12 }, 31],
  ]);
  pin("gh-2", 0.72, 0.22, [
    ["sazan", "Üstteki saat 00:19 gösteriyor mu, göremedim.", { "👀": 5 }, 30],
  ]);
  pin("gh-2", 0.66, 0.81, [
    ["horoz", "Alt köşedeki turnike bozuk gibi, kimse kullanmıyor.", { "😄": 7 }, 29],
  ]);

  on("gh-3:0", "Telefonuna değil, yukarı bakıyor.", [
    ["yildiz", "Bu adam bütün seriyi kurtarıyor.", { "❤️": 34, "🔥": 11 }, 28],
    ["kelebek", "Yukarıda ne var? Ben de bakmak istedim.", { "👀": 16 }, 27],
    ["kertenkele", "Belki tavandaki sızıntıya bakıyordur, ama böylesi daha güzel.", { "😄": 21 }, 26],
  ]);
  pin("gh-3", 0.52, 0.44, [
    ["geyik", "Merdivenin ortasında durmak aslında en zor şey, akıntıya karşı durmak gibi.", { "❤️": 17 }, 25],
  ]);
  pin("gh-3", 0.18, 0.24, [
    ["karga", "Sol üstteki kadraj biraz gevşek durmuş bence.", { "🤔": 4 }, 24],
  ]);

  on("gh-4:0", "Işığı sokağa taşıyor.", [
    ["flamingo", "Gece açık kalan tek dükkânın hâli. “Taşıyor” fiili çok doğru.", { "❤️": 19 }, 23],
  ]);
  pin("gh-4", 0.61, 0.55, [
    ["yarasa", "Vitrinin içindeki adamın yüzü görünmüyor, iyi olmuş.", { "🔥": 8 }, 22],
  ]);
  pin("gh-4", 0.24, 0.82, [
    ["sincap", "Kaldırımdaki su birikintisi ışığı ikiye katlamış.", { "❤️": 13 }, 21],
  ]);

  on("gh-5:0", "Kalabalık kırk saniyede dağıldı.", [
    ["baykus", "Kırk saniye. Şehrin en dürüst ölçüsü.", { "❤️": 26, "💯": 9 }, 20],
    ["kedi", "Yağmur her şeyi bitirir, bu yüzden seriyi burada bitirmek doğru olmuş.", { "❤️": 15 }, 19],
  ]);
  pin("gh-5", 0.47, 0.36, [
    ["balina", "Buradaki şemsiye açılma anı mı? Öyleyse zamanlama inanılmaz.", { "🤯": 14 }, 18],
    ["turna", "Bence açılmış da rüzgâra yakalanmış.", { "😄": 6 }, 17, 0],
  ]);
  pin("gh-5", 0.2, 0.58, [
    ["horoz", "Soldaki koşan kişi tek bulanık şey, gerisi durmuş.", { "🔥": 11 }, 16],
  ]);
  pin("gh-5", 0.83, 0.7, [
    ["orumcek", "Sağdaki tabelanın ışığı yağmurda dağılıyor, çok güzel.", { "❤️": 9 }, 15],
  ]);
  loose("gh-5", [
    ["kaplumbaga", "Bu foto-öyküyü baştan sona iki kez okudum. İkinci seferde alt yazıları okumadım, daha iyi oldu.", { "❤️": 22, "👀": 4 }, 14],
  ]);

  /* ========================================================================
     04 · SÖYLEŞİ
     ===================================================================== */

  on("sy-acilis:1", "Kâğıt ışığı yumuşatır, cam sertleştirir", [
    ["nilufer", "Başlık olarak bundan iyisi olamazdı.", { "❤️": 27 }, 44],
    ["yelkovan", "Fizik olarak da doğru: kâğıt saçıyor, cam kırıyor.", { "💯": 18, "🙏": 4 }, 42],
  ]);

  on("sy-1:1", "Saymayı otuz yıl önce bıraktım.", [
    ["ayi", "Bu cevabı verebilmek için otuz yıl çalışmak lazım.", { "❤️": 31 }, 40],
    ["kirpi", "“Ama sayabilirsin” kısmı çok tatlı, matematiği okura bırakıyor.", { "😄": 17 }, 38],
  ]);
  on("sy-1:3", "Kötü fener yapmak, fener yapmamaktan daha kötüdür.", [
    ["kartal", "Bu cümleyi atölyemin kapısına yazdım. Gerçekten yazdım.", { "❤️": 38, "🔥": 14 }, 36],
    ["karga", "Kulağa hoş geliyor ama insanlar ancak kötü yaparak öğreniyor.", { "🤔": 16 }, 35],
    ["kartal", "Öğrenirken yaptığın kötü şeyi satmıyorsun ama. Fark orada.", { "💯": 29 }, 34, 1],
    ["kunduz", "Yazılıma da birebir uyuyor.", { "👍": 12 }, 33],
    ["guvercin", "Ustaların hepsi aynı şeyi başka kelimelerle söylüyor, hep aynı yere çıkıyor.", { "❤️": 14 }, 32],
  ]);

  on("sy-2:0", "Kötü fener yapmak, fener yapmamaktan daha kötüdür.", [
    ["yildiz", "Alıntı olarak tekrar görmek iyi olmuş, ilk okuyuşta kaçırmıştım.", { "👍": 11 }, 31],
    ["sazan", "Aynı cümle iki yerde ve iki farklı yerde işaretlenmiş, sistem bunu ayırıyor demek ki.", { "🤯": 8 }, 30],
  ]);
  on("sy-2:2", "Fark görülmeyince, fark yok demektir.", [
    ["nilufer", "Bu, aslında bütün zanaatların özeti.", { "❤️": 27, "💯": 11 }, 29],
    ["kirpi", "Ya da her şeyin. Yazılımda da aynısı.", { "😄": 4 }, 28, 0],
    ["vinc", "Yazılımda fark görülmeyince fark gerçekten yok oluyor ama, orası ayrı 😅", {}, 27, 1],
    ["kelebek", "Karamsar bir cümle ama itiraz edemiyorum.", { "🤔": 13 }, 26],
    ["ari", "Tam tersini düşünüyorum: fark görülmese de kalıyor, sadece kimse ödemiyor.", { "💯": 21 }, 25],
    ["yarasa", "Bu cümle yüzünden kahve fincanımı değiştirdim.", { "😄": 24 }, 24],
    ["kaplumbaga", "Ustanın en sert cümlesi bu ve en sakin söylediği cümle de bu.", { "❤️": 19 }, 23],
  ]);
  on("sy-2:2", "artık farkı görmüyoruz", [
    ["horoz", "Görmüyoruz değil, bakmıyoruz.", { "💯": 17 }, 22],
    ["kedi", "Bakmak için zaman gerekiyor, kimsede yok.", { "❤️": 12 }, 21],
  ]);
  on("sy-2:4", "Bunu ölçemezsin ama olur.", [
    ["balik", "Ölçülemeyen şeylerin en çok konuşulduğu çağda çok iyi bir cümle.", { "❤️": 25, "💯": 8 }, 20],
    ["kurbaga", "Aslında ölçülebilir: desibel düşer. Ama ustanın demek istediği o değil.", { "😄": 15, "🙏": 6 }, 19],
    ["orumcek", "Bir odaya kâğıt fener koydum, gerçekten oldu. Bilimsel değil, ama oldu.", { "❤️": 22 }, 18],
    ["karga", "Plasebo olabilir.", { "🤔": 9 }, 17],
    ["orumcek", "Olsun. Sonuç aynı.", { "😄": 26 }, 16, 3],
  ]);
  on("sy-2:4", "insanlar daha alçak sesle konuşur", [
    ["guvercin", "Restoranlar bunu bilse hayatımız değişirdi.", { "😄": 31, "💯": 12 }, 15],
  ]);

  on("sy-3:1", "Sabır romantiktir; tekrar sıkıcıdır.", [
    ["kunduz", "Bu ayrımı hiç bu kadar net duymamıştım.", { "❤️": 34, "🤯": 9 }, 14],
    ["ayi", "Enstrüman çalan herkes bunu bilir. Sabır değil, tekrar.", { "💯": 27 }, 13],
    ["flamingo", "Bunu okuduktan sonra bıraktığım şeyleri düşündüm. Hepsi tekrar yüzünden.", { "❤️": 23 }, 12],
    ["kertenkele", "Sıkıcı olanı sevmek öğrenilebilir mi acaba?", { "👀": 11 }, 11],
    ["ayi", "Öğrenilmiyor, alışılıyor. Aynı şey değil ama işe yarıyor.", { "❤️": 16 }, 10, 3],
  ]);
  on("sy-3:3", "Sadece bırakmadım.", [
    ["yildiz", "Söyleşinin en iyi cevabı en kısa cevabı.", { "❤️": 29, "🔥": 8 }, 9],
    ["sincap", "İki cümlede bir hayat.", { "❤️": 17 }, 8],
    ["kartal", "Bu cevabı verebilmek için kırk bir yıl gerekiyor demek ki.", { "❤️": 13 }, 7],
  ]);
  on("sy-3:5", null, [
    ["sazan", "“Kısaltıldı” notu dürüst, sevdim. Tam hâli bir yerde yayımlanır mı?", { "👀": 14 }, 6],
  ]);

  /* ========================================================================
     05 · SON TREN  (manga — panel yorumları + pinler)
     ===================================================================== */

  on("mn-acilis:2", null, [
    ["balina", "Sağdan sola okumayı ilk defa deniyorum, ilk sayfada şaşırdım, sonra alıştım.", { "👍": 21 }, 34],
    ["kelebek", "Uyarı olmasa yanlış sırada okuyacaktım.", { "🙏": 13 }, 33],
  ]);
  pin("mn-acilis", 0.5, 0.44, [
    ["yarasa", "Ay bu kadar büyük olmasa hikâye bu kadar sessiz durmazdı.", { "❤️": 18 }, 32],
  ]);

  on("mn-1:0.0", null, [
    ["kirpi", "İlk panelde “yine” demesi her şeyi anlatıyor.", { "❤️": 27, "💯": 6 }, 31],
    ["kedi", "Bu panelin çerçevesi diğerlerinden ince, dikkat mi çekiyor?", { "👀": 7 }, 30],
  ]);
  on("mn-1:0.2", null, [
    ["kaplumbaga", "Saat vermek yerine “son tren” demesi daha iyi olurdu bence.", { "🤔": 5 }, 29],
  ]);
  on("mn-1:0.3", null, [
    ["yildiz", "İki dakika. Bütün hikâye iki dakikanın içinde.", { "❤️": 31, "🔥": 9 }, 28],
  ]);
  pin("mn-1", 0.68, 0.22, [
    ["turna", "Buradaki tabela çizimi çok temiz.", { "🔥": 8 }, 27],
  ]);
  pin("mn-1", 0.73, 0.28, [
    ["orumcek", "Tabelanın altındaki gölge yönü diğer panellerle uyuşmuyor gibi.", { "👀": 6 }, 26],
  ]);
  pin("mn-1", 0.3, 0.79, [
    ["horoz", "Alt panelde perondaki çizgiler kaçış noktasına gidiyor, güzel iş.", { "❤️": 12 }, 25],
  ]);

  on("mn-2:0.2", null, [
    ["flamingo", "“Sen de mi” diyen kişinin yüzünü göstermemek doğru karar.", { "❤️": 24 }, 24],
    ["guvercin", "Bu replik olmasa hikâye yürümezdi.", { "👍": 11 }, 23],
  ]);
  pin("mn-2", 0.28, 0.74, [
    ["turna", "Bu panelin sessizliği çok iyi kurulmuş.", { "🔥": 12 }, 22],
  ]);
  pin("mn-2", 0.33, 0.79, [
    ["balik", "Ayaklara yakın kadraj, konuşma da alçaktan geliyor gibi.", { "❤️": 9 }, 21],
  ]);
  pin("mn-2", 0.71, 0.33, [
    ["karga", "Boş panel biraz kolaya kaçmak gibi geldi bana.", { "🤔": 7 }, 20],
    ["yildiz", "Boş panel duraklama işareti. Müzikte de sus var.", { "💯": 23 }, 19, 0],
  ]);

  on("mn-3:0.0", null, [
    ["sincap", "“Her cuma buradayım” cümlesini üçüncü okuyuşta anladım.", { "🤯": 15 }, 18],
  ]);
  on("mn-3:0.2", null, [
    ["kunduz", "Sabahın ilk treni beşte. Dört saat bekleyecek yani. Bunu söylemeden söylüyor.", { "❤️": 28, "💯": 7 }, 17],
    ["kertenkele", "Bu panelin ışığı diğerlerinden farklı, umut gibi.", { "❤️": 14 }, 16],
  ]);
  pin("mn-3", 0.55, 0.3, [
    ["ari", "Büyük panelde arkadaki saatin ibresi yok, bilerek mi?", { "👀": 9 }, 15],
  ]);
  pin("mn-3", 0.22, 0.68, [
    ["kelebek", "Küçük panellerin sıkışıklığı sohbetin gerginliğini veriyor.", { "🔥": 11 }, 14],
  ]);

  on("mn-4:0.1", null, [
    ["baykus", "Aynı repliğin iki kez, biri düşünce balonunda verilmesi çok iyi.", { "❤️": 33, "🤯": 8 }, 13],
    ["kedi", "İkinci “dört saat” daha ağır geliyor, aynı kelimeler olmasına rağmen.", { "❤️": 19 }, 12],
  ]);
  on("mn-4:0.3", "Şehir o dört saatte başka bir şehir oluyor.", [
    ["nilufer", "Bu son cümle bütün one-shot'ı toparlıyor.", { "❤️": 37, "🔥": 13 }, 11],
    ["yarasa", "Gece vardiyasında çalışan biri olarak: gerçekten başka bir şehir.", { "❤️": 31, "💯": 9 }, 10],
    ["kaplumbaga", "Foto-öykü ile aynı şeyi söylüyorlar, sayı bilerek böyle kurulmuş sanki.", { "🤯": 17 }, 9],
    ["nilufer", "Bence bilerek. İkisi de 00:41 civarı geçiyor.", { "👀": 12 }, 8, 2],
  ]);
  pin("mn-4", 0.5, 0.86, [
    ["flamingo", "Son panelde şehir siluetinin boş bırakılması çok doğru.", { "❤️": 21 }, 7],
  ]);
  pin("mn-4", 0.77, 0.2, [
    ["sazan", "Sağ üstteki pencere ışıkları teker teker sönüyor gibi çizilmiş.", { "🔥": 10 }, 6],
  ]);
  loose("mn-4", [
    ["kartal", "Sekiz sayfa demişti, dört sayfa okudum. Klasik moda geçmem gerekiyor sanırım.", { "😄": 18 }, 5],
    ["kirpi", "Aynen, orta modda iki sayfa gizli.", { "🙏": 7 }, 4, 0],
  ]);

  /* ========================================================================
     06 · BEŞ KELİME
     ===================================================================== */

  on("sz-1:1", null, [
    ["ayi", "Bu bölüm her sayıda olsun. En sevdiğim kısım.", { "❤️": 24 }, 30],
  ]);
  on("sz-2:0.0", "Yaprağın döküleceğini bilerek ona bakmak.", [
    ["yildiz", "Mono no aware'ı bundan iyi anlatan bir tanım okumadım.", { "❤️": 29, "💯": 8 }, 29],
    ["balina", "Bu tanım bütün sayının konusu aslında.", { "❤️": 17 }, 28],
    ["karga", "Biraz fazla romantize ediliyor bu kelime, Japonca'da bu kadar ağır değil.", { "🤔": 14 }, 27],
    ["ayi", "Ağır değil ama sık kullanılıyor, o yüzden ağırlaşmış olabilir.", { "💯": 11 }, 26, 2],
  ]);
  on("sz-2:0.1", "Yaprakların arasından süzülen ışık", [
    ["balina", "Komorebi için Türkçede tek kelime bulmaya çalışıyorum, olmuyor.", { "❤️": 21 }, 25],
    ["tilki", "“Yaprak ışığı” desek? Kısa değil ama yakın.", { "👍": 14 }, 24, 0],
    ["kurbaga", "“Gölge kırıntısı” diyen birini duymuştum, o da güzeldi.", { "❤️": 18 }, 23],
    ["horoz", "Bizim köyde buna “alaca” derlerdi. Tam değil ama yakın.", { "🤯": 26, "❤️": 9 }, 22],
  ]);
  on("sz-2:0.1", "Işığın kendisi değil, yaprakla arasındaki iş.", [
    ["orumcek", "Tanımın ikinci cümlesi tanımdan iyi.", { "❤️": 19 }, 21],
    ["yelkovan", "“Arasındaki iş” ifadesi çok hoşuma gitti.", { "👍": 12 }, 20],
  ]);
  on("sz-2:0.2", "Yürümek değil, sadece ormanda bulunmak.", [
    ["kaplumbaga", "Yürüyünce spor oluyor, durunca orman oluyor. Fark bu.", { "❤️": 23, "💯": 6 }, 19],
  ]);
  on("sz-2:0.3", "Sisin ardındaki dağ.", [
    ["kelebek", "Yūgen'i beş kelimeyle anlatmışsınız, geri kalanı okumaya gerek yok.", { "❤️": 27 }, 18],
    ["kertenkele", "Sis kalkınca yūgen bitiyor mu peki?", { "😄": 15 }, 17],
    ["balik", "Bitmiyor, yer değiştiriyor.", { "❤️": 22 }, 16, 1],
  ]);
  on("sz-2:0.4", "Kusurun, eskimenin ve eksikliğin içindeki güzellik.", [
    ["ari", "Bu kelimeyi herkes biliyor ama tanımı hep yanlış hatırlıyor.", { "💯": 18 }, 15],
    ["sincap", "Kırık bir fincanı attıktan sonra bunu okudum, üzüldüm.", { "😄": 29, "❤️": 11 }, 14],
    ["guvercin", "Altın yapıştırıcıyla tamir etmek de bunun bir parçası değil mi?", { "👀": 13 }, 13],
  ]);

  on("sz-3:1", "pahalıya çevirmektir", [
    ["yelkovan", "Çevirmen olarak: bu cümleyi çerçeveletip masaya koyacağım.", { "❤️": 34, "💯": 15 }, 12],
    ["karga", "Yine de bazı şeyler gerçekten çevrilemiyor. Hepsi fiyat meselesi değil.", { "🤔": 12 }, 11],
  ]);
  on("sz-3:2", "Çevrilemez diye bir şey yok.", [
    ["nilufer", "İddialı ama katılıyorum.", { "❤️": 22 }, 10],
    ["kurbaga", "Şiir çevirisi yapmış biri olarak: katılmıyorum ama tartışmayı seviyorum.", { "🤔": 19, "😄": 5 }, 9],
    ["ayi", "İkiniz de haklısınız, mesele neyi kaybetmeye razı olduğun.", { "💯": 24 }, 8],
  ]);

  /* ========================================================================
     07-08 · BULMACA ve SAYI SONU
     ===================================================================== */

  on("bl-1:2", null, [
    ["sincap", "Bana kelime avı ile haiku çıktı. İkisi de yazıyla bağlantılı, hoş olmuş.", { "👍": 17 }, 12],
    ["kedi", "Bende renk dizisi vardı, hiç tutmadı. Bir daha sorsa iyi olur.", { "🤔": 8 }, 11],
  ]);
  loose("bl-1", [
    ["horoz", "Haiku bulmacasında ikinci soruyu üç kere okudum, cevap çok güzeldi.", { "❤️": 15 }, 10],
  ]);
  loose("son-1", [
    ["kaplumbaga", "Bitirdim. Uzun zamandır bir şeyi bitirmemiştim, iyi geldi.", { "❤️": 41, "🍁": 12 }, 6],
    ["yildiz", "Ben de bitirdim ama en az modunda. Şimdi klasikten tekrar okuyacağım.", { "❤️": 19 }, 5],
    ["kelebek", "Gelecek sayının adı “Islak Asfalt” mı? Şimdiden bekliyorum.", { "🔥": 23 }, 4],
    ["guvercin", "Aynı sayıyı üç derinlikte okuyup karşılaştıran biri var mı? Merak ediyorum.", { "👀": 14 }, 3],
    ["kunduz", "Ben yaptım. En az mod bir özet değil, ayrı bir yazı gibi. Beklemiyordum.", { "🤯": 21 }, 2, 3],
  ]);

  /* ========================================================================
     ONAY KUYRUĞU — moderasyon paneli boş durmasın.
     Bu yorumlar hiçbir okura görünmez (status: pending); yalnızca editörün
     kuyruğunda beklerler. Biri bilerek reddedilmeye değer.
     ===================================================================== */

  on("km-1:0", "renk her gün yaklaşık yirmi metre iner", [
    ["geyik", "bunu nerden uyduruyorsunuz", {}, 3, null, { status: "pending" }],
  ]);
  on("km-3:3", "Tamamlanmış güzellik durur. Yarım güzellik ilerler.", [
    ["kedi", "Cümlenin kaynağı sanırım bir Zen metni. Emin değilim ama araştırıyorum, bulursam yazarım.", {}, 4, null, { status: "pending" }],
  ]);
  on("sy-2:2", null, [
    ["balik", "Usta hâlâ sipariş alıyor mu? İletişim bilgisi paylaşılır mı?", {}, 2, null, { status: "pending" }],
  ]);
  pin("gh-3", 0.44, 0.7, [
    ["horoz", "Bu adamı tanıyorum galiba, komşumuz. Kendisine sorayım.", {}, 5, null, { status: "pending" }],
  ]);
  loose("mn-4", [
    ["karga", "aynısını başka bir yerde görmüştüm kopya mı bu", {}, 6, null, { status: "pending" }],
  ]);

  /* ------------------------------------------------------------------------
     TESLİM
     Eski tohumların yerini bu liste aldı; data.js artık yalnızca içerik.
     --------------------------------------------------------------------- */

  D.comments = out;
})(window.MAG);
