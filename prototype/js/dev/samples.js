/* ============================================================================
   DEV · SAMPLES — blok/sahne şablonlarının TEK KAYNAĞI
   ----------------------------------------------------------------------------
   Hem katalog (js/dev/catalog.js) hem canlı editör (js/dev/editor.js) buradan
   beslenir. Buraya bir örnek eklersen, ikisinde de belirir.

   Her blok girişi:
     { t, label, note, sample, dark? }
       t      → render.js BLOCKS anahtarı
       label  → kataloğdaki insan-okur ad
       note   → ne zaman kullanılır (kısa)
       sample → data.js'e yapıştırılabilir GERÇEK blok nesnesi
       dark   → koyu zeminde gösterilmeli (invert / overlay blok)

   Bu dosya yalnızca dev.html'de yüklenir; üretim index.html'ine girmez.
   ========================================================================= */
window.MAG = window.MAG || {};

(function (MAG) {
  "use strict";
  var DEV = (MAG.dev = MAG.dev || {});

  /* --- BLOKLAR --------------------------------------------------------------
     Sıra kataloğdaki gruplamayı da verir. `group` başlıkları katalog çizer. */
  DEV.blocks = [
    /* — Başlıklar — */
    { group: "Başlıklar" },
    { t: "kicker", label: "Üst başlık (kicker)", note: "Bölüm/dosya etiketi; başlığın üstünde küçük.", sample: { t: "kicker", text: "Dosya · Ekim" } },
    { t: "h1", label: "Ana başlık (h1)", note: "Sayfa başına bir tane. `big:true` dev boy.", sample: { t: "h1", text: "Sen hedef değilsin, kapısın" } },
    { t: "h1", label: "Ana başlık — büyük", note: "Açılış/opener sayfaları için.", sample: { t: "h1", big: true, text: "Gürültü" } },
    { t: "h2", label: "Alt başlık (h2)", sample: { t: "h2", text: "Üç antenle bulunuyorsun" } },
    { t: "h3", label: "Küçük başlık (h3)", sample: { t: "h3", text: "Ne yapmalı?" } },

    /* — Metin — */
    { group: "Metin" },
    { t: "lead", label: "Giriş cümlesi (lead)", note: "Başlıktan sonra tek güçlü cümle.", sample: { t: "lead", text: "Cebindeki telefon, ekranı kapalıyken bile bağırıyor." } },
    { t: "p", label: "Paragraf (p)", note: "Gövde. `*italik*`, `**kalın**`, `` `kod` ``, `[bağ](url)` çalışır.", sample: { t: "p", text: "Çünkü kimse seninle uğraşmıyor. Uğraşmak, birini **seçmek** demek — ve kimse seni seçmiyor." } },
    { t: "p", label: "Paragraf — drop cap", note: "Bölümün ilk paragrafı; büyük ilk harf.", sample: { t: "p", drop: true, text: "Kadıköy'de bir akşam. İskeleden çıkıp yukarı yürüyorsun, telefon cebinde, ekranı kapalı." } },

    /* — Vurgu — */
    { group: "Vurgu" },
    { t: "pull", label: "Öne çıkan alıntı (pull)", note: "Metnin içinden çekilmiş cümle. `big:true` daha iri.", sample: { t: "pull", text: "Güvenlik bir ürün değil, bir alışkanlık. Satın alınmıyor, ediniliyor." } },
    { t: "pull", label: "Öne çıkan alıntı — büyük", sample: { t: "pull", big: true, text: "Telefonun sana ait sırları saklıyor. Nerede olduğunu ise herkese soruyor." } },
    { t: "quote", label: "Kaynaklı alıntı (quote)", note: "Söz + kime ait. `by` opsiyonel.", sample: { t: "quote", text: "Bir ölçüm bir çember. İki ölçüm iki nokta. Üç ölçüm bir yer.", by: "trilaterasyonun tamamı" } },
    { t: "note", label: "Not (note)", note: "Kenar notu / editör hatırlatması.", sample: { t: "note", text: "Bu sayının bulmacası da yazının devamı: konumun GPS olmadan nasıl bulunduğunu oynayarak öğreniyorsun." } },
    { t: "caption", label: "Alt yazı (caption)", note: "Görsel altı açıklama.", sample: { t: "caption", text: "Kadıköy, 21:04 — tek bir cihazın yedi saniyesi." } },

    /* — Yapı — */
    { group: "Yapı" },
    { t: "rule", label: "Ayraç (rule)", note: "Yaprak süslü bölüm ayracı. Alan gerektirmez.", sample: { t: "rule" } },
    { t: "byline", label: "Künye satırı (byline)", note: "Yazar + rol + süre. Başlığın hemen altı.", sample: { t: "byline", author: "Emre", role: "editör", minutes: 2 } },
    { t: "stat", label: "Sayı kartları (stat)", note: "2-3 rakam yan yana. items: [{v,k}].", sample: { t: "stat", items: [ { v: "~1.200", k: "telefonun günde sorduğu ağ adı" }, { v: "4", k: "bir kişiyi ayırt etmeye yeten ağ sayısı" }, { v: "₺100", k: "gereken donanımın maliyeti" } ] } },
    { t: "list", label: "Liste (list)", note: "Madde listesi. items dizi.", sample: { t: "list", items: [ "Cihaz adlarını rastgeleye al.", "Otomatik ağ bağlanmayı kapat.", "Bilinen ağları temizle." ] } },
    { t: "list", label: "Numaralı liste", note: "style:'num' → sıralı adımlar.", sample: { t: "list", style: "num", items: [ "Ayarlar → Wi-Fi.", "Bilinen ağlar → temizle.", "Rastgele MAC → aç." ] } },
    { t: "list", label: "Sözlük listesi (dict)", note: "style:'dict' → terim + tanım. Her satır ayrı yorumlanır.", sample: { t: "list", style: "dict", items: [ { term: "Probe request", def: "Telefonun 'şu ağ burada mı?' diye havaya bıraktığı soru." }, { term: "Trilaterasyon", def: "Üç uzaklıktan tek konum çıkarma." } ] } },

    /* — Söyleşi — */
    { group: "Söyleşi" },
    { t: "dialog", label: "Söyleşi — soru", note: "who:'q' → soru satırı.", sample: { t: "dialog", who: "q", text: "Peki sıradan bir kullanıcı ne yapabilir?" } },
    { t: "dialog", label: "Söyleşi — cevap", note: "who:'a' + name → cevap; baş harf rozet olur.", sample: { t: "dialog", who: "a", name: "Deniz", text: "Aslında çoğu şey varsayılan ayarların içinde gizli." } },

    /* — Özel / zengin — */
    { group: "Özel" },
    { t: "term", label: "Terminal kaydı (term)", note: "Ekranda akan kayıt. `$` ile başlayan satır komut sayılır. Metin AYNEN basılır.", sample: { t: "term", host: "dinleyici@kadikoy — 21:04", lines: [ "$ sudo tcpdump -i wlan0 -e -s 256 type mgt subtype probe-req", "21:04:07  aa:bb:cc:11:22:33  →  \"Ev_WiFi\"", "21:04:08  aa:bb:cc:11:22:33  →  \"MODA_KAHVE_MISAFIR\"", "# 1 cihaz · 6 ağ adı · 7 saniye" ], caption: "Tek bir cihazın yedi saniyesi. Adres sahte olabilir; ağ adları değil." } },
    { t: "rtlhint", label: "Sağdan-sola ipucu (rtlhint)", note: "Manga bölümü önünde okuma yönü uyarısı.", sample: { t: "rtlhint" } },
    { t: "manga", label: "Manga sayfası (manga)", note: "panels: [{art:0-5, text, kind}]. dir=rtl. Panele nokta-yorum düşer.", sample: { t: "manga", layout: "3-üst-1-alt", page: 1, panels: [ { art: 0, text: "Sokak boş.", kind: "wide" }, { art: 1, text: "Yağmur başlıyor.", kind: "" }, { art: 3, text: "Bir ışık.", kind: "" }, { art: 5, text: "…", kind: "wide" } ] } },

    /* — Sayfa tipi blokları (tekil; genelde elle yazılmaz) — */
    { group: "Sayfa tipi (tekil)" },
    { t: "cover", label: "Kapak (cover)", note: "Sayının kapağı — aktif sayının meta'sından çizilir. Sayfada tek başına.", sample: { t: "cover" }, dark: true },
    { t: "outro", label: "Sayı sonu (outro)", note: "overlays.js zenginleştirir; iskeleti burada.", sample: { t: "outro" } },
    { t: "puzzleSlots", label: "Bulmaca yuvası (puzzleSlots)", note: "puzzles.js doldurur; bulmaca bölümüne konur.", sample: { t: "puzzleSlots" } },
  ];

  /* --- HER BLOKTA GEÇERLİ --------------------------------------------------- */
  DEV.blockMods = [
    { key: "invert", note: "Koyu/overlay zeminde blok açık renge döner (`invert: true`). Sayfa `bleed:'full'` + sahne arka planı varken kullan." },
  ];

  /* --- PALETLER (tokens.css'teki sayı temaları) -----------------------------
     Kit önizlemeleri bunlardan biriyle boyanır; üst bardaki seçici bu listeden
     doldurulur. İlk sıradaki varsayılan. Yeni tema: tokens.css'e bir blok +
     buraya bir satır — başka hiçbir yer değişmiyor. */
  DEV.palettes = [
    { slug: "2026-11", name: "№ 05 · Kotoba 言葉 (Söz)" },
    { slug: "2026-10", name: "№ 04 · Gürültü" },
    { slug: "2026-09", name: "№ 03 · Kızıl Mevsim" },
    { slug: "2026-08", name: "№ 02 · Mavi Saat" },
  ];

  /* --- ARKA PLAN SAHNELERİ (bg: "scene:<ad>") ------------------------------
     art.js'teki satır içi SVG sahneler. Sayı temasının renkleriyle boyanır. */
  DEV.scenes = [
    /* Japonya sahneleri — dergi kimliğinin omurgası, önce onlar */
    "genko", "sumi", "shoji", "emaki", "tanzaku",
    "paper", "leaves", "torii", "temple", "mountains", "city", "street",
    "rain", "waves", "moon", "bowl", "train", "portrait",
    "neon-city", "terminal", "circuit", "signal-grid",
  ];

  /* Arka plan ayrıca: `photo:<sayı>` (üretilmiş sahte foto) ve `img:<yol>` (gerçek dosya). */
  DEV.bgForms = [
    { form: 'bg: "scene:paper"', note: "Satır içi SVG sahne (yukarıdaki adlar)." },
    { form: 'bg: "photo:101"', note: "Tohumlu sahte fotoğraf (sayı = tohum)." },
    { form: 'bg: "img:assets/2026-09/tren.webp"', note: "Gerçek görsel dosyası — sayı klasörüne göreli yol." },
  ];

  /* --- SAYFA ANİMASYONLARI (scene: "<ad>") ---------------------------------
     Sayfa görünürken çalışan açılış animasyonu. blocks.css'te tanımlı. */
  DEV.anims = [
    { name: "fade-up", note: "Bloklar sırayla alttan belirir. Varsayılan tercih." },
    { name: "stagger", note: "Kademeli, biraz daha belirgin gecikmeli." },
    { name: "parallax", note: "Arka plan yavaş kayar; opener sayfaları için." },
    { name: "mask-wipe", note: "Perde açılışı; kapak/geçiş." },
    { name: "panel-reveal", note: "Panel panel açılım; manga için." },
    { name: "signature", note: "İmza sahne (tam kodlanmış); sayı başına 1-2." },
    { name: "none", note: "Animasyon yok." },
  ];

  /* --- SAYFA ALANLARI ------------------------------------------------------- */
  DEV.pageFields = [
    { name: "id", note: "Benzersiz. YORUM ÇIPASININ temeli (pageId:blokIndex). Sonradan değiştirme.", ex: '"gu-1"' },
    { name: "depth", note: "Hangi okuma modlarında görünür. Kombinasyon serbest.", ex: '["all"]  ·  ["min"]  ·  ["mid","full"]' },
    { name: "kind", note: "Anlamsal tip (folio/gizleme davranışı). cover·opener·photo·narrate·think·figure·signature·manga·puzzle·outro.", ex: '"opener"' },
    { name: "fit", note: "contain = tuvale sığar (varsayılan). scroll = sayfa içi kaydırma serbest.", ex: '"scroll"' },
    { name: "bleed", note: "full = tam kanama (arka plan kenara taşar), none = normal.", ex: '"full"' },
    { name: "bg", note: "Arka plan: scene:/photo:/img: (yukarı bak). Yoksa düz zemin.", ex: '"scene:paper"' },
    { name: "scene", note: "Sayfa animasyonu (yukarı bak).", ex: '"fade-up"' },
    { name: "blocks", note: "Blok nesneleri dizisi. Sırası yorum çıpasını belirler.", ex: "[ … ]" },
  ];

  /* Yeni sayfaya iskelet — editörde 'boş sayfa' düğmesi bunu ekler. */
  DEV.pageSample = {
    id: "yeni-1",
    depth: ["all"],
    fit: "scroll",
    scene: "fade-up",
    bg: "scene:paper",
    blocks: [
      { t: "kicker", text: "Bölüm" },
      { t: "h1", text: "Başlık" },
      { t: "p", drop: true, text: "İlk paragraf…" },
    ],
  };

  /* Yeni bölüm iskeleti — editörün varsayılan içeriği + yeni bölüm dosyası kalıbı. */
  DEV.sectionSample = {
    slug: "yeni-bolum",
    type: "article",
    title: "Yeni Bölüm",
    kicker: "Dosya",
    author: "Emre",
    minutes: 4,
    tags: ["etiket"],
    pages: [MAG.dev.pageSample],
  };
})(window.MAG);
