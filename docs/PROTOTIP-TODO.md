# Prototip Yol Haritası (canlı to-do)

> **Bu dosya her adımda güncellenir.** Oturum yarıda kesilirse buradan devam edilir.
> Prototip = **sahte ama tam görünümlü** ürün. Gerçek arka uç, gerçek derleyici, gerçek
> Supabase **yok**. Amaç: tüm proje neye benzeyecek, uçtan uca görmek.

## Nerede kaldık?

- **Mod tamamlama (K1) girdi.** Bir sayıyı bir modda tahmini sürenin **yarısı** kadar okuyan o modu
  tamamlamış sayılıyor; üçünü de tamamlayan sayının **anahtarını** kazanıyor. Okura hiçbir şey
  söylenmiyor — tek iz, mod seçim ekranındaki kartın **altın** zemine dönmesi. Anahtar şimdilik
  yalnızca durumda bekliyor; **K2 (dergi keşfet sayfası)** onu okuyacak.
- **Yorum sistemi 2.x — SADELEŞTİRİLDİ:** sunum denemeleri budandı; tek model kaldı:
  her yorum bir **baloncuk (pin)**, dokununca üstte **pop-up** (tüm yorumlar kaydırmalı). Metin/paragraf
  highlight'ları, alıntı ısısı ve blok kenarı çentiği tamamen kalktı — ilgili ölü kod (`markQuote`,
  `heatLevel`, `.anno` ve çentik CSS'i, ~174 satır) da temizlendi. Baloncuklar idle'da hafif **salınıyor**
  ve basılı tutup **sürüklenebiliyor** (konum yoruma yazılır, yeniden çizimde kalır). Eş okuma kapalıyken
  pinler gizli.
- **Son tamamlananlar:** (1) Rötuşlar — modal/panel/popup kontrast halkası (`--edge`), yüzen/sürüklenebilir
  baloncuklar, okuma modu isimleri **Doomscroller 🫠 / Dengeli ⚖️ / Doomreader 🧠**. (2) **Analitik paneli**
  (editör-only, sahte veri): `js/data-analytics.js` + `js/analytics.js` + `css/analytics.css`. Türev+olay
  ayrımı etiketli, **tam agregasyon** (kişi-bazlı iz yok), yasal not. Menü > "Analitik" veya `#analitik`.
- **Sayfalama kararı:** Otomatik sayfalayıcı prototipte görünmez → **asıl build'e ertelendi** ([`PROJE.md`](PROJE.md) §8).
  Prototipte sadece Sözlük 3 `fit:contain` sayfaya bölündü (örnek).
- **ARTIK ÇOK SAYILI (C1).** İçerik `js/issues/<slug>.js` dosyalarında, `data.js` yalnızca hangisinin
  açılacağına karar veriyor. Aktif sayı URL'de: `?sayi=2026-09` → Kızıl Mevsim, temiz adres → güncel sayı.
  Arşivden eski sayıya geçmek gerçekten çalışıyor (doğrulanmış hesap gerekiyor, tasarım gereği).
  **Yeni sayı yazmak:** içerik dosyası (+ istersen `.comments.js`), `tokens.css`'e bir tema bloğu,
  `data.js`'te `D.archive`'a bir satır, `index.html`'e script etiketleri. Başka hiçbir yer değişmiyor.
  İçerik iki biçimden biriyle yazılabilir, `data.js` farkı bilmez: **tek dosya** (`js/issues/<yyyy-mm>.js`,
  kendini doğrudan `MAG.issues`'a yazar — 2026-09 böyle) ya da **bölünmüş** (`js/issues/<yyyy-mm>/issue.js`
  + `sections/NN-slug.js`, her biri `MAG.defineSection`; `js/content.js` `order`'a göre toplar — 2026-10
  böyle). Bölünmüş biçimde `content.js` bölüm dosyalarından **önce** yüklenmeli.
- **Yayımlanmış sayılar:** № 03 "Kızıl Mevsim" (2026-09) · № 04 "Gürültü" (2026-10, siber güvenlik/cyberpunk).
  Arşivdeki № 02 ve № 01 hâlâ içeriksiz — arşivin boş hâli de bilerek duruyor.
- **SIRADA (kullanıcı):** Gerçek içerikle 1. sayıyı döşemek (yazı/manga/röportaj/görseller tek tek gelecek),
  uçtan uca test, sonra **asıl build** (SvelteKit mimarisi).
