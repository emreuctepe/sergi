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
          bg: "img:assets/2026-09/kapak.webp",
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
          bg: "img:assets/2026-09/sisli-vadi.webp",
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
          bg: "img:assets/2026-09/tapinak.webp",
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
          bg: "img:assets/2026-09/yaprak.webp",
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
          bg: "img:assets/2026-09/tren.webp",
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
          bg: "img:assets/2026-09/fener.webp",
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
          bg: "img:assets/2026-09/yagmur.webp",
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
      slug: "kapali-kapilar",
      type: "manga",
      title: "Kapalı Kapılar",
      kicker: "One-shot",
      author: "KARGAMANGA",
      minutes: 2,
      /* Soldan sağa kurgulanmış bir dikey şerit — Japon one-shot'ı değil,
         o yüzden rtl yok ve açılışta rtlhint gösterilmiyor. */
      direction: "ltr",
      tags: ["manga", "kurgu"],
      pages: [
        {
          id: "mn-acilis",
          depth: ["all"],
          fit: "contain",
          bleed: "full",
          bg: "img:assets/2026-09/kapali-kapilar/03.webp",
          scene: "mask-wipe",
          kind: "opener",
          blocks: [
            { t: "kicker", text: "Bu sayıya özel one-shot", invert: true },
            { t: "h1", text: "Kapalı Kapılar", invert: true },
            { t: "lead", invert: true, text: "7 kare · KARGAMANGA · aşağı kaydırarak okunur" },
          ],
        },
        {
          id: "mn-1",
          depth: ["all"],
          fit: "scroll",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 1,
              layout: "dikey",
              dir: "ltr",
              panels: [
                {
                  img: "assets/2026-09/kapali-kapilar/01.webp",
                  alt: "Şehrin önünde duran genç; arkasında soluk bir siluet.",
                  text: "kapılarım kapalı…",
                },
                {
                  img: "assets/2026-09/kapali-kapilar/02.webp",
                  alt: "Ardında gökkuşağı renginde bir halka olan genç kadın.",
                  text: "neden herkese kapılarını kapatıyorsun?",
                },
                {
                  img: "assets/2026-09/kapali-kapilar/03.webp",
                  alt: "Alacakaranlıkta üst geçitte birbirinden uzaklaşan iki siluet.",
                  text: "Madem yalnız kalmaktan bu kadar korkuyorsun…",
                },
              ],
            },
          ],
        },
        {
          id: "mn-2",
          depth: ["all"],
          fit: "scroll",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 2,
              layout: "dikey",
              dir: "ltr",
              panels: [
                {
                  img: "assets/2026-09/kapali-kapilar/04.webp",
                  alt: "Genç kadının yakın plan yüzü; arkasında halkanın bir parçası.",
                  text: [
                    { text: "sadece gerçekten gelmek isteyenler gelebilir…" },
                    { text: "ya kimse gelmezse?", at: "alt" },
                  ],
                },
                {
                  img: "assets/2026-09/kapali-kapilar/05.webp",
                  alt: "Gencin profilden görünüşü; arkada raylar ve gün batımı.",
                },
                {
                  img: "assets/2026-09/kapali-kapilar/06.webp",
                  alt: "Bir gözün çok yakın planı.",
                  text: "kilitli değiller…",
                },
              ],
            },
          ],
        },
        {
          id: "mn-3",
          depth: ["all"],
          fit: "scroll",
          kind: "manga",
          scene: "panel-reveal",
          blocks: [
            {
              t: "manga",
              page: 3,
              layout: "dikey",
              dir: "ltr",
              panels: [
                {
                  img: "assets/2026-09/kapali-kapilar/07.webp",
                  alt: "Gece göğünde hilal ve pembe bulutlar.",
                  text: "İşte o zaman istemeyeceğim kadar kafamı dinlerim.",
                  kind: "narrate",
                },
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
          bg: "img:assets/2026-09/dalga.webp",
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
          bg: "img:assets/2026-09/yaprak.webp",
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
                { term: "KARGAMANGA", def: "One-shot: Kapalı Kapılar — izinle yayımlandı · [PIGMENT](https://www.youtube.com/shorts/XaK1Acfo8ZE)" },
                { term: "Aslı Ün", def: "Sözlük · illüstrasyon — [@asliun](https://example.com)" },
              ],
            },
            { t: "rule" },
            { t: "h3", text: "Görseller" },
            {
              t: "p",
              text: "Sayfa görselleri Wikimedia Commons'tan alınmıştır. CC BY / CC BY-SA lisanslı olanlar için atıf zorunludur; CC BY-SA görseller aynı lisansla paylaşılır.",
            },
            {
              t: "list",
              style: "dict",
              items: [
                { term: "One-shot", def: "Kapalı Kapılar, 7 kare — KARGAMANGA / PIGMENT · telif sahibinde, izinle" },
                { term: "Kapak", def: "Fushimi Inari torii — Balon Greyjoy · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)" },
                { term: "Kızıl yaprak", def: "Enko-ji, Kyoto — lumoplank · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)" },
                { term: "Taş fener", def: "Kenroku-en, Kanazawa — DimiTalen · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)" },
                { term: "Sisli vadi", def: "An Autumn Morning — Jaroslav Vosáhlo · [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)" },
                { term: "Yağmur", def: "Sensō-ji, Asakusa — Maarten Heerlien · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)" },
                { term: "Tapınak", def: "Momiji, Daigo-ji — Suicasmo · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)" },
                { term: "Tren", def: "Matsumoto İstasyonu — Tohnass · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)" },
                { term: "Dalga", def: "Breaking wave by rock — Nuwan Devinda · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)" },
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
          bg: "img:assets/2026-09/yaprak.webp",
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
      blurb: "One-shot'ın kareleri karıştı. Okuma sırasına göre diz.",
      tags: ["görsel", "içerik-bağlı"],
      difficulty: 1,
      estMinutes: 2,
      icon: "🀄",
      config: { panels: 7 },
      stats: { plays: 980, solves: 861, firstTryRate: 0.52, avgSeconds: 96 },
    },
  ];


  /* ------------------------------------------------------------------------
     TESLİM — içerik kaydı. Aktif sayı seçimi js/data.js'te.
     --------------------------------------------------------------------- */

  (MAG.issues = MAG.issues || {})[D.issue.slug] = D;
})(window.MAG);
