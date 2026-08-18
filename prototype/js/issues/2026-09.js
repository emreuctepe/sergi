/* ============================================================================
   SAYI 03 · "Kızıl Mevsim" — 2026-09
   ----------------------------------------------------------------------------
   Bir sayının içeriği. Gerçek üründe bu dosya `packages/content` derleyicisinin
   `content/issues/2026-09/` altındaki Markdown'dan ürettiği JSON'un birebir
   aynısıdır:  Issue → Section → Page[] → Block[]
   Yani prototipi gerçeğe bağlamak = bu dosyayı derleyici çıktısıyla değiştirmek.

   Sayfa direktifleri Markdown'da şöyle görünürdü:
       :::page {depth: mid full, scene: parallax, fit: scroll}
   Burada aynı bilgi alan olarak duruyor: { depth, scene, fit }.

   Kayıt: dosya yüklenince kendini MAG.issues'a yazar. Hangi sayının açılacağına
   js/data.js karar verir. Yorumlar ayrı dosyada: issues/2026-09.comments.js.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var D = {};

  /* ========================================================================
     SAYI
     ===================================================================== */

  D.issue = {
    slug: "2026-09",
    number: 3,
    title: "Kızıl Mevsim",
    subtitle: "Sonbaharın ilk haftası, bir şehrin rengi değişirken",
    publishedAt: "2026-09-01",
    colophon: "Aylık · Eylül 2026 · Tek kişilik editöryel",
    editorsPick: "haiku-tamamla",
    puzzlePool: ["kelime-avi", "renk-dizisi", "haiku-tamamla", "panel-sirala"],
    next: { date: "1 Ekim 2026", title: "Gürültü" },
  };
  /* ========================================================================
     TANITIM (about) — ilk ziyarette, kaydırmalı, ~12 saniye
     ===================================================================== */

  D.intro = [
    {
      scene: "paper",
      big: "Bu bir dergi.",
      small: "Akış değil. Başlıyor ve bitiyor.",
    },
    {
      scene: "leaves",
      big: "Ayda bir sayı.",
      small: "Bir oturuşta okunur. Sonra kapanır ve gelecek ayı bekler.",
    },
    {
      scene: "waves",
      big: "Üç okuma derinliği.",
      small: "Acelen varsa en az. Vaktin varsa klasik. Aynı sayı, üç farklı uzunluk.",
    },
    {
      scene: "street",
      big: "Nereye istersen yorum yaz.",
      small: "Bir cümlenin altına, bir fotoğrafın köşesine. Hesap açmana gerek yok.",
    },
    {
      scene: "torii",
      big: "Hazırsan başlayalım.",
      small: "Sayı 03 · Kızıl Mevsim",
      last: true,
    },
  ];

  /* ========================================================================
     BÖLÜMLER
     ===================================================================== */

  D.sections = [
    /* --------------------------------------------------------------------
       00 · KAPAK
       ----------------------------------------------------------------- */
    {
      slug: "kapak",
      type: "cover",
      title: "Kapak",
      pages: [
        {
          id: "kapak-1",
          depth: ["all"],
          kind: "cover",
          fit: "contain",
          bleed: "full",
          bg: "scene:torii",
          scene: "mask-wipe",
          blocks: [{ t: "cover" }],
        },
      ],
    },

    /* --------------------------------------------------------------------
       01 · EDİTÖRDEN
       ----------------------------------------------------------------- */
    {
      slug: "editorden",
      type: "article",
      title: "Editörden",
      kicker: "Sunuş",
      author: "Emre",
      minutes: 2,
      tags: ["editoryel"],
      pages: [
        {
          id: "ed-1",
          depth: ["all"],
          fit: "contain",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Sunuş" },
            { t: "h1", text: "Renk, aslında bir veda" },
            { t: "byline", author: "Emre", role: "editör", minutes: 2 },
            { t: "rule" },
            {
              t: "p",
              drop: true,
              text: "Yaprağın kızıla dönmesi bir başlangıç gibi görünür ama değildir. Ağaç o rengi üretmez; sadece yeşili geri çeker. Geriye kalan, hep orada olan renktir.",
            },
            {
              t: "p",
              text: "Bu sayıyı da öyle kurduk. Yeni bir şey eklemedik — sadece gürültüyü çektik. Geriye ne kaldığına bakıyoruz.",
            },
          ],
        },
        {
          id: "ed-2",
          depth: ["mid", "full"],
          fit: "contain",
          scene: "fade-up",
          blocks: [
            {
              t: "p",
              text: "Eylülde bir şehrin nasıl renk değiştirdiğini anlatan uzun bir yazı var. Gece yarısı son trenden inen insanları takip eden bir foto-öykü. Kırk yıldır kâğıt fener yapan bir ustayla söyleşi. Ve bu ay ilk kez, sayıya özel çizilmiş bir one-shot.",
            },
            {
              t: "pull",
              text: "Bitişi olan bir şey okumayı özlediysen, doğru yerdesin.",
            },
            {
              t: "p",
              text: "Aşağı kaydır. Beğendiğin cümlenin üstüne parmağını basılı tut — orada bir şey söyleyebilirsin.",
            },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       02 · UZUN YAZI — üç derinlik burada gerçekten ayrışıyor
       ----------------------------------------------------------------- */
    {
      slug: "kizil-mevsim",
      type: "article",
      title: "Kızıl Mevsim",
      kicker: "Dosya",
      author: "Emre",
      minutes: 11,
      tags: ["gezi", "mevsim"],
      pages: [
        /* açılış — her derinlikte */
        {
          id: "km-acilis",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "scene:mountains",
          scene: "parallax",
          kind: "opener",
          blocks: [
            { t: "kicker", text: "Dosya · Mevsim", invert: true },
            { t: "h1", text: "Kızıl Mevsim", invert: true, big: true },
            {
              t: "lead",
              invert: true,
              text: "Sonbahar bir tarih değil, bir yükseklik meselesidir. Dağdan aşağı iner — günde yaklaşık yirmi metre.",
            },
            { t: "byline", author: "Emre", role: "yazı ve fotoğraflar", minutes: 11, invert: true },
          ],
        },

        /* ---- EN AZ: tek sayfa, madde madde ---- */
        {
          id: "km-min",
          depth: ["min"],
          fit: "contain",
          scene: "stagger",
          blocks: [
            { t: "kicker", text: "Kısaca" },
            { t: "h2", text: "Üç cümlede sonbahar" },
            {
              t: "list",
              style: "num",
              items: [
                "Renk kuzeyden güneye, yüksekten alçağa iner. Günde 20 metre, haftada bir ilçe.",
                "En iyi hafta ayın ikinci haftasıdır; birinci hafta erken, üçüncü hafta kalabalıktır.",
                "Kırmızıyı bekleme. En güzel an, yeşille kızılın aynı dalda durduğu üç gündür.",
              ],
            },
            { t: "rule" },
            {
              t: "note",
              text: "Bu, yazının en kısa hâli. Aynı yazıyı daha uzun okumak için üst çubuktan okuma derinliğini değiştir.",
            },
          ],
        },

        /* ---- ORTA + KLASİK: ortak gövde ---- */
        {
          id: "km-1",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            {
              t: "p",
              drop: true,
              text: "Eylülün ilk günü hiçbir şey olmaz. İkinci haftasında, kuzeydeki bir dağın tepesinde, kimsenin görmediği bir yerde ilk yaprak döner. Oradan sonra iş matematiğe kalır: renk her gün yaklaşık yirmi metre iner, her hafta bir ilçe aşağı kayar.",
            },
            {
              t: "p",
              text: "Bunu ilk duyduğumda inanmadım. Bir mevsimin hız birimi olmasını saçma buldum. Sonra üç yıl üst üste aynı yamaca aynı tarihlerde çıktım ve gerçekten öyle olduğunu gördüm.",
            },
            {
              t: "pull",
              text: "Bir mevsimin hızı vardır ve o hız ölçülebilir. Bunu bilmek, beklemeyi değiştirir.",
            },
            {
              t: "p",
              text: "Şehirde bunu fark etmek zordur. Beton geceleri ısıyı tutar, ağaçlar kararsız kalır. Bu yüzden şehrin sonbaharı hep birkaç gün geç gelir ve daha kısa sürer — sanki aceleye gelmiş gibi.",
            },
          ],
        },
        {
          id: "km-2",
          depth: ["mid", "full"],
          fit: "contain",
          bleed: "full",
          bg: "scene:temple",
          scene: "mask-wipe",
          kind: "figure",
          blocks: [
            {
              t: "caption",
              invert: true,
              text: "Ayın ikinci haftası, sabah yedi. Kalabalık henüz otobüslerde.",
            },
          ],
        },
        {
          id: "km-3",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            { t: "h2", text: "Kalabalıkla yarışmak" },
            {
              t: "p",
              text: "Herkes aynı üç günü bilir. Sorun renk değil, aynı anda aynı yere bakan yedi bin kişidir. Çözüm basit ama kimse uygulamaz: bir hafta erken gel.",
            },
            {
              t: "p",
              text: "Erken gelmek, yarısı hâlâ yeşil bir yamacı görmek demektir. Fotoğrafta iyi durmaz. Ama gözle bakınca, tam olgunlaşmış kızıldan daha iyidir — çünkü hareket vardır. Bir şey olmaktadır.",
            },
            {
              t: "quote",
              text: "Tamamlanmış güzellik durur. Yarım güzellik ilerler.",
              by: "bir bahçıvanın söylediği, kaynağını bilmediğim söz",
            },
          ],
        },

        /* ---- YALNIZCA KLASİK: derinlemesine bölüm ---- */
        {
          id: "km-4",
          depth: ["full"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            { t: "kicker", text: "Yalnızca klasik modda" },
            { t: "h2", text: "Rengin kimyası, kısaca" },
            {
              t: "p",
              text: "Yaprağın yeşili klorofildendir ve klorofil pahalıdır — ağaç onu sürekli üretmek zorundadır. Gün kısalıp ışık azalınca üretim durur. Altta bekleyen karotenoidler ortaya çıkar: sarı, turuncu.",
            },
            {
              t: "p",
              text: "Kırmızı ise farklıdır. Antosiyanin denen o pigment, yaprak ölürken *yeni* üretilir. Yani ağaç, veda ederken masrafa girer. Neden yaptığı hâlâ tam bilinmiyor; en güçlü tahmin, güneş yanığına karşı bir gölgelik kurduğu.",
            },
            {
              t: "stat",
              items: [
                { k: "Günlük iniş", v: "~20 m" },
                { k: "İdeal aralık", v: "3 gün" },
                { k: "Şehir gecikmesi", v: "4-6 gün" },
              ],
            },
            {
              t: "p",
              text: "Bu bilgiyi öğrendikten sonra bir daha aynı gözle bakamadım. Kızıl, ağacın son işidir. Bitirmeden önce yaptığı en gösterişli şey.",
            },
          ],
        },
        {
          id: "km-5",
          depth: ["full"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            { t: "h2", text: "Üç yamaç, üç ders" },
            {
              t: "list",
              style: "dict",
              items: [
                { term: "Kuzey yamacı", def: "Önce döner, çabuk döker. Erken gitmek zorundasın; ödülü tenhalık." },
                { term: "Güney yamacı", def: "Geç döner, uzun tutar. Kalabalığın kaçırdığı ikinci bir hafta verir." },
                { term: "Vadi tabanı", def: "Sis. Renk zayıf ama sabahın ilk saatinde ışık her şeyi affeder." },
              ],
            },
            {
              t: "p",
              text: "Üç yıl sonra kendi kuralımı yazdım: kalabalığın gittiği yere iki gün önce git, kalabalığın gitmediği yere istediğin zaman.",
            },
          ],
        },

        /* ---- imza sahne: her derinlikte, kapanış ---- */
        {
          id: "km-imza",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "scene:leaves",
          scene: "signature",
          kind: "signature",
          blocks: [
            { t: "pull", text: "Renk gelmiyor. Yeşil gidiyor.", big: true },
            { t: "caption", text: "Kızıl Mevsim · son" },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       03 · FOTO-ÖYKÜ
       ----------------------------------------------------------------- */
    {
      slug: "gece-hatti",
      type: "gallery",
      title: "Gece Hattı",
      kicker: "Foto-öykü",
      author: "Emre",
      minutes: 4,
      tags: ["gece", "sehir"],
      pages: [
        {
          id: "gh-acilis",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "scene:city",
          scene: "mask-wipe",
          kind: "opener",
          blocks: [
            { t: "kicker", text: "Foto-öykü", invert: true },
            { t: "h1", text: "Gece Hattı", invert: true },
            {
              t: "lead",
              invert: true,
              text: "Son trenden inen yüz kırk kişi. Hepsi aynı yöne yürüyor ve kimse konuşmuyor.",
            },
          ],
        },
        {
          id: "gh-1",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "photo:101",
          scene: "fade-up",
          kind: "photo",
          blocks: [{ t: "caption", invert: true, text: "00:12 — Peronda son anons. Kimse acele etmiyor." }],
        },
        {
          id: "gh-2",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "photo:102",
          scene: "fade-up",
          kind: "photo",
          blocks: [{ t: "caption", invert: true, text: "00:19 — Turnikeler. Tek ses, kartların çıkardığı ses." }],
        },
        {
          id: "gh-3",
          depth: ["mid", "full"],
          fit: "contain",
          bleed: "full",
          bg: "photo:103",
          scene: "fade-up",
          kind: "photo",
          blocks: [{ t: "caption", invert: true, text: "00:26 — Merdivenin ortasında duran adam. Telefonuna değil, yukarı bakıyor." }],
        },
        {
          id: "gh-4",
          depth: ["full"],
          fit: "contain",
          bleed: "full",
          bg: "photo:104",
          scene: "fade-up",
          kind: "photo",
          blocks: [{ t: "caption", invert: true, text: "00:31 — Çıkışta açık kalan tek dükkân. Işığı sokağa taşıyor." }],
        },
        {
          id: "gh-5",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "scene:rain",
          scene: "fade-up",
          kind: "photo",
          blocks: [{ t: "caption", invert: true, text: "00:44 — Yağmur başladı. Kalabalık kırk saniyede dağıldı." }],
        },
      ],
    },

    /* --------------------------------------------------------------------
       04 · SÖYLEŞİ
       ----------------------------------------------------------------- */
    {
      slug: "soylesi",
      type: "interview",
      title: "Fener Ustası",
      kicker: "Söyleşi",
      author: "Emre",
      minutes: 6,
      tags: ["zanaat", "portre"],
      pages: [
        {
          id: "sy-acilis",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "scene:portrait",
          scene: "mask-wipe",
          kind: "opener",
          blocks: [
            { t: "kicker", text: "Söyleşi", invert: true },
            { t: "h1", text: "“Kâğıt ışığı yumuşatır, cam sertleştirir”", invert: true },
            { t: "lead", invert: true, text: "Kırk bir yıldır kâğıt fener yapan bir ustayla, atölyesinde." },
          ],
        },
        {
          id: "sy-1",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            { t: "dialog", who: "q", text: "Kaç fener yaptınız?" },
            { t: "dialog", who: "a", name: "Usta", text: "Bilmiyorum. Saymayı otuz yıl önce bıraktım. Ama her yıl aynı sayıda yapıyorum, yani sayabilirsin." },
            { t: "dialog", who: "q", text: "Neden aynı sayıda?" },
            { t: "dialog", who: "a", name: "Usta", text: "Çünkü elim o kadarına yetiyor. Daha fazlasını yapsam, fazlası kötü olur. Kötü fener yapmak, fener yapmamaktan daha kötüdür." },
          ],
        },
        {
          id: "sy-2",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            { t: "pull", text: "“Kötü fener yapmak, fener yapmamaktan daha kötüdür.”" },
            { t: "dialog", who: "q", text: "Makineyle üretilenler için ne düşünüyorsunuz?" },
            { t: "dialog", who: "a", name: "Usta", text: "Güzeller. Cidden. Ucuzlar ve dayanıyorlar. Sorun onlarda değil, bizde: artık farkı görmüyoruz. Fark görülmeyince, fark yok demektir." },
            { t: "dialog", who: "q", text: "Fark ne peki?" },
            { t: "dialog", who: "a", name: "Usta", text: "Kâğıt ışığı yumuşatır, cam sertleştirir. Bir odaya kâğıt fener koyduğunda insanlar daha alçak sesle konuşur. Bunu ölçemezsin ama olur." },
          ],
        },
        {
          id: "sy-3",
          depth: ["full"],
          fit: "scroll",
          scene: "fade-up",
          blocks: [
            { t: "dialog", who: "q", text: "Devam edecek biri var mı?" },
            { t: "dialog", who: "a", name: "Usta", text: "Yeğenim üç yıl geldi, sonra gitti. Kızmadım. Bu iş sabır değil, tekrar istiyor. Sabır romantiktir; tekrar sıkıcıdır. İnsanlar sıkıcı olanı sevmiyor." },
            { t: "dialog", who: "q", text: "Siz nasıl dayandınız?" },
            { t: "dialog", who: "a", name: "Usta", text: "Ben de sevmedim. Sadece bırakmadım. İkisi farklı şeyler." },
            { t: "rule" },
            { t: "note", text: "Söyleşi eylülün ilk haftasında, atölyesinde yapıldı. Kısaltıldı." },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       05 · ONE-SHOT MANGA
       ----------------------------------------------------------------- */
    {
      slug: "son-tren",
      type: "manga",
      title: "Son Tren",
      kicker: "One-shot",
      author: "—",
      minutes: 5,
      direction: "rtl",
      tags: ["manga", "kurgu"],
      pages: [
        {
          id: "mn-acilis",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "scene:moon",
          scene: "mask-wipe",
          kind: "opener",
          blocks: [
            { t: "kicker", text: "Bu sayıya özel one-shot", invert: true },
            { t: "h1", text: "Son Tren", invert: true },
            { t: "lead", invert: true, text: "8 sayfa · sağdan sola okunur" },
            { t: "rtlhint" },
          ],
        },
        {
          id: "mn-1",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 1,
              layout: "3-üst-1-alt",
              panels: [
                { art: 0, text: "Yine kaçırdım.", kind: "think" },
                { art: 4, text: "" },
                { art: 2, text: "Son tren 00:41'de." },
                { art: 1, text: "Şimdi 00:43.", kind: "narrate" },
              ],
            },
          ],
        },
        {
          id: "mn-2",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 2,
              layout: "2-üst-2-alt",
              panels: [
                { art: 3, text: "Peron boş." },
                { art: 5, text: "" },
                { art: 1, text: "— Sen de mi kaçırdın?" },
                { art: 0, text: "Dönüp baktım.", kind: "narrate" },
              ],
            },
          ],
        },
        {
          id: "mn-3",
          depth: ["mid", "full"],
          fit: "contain",
          bleed: "full",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 3,
              layout: "1-buyuk-2-kucuk",
              panels: [
                { art: 4, text: "Her cuma buradayım.", kind: "" },
                { art: 2, text: "Neden?" },
                { art: 5, text: "Çünkü sabahın ilk treni saat beşte." },
              ],
            },
          ],
        },
        {
          id: "mn-4",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 4,
              layout: "3-üst-1-alt",
              panels: [
                { art: 3, text: "Dört saat." },
                { art: 1, text: "Dört saat.", kind: "think" },
                { art: 0, text: "" },
                { art: 5, text: "Şehir o dört saatte başka bir şehir oluyor.", kind: "narrate" },
              ],
            },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       06 · KISA SÖZLÜK
       ----------------------------------------------------------------- */
    {
      slug: "sozluk",
      type: "list",
      title: "Beş Kelime",
      kicker: "Sözlük",
      author: "Emre",
      minutes: 3,
      tags: ["dil"],
      pages: [
        {
          id: "sz-1",
          depth: ["all"],
          fit: "contain",
          scene: "stagger",
          bg: "scene:waves",
          blocks: [
            { t: "kicker", text: "Sözlük" },
            { t: "h1", text: "Bu ayın beş kelimesi" },
            { t: "rule" },
            { t: "lead", text: "Tek kelimeyle söylenip cümlelerle çevrilen beşli." },
          ],
        },
        {
          id: "sz-2",
          depth: ["all"],
          fit: "contain",
          scene: "fade-up",
          blocks: [
            {
              t: "list",
              style: "dict",
              items: [
                { term: "Mono no aware", def: "Şeylerin geçiciliğinden doğan tatlı hüzün. Yaprağın döküleceğini bilerek ona bakmak." },
                { term: "Komorebi", def: "Yaprakların arasından süzülen ışık. Işığın kendisi değil, yaprakla arasındaki iş." },
                { term: "Shinrin-yoku", def: "Orman banyosu. Yürümek değil, sadece ormanda bulunmak." },
                { term: "Yūgen", def: "Anlatılamayacak kadar derin olanın verdiği his. Sisin ardındaki dağ." },
                { term: "Wabi-sabi", def: "Kusurun, eskimenin ve eksikliğin içindeki güzellik." },
              ],
            },
          ],
        },
        {
          id: "sz-3",
          depth: ["mid", "full"],
          fit: "contain",
          scene: "fade-up",
          blocks: [
            { t: "h2", text: "Bir not" },
            {
              t: "p",
              text: "Bu kelimelerin çevrilemez olduğu söylenir. Doğru değil — çevrilebilirler, sadece uzun sürer. Tek kelimeyle söylenen bir şeyi üç cümleyle söylemek, çevirememek değildir; pahalıya çevirmektir.",
            },
            { t: "pull", text: "Çevrilemez diye bir şey yok. Sadece pahalı çeviri var." },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       07 · BULMACA
       ----------------------------------------------------------------- */
    {
      slug: "bulmaca",
      type: "puzzle",
      title: "Bulmaca",
      kicker: "Oyun",
      minutes: 8,
      tags: ["oyun"],
      pages: [
        {
          id: "bl-1",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          kind: "puzzle",
          blocks: [
            { t: "kicker", text: "Oyun" },
            { t: "h1", text: "Bu ayın bulmacası" },
            { t: "lead", text: "Bu ayın bulmacası. Çöz, sonucunu okurlarla karşılaştır." },
            { t: "puzzleSlots" },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       08 · SAYI SONU
       ----------------------------------------------------------------- */
    {
      slug: "son",
      type: "outro",
      title: "Sayı sonu",
      pages: [
        {
          id: "son-kunye",
          depth: ["all"],
          fit: "contain",
          scene: "fade-up",
          bg: "scene:leaves",
          blocks: [
            { t: "kicker", text: "Künye" },
            { t: "h2", text: "Bu sayıda emeği geçenler" },
            { t: "rule" },
            {
              t: "list",
              style: "dict",
              items: [
                { term: "Emre Üçtepe", def: "Editör · söyleşi — [@emreuctepe](https://example.com)" },
                { term: "Deniz Kaya", def: "Foto-öykü: Gece Hattı — [@denizkaya](https://example.com)" },
                { term: "Selin Aydın", def: "Kızıl Mevsim yazısı — [@selinaydin](https://example.com)" },
                { term: "Mert Doğan", def: "One-shot: Son Tren — [@mertdogan](https://example.com)" },
                { term: "Aslı Ün", def: "Sözlük · illüstrasyon — [@asliun](https://example.com)" },
              ],
            },
          ],
        },
        {
          id: "son-1",
          depth: ["all"],
          fit: "scroll",
          kind: "outro",
          scene: "fade-up",
          bg: "scene:leaves",
          blocks: [{ t: "outro" }],
        },
      ],
    },
  ];

  /* ========================================================================
     BULMACA HAVUZU  (puzzles/<id>/puzzle.json karşılığı)
     ===================================================================== */

  D.puzzles = [
    {
      id: "kelime-avi",
      name: "Kelime Avı",
      blurb: "Kızıl Mevsim yazısından altı kelime, ızgarada saklı.",
      tags: ["kelime", "içerik-bağlı"],
      difficulty: 2,
      estMinutes: 4,
      icon: "🔤",
      config: {
        size: 9,
        words: ["KIZIL", "YAPRAK", "SISLI", "VADI", "TREN", "FENER"],
      },
      stats: { plays: 1284, solves: 903, firstTryRate: 0.34, avgSeconds: 214 },
    },
    {
      id: "renk-dizisi",
      name: "Renk Dizisi",
      blurb: "Sayının paletini hatırla. Her turda bir renk daha ekleniyor.",
      tags: ["görsel", "mantık"],
      difficulty: 3,
      estMinutes: 3,
      icon: "🎨",
      config: { rounds: 8 },
      stats: { plays: 2011, solves: 742, firstTryRate: 0.12, avgSeconds: 168 },
    },
    {
      id: "haiku-tamamla",
      name: "Haiku Tamamla",
      blurb: "Üç haiku, üç eksik satır. Hece sayısı tutmalı.",
      tags: ["kelime", "içerik-bağlı"],
      difficulty: 2,
      estMinutes: 5,
      icon: "🍁",
      editorsNote: "Bu sayının yazısıyla aynı nefesi taşıdığı için seçtim.",
      config: {
        items: [
          {
            lines: ["Dağdan iniyor —", "___", "yirmi metre her gün"],
            options: ["kızıl bir yavaşlık", "otobüs kalabalığı", "telefonun ışığı"],
            answer: 0,
          },
          {
            lines: ["Son tren gitti", "peronda iki kişi", "___"],
            options: ["ve dört saatlik şehir", "bilet makinesi bozuk", "yarın yine cuma"],
            answer: 0,
          },
          {
            lines: ["___", "kâğıdın ardında", "ses alçalıyor"],
            options: ["Fenerin içinde", "Cam sertleştirir", "Atölye kapalı"],
            answer: 0,
          },
        ],
      },
      stats: { plays: 1640, solves: 1201, firstTryRate: 0.41, avgSeconds: 243 },
    },
    {
      id: "panel-sirala",
      name: "Panel Sırala",
      blurb: "One-shot'ın panelleri karıştı. Sağdan sola doğru sırala.",
      tags: ["görsel", "içerik-bağlı"],
      difficulty: 1,
      estMinutes: 2,
      icon: "🀄",
      config: { panels: 5 },
      stats: { plays: 980, solves: 861, firstTryRate: 0.52, avgSeconds: 96 },
    },
  ];


  /* ------------------------------------------------------------------------
     TESLİM — içerik kaydı. Aktif sayı seçimi js/data.js'te.
     --------------------------------------------------------------------- */

  (MAG.issues = MAG.issues || {})[D.issue.slug] = D;
})(window.MAG);