- **Not:** Prototip saf HTML/CSS/JS, derleme adımı yok. `prototype/index.html` çift
  tıklanarak açılabilir (klasik `<script>` etiketleri, ES modül yok — `file://` uyumlu).

## Prototip kuralları

1. **Derleme yok.** Node, npm, bundler yok. Çift tıkla çalışsın.
2. **Ağ yok.** CDN yok, dış istek yok — her şey depoda. Sahnelerin çoğu hâlâ elle çizilmiş
   satır içi SVG (`js/art.js`), ama 2026-09 gerçek dosyalarla döşendi: `assets/2026-09/`
   altında 17 WebP ve tek gömülü font (`assets/animeace2_reg.ttf`, yalnız manga balonu).
3. **Veri sahte ama gerçekçi.** Her sayı `js/issues/` altında eksiksiz durur (tek dosya
   ya da bölünmüş); `js/data.js` yalnızca hangisinin açılacağını seçer.
4. **Durum `localStorage`'da.** Okuma modu, ilerleme, yorumlar, bulmaca sonuçları.
5. **Her adım kendi başına çalışır.** Yarıda kalırsa prototip yine açılır, çökmez.

---

## Adımlar

### Temel

- [x] **A0 — Depo iskeleti**
      `docs/PROJE.md`, bu dosya, `prototype/` klasör düzeni, boş `index.html` kabuğu.
- [x] **A1 — Tasarım token'ları**
      `css/tokens.css`: renk/tipografi/boşluk ölçekleri, karanlık-aydınlık,
      sayı teması değişkenleri (Eylül 2026 = kızıl/kâğıt paleti).
- [x] **A2 — 3:4 tuval + bantlar**
      `css/canvas.css` + `js/canvas.js`: sabit oranlı tuval, üst bant (menü/mod/dil/
      ilerleme), alt bant (yorum katmanı düğmesi + sayaç), masaüstünde "dergi objesi".
- [x] **A3 — Snap motoru**
      Dikey sayfa sayfa oturma, ilerleme çubuğu, klavye gezinmesi (↑↓/PgUp/PgDn),
      `fit: contain` ve `fit: scroll` sayfa davranışları.

### İçerik

- [x] **A4 — Sahte sayı verisi**
      `js/issues/2026-09.js`: Sayı 03 / Eylül 2026, 3 okuma derinliği, TR metinleri.
      (Başlangıçta 8 bölümdü; one-shot eklenince 9 oldu.)
- [x] **A5 — Satır içi SVG görsel kitaplığı**
      `js/art.js`: kapak, manzara, şehir, yağmur, portre, doku — hepsi tema
      değişkenleriyle boyanır.
- [x] **A6 — `article` + `list` blokları**
      `js/render.js` + `css/blocks.css`: başlık, drop cap, alıntı, dipnot, sözlük kartları.
- [x] **A7 — `gallery` + `interview` blokları**
      Tam ekran foto-öykü; iki sesli söyleşi dizgisi.
- [x] **A8 — `manga` bloğu**
      One-shot okuyucu: sayfa sayfa, panel vurgulu rehberli görünüm. Okuma yönü blokta
      (`dir`) — varsayılan sağdan sola, gerçek one-shot soldan sağa kullanıyor.

### Deneyim

- [x] **A9 — Tanıtım (about) sahnesi**
      İlk ziyarette 10-15 sn kaydırmalı tanıtım, atlanabilir.
- [x] **A10 — Okuma modu seçimi**
      3 kart (en az / orta / klasik) + üst banttan anlık değişim + konum koruma.
- [x] **A11 — Animasyon sahneleri**
      `fade-up`, `stagger`, `parallax`, `mask-wipe`, `type-in`, `panel-reveal`,
      imza sahne; `prefers-reduced-motion` düşüşü.

### Sosyal

- [x] **A12 — Yorum katmanı**
      Metin seçimi ankrajı + görsele koordinat pini, katman aç/kapa, hafif vurgular.
- [x] **A13 — Yorum thread paneli**
      Alttan açılan panel, iç içe cevaplar, emoji tepkileri, yorum yazma alanı.
- [x] **A14 — Kimlik ve giriş**
      Sessiz anonim takma ad + emoji/renk, ilk yorum sonrası giriş teklifi,
      e-posta + 6 haneli kod modalı, "geçmişin taşındı" anı.

### Oyun ve kapanış

- [x] **A15 — Bulmaca motoru + bulmacalar**
      Custom element sözleşmesi (sahte), kelime avı + görsel bulmaca, sonuç ekranı,
      anonim okur istatistikleri, öneri rozeti ("bunu neden gördün?"). 2026-09'un
      havuzunda 4 bulmaca var, okura sayı başına 2'si sunuluyor.
- [x] **A16 — Sayı sonu ekranı**
      "Bitirdin" rozeti, okuma istatistikleri, bulmaca özeti, ikinci giriş teklifi.
- [x] **A17 — Menü, arşiv, ayarlar**
      Yan menü, sayı arşivi, dil değiştirici (TR/EN/JA), tema, erişilebilirlik ayarları.
- [x] **A18 — Moderasyon paneli**
      Sahte `/admin` onay kuyruğu: bağlamıyla birlikte yorum kartları.
- [x] **A19 — Cila**
      Alıntı paylaşma görseli, geçişler, boş/hata durumları, mobil elden geçirme.

---

## Adım günlüğü

| Adım | Durum | Not |
|---|---|---|
| A0 | ✅ | `docs/` + `prototype/` iskeleti kuruldu. |
| A1 | ✅ | `css/tokens.css` — iki ölçek (cqi tuval / px arayüz), 2 sayı teması. |
| A2 | ✅ | `css/base.css`, `css/canvas.css`, `index.html` kabuğu. Letterbox `roomy/tight`. |
| A3 | ✅ | `js/canvas.js` — snap motoru, ilerleme, klavye, folio, sahne gözlemcisi. |
| A5 | ✅ | `js/art.js` — 12 sahne + foto üreteci + manga paneli, hepsi tema değişkenli. |
| A4 | ✅ | Sayı 03 "Kızıl Mevsim": 8 bölüm, 14 tohum yorum, 4 bulmacalık havuz. (Bugün 9 bölüm / 29 sayfa — klasikte 28 görünür — ve 248 yorum; one-shot ve dolu sayı sonradan geldi.) |
| A6 | ✅ | `js/render.js` + `css/blocks.css` — 22 blok tipi, drop cap, sözlük, istatistik şeridi. |
| A7 | ✅ | Foto-öykü (tam kanama + alt yazı) ve söyleşi (iki sesli dizgi) blokları. |
| A8 | ✅ | Manga bloğu — 3 panel düzeni, okuma yönü seçilebilir (`dir`), konuşma/düşünce/anlatı balonları. |
| A9 | ✅ | Tanıtım sahnesi — 5 kaydırmalı slayt, atlanabilir, nokta göstergesi. |
| A10 | ✅ | Mod seçimi — 3 kart, her mod için gerçek süre/sayfa tahmini, konum koruma. |
| A11 | ✅ | 6 sahne preseti + `prefers-reduced-motion` ve elle kapatma düşüşü. |
| A12 | ✅ | Yorum katmanı — metin ankrajı, normalize (x,y) pin, uzun basma, düşme mantığı. |
| A13 | ✅ | Thread paneli — iç içe cevap, emoji tepki seçici, bağlam alıntısı. |
| A14 | ✅ | Anonim kimlik + e-posta/6 haneli kod; `reader.id` korunuyor, geçmiş taşınıyor. |
| A15 | ✅ | 4 bulmaca, GERÇEK custom element olarak. Öneri algoritması + soğuk başlangıç. |
| A16 | ✅ | Sayı sonu — bitirdin rozeti, 4 istatistik, ikinci ve son giriş teklifi. |
| A17 | ✅ | Menü (içindekiler + ayarlar), arşiv, dil seçici, tema/animasyon anahtarları. |
| A18 | ✅ | Moderasyon paneli — bağlamıyla birlikte onay kuyruğu. |
| A19 | ✅ | Portre çizimi soyutlandı, yaprak simgesi yenilendi, folio perdesi, süre tahmini ayarlandı (6/8/10 dk), `prototype/README.md`. |
| — | 🐞 | Düzeltilen 4 hata: `art.js`'te yorum içinde `*/` tüm dosyayı bozuyordu; uzun sayfalarda IntersectionObserver eşiği içeriği görünmez bırakıyordu; manga sayfasında tam kanama dolgusu; folio uzun sayfada metnin üstüne biniyordu. |
| — | 🐞 | Karanlık temada bantlar okunmuyordu: `.band` rengi `--paper` idi, karanlıkta hem kâğıt hem zemin koyu olduğu için yazı zemine gömülüyordu. Yeni `--on-backdrop` token'ı (aydınlık: kâğıt, karanlık: mürekkep) eklendi — kontrast 1.09'dan 15.9'a çıktı. |
| A20 | ✅ | Masaüstünde sabit menü: tuvalin yanındaki boşlukta durur, perde yok, okuma engellenmez. “Sade görünüm” düğmesiyle kapanır, hamburgerle geri gelir, tercih saklanır. Menü açıkken tuval yarım menü kadar sağa kayar → menü + dergi birlikte ortalanır. Dar pencerede eski çekmece davranışı korunur. |
| B1 | ✅ | **Yorum temeli.** Ankraj artık karakter aralığı değil **blok** (`pageId:index[.alt]`, `render.js` basıyor; sözlük satırı ve manga paneli de ayrı blok). Alıntı ankraj olmaktan çıkıp yorumun gövdesine taşındı → aynı cümleye kaç kişi isterse yorum yazabiliyor (eskiden ikincisi sessizce sayfa seviyesine düşüyordu). Pinler kümeleniyor: sayfa en fazla 6 pin gösterir, yoğunluk artınca kümeler kabalaşır. Eski `text` ankrajları açılışta bloklara taşınıyor, kimse yorumunu kaybetmiyor. (Bu adımda gelen `<mark>` alıntı ısısı ve blok kenarı çentiği 2.x sadeleştirmesinde kaldırıldı; ankraj modeli aynen duruyor.) |
| — | 🐞 | `overlays.closeTop()` gecikmeli temizliği, 260 ms içinde yeniden açılan paneli siliyordu: bir yoruma tepki verince thread paneli bomboş kalıyordu. Her açılışa sıra numarası verildi, temizlik yalnızca kendi açılışı güncelse çalışıyor. |
| B2 | ✅ | **Stres modu** (`js/debug.js`, `MAG.flood(250)`). Sıcak-soğuk dağılım (bloklar 1/sıra^1.15 ağırlıklı), %22 cevap, %18 koordinat pini, %45 alıntı. Yalnızca bellekte. 250 yorumda ölçüm: 7 ms'de çiziliyor, en yoğun blokta 36 yorum → sayfada yine tek ses, bir sayfadaki en fazla işaret 9 (6 pin + 3 blok). |
| B2.5 | ✅ | **Sayı gerçek yorumla dolduruldu.** `js/data-comments.js` (yeni): 248 elle yazılmış tohum yorum — 225 kök + 23 cevap, 30 farklı okur, 58 blokta yorum, 5'i onay kuyruğunda. Dağılım bilerek eşitsiz: en yoğun blok 21 yorum, en çok alıntılanan cümleyi 16 kişi seçmiş. Akıştaki **29 sayfanın hepsinde** yorum var; klasik modda 214, ortada 188, en azda 103 yorum görünüyor. Çizim 3.6 ms. İçerik ile yorum ayrı dosyaya çıktı (`data.js` artık yalnızca derleyici çıktısı). Moderasyon kuyruğu artık okurun kendi yorumlarını değil **bekleyen her yorumu** gösteriyor; onaylanan tohum yorum sayfada anında beliriyor. |
| B2.6 | ✅ | **Pin kümelenmesi hata ayıklama görünümü** (`MAG.pins()`). Kümelenme görünmez bir kuraldı; artık her pinin **çekim alanı** çiziliyor: kesikli elips (yarıçap 0.14, tuval genişliği birimi), pinin kendi gövdesi (8.5cqi) kıyas için, ham koordinatlardan küme ortasına giden bağlar, sınama sırası (`#1 #2 …`), çakışan alanlar turuncu (“en yakına değil sırada önce olana katılır”), pin sınırı yüzünden gelen birleşmeler pembe, en yakın iki pin ve mesafesi. Görselde uzun basınca nokta canlı sınanıyor: “#1 pinine katılır (0.112 ≤ 0.14)” ya da “yeni pin açılır”. `clusterPoints` isteğe bağlı bir birleşme günlüğü tutuyor; görünüm ürün CSS'ine dokunmuyor, kendi stilini kendi enjekte ediyor. |
| — | 🔤 | **Yorum yazısı 1.5×.** Yorum yüzeyleri küçük kalmıştı. `css/comments.css` başında üç değişken tanımlandı: `--fs-cmt` (gövde, ~21px) / `--fs-cmt-quote` (~15-18px) / `--fs-cmt-name`. Baloncuk, pop-up ve thread paneli hepsi buradan besleniyor — tek yerden büyütülüp küçültülüyor. |
| — | 🎨 | **Eş okuma tonlaması içeriden çevreye taşındı.** `#comment-layer` tuvalin İÇİNE %12 koyu tül seriyordu → "içerisi bulanıklaşıyor" hissi. Kullanıcı: "içi aynı renk kalsın, renk değişimini çerçevenin dışına ver." İç tül kapatıldı (`display:none`), yerine `body::after` çevre tülü (z:0, #shell'in altında, tuval opak olduğu için yalnız çerçevenin dışında görünür) — eş okuma açılınca %32 karararak dergi objesini öne çıkarıyor (spotlight). Zoom-out korundu. İçerik iki durumda da birebir aynı parlaklıkta. |
| — | ♻️ | **`comments:decorated` olayı.** `decorate()` bitince tek olay yayıyor: yeniden çizimin tek kapısı. Önce yorumu dinleyen her yüzey ayrı ayrı `comment:added`/`flow:render`/… dinliyordu ve `MAG.flood()` hiçbirini yaymadığı için stres modunda eksik çizim oluyordu — bu tek kapı onu kökten çözdü (ekleme, tepki, stres, moderasyon hepsi decorate'ten geçiyor). |
| C1 | ✅ | **Çok sayılılık + Sayı 04 "Gürültü".** Prototip tek sayıya kilitliydi (`data.js` tek bir `D.issue` singleton'ı ihraç ediyordu; arşivdeki eski sayılar tıklanınca "yalnızca güncel sayı var" toast'ı veriyordu). İçerik `js/issues/<slug>.js` + `js/issues/<slug>.comments.js` dosyalarına çıktı, her biri kendini `MAG.issues`'a kaydediyor; `data.js` yükleyiciye, `data-comments.js` koşum takımına döndü. Aktif sayı **URL'de** taşınıyor (`?sayi=2026-09`) — localStorage'a yazılmıyor, böylece eski bir sayı okunurken yenilemek okuduğunu kaybettirmiyor ve arşiv paylaşılabilir bağlantı üretiyor. Sayı değişimi tam yeniden yükleme: her modül tek bir `MAG.data` ile açılıyor, `state.js` zaten `issueSlug` ile isimlendirdiği için ilerleme/bulmaca kayıtları ayrışıyor. Çekirdekte (render/canvas/comments/analytics) **tek satır değişmedi.** Yeni sayı: cyberpunk tema (mono başlıklar — kullanılmayan `--issue-display` token'ı nihayet bağlandı), 4 yeni sahne, yeni `term` blok tipi, `bg: "img:…"` öneki (çizilmiş sahneyi gerçek dosyayla değiştirmek tek satır), 8 bölüm / 27 sayfa (16·23·26), 98 tohum yorum, "Üç Halka" bulmacası. |
| C1a | ✅ | **Ölçüm dersi.** `fit:contain` taşma kontrolünü `page.scrollHeight` ile yapmak yanıltıyor: `parallax`/`signature` sahneleri `.page__bg`'yi ölçekliyor, dönüştürülmüş arka plan sayfayı taşırıyor ve içerik taşması gibi okunuyor. Doğru ölçüm `.page__inner`. Bu ölçüyle taşma her iki sayıda, üç modda, mobil+masaüstünde **sıfır**. |
| A21 | ✅ | **Responsive elden geçirme — “siyah bölümler”.** 11 ekran boyutunda ölçüldü, 4 ayrı kaynak bulundu: (1) telefonda 3:4 tuval ekranın %38'ini ölü bırakıyordu → tuval artık letterbox tam bir bant boyuna inene kadar uzuyor, ölü alan sıfır; (2) galeri “fotoğrafları” kâğıt paletinden boyanıyordu, karanlıkta kapkara dikdörtgene dönüyorlardı → fotoğrafın kendi tonlaması var artık; (3) tanıtım sahnesi karanlıkta siyah ekrandı (kâğıt zemin + koyu perde) → sayı rengiyle tonlama + karanlıkta hafifletilmiş perde; (4) basık-geniş pencerede yanlarda 500px+ boşluk kalıyordu → sabit menü eşiği 560px'den 440px'e indi, menü o boşluğu dolduruyor. Ayrıca karanlıkta dergiye kenar ışığı ve zemine ışık havuzu: obje zemine karışmıyor. |
| J1 | ✅ | **Japonya sahneleri (5).** Derginin konusu Japon dili/edebiyatı ve Japonoloji; portföy buna göre genişliyor. `art.js`'e beş sahne: `genko` (原稿用紙, sağdan sola yarıya kadar yazılmış müsvedde), `sumi` (書道 — enso + dikey sütun), `shoji` (障子, arkadan aydınlanan kâğıt + bambu gölgesi), `emaki` (絵巻 — altın suyari-gasumi bantları), `tanzaku` (短冊, bambuya asılı şiir şeritleri). Beşi bilerek farklı ritimde (yoğun ızgara / tek jest / geometrik ışık / yatay bant / dikey tekrar) ki aynı sayıda yan yana gelince birbirini tekrar etmesinler. İki ortak motif aileyi bağlıyor: vermilyon mühür (`seal()`) ve okunmayan yazı (`glyph()`) — ikincisi bilerek okunaksız, göz onu doku sanıp üstündeki başlığa geçsin diye. **Ders:** `shoji`'nin ışığını `--paper`'a bağlamak koyu temada sahneyi ters çeviriyordu (arkadan yanan kâğıt kararıyor, shoji'nin bütün fikri gidiyor). Çözüm `A.photo`'nun yolu: palet dışına çıkıp `color-mix(in oklab, var(--accent-2) …%, …)` ile altın vurguyu kâğıda karıştırmak — "arkadan yanan fener" okuması her iki temada da korunuyor. Üç palette (2026-09 açık/koyu, 2026-10 koyu) kontak baskıyla doğrulandı. |
| J2 | ✅ | **"Kotoba" paleti + kitte palet seçici.** `tokens.css`'e 2026-11 teması (açık+koyu). Zor kısmı 2026-09'dan ayrışmaktı — o da zaten kâğıt/mürekkep/torii kırmızısıydı. Ayrım üç yerden: mürekkep ve kâğıt soğudu (sumi grafit siyahı + kōzo grisi, 2026-09 sıcak kahve-krem), `--accent-3` çam yeşilinden 藍 indigoya döndü, kırmızı tuğladan 真朱'ya kaydı. **Kısıt:** `--accent-2` açık ve sıcak kalmalı — `shoji` kâğıdın arkasındaki ışığı ondan karıştırıyor, koyu bir değer o sahneyi karartır; tokens.css'te not düşüldü. Ayrışma `emaki`/`tanzaku`'da net (accent-3 görünüyor), `sumi`/`shoji`'de neredeyse yok — onlar accent-3 kullanmıyor. Kit artık paleti seçtiriyor (`DEV.palettes` + üst barda iki `<select>`, `localStorage`'da hatırlanıyor): arayüz `--d-*` ile boyandığı için koyu kalıyor, seçim yalnızca önizleme yüzeylerini çeviriyor ve sahneler CSS değişkeni kullandığından yeniden çizim gerekmiyor. |
| J3 | ✅ | **`--font-ja` sessizce gothic'e düşüyormuş.** Token `"Noto Serif JP"` diyordu; Linux dağıtımları bu aileyi **`"Noto Serif CJK JP"`** adıyla kuruyor ("Noto Serif JP" alt küme derlemesi genelde yok). Yığındaki dört adın (Hiragino/Yu Mincho/Noto Serif JP/MS Mincho) hiçbiri tutmayınca `var(--font-text)`'e (Georgia) düşüyor, Georgia'da kanji olmadığı için tarayıcı kendi yedeğini seçiyordu — **kanji çıkıyor ama gothic çıkıyor, mincho değil.** Metin göründüğü için gözle fark edilmiyor. Yığına Linux + Adobe adları eklendi (`Noto Serif CJK JP`, `Source Han Serif JP`, `IPAexMincho`). Ölçüm: 言 glifi 64×64 tuvale çizilip mürekkep pikseli sayıldı — düzeltmeden önce 627 (gothic referansıyla aynı), sonra **334** (mincho referansıyla birebir). Token hâlâ hiçbir yerde kullanılmıyor; Japonca metin bloğu geldiğinde bağlanacak. |
| M1 | ✅ | **2026-09'a gerçek one-shot: "Kapalı Kapılar" (KARGAMANGA, izinle).** Sayının çizili sahneleri önce Commons görselleriyle değiştirildi (görsel künyesiyle birlikte), ardından manga bölümü geldi — sayı 8 bölümden 9'a çıktı. Yerleşim planın kendi sayfa kompozisyonu: 24 sütunlu grid, üç kuşak, 7 kare + başlık kutusu (`layout: "plan"`). Balonlar kare sınırlarını bilerek taşıyor (`overflow: visible`). Japon one-shot'ı olmadığı için **soldan sağa** (`dir: "ltr"`). Bölüm, sayı sonundan hemen önceye yerleşti; kendi kapak sayfası var (KARGAMANGA karga figürü). Ham 8.1 MB PNG → 392 KB WebP; ham kaynaklar `.gitignore`'da. `panel-sirala` bulmacası bu 7 kareyi kullanıyor. |
| M2 | ✅ | **Projenin ilk gömülü fontu: Anime Ace.** Balon ve manga başlığı sistem fontlarıyla "çizgi roman" kaydında durmuyordu. `assets/animeace2_reg.ttf` (64 KB) `@font-face` ile gömüldü, `--font-manga` token'ına bağlandı; yedeği Comic Sans → `--font-ui`, yani font yüklenmezse balon yine çizgi roman kaydında kalıyor. **Tuzak:** fontta uzun tire (— –) yok, balon metninde kullanılırsa o karakter sessizce yedeğe düşüyor — `tokens.css`'e not düşüldü, 7 balonun hepsi kontrol edildi. Lisans borcu "sırada ne var" §4'te. |
| M3 | ✅ | **PIGMENT filigranı + `--safe-bottom`.** One-shot sayfasının sağ altında stüdyo logosu; yorum baloncuklarıyla aynı dilde duruyor, dokununca sayının YouTube Shorts sürümüne gidiyor. Ayrıca tuval altına görünmez bir güvenli alan eklendi (`--safe-bottom`): folio, tam sayfa içeriğin üstüne 15px biniyordu. |
| K1 | ✅ | **Mod tamamlama ve anahtar** (`js/streak.js`, yeni). Okur bir sayıyı bir modda o modun **tahmini süresinin yarısı** kadar okursa modu tamamlamış sayılıyor; üç modu da tamamlarsa sayının **anahtarını** kazanıyor. Hedef veri olarak yazılmadı, `D.estimateMinutes(mod)`'dan geliyor — sayı büyüyünce eşik kendiliğinden büyüyor. **Bilerek sessiz:** tamamlanma anında toast/rozet/ses yok, tek görünür iz mod seçim ekranındaki kartın altın zemine dönmesi; okur oraya kendi merakıyla dönüp fark etsin diye, "şunu da yap" diyen bir görev listesi olmasın. Sayaç duvar saatini değil okuma süresini sayıyor: yalnızca sekme görünürken **ve** okur son 3 dk içinde kıpırdamışken işliyor, yani sekmeyi açık bırakıp gitmek modu tamamlatmıyor; uyuyan sekmeden gelen dev `delta` bir tura kırpılıyor. Süre `sayı:mod` çiftine yazıldığı için mod değiştirince sayaç öteki kovaya geçiyor, biriken kaybolmuyor. Yazım saniyede bir olduğundan `addModeTime` olay **yaymıyor** (yoksa her saniye tüm dinleyiciler tetiklenirdi); seyrek olan `mode:done` ve `key:earned` yayıyor. **Renk tuzağı:** altın için `--accent-2`'ye bağlanmak yanlıştı — o token sayı temasının ikinci rengi ve her sayıda altın olmak zorunda değil (2026-10'da neon pembe `#ff54a3`), bağlansaydı "tamamladım" işareti sayıdan sayıya renk değiştirirdi. Sayı temalarından bağımsız ayrı bir `--gold` tokenı eklendi. Anahtar şimdilik yalnızca `State.keys` + `key:earned`; K2 onu okuyacak. Konsoldan `MAG.streak.report()` / `.forward(dk)` — açılış banner'ında bilerek duyurulmuyor. |
| — | 🧭 | **Ortam notu — ölçüm nerede yapılıyor.** Geliştirme bir **Debian 12 distrobox konteynerinin** içinde; konteynerde toplam 6 font var, host'ta (Bazzite/Fedora) 787 font ve 32 Japonca aile. Yani konteynerden `fc-list` çalıştırmak **host'u ölçmez** — host için `distrobox-host-exec fc-list`. Ayrı bir tuzak: konteynerden `flatpak run` ile açılan headless Chromium host CJK fontlarını göremiyor (o sandbox'ta 言 tofu çıkıyor), uygulama içi tarayıcı görüyor. Font kararlarını ekran görüntüsüyle değil tuval üzerinde piksel sayarak doğrula. |

---

## B — Yorum sistemi yeniden tasarımı

Ayrıntılı plan: [`docs/YORUM-SISTEMI.md`](YORUM-SISTEMI.md).
Sorun: ankraj modeli (karakter aralığı + piksel pini) yüzlerce yorumda **sessizce**
bozuluyor — aynı cümleye ikinci yorum bugünkü kodda zaten imkânsız. Hedef: okur,
yazıyı ve ona iliştirilen sesleri aynı anda okuyabilsin.

- [x] **B0 — Plan onayı.** Önce ankraj temeli, sonra sunum denemeleri.
- [x] **B1 — Temel.** Blok kimliği, blok ankrajı, pin kümelenmesi,
      geriye dönük ankraj taşıma.
- [x] **B2 — Stres modu.** `MAG.flood(250)` — sunum 14 yorumda güzel görünür,
      ayrım 250'de çıkar.
- [x] **B2.5 — Dolu sayı.** 248 elle yazılmış tohum yorum (`js/data-comments.js`).
      Sentetik stres modundan farkı: kalıcı, okunabilir ve *gerçekten* tartışıyor —
      sunum kararı buna bakarak verildi.
- [x] **B2.6 — Kümelenme görünümü.** `MAG.pins()` — çekim alanları, sınama sırası,
      çakışmalar, sınır birleşmeleri ve canlı nokta sınaması.
- [x] **B5 — Karar: BALONCUK.** Denenen sunumlar elendi; geriye tek model kaldı —
      her yorum bir baloncuk, dokununca pop-up. Metne dokunan hiçbir işaret yok.
- [ ] **B6 — Mektuplar sayfası** (bölüm sonuna editöryel dizilmiş 6-8 yorum).
- [x] **K1 — Mod tamamlama ve anahtar.** Sürenin yarısı okununca mod tamam (sessiz),
      tek iz altın mod kartı; üç mod tamamsa sayının anahtarı.
- [ ] **K2 — Dergi keşfet sayfası.** Onlarca derginin yolunu K1'in anahtarı açacak.

---

## Sırada ne var (kullanıcı kararı bekliyor)

1. **Görsel yön.** Şu anki palet ve çizim dili bir öneri — beğenmediğin her şey
   `css/tokens.css` ve `js/art.js`'te tek yerden değişir.
2. **Niş ve marka adı.** Prototip içeriği (Kyoto/sonbahar/gece) plandaki örneklerden
   türetildi, yer tutucu. Niş netleşince bölüm şablonları ona göre ayarlanır.
3. **One-shot manga — kim çizecek?** 2026-09 için **çözüldü:** KARGAMANGA'nın
   "Kapalı Kapılar" one-shot'ı izinle yayımlandı (telif sahibinde). Süreklilik hâlâ
   açık: her ay bir one-shot mu, davetli çizer mi, ne sıklıkta?
4. **Anime Ace font lisansı — ödenmemiş borç.** Manga balonu ve başlığı bu fontla
   diziliyor (`assets/animeace2_reg.ttf`, projenin tek gömülü fontu). Prototipte
   sorun değil ama **yayın öncesi** ya lisans satın alınmalı ya da OFL bir
   alternatife geçilmeli. Gerçek build'de WOFF2'ye inecek (~30 KB).
5. **Onaydan sonra:** Faz 0 (gerçek SvelteKit iskeleti). Prototip o noktada
   referans olarak kalır, silinmez.

### Asıl build'e kaydedilen iki madde ([`PROJE.md`](PROJE.md))

- **Güvenlik denetimi (1.0 sonrası) → PROJE.md §6 Faz 9.** Site 1.0 canlıya
  çıktıktan sonra giriş/kimlik başta olmak üzere önemli yüzeylerde güvenlik
  açıkları taranacak (kod deneme sınırı, oturum, RLS yetki, XSS/enjeksiyon,
  hesap devralma). Her faz sonrası tekrarlanan bir geçiş.
- **Dergi boyutu ve saklama verimi → PROJE.md §8.7.** Bir sayının toplam
  ağırlığı ölçülecek, en ağır parça (muhtemelen görseller) tespit edilecek;
  görsel formatı/duyarlı boyut/tembel yükleme, kod bölme, CDN/edge önbelleği,
  eski sayıların soğuk saklaması değerlendirilecek — arşiv büyüdükçe ilk açılış
  maliyeti sabit kalsın diye.
